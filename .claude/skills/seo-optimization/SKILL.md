---
name: seo-optimization
description: Sitenin arama motoru (SEO) ve yapay zekâ/üretken motor (GEO) uyumunu denetlerken veya geliştirirken kullan: sayfa başına title/description, hreflang, canonical, JSON-LD, sitemap, robots.txt, llms.txt, görsel alt metinleri, Open Graph.
---

# SEO + GEO: Berat Yanardağ sitesi

## Ödev şartı
"SEO ve GEO uyumlu; **her sayfanın Title ve Meta Description'ı ayrı ve dolu**." Bu proje için bu bir **gereksinimdir**, isteğe bağlı değil.

## Önemli teknik gerçek
Ana sayfa 3B bir oda olduğu için içerik JavaScript'le çiziliyor. Arama motorlarının okuması için **içerik gerçek HTML olarak da bulunmalı**:
- Her bölüm için ayrı dosya vardır: `tr/index, hakkimda, projeler, blog, galeri, iletisim` ve `en/index, about, projects, blog, gallery, contact`.
- Ana sayfada `#summary` paneli (hakkımda özeti, projeler, galeri örnekleri) ve her sayfanın `<template>` içeriği DOM'dadır.
- Bu yapıyı **bozma**: iç sayfa dosyalarını silme, içeriği sadece canvas/JS'e taşıma.

## Üretim akışı
Tüm SEO etiketleri `tools/build.py` içinde üretilir (`_head()`, `person_ld()`, `crumbs()`, sitemap/robots/llms üretimi). **Üretilmiş HTML'i elle düzenleme**, `build.py`'yi düzenle ve `py tools/build.py` çalıştır.

## Kontrol listesi (her sayfa için)
- [ ] `<title>` benzersiz, 50-60 karakter civarı, sayfa konusunu + adı içerir (TR sayfada TR, EN sayfada EN).
- [ ] `<meta name="description">` benzersiz, 120-160 karakter, eylem/değer içerir.
- [ ] `<html lang="tr|en">` doğru.
- [ ] `<link rel="canonical">` kendi URL'sine; `hreflang` tr, en ve `x-default` karşılıklı doğru.
- [ ] Open Graph (`og:title/description/url/image/locale`) + `twitter:card`.
- [ ] Tek bir `<h1>`; başlık hiyerarşisi sıralı (h1 → h2 → h3).
- [ ] Tüm `<img>`'lerde anlamlı `alt` (süs resimlerde `alt=""`), `width/height` verilmiş, aşağıdakilerde `loading="lazy"`.
- [ ] JSON-LD: `WebSite`, `Person` (ad, e-posta, telefon, adres, `knowsAbout`, `sameAs`), sayfaya uygun tür (`ProfilePage`, `CollectionPage`, `Blog/BlogPosting`, `ImageGallery`, `ContactPage`), `BreadcrumbList`.
- [ ] İç bağlantılar açıklayıcı metinli ("tıklayın" değil).
- [ ] Mobil uyumlu viewport, hızlı yükleme (görseller optimize).

## Site geneli
- `sitemap.xml`: tüm 12 URL + `xhtml:link` alternatifleri + `lastmod`.
- `robots.txt`: `Allow: /`, `Disallow: /tools/`, `Sitemap:` satırı; yapay zekâ botları (GPTBot, ClaudeBot, PerplexityBot…) için açık izin (GEO).
- `llms.txt`: kısa tanıtım + her sayfanın bağlantısı ve tek cümlelik açıklaması (TR/EN).
- `SITE_URL` (`build.py` başında) şu an `https://www.example.com`. **Gerçek alan adı alınınca** buradan güncelle; canonical/sitemap/OG hepsi buradan beslenir. Alan adı yokken bu uyarıyı kullanıcıya hatırlat.

## GEO (yapay zekâ cevap motorları) için
- Net, alıntılanabilir, olgusal cümleler: kim, ne okuyor, hangi alanlarda çalışıyor, nerede.
- Person şemasında tutarlı bilgi; `llms.txt`'te sayfa haritası.
- Uydurma iddia yazma (ödül, deneyim, sertifika); sadece kullanıcının verdiği bilgi.

## Doğrulama
1. `py tools/build.py` sonrası `title`/`description` tekrarı olmadığını betikle kontrol et (12 sayfa).
2. Üretilen JSON-LD bloklarının geçerli JSON olduğunu `json.loads` ile doğrula.
3. Gerçek alan adı sonrası: Google Rich Results Test ve PageSpeed Insights önerilir (kullanıcı çalıştırır).
