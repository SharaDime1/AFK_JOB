/* Progressive enhancement. COPY-DRAFT: UI and message templates are in data.js. */
(() => {
  'use strict';
  const { SITE, PRICES, SCHEDULE, TRAINERS, UI } = window.AZIFIT;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const money = n => new Intl.NumberFormat('ru-RU').format(n) + '\u00a0₸';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const state = { audience: 'women', category: 'gym', minutes: 30, trainer: 'Амир', cart: new Set() };
  const valid = p => p.active !== false;
  const dayLabel = days => days.map(d => UI.dayNames[d]).join('/');
  const metadata = p => [p.trainer && `${p.category === 'afk' ? UI.column : UI.trainer}: ${p.trainer}`, dayLabel(p.days), p.times.join(' · '), p.minutes && `${p.minutes} ${UI.minutes}`].filter(Boolean).join(' · ');
  document.documentElement.classList.add('enhanced');
  if (location.protocol !== 'file:') { const manifest = document.createElement('link'); manifest.rel = 'manifest'; manifest.href = 'site.webmanifest'; document.head.append(manifest); }
  let focusOrigin, toastTimer;
  function toast(text) { const el = $('#toast'); el.textContent = text; el.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 3000); }
  function openDialog(dialog, origin) {
    focusOrigin = origin || document.activeElement;
    dialog.showModal(); document.body.classList.add('dialog-open');
    if (dialog.id === 'menu-dialog') $('.menu-toggle').setAttribute('aria-expanded', 'true');
    $('.close-dialog', dialog).focus();
  }
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); $('.menu-toggle').setAttribute('aria-expanded', 'false'); if (focusOrigin?.isConnected) focusOrigin.focus(); });
    dialog.addEventListener('click', e => { if (e.target.closest('[data-close]') || e.target === dialog && (e.clientX < dialog.getBoundingClientRect().left || e.clientY < dialog.getBoundingClientRect().top)) dialog.close(); });
    dialog.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const items = $$('a[href],button,input,textarea,select,[tabindex="0"]', dialog).filter(el => el.getClientRects().length && !el.disabled);
      const first = items[0], last = items.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  });
  $('.menu-toggle').addEventListener('click', e => openDialog($('#menu-dialog'), e.currentTarget));
  $$('#menu-dialog a').forEach(a => a.addEventListener('click', () => $('#menu-dialog').close()));
  $$('[data-book]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); renderCart(); openDialog($('#booking-dialog'), el); }));
  function setHash(category = state.category, audience = state.audience) {
    const hash = `#prices-${audience}${category === UI.categories[audience][0][0] ? '' : '-' + category}`;
    history.pushState(null, '', hash); applyHash();
  }
  function applyHash() {
    const match = location.hash.match(/^#prices-(women|kids)(?:-([a-z]+))?$/);
    if (!match) return;
    state.audience = match[1];
    state.category = UI.categories[state.audience].some(c => c[0] === match[2]) ? match[2] : UI.categories[state.audience][0][0];
    renderPrices();
  }
  window.addEventListener('hashchange', applyHash);
  window.addEventListener('popstate', applyHash);
  $$('#audience-tabs button').forEach(button => button.addEventListener('click', () => setHash(UI.categories[button.dataset.audience][0][0], button.dataset.audience)));
  $('#audience-tabs').addEventListener('keydown', e => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
    e.preventDefault(); const audience = e.key === 'Home' ? 'women' : e.key === 'End' ? 'kids' : state.audience === 'women' ? 'kids' : 'women';
    setHash(UI.categories[audience][0][0], audience); $(`[data-audience="${audience}"]`).focus();
  });
  document.addEventListener('click', e => {
    const link = e.target.closest('[data-price-link]');
    if (!link) return;
    e.preventDefault(); const category = link.dataset.priceLink;
    const audience = UI.categories.kids.some(c => c[0] === category) ? 'kids' : 'women';
    setHash(category, audience); $('#prices').scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth' });
  });
  $('#category-chips').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { setHash(b.dataset.category); $(`[data-category="${b.dataset.category}"]`).focus(); } });
  $('#price-options').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.minutes) state.minutes = Number(b.dataset.minutes);
    if (b.dataset.trainer) state.trainer = b.dataset.trainer;
    const key = b.dataset.minutes ? `[data-minutes="${state.minutes}"]` : `[data-trainer="${state.trainer}"]`;
    renderPrices(); $(key, $('#price-options'))?.focus(); renderLpg();
  });
  function renderPrices() {
    $('#audience-tabs').classList.toggle('kids', state.audience === 'kids');
    $$('#audience-tabs button').forEach(b => { const active = b.dataset.audience === state.audience; b.setAttribute('aria-selected', active); b.tabIndex = active ? 0 : -1; });
    $('#price-results').setAttribute('aria-labelledby', 'tab-' + state.audience);
    $('#category-chips').innerHTML = UI.categories[state.audience].filter(c => c[0] !== 'intensive' || PRICES.find(p => p.id === 'intensive').active).map(([id,name]) => `<button data-category="${id}" aria-pressed="${id === state.category}">${name}</button>`).join('');
    $('#price-options').innerHTML = state.category === 'lpg' ? [30,45].map(n => `<button data-minutes="${n}" aria-pressed="${n === state.minutes}">${n} ${UI.minutes}</button>`).join('') : state.category === 'afk' ? ['Амир','Дамир','Азиза'].map(n => `<button data-trainer="${n}" aria-pressed="${n === state.trainer}">${n}</button>`).join('') : '';
    const prices = PRICES.filter(p => valid(p) && p.audience === state.audience && p.category === state.category && (p.category !== 'lpg' || p.minutes === state.minutes) && (p.category !== 'afk' || p.trainer === state.trainer));
    $('#price-cards').innerHTML = prices.map(p => `<article class="price-card ${state.cart.has(p.id) ? 'selected' : ''}" id="price-${p.id}"><span class="eyebrow">AZIFIT STUDIO</span><h3>${escape(p.name)}</h3><div class="meta">${escape(metadata(p))}</div><div class="price-number">${p.price === null ? UI.ask : money(p.price)}</div><div class="package">${escape(p.detail)}</div><div class="stamps" aria-hidden="true">${Array.from({length: Math.max(12,p.count || 0)},(_,i) => `<i class="${i < (p.count || 0) ? 'filled' : ''}"></i>`).join('')}</div><details><summary aria-expanded="false">${UI.details}</summary><p>${escape(p.note || p.detail || UI.clarify)}</p>${SITE.showPerProcedure && p.category === 'lpg' ? `<p>≈ ${money(Math.round(p.price/p.count))} ${UI.procedure}</p>` : ''}</details><button class="button" data-add="${p.id}" aria-pressed="${state.cart.has(p.id)}">${p.price === null ? UI.ask : state.cart.has(p.id) ? UI.selected : UI.choose} <span aria-hidden="true">↗</span></button></article>`).join('');
    $$('#price-cards details').forEach(d => d.addEventListener('toggle', () => $('summary',d).setAttribute('aria-expanded', d.open)));
    $('#carousel-dots').innerHTML = prices.length > 1 ? prices.map((p,i) => `<button data-card="${i}" aria-label="${escape(p.name + ', ' + p.detail)}" aria-pressed="${i === 0}"></button>`).join('') : '';
    $('#price-cards').scrollLeft = 0;
  }
  $('#carousel-dots').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { const card = $$('.price-card')[Number(b.dataset.card)]; $('#price-cards').scrollTo({left:card.offsetLeft - $('.price-card').offsetLeft,behavior:reduced.matches ? 'instant' : 'smooth'}); } });
  $('#price-cards').addEventListener('scroll', () => { const cards = $$('.price-card'); if (!cards.length) return; const width = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 1; const index = Math.round($('#price-cards').scrollLeft / width); $$('#carousel-dots button').forEach((b,i) => b.setAttribute('aria-pressed',i === index)); }, {passive:true});
  $('#price-cards').addEventListener('click', e => {
    const b = e.target.closest('[data-add]'); if (!b) return;
    state.cart.add(b.dataset.add); renderCart();
    b.setAttribute('aria-pressed','true'); b.closest('.price-card').classList.add('selected'); b.firstChild.textContent = UI.selected + ' ';
    openDialog($('#booking-dialog'),b);
  });
  function selected() { return PRICES.filter(p => state.cart.has(p.id) && valid(p)); }
  function message() {
    const items = selected();
    const list = items.map(p => `${p.price === null ? UI.askMessage + ' ' : ''}${p.name}${metadata(p) ? ' (' + metadata(p) + ')' : ''}${p.detail ? ', ' + p.detail : ''}${p.price === null ? '' : ' — ' + money(p.price)}`).join('; ');
    const name = $('#booking-name').value.trim(), time = $('#booking-time').value.trim();
    return `${UI.hello}${list ? ' ' + list : ''}.${name ? ' ' + UI.name + ': ' + name + '.' : ''}${time ? ' ' + UI.time + ': ' + time + '.' : ''}`;
  }
  function updateMessage() { $('#send-whatsapp').href = SITE.whatsapp + '?text=' + encodeURIComponent(message()); $('#message-copy').value = message(); }
  function renderCart() {
    const items = selected();
    $('#cart-items').innerHTML = items.length ? items.map(p => `<div class="cart-item"><p>${escape(p.name)}<small>${escape([metadata(p),p.detail].filter(Boolean).join(' · '))}</small><strong>${p.price === null ? UI.clarify : money(p.price)}</strong></p><button data-remove="${p.id}" aria-label="${UI.remove}: ${escape(p.name)}">×</button></div>`).join('') : `<p>${UI.empty}</p>`;
    $('#cart-total').textContent = `${UI.total}: ${money(items.reduce((sum,p) => sum + (p.price || 0),0))}`;
    $$('.cart-count').forEach(e => e.textContent = items.length); updateMessage();
  }
  $('#cart-items').addEventListener('click', e => { const b = e.target.closest('[data-remove]'); if (b) { state.cart.delete(b.dataset.remove); renderCart(); renderPrices(); $('[data-remove]', $('#cart-items'))?.focus(); if (!selected().length) $('#booking-name').focus(); } });
  $('#booking-name').addEventListener('input',updateMessage); $('#booking-time').addEventListener('input',updateMessage);
  $('#send-instagram').addEventListener('click', async () => {
    const url = 'https://ig.me/m/' + SITE.instagram;
    const tab = window.open('about:blank','_blank'); if (tab) tab.opener = null;
    try { await navigator.clipboard.writeText(message()); toast(UI.copied); if (tab) tab.location.replace(url); else { $('#manual-copy').hidden = false; updateMessage(); } }
    catch { if (tab) tab.close(); $('#manual-copy').hidden = false; updateMessage(); $('#message-copy').focus(); $('#message-copy').select(); }
  });
  function renderLpg() {
    $$('#lpg-switch button').forEach(b => b.setAttribute('aria-pressed',Number(b.dataset.lpg) === state.minutes));
    const first = PRICES.find(p => p.category === 'lpg' && p.minutes === state.minutes && p.count === 1);
    $('#lpg-summary').textContent = `${first.detail} · ${money(first.price)}`;
  }
  $('#lpg-switch').addEventListener('click',e => { const b=e.target.closest('button'); if (b) { state.minutes=Number(b.dataset.lpg); renderLpg(); if(state.category==='lpg') renderPrices(); } });
  const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const todayIndex = (date = new Date()) => weekdays.indexOf(new Intl.DateTimeFormat('en-US',{weekday:'short',timeZone:'Asia/Almaty'}).format(date));
  let selectedDay = todayIndex();
  const scheduleFiltered = () => SCHEDULE.filter(s => ($('#schedule-audience').value === 'all' || s.audience === $('#schedule-audience').value) && ($('#schedule-trainer').value === 'all' || s.trainer === $('#schedule-trainer').value));
  function renderSchedule() {
    const rows = scheduleFiltered(), today = todayIndex();
    const events = day => rows.filter(s => s.days.includes(day)).sort((a,b) => a.time.localeCompare(b.time));
    let nearest = today; for(let offset=0;offset<7;offset++){const d=(today+offset)%7;if(events(d).length){nearest=d;break;}}
    $('#today').innerHTML = `<strong>${nearest === today ? UI.today : UI.next} · ${UI.dayNames[nearest]}</strong><span>${events(nearest).map(s => `${s.time} — ${escape(s.name)} (${s.trainer})`).join('<br>') || '—'}</span>`;
    $('#day-chips').innerHTML = [1,2,3,4,5,6,0].map(d => `<button data-day="${d}" aria-pressed="${selectedDay===d}">${UI.dayNames[d]}</button>`).join('');
    $('#week').innerHTML = [1,2,3,4,5,6,0].map(d => `<div class="day-column ${d===selectedDay?'active':''} ${d===today?'current':''}"><h3>${UI.dayNames[d]}${d===today?' · '+UI.today:''}</h3>${events(d).map(s => `<div class="schedule-event"><strong>${s.time}</strong>${escape(s.name)}<small>${s.audience === 'kids' ? UI.column : UI.trainer}: ${s.trainer}</small></div>`).join('') || '<p>—</p>'}</div>`).join('');
  }
  [...new Set(SCHEDULE.map(s=>s.trainer))].forEach(name=>{const option=document.createElement('option');option.value=name;option.textContent=name;$('#schedule-trainer').append(option);});
  ['#schedule-audience','#schedule-trainer'].forEach(s=>$(s).addEventListener('change',renderSchedule));
  $('#day-chips').addEventListener('click',e=>{const b=e.target.closest('button');if(b){selectedDay=Number(b.dataset.day);renderSchedule();$(`[data-day="${selectedDay}"]`).focus();}});
  $$('[data-price]').forEach(el=>{const p=PRICES.find(p=>p.id===el.dataset.price);el.textContent=p&&p.price!==null?money(p.price):UI.clarify;});
  if(!PRICES.find(p=>p.id==='intensive').active){$('#intensive').hidden=true;$$('[data-service="intensive"]').forEach(el=>el.hidden=true);}
  $$('[data-instagram]').forEach(a=>{a.href=a.href.includes('instagram.com')?`https://www.instagram.com/${SITE.instagram}/`:`https://ig.me/m/${SITE.instagram}`;if(a.textContent.startsWith('@'))a.textContent='@'+SITE.instagram+' ↗';});
  if(SITE.hours){$('#hours').hidden=false;$('#hours').textContent=SITE.hours;}
  if(SITE.pricesUpdatedAt)$$('[data-updated]').forEach(el=>el.textContent=UI.updated+' '+SITE.pricesUpdatedAt);
  const structured={'@context':'https://schema.org','@type':'HealthClub',name:SITE.name,telephone:SITE.phone,address:{'@type':'PostalAddress',streetAddress:'Акжунис 12',addressLocality:'Алматы'},sameAs:[`https://www.instagram.com/${SITE.instagram}/`]};
  if(/^https?:\/\//.test(SITE.url)){const url=SITE.url.replace(/\/$/,'')+'/';const link=$('link[rel="canonical"]')||document.createElement('link');link.rel='canonical';link.href=url;if(!link.isConnected)document.head.append(link);structured.url=url;const og=document.createElement('meta');og.setAttribute('property','og:url');og.content=url;document.head.append(og);$('meta[property="og:image"]').content=url+'assets/img/og.png';$('meta[name="twitter:image"]').content=url+'assets/img/og.png';}
  const jsonld=document.createElement('script');jsonld.type='application/ld+json';jsonld.textContent=JSON.stringify(structured);document.head.append(jsonld);
  $$('picture img').forEach(img=>img.addEventListener('error',()=>{img.closest('picture').hidden=true;}));
  $$('.faq details').forEach(d=>{$('summary',d).setAttribute('aria-expanded',d.open);d.addEventListener('toggle',()=>$('summary',d).setAttribute('aria-expanded',d.open));});
  renderPrices();applyHash();renderCart();renderSchedule();renderLpg();
  if(location.hash.startsWith('#prices-'))$('#prices').scrollIntoView();
  if('IntersectionObserver' in window&&!reduced.matches){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('pending');observer.unobserve(entry.target);}}),{threshold:.08});$$('.reveal').forEach(el=>{el.classList.add('pending');observer.observe(el);});}
  let frame=0;const visibleShapes=new Set();
  if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>e.isIntersecting?visibleShapes.add(e.target):visibleShapes.delete(e.target)));$$('.entry').forEach(el=>observer.observe(el));}
  function onScroll(){if(frame)return;frame=requestAnimationFrame(()=>{$('.header').classList.toggle('compact',scrollY>40);if(!reduced.matches)visibleShapes.forEach(el=>{const y=Math.max(-15,Math.min(15,el.getBoundingClientRect().top*.025));$('.organic',el).style.translate=`0 ${y}px`;});frame=0;});}
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  /* Expose deterministic read-only helpers for offline verification. */
  window.AZIFIT_TEST={money,todayIndex,message};
})();
