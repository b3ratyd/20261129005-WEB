/* "Arayüz Atölyesi": web sayfası kurmayı öğreten 3 görevli eğitici oyun. Bitirince Web Tasarım Rozeti. */
export function startGame(G, urls, onClose, onClaim) {
  const root = document.getElementById('game');
  const saved = localStorage.getItem('bwon');
  root.hidden = false;
  root.innerHTML = `<div class="gw"><button class="gx" aria-label="${G.close}">✕</button><div class="ghead"><b>${G.title}</b><span class="gstep"></span><span class="glife"></span></div><div class="gbar"><i></i></div><div class="gmain"></div></div>`;
  const $ = (s) => root.querySelector(s), main = $('.gmain');
  let stage = 0, errs = 0;
  const key = (e) => { if (e.key === 'Escape') close(); };
  const close = () => { removeEventListener('keydown', key); root.hidden = true; root.innerHTML = ''; onClose && onClose(); };
  addEventListener('keydown', key); $('.gx').onclick = close; $('.gx').focus();
  const hud = () => { $('.gstep').textContent = stage >= 1 && stage <= 3 ? `${G.step} ${stage}/3` : ''; $('.glife').textContent = stage >= 1 && stage <= 3 ? '❤'.repeat(Math.max(0, G.maxErr - errs)) + '♡'.repeat(Math.min(G.maxErr, errs)) : ''; $('.gbar i').style.width = `${Math.min(3, stage - 1 < 0 ? 0 : stage - 1) / 3 * 100}%`; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const miss = () => { errs++; hud(); if (errs >= G.maxErr) { setTimeout(lose, 700); return true; } return false; };
  const code = () => saved || ('UI-' + Math.random().toString(36).slice(2, 6).toUpperCase());
  const claim = (c) => () => { if (onClaim) { close(); onClaim(c); } else location.href = urls.contact + '?kupon=' + encodeURIComponent(c); };
  const panel = (title, html, btns) => { main.innerHTML = `<div class="gpanel"><h2>${title}</h2>${html}<div class="gbtns">${btns.map((b, i) => `<button data-i="${i}" class="${b[2] || ''}">${b[0]}</button>`).join('')}</div></div>`; main.querySelectorAll('.gbtns button').forEach((b) => b.onclick = btns[b.dataset.i][1]); };

  /* 1 · Yerleşim: parçaları yukarıdan aşağı doğru sıraya koy */
  function layout() {
    stage = 1; hud(); const L = G.layout, n = L.parts.length; let next = 0;
    const order = [...L.parts.keys()].sort(() => Math.random() - .5);
    main.innerHTML = `<div class="gtask"><h3>${L.t}</h3><p>${L.d}</p></div><div class="glay"><div class="gparts">${order.map((i) => `<button data-i="${i}" style="--c:${L.parts[i][1]}">${esc(L.parts[i][0])}</button>`).join('')}</div><div class="gmock"><div class="gmtop"><i></i><i></i><i></i><span>berat.dev</span></div><div class="gslots">${L.parts.map(() => '<div class="gslot"></div>').join('')}</div></div></div><p class="gfb"></p>`;
    const slots = main.querySelectorAll('.gslot'), fb = main.querySelector('.gfb');
    main.querySelectorAll('.gparts button').forEach((b) => b.onclick = () => {
      const i = +b.dataset.i;
      if (i === next) { slots[next].textContent = L.parts[i][0]; slots[next].style.setProperty('--c', L.parts[i][1]); slots[next].classList.add('on'); b.disabled = true; next++; fb.className = 'gfb ok'; fb.textContent = G.right;
        if (next === n) { fb.textContent = L.done; setTimeout(() => nextBtn(tags), 400); } }
      else { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); fb.className = 'gfb no'; fb.textContent = `${G.wrong} · ${L.hint}`; miss(); }
    });
  }
  const nextBtn = (fn) => { const d = document.createElement('div'); d.className = 'gbtns'; d.innerHTML = `<button class="gpri">${G.next}</button>`; d.firstChild.onclick = fn; main.appendChild(d); };

  /* 2 ve 3 · çoktan seçmeli sorular (etiketler, kontrast, mobil) */
  const lum = (h) => { const v = [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16) / 255).map((c) => c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  function quiz(Q, st, done) {
    stage = st; hud(); let qi = 0;
    const show = () => {
      const q = Q.qs[qi], contrast = q.type === 'contrast';
      const best = contrast ? q.o.map((p) => ratio(p[0], p[1])).reduce((m, r, i, a) => r > a[m] ? i : m, 0) : q.a;
      main.innerHTML = `<div class="gtask"><h3>${Q.t} <small>${qi + 1}/${Q.qs.length}</small></h3><p>${esc(q.q)}</p></div><div class="gopts ${contrast ? 'cc' : ''}">${q.o.map((o, i) => contrast ? `<button data-i="${i}" style="color:${o[0]};background:${o[1]}">Aa · ${G.sample}<small></small></button>` : `<button data-i="${i}"><code>${esc(o)}</code></button>`).join('')}</div><p class="gfb"></p>`;
      const fb = main.querySelector('.gfb'), bs = main.querySelectorAll('.gopts button');
      bs.forEach((b) => b.onclick = () => {
        const i = +b.dataset.i; bs.forEach((x) => x.disabled = true);
        if (contrast) bs.forEach((x, j) => { x.querySelector('small').textContent = ` ${ratio(q.o[j][0], q.o[j][1]).toFixed(1)}:1`; });
        bs[best].classList.add('ok'); let over = false;
        if (i === best) { fb.className = 'gfb ok'; fb.textContent = `${G.right} ${q.e}`; } else { b.classList.add('no'); fb.className = 'gfb no'; fb.textContent = `${G.wrong}. ${q.e}`; over = miss(); }
        if (!over) nextBtn(() => { qi++; qi < Q.qs.length ? show() : done(); });
      });
    };
    show();
  }
  const tags = () => quiz(G.tags, 2, () => quiz(G.design, 3, win));

  /* Ödül: Web Tasarım Rozeti */
  const badge = () => `<svg class="gbadge" viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="bg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#ff8a3d"/></linearGradient></defs><polygon points="60,6 107,33 107,87 60,114 13,87 13,33" fill="url(#bg1)" stroke="#fff6" stroke-width="3"/><polygon points="60,20 95,40 95,80 60,100 25,80 25,40" fill="#0b0e1c"/><text x="60" y="68" text-anchor="middle" font-size="28" font-weight="800" fill="#7fe4ff" font-family="system-ui">UI</text><text x="60" y="88" text-anchor="middle" font-size="12" fill="#ffd27a">★ ★ ★</text></svg>`;
  function win() {
    stage = 4; hud(); $('.gbar i').style.width = '100%';
    const c = code(); localStorage.setItem('bwon', c); window.dispatchEvent(new Event('bwon'));
    panel(G.winT, `${badge()}<p>${G.winD}</p><p class="gprize">${G.prize}</p><p>${G.codeL}: <b class="gcode">${c}</b></p>`, [[G.claim, claim(c), 'gpri'], [G.again, begin], [G.close, close]]);
  }
  function lose() { stage = 0; hud(); panel(G.loseT, `<p>${G.loseD}</p>`, [[G.again, begin, 'gpri'], [G.close, close]]); }
  function begin() { errs = 0; layout(); }

  hud();
  if (saved) panel(G.savedT, `${badge()}<p class="gprize">${G.prize}</p><p>${G.codeL}: <b class="gcode">${saved}</b></p>`, [[G.claim, claim(saved), 'gpri'], [G.again, begin], [G.close, close]]);
  else panel(G.title, `<p>${G.hint}</p><ol class="glist">${G.steps.map((s) => `<li>${s}</li>`).join('')}</ol>`, [[G.start, begin, 'gpri']]);
}
