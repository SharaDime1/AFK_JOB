/* Independent transcription of the specification: id, price, count, trainer, minutes, days, times. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'cloudflare-pages/assets/js/data.js'),'utf8'),context);
const data=JSON.parse(JSON.stringify(context.window.AZIFIT));
const expected=[
['gym12',10000,12,'',null,[],[]],['gym8',8000,8,'',null,[],[]],
['personal-arzu',25000,null,'Арзу',null,[],[]],['personal-aziza',25000,null,'Азиза',null,[],[]],['individual',100000,null,'Азиза',null,[],[]],
['azifit',35000,12,'Азиза',null,[1,3,5],['20:00–21:00']],['burn',20000,8,'Алинур',null,[2,4],['09:00–10:00','19:00–20:00']],['mix',20000,8,'Алинур',null,[2,4],['18:00–19:00']],['intimate',35000,8,'Арайлым',null,[1,4],['11:00–12:00']],
['lpg30-1',9800,1,'',30,[],[]],['lpg30-5',37990,5,'',30,[],[]],['lpg30-10',65990,10,'',30,[],[]],['lpg30-15',92990,15,'',30,[],[]],
['lpg45-1',12990,1,'',45,[],[]],['lpg45-5',54990,5,'',45,[],[]],['lpg45-10',89990,10,'',45,[],[]],['lpg45-15',125990,15,'',45,[],[]],['lpg45-20',149990,20,'',45,[],[]],['stretch',null,null,'',null,[],[]],
['afk-amir-1',10000,1,'Амир',null,[],[]],['afk-group',30000,12,'Амир',null,[1,3,5],['19:00–20:00']],['afk-amir-12',96000,12,'Амир',null,[],[]],['afk-amir-8',64000,8,'Амир',null,[],[]],
['afk-damir-1',10000,1,'Дамир',null,[],[]],['afk-damir-12',96000,12,'Дамир',null,[],[]],['afk-damir-8',64000,8,'Дамир',null,[],[]],
['afk-aziza-1',10000,1,'Азиза',null,[],[]],['afk-aziza-12',108000,12,'Азиза',null,[],[]],['afk-aziza-8',75000,8,'Азиза',null,[],[]],['afk-split',75000,null,'Азиза',null,[],[]],
['speech1',8000,1,'',null,[],[]],['speech12',96000,12,'',null,[],[]],['speech8',64000,8,'',null,[],[]],['intensive',120000,12,'',null,[],[]],['massage0',50000,null,'',null,[],[]],['massage3',60000,null,'',null,[],[]],['massage7',70000,null,'',null,[],[]]
];
assert.deepEqual(data.PRICES.map(p=>[p.id,p.price,p.count,p.trainer,p.minutes,p.days,p.times]),expected);
const names={gym:'Тренажёрный зал',personal:'Персональные занятия',lpg:'LPG-массаж',stretch:'Стретчинг',afk:'АФК и Сенсорная Интеграция',speech:'Логопед',intensive:'Интенсив',massage:'Детский массаж'};
for(const p of data.PRICES){if(p.id==='individual')assert.equal(p.name,'Индивидуальные тренировки');else if(p.id==='afk-split')assert.equal(p.name,'Сплит');else if(names[p.category])assert.equal(p.name,names[p.category]);}
assert.equal(data.PRICES.find(p=>p.id==='intimate').name,'Интимная гимнастика и фитнес камасутра');
assert.equal(data.PRICES.find(p=>p.id==='intensive').detail,'30 мин АФК + 30 мин логопед · 12 занятий');
for(const [id,age]of [['massage0','0–3 года'],['massage3','3–7 лет'],['massage7','7–12 лет']])assert.equal(data.PRICES.find(p=>p.id===id).detail,age+' · Фидбол и ЛФК в подарок!');
const scheduled=expected.flatMap(row=>row[6].map(time=>[row[0]+'-'+time.slice(0,2),row[3],row[5],time]));
assert.deepEqual(data.SCHEDULE.map(s=>[s.id,s.trainer,s.days,s.time]),scheduled);
assert.deepEqual(data.TRAINERS,['Азиза','Арзу','Алинур','Арайлым','Амир','Дамир']);
assert.equal(data.SERVICES[0].visible,false);assert.equal(data.SITE.whatsapp,'https://wa.me/77007194746');assert.equal(data.SITE.instagram,'azifit_almaty');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const file of walk(path.join(root,'cloudflare-pages')).filter(f=>/\.(js|html|css|json|txt|md|xml)$/.test(f))){const text=fs.readFileSync(file,'utf8');assert(!text.replace(/\D/g,'').includes('77785000348'),file+': private number');assert(!/localStorage|sessionStorage|document\.cookie|fetch\(|XMLHttpRequest/.test(text),file+': storage or network');}
const js=fs.statSync(path.join(root,'cloudflare-pages/assets/js/data.js')).size+fs.statSync(path.join(root,'cloudflare-pages/assets/js/app.js')).size,css=fs.statSync(path.join(root,'cloudflare-pages/assets/css/main.css')).size;assert(js<=60000);assert(css<=60000);
console.log(`PASS: ${expected.length} prices; all amounts, counts, trainers, durations, days and times match.`);
console.log(`PASS: ${scheduled.length} schedule entries; hidden gymnastics; contact configuration; no storage or private number.`);
console.log(`PASS: JS ${js} bytes / 60000; CSS ${css} bytes / 60000.`);
