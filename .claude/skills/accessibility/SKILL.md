---
name: accessibility
description: Sitenin erişilebilirliğini (WCAG 2.2 AA) denetlerken veya yeni bileşen yazarken kullan: klavye, ekran okuyucu, kontrast, odak, hareket azaltma, dokunma hedefleri, form etiketleri, 3B/canvas içeriğin metin karşılığı.
---

# Erişilebilirlik (WCAG 2.2 AA): Berat Yanardağ sitesi

## Zorluk
Ana sayfa tam ekran WebGL oda; canvas ekran okuyucuya ve klavyeye kapalıdır. Bu yüzden **aynı içerik ve işlevin erişilebilir bir karşılığı** bulunmalıdır. Zaten var olanları koru:
- İçerik gerçek HTML'dedir (`#summary` paneli, `<template>` sayfaları, bağımsız iç sayfalar).
- Alt çubuk (dock) klavye ile erişilebilir `<button>`'lardır ve her bölüme tek adımda götürür.
- `<h1 class="sr">` ana sayfada ekran okuyucuya sayfa başlığını verir.

## Zorunlu kurallar
1. **Klavye:** Her etkileşimli öğe Tab ile ulaşılır, Enter/Space ile çalışır. Odak sırası mantıklı. Tuzak yok: açık katmanlardan (site penceresi, oyun, hikâye paneli, dalış) **Esc** ile çıkılır.
2. **Odak göstergesi:** Her odaklanabilir öğede görünür odak halkası (≥ 3 px, yeterli kontrast). `outline: none` kullanıyorsan yerine eşdeğer göstergeyi koy.
3. **Kontrast:** Normal metin ≥ 4.5:1, büyük metin ve UI bileşenleri ≥ 3:1. Koyu zeminde `#aab6c8` ve üstü; `#5f7a96` gibi soluk tonlar sadece süs/ikincil için, bilgi taşımasın. Oyundaki kontrast sorusu bunu öğretir, kendi arayüzün de uymalı.
4. **Hareket:** `prefers-reduced-motion: reduce` altında animasyonlar, 3B başlık modelleri ve geçişler kapanır ya da anlık olur. Yanıp sönen içerik saniyede 3 kezi geçmez. Uyanış animasyonunun atlanabilir olması iyi olur.
5. **Dokunma hedefi:** Etkileşimli öğeler en az 44×44 px (telefonda).
6. **Formlar:** Her alanın görünür `<label>`'ı, `autocomplete` değerleri (`name`, `email`), hata iletisi `aria-describedby` + `aria-live="polite"`, durum `role="status"`. Hata sadece renkle verilmez.
7. **Görseller:** Anlamlı `alt` (fotoğraf: neyi gösterdiği; proje: başlık + kısa açıklama). Süs görseli `alt=""`.
8. **Tablolar:** `<caption>`, `<th scope>`; ders programı tablosu gerçek `<table>` olarak kalır (duvardaki görsel sadece ek).
9. **Anlamsal HTML:** `header/nav/main/aside/footer`, tek `h1`, sıralı başlıklar; `abbr`, `code`, `pre`, `blockquote` anlamlı kullanılır.
10. **Dil:** `html[lang]` doğru; dil değiştirme bağlantısında `hreflang`/`lang`.
11. **Modal katmanlar** (`#site`, `#story`, `#game`): `role="dialog"` + `aria-modal`, açılınca odak içine, kapanınca tetikleyiciye döner; arkadaki içerik etkileşime kapalı.
12. **Zaman sınırı yok:** Oyun ve dalışta süre baskısı zorunlu olmamalı; panel metinleri okunmadan kaybolmamalı (kendiliğinden kaybolanlar için erişilebilir alternatif/yeterli süre).

## Canvas/3B için metin karşılığı
- Duvardaki özgeçmiş ve ders programı canvas'ta çizilir; aynı bilgi `hakkimda`/`about` içeriğinde HTML olarak vardır. İçeriği güncellerken **ikisini birlikte** güncelle.
- Galeri hikâyeleri `#story` panelinde gerçek metindir (`aria-live` ile duyurulabilir).
- Dalış dersleri `#dlesson` içinde metindir; okunması için `role="status"`/`aria-live` eklenebilir.

## Denetim yöntemi
1. Sadece klavye ile tüm akışı gez (oda → dock → sayfa → çıkış).
2. Ekran okuyucu (NVDA/VoiceOver) ile ana sayfa ve bir iç sayfayı oku.
3. Tarayıcıda %200 yakınlaştır, 360 px genişlik, yatay kaydırma olmamalı.
4. Kontrast için DevTools/WebAIM Contrast Checker; otomatik tarama için axe DevTools / Lighthouse.
5. Bulguları şiddetine göre (engelleyici / önemli / küçük) listele, düzeltmeyi ayrıca onay alarak uygula.
