/* Regenerate HTML fallbacks from data.js; no runtime build is needed. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),pub=path.join(root,'public');
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(pub,'assets/js/data.js'),'utf8'),context);
const {PRICES,TRAINERS,UI,SITE,SCHEDULE}=context.window.AZIFIT;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('ru-RU').format(n)+'\u00a0₸';
let html=fs.readFileSync(path.join(pub,'index.html'),'utf8');
function replace(label,content){const expression=new RegExp(`<!-- ${label} -->(?:[\\s\\S]*?<!-- END_${label} -->)?`);html=html.replace(expression,`<!-- ${label} -->\n${content}\n<!-- END_${label} -->`);}
replace('STATIC_PRICES',PRICES.filter(p=>p.active!==false).map(p=>`<article class="static-price"><h3>${esc(p.name)}</h3><p>${esc([p.trainer,p.detail,p.minutes?`${p.minutes} мин`:'',p.days.map(d=>UI.dayNames[d]).join('/'),p.times.join(' · ')].filter(Boolean).join(' · '))}</p><p>${p.price===null?UI.ask:money(p.price)}${p.note?' · '+esc(p.note):''}</p><a href="${SITE.whatsapp}?text=${encodeURIComponent((p.price===null?UI.askMessage:UI.hello)+' '+p.name+' '+p.detail)}">${UI.choose} ↗</a></article>`).join('\n'));
replace('STATIC_SCHEDULE',SCHEDULE.map(s=>`<article class="static-price"><h3>${esc(s.name)}</h3><p>${s.days.map(d=>UI.dayNames[d]).join('/')} · ${s.time} · ${s.trainer}</p></article>`).join(''));
const women=[['gym','Тренажёрный зал',''],['group','Авторская программа AziFit','Твоё тело — твоя сила!'],['group','Жиротопка',''],['group','Fitness Mix',''],['group','Интимная гимнастика и фитнес камасутра',''],['stretch','Стретчинг',''],['lpg','LPG-массаж','Для тех, кто любит себя и своё тело']];
const kids=[['afk','АФК и Сенсорная Интеграция','Движение • Развитие • Здоровье'],['speech','Логопед','Речь — ключ к развитию и уверенности!'],['intensive','Интенсив','Развитие. Речь. Уверенность'],['massage','Детский массаж','Заботимся о развитии и здоровье вашего ребёнка']];
for(const [key,rows]of [['WOMEN',women],['KIDS',kids]])replace('SERVICES_'+key,rows.filter(([id])=>id!=='intensive'||PRICES.find(p=>p.id===id).active).map(([id,name,copy])=>`<article class="service-card" data-service="${id}"><h3>${name}</h3>${copy?'<p>'+copy+'</p>':''}<a href="#prices-${key.toLowerCase()}-${id}" data-price-link="${id}" aria-label="Цены: ${name}">Цены ↗</a></article>`).join(''));
replace('TEAM',TRAINERS.map((name,i)=>`<article class="team-card"><div class="portrait"><span aria-hidden="true">${name.slice(0,1)}</span><picture data-photo-slot="trainer-${i+1}"><!-- TODO(owner): Add local webp source and jpg img with width=400 height=500 loading=lazy decoding=async alt after supplying a real photo. --></picture></div><h3>${name}</h3></article>`).join(''));
html=html.replace(/(<span data-price="([^"]+)">)[\s\S]*?(<\/span>)/g,(_,start,id,end)=>start+money(PRICES.find(p=>p.id===id).price)+end);
html=html.replace(/(<div class="intensive-price" data-price="intensive">)[\s\S]*?(<\/div>)/,(_,start,end)=>start+money(PRICES.find(p=>p.id==='intensive').price)+end);
/* Keep plain anchors functional when scripts are disabled. */
html=html.replace(/href="#prices-(?:women|kids)(?:-[a-z]+)?"/g,'href="#prices"');
html=html.replace(/<section id="intensive"(?: hidden)?/,`<section id="intensive"${PRICES.find(p=>p.id==='intensive').active?'':' hidden'}`);
if(SITE.url){
 const base=SITE.url.replace(/\/$/,'')+'/';
 html=html.replace(/\s*<link rel="canonical"[^>]*>/g,'').replace('</head>',`  <link rel="canonical" href="${esc(base)}">\n</head>`);
 html=html.replace(/(<meta (?:property="og:image"|name="twitter:image") content=")[^"]*(">)/g,(_,start,end)=>start+esc(base)+'assets/img/og.png'+end);
}
fs.writeFileSync(path.join(pub,'index.html'),html);
if(SITE.url){const url=SITE.url.replace(/\/$/,'')+'/';fs.writeFileSync(path.join(pub,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${esc(url)}</loc></url></urlset>\n`);fs.writeFileSync(path.join(pub,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${url}sitemap.xml\n`);}
console.log(`Static fallback: ${PRICES.length} prices, ${SCHEDULE.length} schedule entries; service and team sections generated.`);
