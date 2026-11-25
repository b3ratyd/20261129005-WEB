---
name: frontend-design
description: Bu projede (Berat Yanardağ kişisel sitesi, 3B New York odası) yeni arayüz, sayfa, bileşen ya da görsel katman yazarken veya mevcut olanı değiştirirken kullan. Tasarım diline sadık kalmayı, performansı ve build akışını korumayı sağlar.
---

# Frontend Design: Berat Yanardağ sitesi

## Önce şunu oku
1. `tools/build.py` içindeki ilgili fonksiyonu (`layout`, `home`, `about`, `projects`, `blog`, `gallery`, `contact`) ve `assets/css/*.css` dosyalarını incele.
2. Mevcut bir deseni (kart, buton, panel, başlık) bulabiliyorsan **yeniden kullan**, yenisini icat etme.

## Proje mimarisi (bozma)
- **Üretilen dosyalar:** `tr/*.html`, `en/*.html`, `sitemap.xml`, `robots.txt`, `llms.txt` `tools/build.py` ile üretilir. **Bunları elle düzenleme**: bir sonraki `py tools/build.py` hepsini ezer. Değişikliği `build.py` içinde yap, sonra çalıştır (`py` kullan, `python` PATH'te değil).
- **Ana sayfa = 3B oda** (`tr/index.html`, `en/index.html` → `assets/js/room.js`, Three.js r160, unpkg import map). Diğer sayfalar oda içinde **site penceresi** (`#site` katmanı, `<template id="tpl-...">`) olarak açılır; ayrı sayfaya yönlendirme yapılmaz. Bağımsız iç sayfa dosyaları SEO ve doğrudan bağlantı için durur.
- Stil katmanları: `style.css` (taban) → `room.css` (oda kabuğu, oyun, dalış) → `site.css` (`.pg` kapsamlı modern iç sayfa tasarımı).
- Diğer modüller: `hero3d.js` (sayfa başlığı 3B modelleri), `game.js` (Arayüz Atölyesi), `main.js` (içerik başlatıcı, form).

## Tasarım dili
- **Atmosfer:** New York gökdeleninde gece/gün batımı odası: koyu lacivert zemin, cam yüzeyler, sıcak LED ışıkları.
- **Renkler:** koyu `#0b0d16`, camgöbeği `#7fe4ff`, turuncu/amber `#ffb25a`, vurgu pembe `#ff6f91`, yeşil `#5fe0a8`, metin `#e9eef7`, soluk metin `#aab6c8`. Yeni renk eklemeden önce bu paletle çözülüp çözülmediğine bak.
- **Yüzey:** cam kart = `rgba(255,255,255,.055)` + `1px rgba(255,255,255,.11)` kenarlık + 20-26px yarıçap + hafif blur.
- **Tipografi:** sistem yazı tipleri (`ui-sans-serif, system-ui, "Segoe UI"…`), başlıkta sıkı letter-spacing (`-.02em`), gövde metni `line-height 1.6-1.7`. Büyük uppercase "blueprint" başlıklar eski tasarımdır, kullanma.
- **Hareket:** 3B derinlik (perspective, rotateX/Y), yumuşak `cubic-bezier(.2,.7,.2,1)`, 0.35-0.9 sn. `prefers-reduced-motion` altında kapat.

## Kurallar
1. **İki dil:** Her kullanıcıya görünen metin TR ve EN olarak `t(tr, en)` ile yazılır. Tek dilli metin ekleme.
2. **Mobile-first:** Önce en dar ekranı çöz, `min-width` ile genişlet. Telefonda ağır efekt/model yüklenmez (`LOW` kalite katmanı).
3. **Performans önce:** Kasma en önemli şikâyet. Yeni 3B nesne/ışık/doku eklerken bkz. `code-review` skill'indeki performans listesi. Statik şeyleri bir kez hesapla, hareket edenleri `DYN` kümesine ekle, canvas dokularını sadece gerektiğinde güncelle.
4. **Ses yok:** Projede hiçbir ses/müzik/konuşma ekleme (kullanıcı kaldırttı).
5. **Mevcut tasarımı bozma:** İstenmeyen yeniden tasarım yapma; istenen değişikliği en küçük farkla yap.
6. **Görsel:** Yeni görseller `assets/img/` altına, WebP/JPEG optimize (uzun kenar ≤ 1400 px). Toplam proje < 300 MB (şu an ≈ 4 MB).
7. **Doğrulama:** Değişiklikten sonra `py tools/build.py` ve `node --check assets/js/<dosya>.js`. Tarayıcıda görmediysen "denedim, çalışıyor" deme; ne doğruladığını ve neyi doğrulayamadığını belirt.

## Yeni bileşen kontrol listesi
- [ ] Mevcut sınıf/desen yeniden kullanıldı mı?
- [ ] TR/EN metin var mı?
- [ ] 360 px, 768 px, 1280 px genişlikte taşma yok mu?
- [ ] Odak (focus) görünür, klavye ile kullanılabilir mi?
- [ ] `prefers-reduced-motion` için kapanıyor mu?
- [ ] Performans etkisi ölçüldü/gerekçelendirildi mi?
