(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Mobil menü */
  const toggle = $(".nav-toggle");
  const nav = $("#nav");
  if (toggle && nav) {
    const set = (open) => {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", () => set(!nav.classList.contains("open")));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
    matchMedia("(min-width: 64em)").addEventListener("change", (m) => { if (m.matches) set(false); });
  }

  /* Dil tercihini hatırla */
  $$("[data-setlang]").forEach((a) =>
    a.addEventListener("click", () => { try { localStorage.setItem("lang", a.dataset.setlang); } catch (e) {} }));

  /* Hero nişangâhı (yalnızca fare ile) */
  const hero = $(".hero");
  if (hero && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const xx = $(".xh-x", hero), xy = $(".xh-y", hero), rd = $(".xh-read", hero);
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      const x = Math.round(e.clientX - r.left), y = Math.round(e.clientY - r.top);
      xx.style.top = y + "px"; xy.style.left = x + "px";
      rd.textContent = `x ${String(x).padStart(4, "0")}  y ${String(y).padStart(4, "0")}`;
      hero.classList.add("live");
    });
    hero.addEventListener("pointerleave", () => hero.classList.remove("live"));
  }

  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Kaydırma ilerlemesi + header gölgesi */
  const bar = $(".progress"), head = $(".site-header");
  const onScroll = () => {
    const h = document.documentElement;
    const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    if (bar) bar.style.transform = `scaleX(${p})`;
    if (head) head.classList.toggle("scrolled", h.scrollTop > 8);
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* Sayaçlar */
  $$("[data-count]").forEach((el) => {
    const to = +el.dataset.count; if (calm) return;
    let t0; el.textContent = "0";
    const step = (t) => { t0 ??= t; const k = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });

  /* 3B katman: kaydırınca belirme, fareyle eğilme, başlıkta dönen şekiller */
  const FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const DECO = '<div class="deco3d" aria-hidden="true"><div class="d3rig"><div class="cube"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="ring"></div><div class="ring r2"></div></div></div>';
  const init3d = (root) => {
    if (calm) return;
    const scroller = root === document ? null : root;
    const els = $$(".page-head, .about-layout > *, .prose > h2, .prose > p, .prose > blockquote, .prose > pre, .table-wrap, .lists > div, .skills li, .timeline li, .plates .plate, .post, .shot, .contact-list > div, #contact-form, .facts, .section-head, .about-split > *, .strip figure", root);
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { root: scroller, threshold: .08, rootMargin: "0px 0px -4% 0px" });
      els.forEach((el, i) => { el.classList.add("r3"); el.style.setProperty("--d", `${(i % 4) * 80}ms`); io.observe(el); });
      setTimeout(() => { const vh = scroller ? scroller.getBoundingClientRect().bottom : innerHeight; els.forEach((el) => { if (el.isConnected && !el.classList.contains("in") && el.getBoundingClientRect().top < vh) el.classList.add("in"); }); }, 1800);
    }
    if (FINE) {
      $$(".plate, .shot, .contact-list > div, .lists > div, .skills li, .facts, .id-photo, #contact-form, .post", root).forEach((el) => {
        el.classList.add("tilt3d");
        el.addEventListener("pointerenter", () => { el.style.transition = "transform .15s ease-out"; });
        el.addEventListener("pointermove", (e) => {
          const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          el.style.transform = `perspective(900px) rotateX(${(.5 - y) * 7}deg) rotateY(${(x - .5) * 9}deg) translateZ(8px)`;
          el.style.setProperty("--mx", `${x * 100}%`); el.style.setProperty("--my", `${y * 100}%`);
        });
        el.addEventListener("pointerleave", () => { el.style.transition = "transform .6s cubic-bezier(.2,.7,.2,1)"; el.style.transform = ""; setTimeout(() => { el.style.transition = ""; }, 650); });
      });
    }
    const head = $(".page-head", root);
    if (head && !$(".deco3d", head)) {
      head.insertAdjacentHTML("beforeend", DECO);
      const rig = $(".d3rig", head);
      const host = root === document ? document : root;
      if (FINE) host.addEventListener("pointermove", (e) => {
        const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
        rig.style.setProperty("--rx", `${-18 - y * 34}deg`); rig.style.setProperty("--ry", `${28 + x * 46}deg`);
      });
    }
  };

  /* İçerik başlatıcı: sayfada ve odanın içinde açılan "site penceresi"nde çalışır */
  window.initContent = (root = document) => {
    init3d(root);
    const skills = $(".skills", root);
    if (skills) {
      const run = () => skills.classList.add("in");
      if (root === document && "IntersectionObserver" in window) {
        const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { run(); io.disconnect(); } }, { threshold: .25 });
        io.observe(skills);
      } else run();
    }

    /* Galeri lightbox */
    const dlg = $("dialog.lightbox", root);
    const shots = $$(".shot button", root);
    if (dlg && shots.length) {
      let idx = 0;
      const img = $("img", dlg), title = $("[data-lb-title]", dlg), text = $("[data-lb-text]", dlg);
      const show = (i) => {
        idx = (i + shots.length) % shots.length;
        const b = shots[idx];
        img.src = b.dataset.full; img.alt = b.dataset.alt || "";
        title.textContent = b.dataset.title; text.textContent = b.dataset.text;
      };
      shots.forEach((b, i) => b.addEventListener("click", () => { show(i); dlg.showModal(); }));
      $("[data-lb-prev]", dlg).addEventListener("click", () => show(idx - 1));
      $("[data-lb-next]", dlg).addEventListener("click", () => show(idx + 1));
      $("[data-lb-close]", dlg).addEventListener("click", () => dlg.close());
      dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
      dlg.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") show(idx - 1);
        if (e.key === "ArrowRight") show(idx + 1);
      });
    }

    /* İletişim formu */
    const form = $("#contact-form", root);
    if (form) {
      const msg = JSON.parse(form.dataset.msg);
      const kp = new URLSearchParams(location.search).get("kupon");
      if (kp) { const en = document.documentElement.lang === "en";
        $("#subject", form).value = (en ? "Web Design Badge: " : "Web Tasarım Rozeti: ") + kp;
        $("#message", form).value = en ? `Hi Berat, I finished the UI Workshop game! My badge code is ${kp}. Can I claim my coffee & web design chat?` : `Merhaba Berat, Arayüz Atölyesi oyununu bitirdim! Rozet kodum ${kp}. Kahve eşliğindeki web/arayüz sohbeti ödülümü alabilir miyim?`; }
      const status = $("#form-status", form);
      const check = (el) => {
        const err = $(`#${el.id}-err`, form);
        let m = "";
        if (el.validity.valueMissing) m = msg.required;
        else if (el.validity.typeMismatch) m = msg.email;
        else if (el.validity.tooShort) m = msg.short;
        err.textContent = m;
        el.setAttribute("aria-invalid", m ? "true" : "false");
        return !m;
      };
      const fields = $$("input, textarea", form).filter((f) => f.id);
      fields.forEach((f) => f.addEventListener("blur", () => check(f)));
      const say = (t) => { status.textContent = t; status.classList.add("show"); status.focus(); };
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if ($(".hp input", form).value) return;
        const ok = fields.map(check).every(Boolean);
        if (!ok) { fields.find((f) => f.getAttribute("aria-invalid") === "true").focus(); return; }
        const d = Object.fromEntries(new FormData(form));
        const last = +(localStorage.getItem("cfLast") || 0);
        if (Date.now() - last < 30000) { say(msg.wait); return; }
        window.dispatchEvent(new Event("contact:send"));
        const btn = $("button[type=submit]", form); btn.disabled = true; say(msg.sending);
        const en = document.documentElement.lang === "en", ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 15000);
        try {
          /* FormSubmit: mesaj doğrudan Gmail kutusuna düşer (ilk gönderimde e-postadaki etkinleştirme onaylanır). */
          const r = await fetch(`https://formsubmit.co/ajax/${form.dataset.to}`, {
            method: "POST", signal: ctl.signal, headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ name: d.name, email: d.email, _replyto: d.email, _subject: `[Site] ${d.subject}`, message: d.message, dil: en ? "EN" : "TR", sayfa: location.href.split("#")[0], _captcha: "false", _template: "table",
              _autoresponse: en ? "Hi! Your message reached Berat. He will get back to you soon." : "Merhaba! Mesajın Berat'a ulaştı, en kısa sürede sana dönüş yapacak." }),
          });
          clearTimeout(to);
          const j = await r.json();
          if (/activat/i.test(j.message || "")) { window.dispatchEvent(new Event("contact:fail")); say(msg.activate || (en ? "The form isn't activated yet: a confirmation email was sent to Berat. Please try again after he confirms it." : "Form henüz etkinleştirilmedi: Berat'a bir onay e-postası gönderildi. Onaylandıktan sonra tekrar deneyin.")); return; }
          if (!r.ok || j.success === "false") throw new Error("send");
          window.dispatchEvent(new Event("contact:done")); say(msg.ok); form.reset(); localStorage.setItem("cfLast", String(Date.now()));
        } catch (err) {
          window.dispatchEvent(new Event("contact:fail")); say(msg.fail);
          const body = `${d.message}\n\n— ${d.name} <${d.email}>`;
          location.href = `mailto:${form.dataset.to}?subject=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(body)}`;
        } finally { btn.disabled = false; }
      });
    }
  };
  window.initContent(document);
})();
