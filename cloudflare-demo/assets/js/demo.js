/* Presentation-only enhancement. No unconfirmed prices, schedule or cart data. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const menu = $('#menu-dialog');
  const toggle = $('.menu-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.documentElement.classList.add('enhanced');
  if (location.protocol !== 'file:') {
    const manifest = document.createElement('link');
    manifest.rel = 'manifest'; manifest.href = 'site.webmanifest';
    document.head.append(manifest);
  }
  function closeMenu() { menu.close(); }
  toggle.addEventListener('click', () => {
    menu.showModal(); toggle.setAttribute('aria-expanded','true');
    document.body.classList.add('dialog-open'); menu.querySelector('button').focus();
  });
  menu.querySelector('[data-close]').addEventListener('click',closeMenu);
  menu.addEventListener('close',() => {
    document.body.classList.remove('dialog-open');
    toggle.setAttribute('aria-expanded','false'); toggle.focus();
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click',closeMenu));
  menu.addEventListener('keydown',e => {
    if(e.key !== 'Tab') return;
    const items = [...menu.querySelectorAll('button,a[href]')];
    const first = items[0], last = items.at(-1);
    if(e.shiftKey && document.activeElement === first){ e.preventDefault();last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault();first.focus(); }
  });
  const sections = $$('.service-card, #contacts .contact-grid');
  sections.forEach(el => el.classList.add('reveal'));
  if('IntersectionObserver' in window && !reduced.matches){
    const reveal = new IntersectionObserver(entries => entries.forEach(e => {
      if(e.isIntersecting){e.target.classList.remove('pending');reveal.unobserve(e.target);}
    }),{threshold:.08});
    $$('.reveal').forEach(el => {el.classList.add('pending');reveal.observe(el);});
  }
  const visible = new Set();let frame = 0;
  if('IntersectionObserver' in window){
    const observer = new IntersectionObserver(entries => entries.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
    $$('.entry').forEach(el => observer.observe(el));
  }
  function onScroll(){
    if(frame) return;
    frame=requestAnimationFrame(() => {
      $('.header').classList.toggle('compact',scrollY>40);
      if(!reduced.matches) visible.forEach(el => {
        const y=Math.max(-15,Math.min(15,el.getBoundingClientRect().top*.025));
        el.querySelector('.organic').style.translate=`0 ${y}px`;
      });
      frame=0;
    });
  }
  addEventListener('scroll',onScroll,{passive:true});onScroll();
})();
