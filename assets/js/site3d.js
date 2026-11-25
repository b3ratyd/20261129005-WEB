/* Site penceresi DOM katmanı: 3B yuvalar, yazı/kaydırma animasyonları (GSAP), proje görüntüleyici,
   galeri yolculuğu, iletişim uçuş katmanı. 3B sahne için stage3d.js ile birlikte çalışır. */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function enhance(kind, ctx) {
  const { D, sbody, swin, state, imgBase } = ctx, g = window.gsap, ST = window.ScrollTrigger, EN = document.documentElement.lang === 'en';
  if (g && ST) g.registerPlugin(ST);
  const offs = [], on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
  const head = sbody.querySelector('.page-head');
  const PH = innerWidth <= 700; /* telefon: WebGL sahne yerine hafif CSS animasyonlu başlık görseli */
  swin.classList.add(PH ? 'phone-hero' : 'stage-on');
  { const dbg = new URLSearchParams(location.search).get('scroll'); if (dbg) setTimeout(() => { sbody.scrollTop = +dbg; }, 2500); } /* yalnızca test */

  /* imleç ışığı */
  on(swin, 'pointermove', (e) => { const r = swin.getBoundingClientRect(); swin.style.setProperty('--mx', e.clientX - r.left + 'px'); swin.style.setProperty('--my', e.clientY - r.top + 'px'); });

  /* hero: 3B yuva + başlık girişi */
  if (head) {
    head.classList.add('has3d'); const s = document.createElement('div'); s.className = 'slot3d hero k-' + kind + (kind === 'about' ? ' portrait' : ''); head.appendChild(s);
    if (PH && kind === 'about') { s.classList.add('css3d'); s.innerHTML = '<div class="phero"><i class="ring"></i><i class="ring r2"></i><img src="' + imgBase + 'portrait.jpg" alt="' + (D.cv.name || '') + '" width="600" height="800"><b>' + (D.cv.name || '') + '<small>' + (D.t.aboutCap || '') + '</small></b></div>'; }
    if (PH && kind === 'contact') { s.classList.add('css3d'); s.innerHTML = '<div class="pglobe" aria-hidden="true"><i class="gl"></i><i class="gl l2"></i><i class="gl l3"></i><i class="lat a"></i><i class="lat b"></i><i class="lat c"></i><i class="ring"></i><span class="pin p1">Antalya</span><span class="pin p2">Gmail</span></div>'; }
    const h1 = head.querySelector('h1'); if (h1 && g) g.from(h1, { y: 40, opacity: 0, rotationX: -70, transformPerspective: 900, transformOrigin: '50% 100%', filter: 'blur(14px)', duration: 1.2, ease: 'power4.out', delay: .1 });
    if (g) g.from(head.querySelectorAll('p, .toc, .roles'), { y: 24, opacity: 0, duration: .9, ease: 'power3.out', stagger: .12, delay: .35 });
    if (g && ST) g.to(head.querySelectorAll('h1, p'), { y: -50, opacity: .25, ease: 'none', scrollTrigger: { trigger: head, scroller: sbody, start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* kaydırma ilerleme çubuğu + kartlar kaydırdıkça 3B derinlikte hafifçe eğilir (bağımsız rotate/translate özellikleriyle; fare eğilmesiyle çakışmaz) */
  {
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches, bar = document.createElement('div'); bar.className = 'sprog'; bar.setAttribute('aria-hidden', 'true'); bar.innerHTML = '<i></i>'; swin.appendChild(bar);
    const bi = bar.firstChild, tgt = [...sbody.querySelectorAll('.plate, .post, .shot, .skills li, .timeline li, .contact-list > div, .lists > div, .facts, .section-head')];
    let raf = 0;
    const upd3 = () => {
      raf = 0; const sr = sbody.getBoundingClientRect(), mid = sr.top + sr.height / 2;
      bi.style.width = clamp(sbody.scrollTop / Math.max(1, sbody.scrollHeight - sbody.clientHeight), 0, 1) * 100 + '%'; if (RM) return;
      for (const el of tgt) { const r = el.getBoundingClientRect(); if (r.bottom < sr.top - 80 || r.top > sr.bottom + 80) continue; const p = clamp(((r.top + r.height / 2) - mid) / (sr.height * .6), -1, 1); el.style.rotate = `1 0 0 ${(p * 9).toFixed(2)}deg`; el.style.translate = `0 0 ${(-Math.abs(p) * 46).toFixed(1)}px`; }
    };
    const sched = () => { if (!raf) raf = requestAnimationFrame(upd3); };
    on(sbody, 'scroll', sched, { passive: true }); on(window, 'resize', sched); sched(); setTimeout(sched, 700); offs.push(() => cancelAnimationFrame(raf));
  }

  /* HAKKIMDA: rol yazıcısı, yetenek yuvası, sayaçlar */
  if (kind === 'about') {
    if (head && D.roles) {
      const p = document.createElement('p'); p.className = 'roles'; p.innerHTML = '<span></span><i></i>'; const first = head.querySelector('p'); first ? first.after(p) : head.appendChild(p);
      const sp = p.firstChild, R = D.roles; let ri = 0, ci = 0, del = false, tm = 0;
      const tick = () => { const w = R[ri]; ci += del ? -1 : 1; sp.textContent = w.slice(0, ci); let d = del ? 32 : 68; if (!del && ci === w.length) { del = true; d = 1500; } else if (del && ci === 0) { del = false; ri = (ri + 1) % R.length; d = 300; } tm = setTimeout(tick, d); };
      tm = setTimeout(tick, 700); offs.push(() => clearTimeout(tm));
    }
    const ul = sbody.querySelector('ul.skills');
    if (ul) { const s = document.createElement('div'); s.className = 'slot3d skills'; s.innerHTML = '<span class="slotcap"></span>'; s.firstChild.textContent = EN ? 'Hover over the cubes' : 'Küplerin üstüne gel'; ul.before(s); }
    if (g && ST) sbody.querySelectorAll('.skill-top output').forEach((o) => { const v = parseInt(o.textContent.replace(/\D/g, ''), 10) || 0, ob = { v: 0 }; g.fromTo(ob, { v: 0 }, { v, duration: 1.4, ease: 'power2.out', onUpdate: () => { o.textContent = '%' + Math.round(ob.v); }, scrollTrigger: { trigger: o, scroller: sbody, start: 'top 92%', once: true } }); });
  }

  /* PROJELER: büyük görüntüleyici, 3B dönüşlü geçişler */
  let viewer = null;
  if (kind === 'projects') {
    const list = D.proj, cards = [...sbody.querySelectorAll('.plate')], v = document.createElement('div'); viewer = v; v.className = 'pview'; v.hidden = true;
    v.innerHTML = `<div class="pv-in"><button class="pv-x" type="button" aria-label="${EN ? 'Close' : 'Kapat'}">✕</button><div class="pv-img"><img alt=""></div><div class="pv-tx"><small></small><h2></h2><p></p><dl class="pv-dl"></dl><div class="pv-nav"><button class="pv-p" type="button" aria-label="‹">‹</button><button class="pv-n" type="button" aria-label="›">›</button></div></div></div>`;
    swin.appendChild(v); const inner = v.querySelector('.pv-in'); let cur = 0;
    const apply = () => { const p = list[cur]; const im = v.querySelector('img'); im.src = imgBase + 'projects/' + p[0] + '.jpg'; im.alt = p[1]; v.querySelector('small').textContent = `${cur + 1} / ${list.length}`; v.querySelector('h2').textContent = p[1]; v.querySelector('p').textContent = p[2]; const d = p[3], L = D.plabels, dl = v.querySelector('.pv-dl'); dl.innerHTML = ''; if (d) { for (const k of ['goal', 'how', 'result']) { const row = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = L[k]; dd.textContent = d[k]; row.append(dt, dd); dl.appendChild(row); } const row = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = L.tools; d.tools.forEach((x) => { const c = document.createElement('span'); c.className = 'chip'; c.textContent = x; dd.appendChild(c); }); row.append(dt, dd); dl.appendChild(row); } };
    const show = (n, dir = 1) => { cur = (n + list.length) % list.length; if (g && !v.hidden) g.timeline().to(inner, { rotateY: -42 * dir, x: -60 * dir, opacity: 0, duration: .26, ease: 'power2.in', onComplete: apply }).fromTo(inner, { rotateY: 42 * dir, x: 60 * dir, opacity: 0 }, { rotateY: 0, x: 0, opacity: 1, duration: .55, ease: 'power3.out' }); else apply(); };
    const open = (i) => { show(i); v.hidden = false; if (g) g.fromTo(inner, { opacity: 0, scale: .82, rotateX: 14 }, { opacity: 1, scale: 1, rotateX: 0, duration: .7, ease: 'power3.out' }); v.querySelector('.pv-x').focus(); };
    const close = () => { if (g) g.to(inner, { opacity: 0, scale: .9, duration: .25, onComplete: () => { v.hidden = true; } }); else v.hidden = true; };
    cards.forEach((c, i) => { const a = c.querySelector('a'); if (a) on(a, 'click', (e) => { e.preventDefault(); open(i); }); });
    on(v.querySelector('.pv-x'), 'click', close); on(v.querySelector('.pv-p'), 'click', () => show(cur - 1, -1)); on(v.querySelector('.pv-n'), 'click', () => show(cur + 1, 1)); on(v, 'click', (e) => { if (e.target === v) close(); });
    on(window, 'keydown', (e) => { if (v.hidden) return; if (e.key === 'Escape') { e.stopPropagation(); close(); } else if (e.key === 'ArrowLeft') { e.stopPropagation(); show(cur - 1, -1); } else if (e.key === 'ArrowRight') { e.stopPropagation(); show(cur + 1, 1); } }, true);
  }

  /* BLOG: yazılar kaydırınca derinlikten gelir, her yazının okuma ilerlemesi */
  if (kind === 'blog') {
    sbody.querySelectorAll('.post').forEach((p) => {
      const bar = document.createElement('div'); bar.className = 'readbar'; bar.innerHTML = '<i></i>'; p.prepend(bar); const i = bar.firstChild;
      const upd = () => { const r = p.getBoundingClientRect(), sr = sbody.getBoundingClientRect(); i.style.width = clamp((sr.top + sbody.clientHeight * .6 - r.top) / r.height, 0, 1) * 100 + '%'; };
      on(sbody, 'scroll', upd, { passive: true }); upd();
    });
  }

  /* GALERİ: kaydırarak fotoğraflarda yolculuk (kamera tünelde ilerler) */
  if (kind === 'gallery' && head && false /* yolculuk kapalı: galeri doğrudan fotoğraf ızgarasıyla açılır */) {
    const P = D.photos, n = P.length, sec = document.createElement('section'); sec.className = 'journey'; sec.setAttribute('aria-label', EN ? 'Photo journey' : 'Fotoğraf yolculuğu');
    sec.innerHTML = `<div class="jstick"><div class="jcap"><small></small><h2></h2><p class="jc"></p><p class="js"></p><button class="jbtn" type="button">${EN ? 'Read the story' : 'Hikâyeyi oku'}</button></div><div class="jbar"><i></i></div><p class="jhint">${EN ? 'scroll to travel ↓' : 'yolculuk için kaydır ↓'}</p></div>`;
    head.before(sec); const cap = sec.querySelector('.jcap'); /* galeri doğrudan sergi koridoruyla açılır; başlık ve ızgara yolculuktan sonra gelir */
    const set = () => { sec.style.setProperty('--vh', sbody.clientHeight + 'px'); sec.style.height = sbody.clientHeight * (1 + n * .75) + 'px'; }; set(); on(window, 'resize', set);
    let last = -1;
    const upd = () => {
      const sr = sbody.getBoundingClientRect(), r = sec.getBoundingClientRect(), top = r.top - sr.top, span = Math.max(1, r.height - sbody.clientHeight), jp = clamp(-top / span, 0, 1);
      state.jp = jp; state.jFade = clamp(Math.min(1 - top / (sbody.clientHeight * .3), (r.bottom - sr.top) / (sbody.clientHeight * .3)), 0, 1); state.jActive = state.jFade > .01; const idx = Math.round(jp * (n - 1)); state.jIdx = idx; sec.querySelector('.jbar i').style.width = jp * 100 + '%';
      if (state.jActive && idx !== last) { last = idx; const p = P[idx]; cap.querySelector('small').textContent = `${idx + 1} / ${n}`; cap.querySelector('h2').textContent = p[3] || ''; cap.querySelector('.jc').textContent = p[4] || ''; cap.querySelector('.js').textContent = p[5] || ''; if (g) g.fromTo(cap, { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: .55, ease: 'power3.out' }); }
    };
    on(sbody, 'scroll', upd, { passive: true }); upd();
    on(sec.querySelector('.jbtn'), 'click', () => window.dispatchEvent(new CustomEvent('photo:open', { detail: state.jIdx })));
  }

  /* İLETİŞİM: gönderince sayfa kararır, dünya büyür, mesaj Antalya'dan Gmail'e uçar */
  let fcap = null;
  if (kind === 'contact') {
    const F = D.fly, cap = document.createElement('div'); fcap = cap; cap.className = 'flycap'; cap.setAttribute('role', 'status'); cap.setAttribute('aria-live', 'polite');
    cap.innerHTML = '<small></small><h2></h2><div class="fbar"><i></i></div>'; swin.appendChild(cap); let to = 0;
    const end = () => { swin.classList.remove('flying'); };
    on(window, 'contact:send', () => { swin.classList.add('flying'); cap.querySelector('small').textContent = F.route; cap.querySelector('h2').textContent = F.sending; cap.querySelector('.fbar i').style.width = '0%'; clearTimeout(to); to = setTimeout(end, 16000); });
    on(window, 'contact:done', () => { cap.querySelector('h2').textContent = F.done; });
    on(window, 'contact:fail', () => { cap.querySelector('h2').textContent = F.fail; });
    on(window, 'contact:landed', () => { clearTimeout(to); setTimeout(end, 1400); });
    on(window, 'contact:aborted', () => { clearTimeout(to); setTimeout(end, 900); });
    offs.push(() => { clearTimeout(to); swin.classList.remove('flying'); });
  }

  return {
    stop() {
      offs.forEach((f) => f()); if (ST) ST.getAll().forEach((x) => x.kill());
      if (viewer) viewer.remove(); if (fcap) fcap.remove(); swin.classList.remove('stage-on', 'flying');
    },
  };
}
