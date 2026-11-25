/* Site penceresinin arkasındaki canlı 3B sahne (sayfaya özel). Fare ve kaydırmaya tepki verir.
   Sayfadaki .slot3d kutularına "çıpalanır": kutu kaydıkça 3B nesne de aynı yerde kalır. */
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k;
const cvTex = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
const TECH = [['HTML', '#e44d26', '#ffffff'], ['CSS', '#2965f1', '#ffffff'], ['JS', '#f7df1e', '#1b1b1b'], ['GIT', '#f05032', '#ffffff'], ['PY', '#3776ab', '#ffd43b'], ['ANIM', '#9b7bff', '#ffffff']];

export function mountStage(kind, ctx) {
  const { D, imgBase, swin, sbody, tier, state } = ctx, low = tier === 'low';
  const sbar = swin.querySelector('.sbar'), EN = document.documentElement.lang === 'en';
  const canvas = document.createElement('canvas'); canvas.className = 'stage3d'; swin.insertBefore(canvas, sbody);
  const R = new THREE.WebGLRenderer({ canvas, antialias: !low, alpha: true, powerPreference: 'high-performance' });
  R.setPixelRatio(Math.min(devicePixelRatio, low ? 1 : 1.5)); R.setClearColor(0, 0); R.autoClear = false;
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(35, 1, .1, 200); cam.position.set(0, 0, 12);
  const sc2 = new THREE.Scene(), cam2 = new THREE.PerspectiveCamera(55, 1, .1, 200); sc2.fog = new THREE.Fog(0x070a14, 7, 36);
  scene.add(new THREE.AmbientLight(0xffffff, 1.1));
  const L1 = new THREE.PointLight(0xffb25a, 130, 60); L1.position.set(6, 5, 8); scene.add(L1);
  const L2 = new THREE.PointLight(0x7fe4ff, 110, 60); L2.position.set(-7, -3, 8); scene.add(L2);
  const TL = new THREE.TextureLoader(), texCache = {};
  const tex = (u) => texCache[u] || (texCache[u] = (() => { const t = TL.load(imgBase + u); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; })());
  const glow = (c, o = .5) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false });
  const glowTex = cvTex(256, 256, (c) => { const g = c.createRadialGradient(128, 128, 8, 128, 128, 128); g.addColorStop(0, 'rgba(255,210,150,.55)'); g.addColorStop(.5, 'rgba(127,228,255,.14)'); g.addColorStop(1, 'rgba(127,228,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 256, 256); });
  let W = 1, H = 1, upp = .01, alive = true, raf = 0, last = performance.now(), t = 0, mx = 0, my = 0, mxs = 0, mys = 0;
  const ptr = { x: 0, y: 0, in: false }, anim = [], anchors = [], offs = [];
  const on = (tg, e, f, o) => { tg.addEventListener(e, f, o); offs.push(() => tg.removeEventListener(e, f, o)); };
  const rs = () => { canvas.style.top = sbar.offsetHeight + 'px'; const w = swin.clientWidth, h = Math.max(1, swin.clientHeight - sbar.offsetHeight); R.setSize(w, h, false); W = w; H = h; cam.aspect = cam2.aspect = w / h; cam.updateProjectionMatrix(); cam2.updateProjectionMatrix(); upp = 2 * Math.tan(cam.fov * Math.PI / 360) * 12 / h; };
  rs(); const ro = new ResizeObserver(rs); ro.observe(swin);
  on(window, 'pointermove', (e) => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; ptr.x = e.clientX; ptr.y = e.clientY; ptr.in = true; });
  const tip = document.createElement('div'); tip.className = 'tip3d'; swin.appendChild(tip);

  /* arka plan yıldız tozu (kaydırmayla paralaks) */
  const stars = (() => { const n = low ? 90 : 220, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) a.set([(Math.random() - .5) * 28, (Math.random() - .5) * 18, -2 - Math.random() * 9], i * 3); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(a, 3)); const p = new THREE.Points(g, new THREE.PointsMaterial({ size: .05, color: 0xcfe9ff, transparent: true, opacity: .6, depthWrite: false })); scene.add(p); return p; })();

  /* çıpa: grubu DOM kutusunun üstüne oturtur */
  const anchor = (group, slot, o = {}) => { group.visible = false; scene.add(group); anchors.push({ group, slot, fit: o.fit || 5, z: o.z || 0, s: o.s || 1, par: o.par || 0, fn: o.fn }); };
  const place = () => {
    const cr = canvas.getBoundingClientRect();
    for (const a of anchors) {
      if (!a.slot.isConnected) { a.group.visible = false; continue; }
      const r = a.slot.getBoundingClientRect(), vis = r.width > 0 && r.bottom > cr.top - 60 && r.top < cr.bottom + 60; a.group.visible = vis; if (!vis) continue;
      const u = a.group.userData; u.sc = Math.min(r.width, r.height) * upp / a.fit * a.s; u.px = (r.left + r.width / 2 - cr.left - cr.width / 2) * upp + mxs * a.par; u.py = -(r.top + r.height / 2 - cr.top - cr.height / 2) * upp - mys * a.par; u.ww = r.width * upp; u.hh = r.height * upp;
      if (a.fn) a.fn(u); else { a.group.position.set(u.px, u.py, a.z); a.group.scale.setScalar(u.sc); }
    }
  };
  const hero = sbody.querySelector('.slot3d.hero');

  /* ortak yapı taşları */
  const techCube = (i, size) => {
    const tt = TECH[i], map = cvTex(256, 256, (c, w, h) => { c.fillStyle = tt[1]; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,.16)'; c.fillRect(0, 0, w, h / 2); c.fillStyle = tt[2]; const long = tt[0].length > 3; c.font = `800 ${long ? 66 : 96}px system-ui`; c.textAlign = 'center'; c.fillText(tt[0], w / 2, h / 2 + (long ? 22 : 32)); c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8); });
    return new THREE.Mesh(new RoundedBoxGeometry(size, size, size, 3, size * .12), new THREE.MeshStandardMaterial({ map, roughness: .35, metalness: .15 }));
  };

  const scenes = {
    /* ================= HAKKIMDA ================= */
    about() {
      const slotP = sbody.querySelector('.slot3d.portrait'), slotS = sbody.querySelector('.slot3d.skills');
      if (slotP) {
        const grp = new THREE.Group(), img = new Image(); img.src = imgBase + 'portrait.jpg';
        const draw = (c, w, h) => {
          c.clearRect(0, 0, w, h); let g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#17203a'); g.addColorStop(1, '#0b0f1a'); c.fillStyle = g; c.beginPath(); c.roundRect(0, 0, w, h, 56); c.fill();
          if (img.complete && img.naturalWidth) { c.save(); c.beginPath(); c.roundRect(14, 14, w - 28, h - 28, 46); c.clip(); const s = Math.max((w - 28) / img.naturalWidth, (h - 28) / img.naturalHeight); c.drawImage(img, (w - img.naturalWidth * s) / 2, (h - img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s); const gr = c.createLinearGradient(0, h * .62, 0, h); gr.addColorStop(0, 'rgba(5,9,17,0)'); gr.addColorStop(1, 'rgba(5,9,17,.88)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.restore(); }
          g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#ffb25a'); g.addColorStop(1, '#7fe4ff'); c.strokeStyle = g; c.lineWidth = 10; c.beginPath(); c.roundRect(5, 5, w - 10, h - 10, 52); c.stroke();
          c.fillStyle = '#fff'; c.font = '700 54px system-ui'; c.fillText(D.cv.name, 44, h - 88); c.fillStyle = '#ffb25a'; c.font = '600 27px system-ui'; c.fillText(D.t.aboutCap, 44, h - 44);
        };
        const ct = cvTex(768, 960, draw); img.onload = () => { draw(ct.image.getContext('2d'), 768, 960); ct.needsUpdate = true; };
        const card = new THREE.Group();
        const slab = new THREE.Mesh(new RoundedBoxGeometry(2.5, 3.1, .14, 4, .14), new THREE.MeshStandardMaterial({ color: 0x10172a, metalness: .7, roughness: .25, emissive: 0x0a1226 })); card.add(slab);
        const face = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3), new THREE.MeshBasicMaterial({ map: ct, transparent: true })); face.position.z = .075; card.add(face);
        const halo = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); halo.position.z = -.6; grp.add(halo, card);
        const r1 = new THREE.Mesh(new THREE.TorusGeometry(2.25, .012, 8, 140), glow(0xffb25a, .8)), r2 = new THREE.Mesh(new THREE.TorusGeometry(2.0, .012, 8, 140), glow(0x7fe4ff, .7)); grp.add(r1, r2);
        const orb = []; for (let i = 0; i < 6; i++) { const c = techCube(i, .46); grp.add(c); orb.push(c); }
        anchor(grp, slotP, { fit: 4.6, par: .4 });
        anim.push((tt) => {
          card.rotation.y = mxs * 1.0 + Math.sin(tt * .6) * .12; card.rotation.x = mys * .7 + Math.sin(tt * .5) * .05; card.position.y = Math.sin(tt * 1.1) * .08;
          r1.rotation.set(1.2 + mys, tt * .5, 0); r2.rotation.set(.4, tt * -.4 + mxs, 1.1);
          orb.forEach((c, i) => { const a = tt * .55 + i * Math.PI * 2 / 6, rr = 2.45 + (i % 2) * .25; c.position.set(Math.cos(a) * rr, Math.sin(a * 1.4) * .9, Math.sin(a) * rr * .55 + .3); c.rotation.set(tt * .7 + i, tt * .9, 0); });
        });
      }
      if (slotS) {
        const sg = new THREE.Group(), cubes = [], gauges = [];
        D.cv.skills.forEach((s, i) => {
          const c = techCube(i, .85); c.userData = { i, h: 0 }; sg.add(c); cubes.push(c);
          const bg = new THREE.Mesh(new THREE.RingGeometry(.55, .64, 48), glow(0x2a3550, .9)), pr = new THREE.Mesh(new THREE.RingGeometry(.55, .64, 48, 1, Math.PI / 2, -Math.PI * 2 * s[1] / 100), glow(0xffb25a, .95)); bg.position.y = pr.position.y = -1.2; sg.add(bg, pr); gauges.push(pr);
        });
        anchor(sg, slotS, { fn: (u) => { const sc = clamp(u.ww / 8.6, .42, 1.2); sg.position.set(u.px, u.py, 0); sg.scale.setScalar(sc); cubes.forEach((c, i) => { c.position.x = (i - 2.5) * 1.5; gauges[i].position.x = c.position.x; }); } });
        sg.userData.cubes = cubes; const ray = new THREE.Raycaster(), nd = new THREE.Vector2(); let hov = -1;
        anim.push((tt, dt) => {
          if (sg.visible && ptr.in) { const cr = canvas.getBoundingClientRect(); nd.set((ptr.x - cr.left) / cr.width * 2 - 1, -((ptr.y - cr.top) / cr.height) * 2 + 1); ray.setFromCamera(nd, cam); const h = ray.intersectObjects(cubes, false)[0], ni = h ? h.object.userData.i : -1;
            if (ni !== hov) { hov = ni; if (ni >= 0) { tip.textContent = `${D.cv.skills[ni][0]} · %${D.cv.skills[ni][1]}`; tip.style.opacity = 1; } else tip.style.opacity = 0; }
            if (hov >= 0) { const sr = swin.getBoundingClientRect(); tip.style.left = ptr.x - sr.left + 16 + 'px'; tip.style.top = ptr.y - sr.top + 16 + 'px'; } } else if (hov >= 0) { hov = -1; tip.style.opacity = 0; }
          cubes.forEach((c, i) => { c.userData.h = lerp(c.userData.h, hov === i ? 1 : 0, Math.min(1, dt * 8)); c.scale.setScalar(1 + c.userData.h * .35); c.rotation.y = tt * (.5 + c.userData.h * 2) + i; c.rotation.x = Math.sin(tt * .8 + i) * .45; c.position.y = Math.sin(tt * 1.2 + i) * .12 + c.userData.h * .2; });
        });
      }
    },
    /* ================= PROJELER ================= */
    projects() {
      if (!hero) return; const g = new THREE.Group(), n = D.proj.length, ringG = new THREE.Group(); g.add(ringG);
      D.proj.forEach((p, i) => {
        const a = i / n * Math.PI * 2, it = new THREE.Group(), fr = new THREE.Mesh(new RoundedBoxGeometry(1.75, 2.35, .08, 3, .06), new THREE.MeshStandardMaterial({ color: 0x0c1322, metalness: .6, roughness: .3, emissive: 0x0a2a3a })), m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.2), new THREE.MeshBasicMaterial({ map: tex('projects/' + p[0] + '.jpg') }));
        m.position.z = .045; it.add(fr, m); it.position.set(Math.sin(a) * 3.6, 0, Math.cos(a) * 3.6); it.rotation.y = a; ringG.add(it);
      });
      const floor = new THREE.Mesh(new THREE.RingGeometry(3.4, 3.8, 90), glow(0xffb25a, .35)); floor.rotation.x = -Math.PI / 2; floor.position.y = -1.6; g.add(floor);
      anchor(g, hero, { fit: 8, par: .3 }); anim.push((tt) => { ringG.rotation.y = tt * .3 + mxs * 1.2; g.rotation.x = .12 + mys * .3; });
    },
    /* ================= BLOG ================= */
    blog() {
      if (!hero) return; const g = new THREE.Group(), snip = [['$ git commit -m "ilk yazı"', '$ git push origin main', '✔ 3 files changed'], ['<h1>Merhaba</h1>', '<p>İlk blog yazım</p>', '<img src="ss.png" alt="">'], ['fetch("/api/blog")', '  .then(r => r.json())', '  .then(show);'], ['.grid { display: grid; }', '@media (min-width: 48em) {', '  .grid { gap: 2rem }'], ['function selam(ad) {', '  return `Merhaba ${ad}`', '}']], wins = [];
      snip.forEach((lines, i) => {
        const map = cvTex(512, 320, (c, w, h) => { c.fillStyle = 'rgba(8,12,22,.95)'; c.fillRect(0, 0, w, h); ['#ff5f57', '#febc2e', '#28c840'].forEach((col, k) => { c.fillStyle = col; c.beginPath(); c.arc(26 + k * 26, 24, 8, 0, 7); c.fill(); }); c.strokeStyle = '#7fe4ff'; c.lineWidth = 4; c.strokeRect(2, 2, w - 4, h - 4); c.fillStyle = '#7dffb0'; c.font = '600 26px monospace'; lines.forEach((l, j) => c.fillText(l, 28, 100 + j * 52)); });
        const m = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.9), new THREE.MeshBasicMaterial({ map, transparent: true, side: THREE.DoubleSide })); g.add(m); wins.push(m);
      });
      anchor(g, hero, { fit: 6.5, par: .35 });
      anim.push((tt) => wins.forEach((m, i) => { m.position.set(Math.sin(i * 1.7) * 2.1, Math.cos(i * 2.3) * 1.2 + Math.sin(tt * .8 + i) * .22, -i * .8 + 1.4); m.rotation.y = -.5 + Math.sin(tt * .4 + i) * .15 + mxs * .6; m.rotation.x = Math.sin(tt * .5 + i) * .06 - mys * .3; }));
    },
    /* ================= GALERİ: halka + fotoğraf yolculuğu (tünel) ================= */
    gallery() {
      const P = D.photos, n = P.length;
      if (hero) {
        const g = new THREE.Group(), ringG = new THREE.Group(); g.add(ringG);
        P.slice(0, 10).forEach((p, i) => { const a = i / 10 * Math.PI * 2, w = 1.25, h = w / (p[1] / p[2]), it = new THREE.Group(), fr = new THREE.Mesh(new THREE.PlaneGeometry(w + .1, h + .1), new THREE.MeshBasicMaterial({ color: 0xf1ece2 })), m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex(p[0]) })); fr.position.z = -.005; m.position.z = .005; it.add(fr, m); it.position.set(Math.sin(a) * 3.5, Math.sin(i * 1.9) * .3, Math.cos(a) * 3.5); it.rotation.y = a; ringG.add(it); });
        const core = new THREE.Mesh(new THREE.SphereGeometry(.5, 24, 16), glow(0xffb25a, .6)); g.add(core);
        anchor(g, hero, { fit: 8, par: .3 }); anim.push((tt) => { ringG.rotation.y = -tt * .24 + mxs; core.scale.setScalar(1 + Math.sin(tt * 2) * .12); });
      }
      /* galeri salonu: uzun bir sergi koridoru. Tüm fotoğraflar tavandan asılı, sağlı sollu şeritlerde süzülür; yürürken hepsinin arasından geçersin */
      const STEP = 3.3, HW = 3.4, HH = 3.6, ZST = 7, ZEND = -(n - 1) * STEP - 6, LEN = ZST - ZEND, ZC = (ZST + ZEND) / 2, LANE = 1.7, PY = 1.85, frames = [], hm = [], AB = THREE.AdditiveBlending, DS = THREE.DoubleSide;
      const bm = (o, b = 1) => { const m = new THREE.MeshBasicMaterial(o); m.userData.tr = !!o.transparent; hm.push({ m, b }); return m; };
      const rep = (t, x, y) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(x, y); t.anisotropy = 8; return t; };
      const rad = (rgb, al) => cvTex(128, 128, (c) => { const g = c.createRadialGradient(64, 64, 2, 64, 64, 64); g.addColorStop(0, `rgba(${rgb},${al})`); g.addColorStop(.6, `rgba(${rgb},${al * .3})`); g.addColorStop(1, `rgba(${rgb},0)`); c.fillStyle = g; c.fillRect(0, 0, 128, 128); });
      const poolT = rad('255,220,170', .55), blobT = rad('0,0,0', .5);
      sc2.fog = new THREE.Fog(0x0b0c10, 9, 32);
      const add2 = (geo, mat, x, y, z, ry = 0, rx = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); sc2.add(m); return m; };
      /* zemin: sıcak parke; duvarlar: mat galeri beyazı; tavan: ışık şeritleri */
      const floorT = rep(cvTex(512, 512, (c, w, h) => { c.fillStyle = '#3a2f26'; c.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { c.fillStyle = `rgba(${i % 2 ? '255,220,180' : '0,0,0'},${.03 + (i % 3) * .015})`; c.fillRect(i * 64, 0, 64, h); c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(i * 64, 0, 2, h); } for (let j = 0; j < 6; j++) { c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(((j * 3) % 8) * 64, j * 90 + 20, 64, 2); } }), 3, LEN / 4.2);
      add2(new THREE.PlaneGeometry(HW * 2, LEN), bm({ map: floorT }), 0, 0, ZC, 0, -Math.PI / 2);
      const wallT = rep(cvTex(512, 256, (c, w, h) => { c.fillStyle = '#e6e1d7'; c.fillRect(0, 0, w, h); for (let i = 0; i < 500; i++) { c.fillStyle = `rgba(0,0,0,${Math.random() * .025})`; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); } const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(0,0,0,.28)'); g.addColorStop(.25, 'rgba(0,0,0,0)'); g.addColorStop(.8, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.25)'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = '#2a2522'; c.fillRect(0, h - 22, w, 22); }), LEN / 4, 1);
      [-1, 1].forEach((sd) => add2(new THREE.PlaneGeometry(LEN, HH), bm({ map: wallT }), sd * HW, HH / 2, ZC, -sd * Math.PI / 2));
      add2(new THREE.PlaneGeometry(HW * 2, LEN), bm({ color: 0x1b1d24 }), 0, HH, ZC, 0, Math.PI / 2);
      add2(new THREE.BoxGeometry(.5, .03, LEN - 2), bm({ color: 0xfff1dc }), 0, HH - .02, ZC); [-1, 1].forEach((sd) => add2(new THREE.BoxGeometry(.08, .03, LEN), bm({ color: 0xffc27a }), sd * (HW - .25), HH - .02, ZC));
      add2(new THREE.PlaneGeometry(HW * 2, HH), bm({ map: cvTex(1024, 512, (c, w, h) => { c.fillStyle = '#e6e1d7'; c.fillRect(0, 0, w, h); c.textAlign = 'center'; c.fillStyle = '#1d1d21'; c.font = '300 130px Georgia,serif'; c.fillText(EN ? 'Frame by Frame' : 'Kare Kare', w / 2, 250); c.fillStyle = '#b8955a'; c.fillRect(w / 2 - 70, 280, 140, 5); c.fillStyle = '#5a5a62'; c.font = 'italic 36px Georgia,serif'; c.fillText(EN ? 'Berat Yanardağ · Personal collection' : 'Berat Yanardağ · Kişisel koleksiyon', w / 2, 350); }) }), 0, HH / 2, ZEND + .01);
      add2(new THREE.PlaneGeometry(HW * 2, HH), bm({ color: 0x14161b }), 0, HH / 2, ZST, Math.PI);
      /* fotoğraflar: tavandan ince halatlarla asılı paneller, yürüyüş yoluna doğru hafif dönük */
      P.forEach((p, i) => {
        const side = i % 2 ? 1 : -1, asp = p[1] / p[2], h = Math.min(2.2, 2.0 / asp), ww = h * asp, z = -i * STEP, px = side * LANE, ry = -side * .28, g = new THREE.Group();
        const fr = new THREE.Mesh(new THREE.PlaneGeometry(ww + .22, h + .22), bm({ color: 0x15161a })), mt = new THREE.Mesh(new THREE.PlaneGeometry(ww + .12, h + .12), bm({ color: 0xf6f1e6 })), m = new THREE.Mesh(new THREE.PlaneGeometry(ww, h), bm({ map: tex(p[0]) })), bk = new THREE.Mesh(new THREE.PlaneGeometry(ww + .22, h + .22), bm({ color: 0x1b1c20 })); m.visible = false;
        mt.position.z = .006; m.position.z = .012; bk.rotation.y = Math.PI; bk.position.z = -.02; g.add(fr, mt, m, bk); g.position.set(px, PY, z); g.rotation.y = ry; sc2.add(g); frames.push({ g, m });
        const top = PY + h / 2 + .11, cl = HH - top;
        [-1, 1].forEach((sd) => add2(new THREE.CylinderGeometry(.008, .008, cl, 5), bm({ color: 0x2a2a30 }), px + sd * ww * .4 * Math.cos(ry), top + cl / 2, z - sd * ww * .4 * Math.sin(ry)));
        add2(new THREE.PlaneGeometry(ww + .9, h + .9), bm({ map: blobT, transparent: true, depthWrite: false, opacity: .22 }, .22), px, PY - .05, z - .12, ry);
        add2(new THREE.PlaneGeometry(3.4, 3.4), bm({ map: poolT, transparent: true, blending: AB, depthWrite: false, opacity: .5 }, .5), px, .012, z + .5, 0, -Math.PI / 2);
        const hy = HH - .12, dz = 1.2, dy = hy - PY, L = Math.hypot(dy, dz);
        add2(new THREE.CylinderGeometry(.06, .08, .16, 10), bm({ color: 0x15161a }), px, hy, z + dz);
      });
      /* havada süzülen toz */
      const DN = low ? 60 : 150, dpos = new Float32Array(DN * 3); for (let i = 0; i < DN; i++) dpos.set([(Math.random() - .5) * HW * 1.8, .3 + Math.random() * 3, ZST - Math.random() * LEN], i * 3);
      const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dpos, 3)); const dmat = new THREE.PointsMaterial({ size: .04, color: 0xfff1dc, transparent: true, opacity: .35, depthWrite: false, blending: AB }); dmat.userData.tr = true; hm.push({ m: dmat, b: .35 }); const dust = new THREE.Points(dg, dmat); dust.frustumCulled = false; sc2.add(dust);
      let lastF = -1; const up = new Set(), pend = [];
      anim.push((tt, dt) => {
        if (!state.jActive) return; const f = state.jFade == null ? 1 : state.jFade;
        if (Math.abs(f - lastF) > .004) { lastF = f; hm.forEach((o) => { o.m.opacity = o.b * f; const tr = f < .995 || o.m.userData.tr; if (o.m.transparent !== tr) { o.m.transparent = tr; o.m.needsUpdate = true; } }); }
        const near = Math.round(state.jp * (n - 1)); for (let k = Math.max(0, near - 2); k <= Math.min(n - 1, near + 2); k++) if (!up.has(k)) { up.add(k); pend.push([k, tex(P[k][0].replace('/t/', '/'))]); }
        for (let q = pend.length - 1; q >= 0; q--) { const [k, ft] = pend[q]; if (ft.image) { frames[k].m.material.map = ft; frames[k].m.material.needsUpdate = true; pend.splice(q, 1); } }
        frames.forEach((o) => { if (!o.m.visible && o.m.material.map && o.m.material.map.image) o.m.visible = true; });
        { const a = dg.attributes.position; for (let i = 0; i < DN; i++) { a.array[i * 3 + 1] += Math.sin(tt * .4 + i) * dt * .05; a.array[i * 3] += Math.cos(tt * .3 + i * 1.3) * dt * .04; } a.needsUpdate = true; }
        const T = state.jp * (n - 1), i0 = Math.min(n - 1, Math.floor(T)), i1 = Math.min(n - 1, i0 + 1), s0 = clamp((T - i0 - .2) / .6, 0, 1), sm = s0 * s0 * (3 - 2 * s0), sd = (k) => (k % 2 ? 1 : -1);
        const yaw = lerp(-sd(i0) * .45, -sd(i1) * .45, sm), cx = lerp(-sd(i0), -sd(i1), sm) * .45 + mxs * .3;
        cam2.position.set(cx, 1.65 + Math.sin(tt * 1.3) * .012, 3.6 - T * STEP); cam2.rotation.set(-.03 - mys * .05, yaw - mxs * .1, 0, 'YXZ');
      });
      tunnelOn = true;
    },
    /* ================= İLETİŞİM: dünya + mesaj yolculuğu ================= */
    contact() {
      if (!hero) return; const F = D.fly, R0 = 2.2, UP = new THREE.Vector3(0, 1, 0), ZV = new THREE.Vector3(0, 0, 1);
      const ll = (lat, lon, r) => { const ph = (90 - lat) * Math.PI / 180, th = (lon + 180) * Math.PI / 180; return new THREE.Vector3(-r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)); };
      const wrap = new THREE.Group(), gl = new THREE.Group(); wrap.add(gl);
      gl.add(new THREE.Mesh(new THREE.SphereGeometry(R0, 40, 28), new THREE.MeshBasicMaterial({ color: 0x0a1630, transparent: true, opacity: .88 })));
      gl.add(new THREE.Mesh(new THREE.SphereGeometry(R0 + .01, 36, 24), new THREE.MeshBasicMaterial({ color: 0x7fe4ff, wireframe: true, transparent: true, opacity: .2 })));
      const n = low ? 500 : 1100, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const y = 1 - i / (n - 1) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963; a.set([Math.cos(th) * r * (R0 + .03), y * (R0 + .03), Math.sin(th) * r * (R0 + .03)], i * 3); }
      const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(a, 3)); gl.add(new THREE.Points(pg, new THREE.PointsMaterial({ size: .03, color: 0xffd9a0 })));
      const A = ll(36.9, 30.7, R0 + .03), B = ll(37.4, -122.1, R0 + .03);
      const label = (txt, col) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: cvTex(256, 96, (c, w, h) => { c.fillStyle = 'rgba(8,12,22,.85)'; c.beginPath(); c.roundRect(4, 4, w - 8, h - 8, 24); c.fill(); c.strokeStyle = col; c.lineWidth = 4; c.stroke(); c.fillStyle = '#fff'; c.font = '700 42px system-ui'; c.textAlign = 'center'; c.fillText(txt, w / 2, 62); }), transparent: true, depthTest: false })); sp.scale.set(1.1, .41, 1); return sp; };
      const mk = (v, col, txt) => { const m = new THREE.Mesh(new THREE.SphereGeometry(.07, 12, 10), new THREE.MeshBasicMaterial({ color: col })); m.position.copy(v); gl.add(m); const l = label(txt, '#' + col.toString(16).padStart(6, '0')); l.position.copy(v).multiplyScalar(1.28); gl.add(l); const rg = new THREE.Mesh(new THREE.RingGeometry(.1, .14, 24), glow(col, .8)); rg.position.copy(v).multiplyScalar(1.003); rg.lookAt(v.clone().multiplyScalar(2)); gl.add(rg); return rg; };
      const ringA = mk(A, 0xffb25a, F.from), ringB = mk(B, 0x7fe4ff, F.to);
      const curve = new THREE.QuadraticBezierCurve3(A, A.clone().add(B).normalize().multiplyScalar(R0 * 2.2), B);
      gl.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 80, .012, 6, false), glow(0xffb25a, .22)));
      const tg = new THREE.TubeGeometry(curve, 100, .026, 8, false), tube = new THREE.Mesh(tg, glow(0xffd9a0, .95)); gl.add(tube); const tIdx = tg.index.count; tg.setDrawRange(0, 0);
      const plane = new THREE.Mesh(new THREE.ConeGeometry(.13, .38, 3), new THREE.MeshBasicMaterial({ color: 0xffffff })); plane.visible = false; gl.add(plane);
      const burst = new THREE.Mesh(new THREE.RingGeometry(.12, .16, 32), glow(0x7fe4ff, .9)); burst.visible = false; burst.position.copy(B).multiplyScalar(1.004); burst.lookAt(B.clone().multiplyScalar(2)); gl.add(burst);
      const fly = { mode: 'idle', u: 0, k: 0, t: 0, res: null, lt: 0, at: 0 }, bar = swin.querySelector('.fbar i'), qT = new THREE.Quaternion(), eT = new THREE.Euler(.25, 0, 0), tmp = new THREE.Vector3();
      const ev = (n) => window.dispatchEvent(new Event(n));
      on(window, 'contact:send', () => { fly.mode = 'go'; fly.u = 0; fly.t = 0; fly.res = null; });
      on(window, 'contact:done', () => { fly.res = 'done'; }); on(window, 'contact:fail', () => { fly.res = 'fail'; });
      anchor(wrap, hero, { fit: 5.6, par: .3, fn: (u) => { const fs = H * upp * .42 / R0; wrap.position.set(lerp(u.px, 0, fly.k), lerp(u.py, 0, fly.k), 0); wrap.scale.setScalar(lerp(u.sc, fs, fly.k)); } });
      anim.push((tt, dt) => {
        fly.k += ((fly.mode === 'idle' ? 0 : 1) - fly.k) * Math.min(1, dt * 3.2);
        if (fly.mode === 'go') { fly.t += dt; fly.u = Math.min(.9, fly.t / 4.2 * .9) + (fly.t > 4.2 ? Math.sin(tt * 3) * .004 : 0); if (fly.res === 'done' && fly.t > 3.2) { fly.mode = 'land'; fly.lt = 0; } else if (fly.res === 'fail' && fly.t > 1.4) fly.mode = 'back'; }
        else if (fly.mode === 'land') { fly.lt += dt; fly.u = Math.min(1, .9 + .1 * fly.lt / 1.1); if (fly.lt > 1.1) { fly.mode = 'arrived'; fly.at = 0; } }
        else if (fly.mode === 'arrived') { fly.at += dt; if (fly.at > 1.7) { fly.mode = 'idle'; ev('contact:landed'); } }
        else if (fly.mode === 'back') { fly.u = Math.max(0, fly.u - dt / 1.4); if (fly.u <= 0) { fly.mode = 'idle'; ev('contact:aborted'); } }
        const flying = fly.mode !== 'idle'; plane.visible = flying && fly.mode !== 'arrived'; tg.setDrawRange(0, flying ? Math.floor(tIdx * fly.u / 3) * 3 : 0);
        if (flying) { curve.getPoint(fly.u, plane.position); curve.getTangent(Math.min(fly.u, .99), tmp); plane.quaternion.setFromUnitVectors(UP, tmp); if (bar) bar.style.width = fly.u * 100 + '%'; }
        burst.visible = fly.mode === 'arrived'; if (burst.visible) { const s = 1 + fly.at * 5; burst.scale.setScalar(s); burst.material.opacity = Math.max(0, .9 - fly.at * .5); }
        ringA.scale.setScalar(1 + (tt * .8 % 1) * 1.6); ringB.scale.setScalar(1 + (tt * 1.0 % 1) * 1.6);
        if (flying) qT.setFromUnitVectors(tmp.copy(plane.position).normalize(), ZV); else { eT.set(.25, tt * .18 + 3.5, 0); qT.setFromEuler(eT); }
        gl.quaternion.slerp(qT, flying ? .07 : .05);
        cam.position.z = lerp(12, 9.6, fly.k * .8);
      });
    },
  };
  /* tel kafes şekiller: zengin arka planı olmayan sayfalarda (galeri, iletişim) */
  if (!['about', 'projects', 'blog'].includes(kind)) {
    const geos = [new THREE.IcosahedronGeometry(1, 0), new THREE.OctahedronGeometry(1, 0), new THREE.TorusGeometry(.8, .22, 8, 24), new THREE.TetrahedronGeometry(1.1, 0), new THREE.TorusKnotGeometry(.6, .18, 48, 8)], cols = [0x7fe4ff, 0xffb25a, 0xc28bf0, 0xff6f91, 0x5fe0a8], shapes = [];
    for (let i = 0; i < (low ? 5 : 11); i++) {
      const m = new THREE.Mesh(geos[i % 5], new THREE.MeshBasicMaterial({ color: cols[i % 5], wireframe: true, transparent: true, opacity: .2, depthWrite: false })), side = i % 2 ? 1 : -1;
      m.userData = { x: side * (6.6 + Math.random() * 2.2), y: (Math.random() - .5) * 10, z: -4 - Math.random() * 6, s: .35 + Math.random() * .55, sp: .2 + Math.random() * .4, par: .3 + Math.random() * .8, o: Math.random() * 6 }; m.scale.setScalar(m.userData.s); scene.add(m); shapes.push(m);
    }
    anim.push((tt) => { const sy = sbody.scrollTop * upp; shapes.forEach((m) => { const u = m.userData, y = (((u.y + sy * u.par * .5) % 12) + 12) % 12 - 6; m.position.set(u.x - mxs * u.par * 2, y - mys * u.par, u.z); m.rotation.set(tt * u.sp + u.o, tt * u.sp * .7, 0); }); });
  }
  /* HAKKIMDA / PROJELER / BLOG: sade ama etkileyici "neon ufuk": koyu gökyüzü, yumuşak ufuk parıltısı, sönük şehir silüeti ve
     kaydırdıkça hızlanan, ufka doğru eriyen neon zemin ızgarası. Sayfa başına tek bir yaratıcı detay (ağ küresi / sahne ışığı / kod yağmuru). */
  if (['about', 'projects', 'blog'].includes(kind)) {
    swin.classList.add('bd3d');
    const ACC = { about: [0x7fe4ff, 0xc28bf0], projects: [0xffb25a, 0xff6f91], blog: [0x5fe0a8, 0x7fe4ff] }[kind], bdg = new THREE.Group(), Add = THREE.AdditiveBlending, half = low ? .5 : 1; scene.add(bdg);
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(260, 140), new THREE.MeshBasicMaterial({ map: cvTex(8, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#05060f'); g.addColorStop(.45, '#0e0f2c'); g.addColorStop(.72, '#241a52'); g.addColorStop(.88, '#4a2a6a'); g.addColorStop(1, '#120a22'); c.fillStyle = g; c.fillRect(0, 0, w, h); }), transparent: true, opacity: .85, fog: false, depthWrite: false }));
    sky.position.set(0, 4, -70); bdg.add(sky);
    const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: ACC[1], transparent: true, opacity: .75, blending: Add, depthWrite: false, fog: false })); sun.scale.set(100, 38, 1); sun.position.set(0, -8, -62); bdg.add(sun);
    const winTex = [0, 1].map(() => cvTex(64, 128, (c, w, h) => { c.fillStyle = '#080b1c'; c.fillRect(0, 0, w, h); for (let y = 6; y < h - 6; y += 12) for (let x = 5; x < w - 5; x += 10) if (Math.random() < .12) { c.fillStyle = ['#ffd98a', '#8fe4ff', '#ffb870'][Math.floor(Math.random() * 3)]; c.fillRect(x, y, 4, 5); } }));
    const layers = [[-30, .5, 40, -9.4, 9, .04], [-44, .36, 52, -12.6, 12, .08]].map(([z, f, cnt, base, hm, k], li) => {
      const n = Math.floor(cnt * half), im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ map: winTex[li % 2], color: new THREE.Color(f, f, f * 1.15), fog: false }), n), o = new THREE.Object3D();
      for (let i = 0; i < n; i++) { const w = 1.6 + Math.random() * 2.8, h = 3 + Math.random() * hm; o.position.set(-36 + i * (72 / n) + (Math.random() - .5), base + h / 2, z); o.scale.set(w, h, 1.5); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }
      im.frustumCulled = false; bdg.add(im); return { im, k };
    });
    const gridU = { uT: { value: 0 }, uCol: { value: new THREE.Color(ACC[0]) } };
    const grid = new THREE.Mesh(new THREE.PlaneGeometry(160, 80), new THREE.ShaderMaterial({ uniforms: gridU, transparent: true, depthWrite: false, blending: Add, side: THREE.DoubleSide, vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }', fragmentShader: 'varying vec2 vUv; uniform float uT; uniform vec3 uCol; void main(){ vec2 g=vec2(vUv.x*80.0, vUv.y*40.0-uT*1.4); vec2 f=abs(fract(g-0.5)-0.5)/fwidth(g); float l=1.0-min(min(f.x,f.y),1.0); float fade=smoothstep(1.0,0.35,vUv.y)*smoothstep(0.0,0.08,vUv.y); gl_FragColor=vec4(uCol, l*fade*0.55); }' }));
    grid.rotation.x = -Math.PI / 2; grid.position.set(0, -9.2, -46); bdg.add(grid);
    const DN = Math.floor(50 * half), dp = new Float32Array(DN * 3); for (let i = 0; i < DN; i++) dp.set([(Math.random() - .5) * 44, (Math.random() - .5) * 20, -4 - Math.random() * 26], i * 3);
    const dgm = new THREE.BufferGeometry(); dgm.setAttribute('position', new THREE.BufferAttribute(dp, 3)); const dust = new THREE.Points(dgm, new THREE.PointsMaterial({ size: .4, map: glowTex, color: 0xffe9c0, transparent: true, opacity: .45, depthWrite: false, blending: Add })); dust.frustumCulled = false; bdg.add(dust);
    let extra = () => {};
    if (kind === 'about') {
      const grp = new THREE.Group(); grp.position.set(12, 1.5, -18); bdg.add(grp);
      grp.add(new THREE.Mesh(new THREE.SphereGeometry(5, 24, 16), new THREE.MeshBasicMaterial({ color: ACC[0], wireframe: true, transparent: true, opacity: .1, fog: false })));
      grp.add(new THREE.Points(new THREE.IcosahedronGeometry(5.05, 1), new THREE.PointsMaterial({ size: .45, map: glowTex, color: 0xffd9a0, transparent: true, opacity: .85, depthWrite: false, blending: Add })));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(7, .03, 6, 90), glow(ACC[1], .5)); ring.rotation.x = 1.2; grp.add(ring);
      extra = (tt, sy) => { grp.rotation.y = tt * .12; ring.rotation.z = tt * .3; grp.position.y = 1.5 + sy * .05 + Math.sin(tt * .4) * .4; };
    } else if (kind === 'projects') {
      const ct = cvTex(64, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,205,130,.55)'); g.addColorStop(1, 'rgba(255,205,130,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.globalCompositeOperation = 'destination-in'; const x = c.createLinearGradient(0, 0, w, 0); x.addColorStop(0, 'rgba(0,0,0,0)'); x.addColorStop(.5, 'rgba(0,0,0,1)'); x.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = x; c.fillRect(0, 0, w, h); });
      const cone = new THREE.Mesh(new THREE.PlaneGeometry(30, 44), new THREE.MeshBasicMaterial({ map: ct, transparent: true, opacity: .26, blending: Add, depthWrite: false, fog: false, side: THREE.DoubleSide })); cone.position.set(9, 4, -24); bdg.add(cone);
      extra = (tt, sy) => { cone.rotation.z = -.28 + Math.sin(tt * .2) * .06; cone.material.opacity = .22 + Math.sin(tt * .5) * .05; };
    } else {
      const rc = cvTex(512, 512, (c, w, h) => { c.fillStyle = '#000'; c.fillRect(0, 0, w, h); c.font = '20px monospace'; for (let x = 0; x < w; x += 44) { const len = 6 + Math.random() * 14, y0 = Math.random() * h; for (let k = 0; k < len; k++) { c.fillStyle = `rgba(95,224,168,${1 - k / len})`; c.fillText('01{}</>;=#'[Math.floor(Math.random() * 10)], x, (y0 + k * 22) % h); } } });
      rc.wrapS = rc.wrapT = THREE.RepeatWrapping; rc.repeat.set(4, 2.4);
      const rp = new THREE.Mesh(new THREE.PlaneGeometry(120, 70), new THREE.MeshBasicMaterial({ map: rc, transparent: true, opacity: .11, blending: Add, depthWrite: false, fog: false })); rp.position.set(0, 0, -50); bdg.add(rp);
      extra = (tt) => { rc.offset.y = -tt * .035; };
    }
    anim.push((tt, dt) => {
      const sy = sbody.scrollTop * upp; gridU.uT.value = tt + sy * .002;
      layers.forEach((L, i) => { L.im.position.y = sy * L.k; L.im.position.x = -mxs * (i + 1) * .8; L.im.material.map = winTex[Math.floor(tt * .7 + i) % 2]; });
      sun.position.y = -8 + sy * .06;
      { const a = dgm.attributes.position; for (let i = 0; i < DN; i++) { a.array[i * 3 + 1] += dt * (.15 + (i % 5) * .03); if (a.array[i * 3 + 1] > 10) a.array[i * 3 + 1] = -10; } a.needsUpdate = true; }
      extra(tt, sy);
    });
  }
  let tunnelOn = false; (scenes[kind] || scenes.about)();

  const loop = () => {
    if (!alive) return; raf = requestAnimationFrame(loop);
    const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now; t += dt; mxs += (mx - mxs) * .06; mys += (my - mys) * .06;
    stars.position.y = sbody.scrollTop * upp * .22; stars.position.x = -mxs * .7; stars.rotation.z = t * .01;
    for (const f of anim) f(t, dt); place();
    R.clear(); const hf = tunnelOn && state.jActive ? (state.jFade == null ? 1 : state.jFade) : 0;
    if (hf < .25) R.render(scene, cam);
    if (hf > 0) { R.clearDepth(); R.render(sc2, cam2); }
  };
  loop();
  return {
    stop() {
      alive = false; cancelAnimationFrame(raf); ro.disconnect(); offs.forEach((f) => f()); tip.remove();
      for (const sc of [scene, sc2]) sc.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (m.map && !texCache[m.map.userKey]) m.map.dispose(); m.dispose(); }); });
      Object.values(texCache).forEach((x) => x.dispose()); R.dispose(); canvas.remove();
    },
  };
}
