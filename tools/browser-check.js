/* Dependency-free browser checks using Chromium's DevTools protocol and Node WebSocket. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
 const targets=await(await fetch('http://127.0.0.1:9222/json')).json();
 const target=targets.find(t=>t.type==='page');if(!target)throw Error('No Chromium page');
 const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
 let seq=0;const pending=new Map(),errors=[],badResources=[],external=[];
 ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(Error(JSON.stringify(m.error)));else p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);else if(m.method==='Log.entryAdded'&&['warning','error'].includes(m.params.entry.level))errors.push(m.params.entry);else if(m.method==='Network.responseReceived'&&m.params.response.status>=400)badResources.push(m.params.response.url);else if(m.method==='Network.requestWillBeSent'&&!/^(http:\/\/127\.0\.0\.1:8080|file:|data:)/.test(m.params.request.url))external.push(m.params.request.url);});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const click=selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
 await send('Page.enable');await send('Runtime.enable');await send('Log.clear');await send('Log.enable');await send('Network.enable');errors.length=0;
 await send('Page.navigate',{url:'http://127.0.0.1:8080/'});await sleep(800);
 assert.equal(await evaluate('document.querySelectorAll(".price-card").length'),2);
 for(const width of [360,390,430,768,1024,1440]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<768});await evaluate('window.scrollTo(0,0)');await sleep(350);
  const size=await evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth})');assert(size.scroll<=size.width,JSON.stringify(size));
  const image=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(root,'tools/screens',width+'.png'),Buffer.from(image.data,'base64'));
  console.log(`PASS viewport ${width}: scrollWidth=${size.scroll}`);
 }
 await click('[data-audience="kids"]');assert.equal(await evaluate('location.hash'),'#prices-kids');assert.equal(await evaluate('document.querySelectorAll(".price-card").length'),4);
 await click('[data-trainer="Дамир"]');assert.equal(await evaluate('document.querySelectorAll(".price-card").length'),3);
 await click('[data-trainer="Азиза"]');assert.equal(await evaluate('document.querySelectorAll(".price-card").length'),4);
 await click('[data-category="speech"]');assert.equal(await evaluate('document.querySelectorAll(".price-card").length'),3);
 await click('[data-add="speech1"]');assert(await evaluate('document.querySelector("#booking-dialog").open'));
 await evaluate('document.querySelector("#booking-name").value="Тест & Имя";document.querySelector("#booking-name").dispatchEvent(new Event("input"))');
 const url=await evaluate('document.querySelector("#send-whatsapp").href');assert.equal(new URL(url).origin,'https://wa.me');assert(new URL(url).searchParams.get('text').includes('Тест & Имя'));console.log('PASS WhatsApp URL: '+url);
 await click('[data-remove="speech1"]');assert((await evaluate('document.querySelector("#cart-total").textContent')).includes('0'));
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});assert(!await evaluate('document.querySelector("#booking-dialog").open'));
 await click('[data-audience="women"]');await click('[data-category="lpg"]');assert.equal(await evaluate('document.querySelectorAll(".price-card").length'),4);await click('[data-minutes="45"]');assert.equal(await evaluate('document.querySelectorAll(".price-card").length'),5);
 await evaluate('history.back()');await sleep(150);assert.equal(await evaluate('location.hash'),'#prices-women');
 assert.equal(await evaluate('AZIFIT_TEST.todayIndex(new Date("2026-10-27T20:00:00Z"))'),3);
 await evaluate('document.querySelector("#schedule-audience").value="kids";document.querySelector("#schedule-audience").dispatchEvent(new Event("change"))');assert((await evaluate('document.querySelector("#today").textContent')).includes('АФК'));
 await send('Emulation.setDeviceMetricsOverride',{width:360,height:800,deviceScaleFactor:1,mobile:true});await click('.menu-toggle');assert(await evaluate('document.querySelector("#menu-dialog").open'));await click('#menu-dialog [data-close]');await sleep(100);assert(await evaluate('document.activeElement===document.querySelector(".menu-toggle")'));
 await click('[data-audience="women"]');await evaluate('document.querySelector("#tab-women").focus()');await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});assert.equal(await evaluate('document.activeElement.id'),'tab-kids');
 await click('[data-trainer="Амир"]');await click('[data-add="afk-amir-1"]');await evaluate('document.querySelector("#booking-name").focus()');
 await evaluate('Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async text=>{window.__copied=text}}});window.open=()=>({opener:null,location:{replace:url=>window.__instagram=url},close:()=>{}})');await click('#send-instagram');await sleep(100);assert((await evaluate('window.__copied')).includes('АФК'));assert.equal(await evaluate('window.__instagram'),'https://ig.me/m/azifit_almaty');
 await evaluate('navigator.clipboard.writeText=async()=>{throw Error("Denied")}');await click('#send-instagram');await sleep(100);assert(!await evaluate('document.querySelector("#manual-copy").hidden'));await click('#booking-dialog [data-close]');
 await send('Emulation.setScriptExecutionDisabled',{value:true});await send('Page.reload');await sleep(500);assert(await evaluate('document.querySelector("#static-prices").getBoundingClientRect().height>0'));await send('Emulation.setScriptExecutionDisabled',{value:false});
 await send('Page.navigate',{url:'file:///'+path.join(root,'public/index.html').replace(/\\/g,'/')});await sleep(700);assert.equal(await evaluate('document.querySelectorAll(".price-card").length'),2);
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});assert.equal(await evaluate('getComputedStyle(document.querySelector(".price-card")).animationName'),'none');
 console.log('PASS: categories, AFK trainers, LPG durations, cart add/remove, WhatsApp encoding, Instagram copy/fallback, URL back, Almaty timezone, schedule filters, mobile menu, focus restoration, arrow keys, Esc, no-JS, file://, reduced motion.');
 assert.deepEqual(errors,[]);assert.deepEqual(badResources,[]);assert.deepEqual(external,[]);console.log('PASS: no console errors/warnings, resource failures or external requests.');
 fs.writeFileSync(path.join(root,'tools/browser-results.json'),JSON.stringify({widths:[360,390,430,768,1024,1440],errors,badResources,external,passed:true},null,2));
 await send('Browser.close');ws.close();
})().catch(e=>{console.error(e);process.exitCode=1;setTimeout(()=>process.exit(1),50);});
