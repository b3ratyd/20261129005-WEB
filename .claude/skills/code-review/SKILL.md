---
name: code-review
description: Bu projedeki kod değişikliklerini (build.py, room.js, hero3d.js, game.js, main.js, CSS) gözden geçirirken veya teslimden önce denetlerken kullan. Doğruluk, performans (kasma), build akışı, çift dil, güvenlik ve teslim gereksinimlerine odaklanır.
---

# Code Review: Berat Yanardağ sitesi

## Yaklaşım
1. Önce neyin değiştiğini oku (değişen dosyalar, ilgili fonksiyonlar). Bağlamı anlamadan yorum yazma.
2. Bulguları **şiddet sırasıyla** ver: 🔴 çalışmayı bozan, 🟠 performans/erişilebilirlik/ödev şartı, 🟡 bakım/okunabilirlik. Her bulguda dosya:satır, sorun, somut sonuç, önerilen düzeltme.
3. Emin olmadığını "doğrulanmadı" olarak işaretle; tahmini kesin gibi yazma.
4. Kullanıcı istemedikçe kodu değiştirme; önce raporla.

## 1. Build akışı (en sık hata)
- [ ] `tr/*.html`, `en/*.html`, `sitemap.xml`, `robots.txt`, `llms.txt` elle düzenlenmemiş (üretilmişler). Değişiklik `tools/build.py`'de mi?
- [ ] `py tools/build.py` hatasız çalışıyor, ardından 12 sayfa üretiliyor.
- [ ] Yeni string/veri `room_data(lang)` ve TR/EN için eksiksiz.
- [ ] `node --check assets/js/<dosya>.js` geçiyor (room, hero3d, game, main).
- [ ] Tekrarlanan `const` adı yok (aynı modül kapsamı; room.js büyük ve tek kapsamlı).

## 2. Doğruluk (JS)
- [ ] `let/const` kullanımdan önce tanımlı mı (TDZ)? room.js'te fonksiyonlar bazı `let` değişkenlere çağrı anında ulaşır; sıra önemli.
- [ ] Olay dinleyicileri yinelenmiyor/sızdırmıyor (site penceresi her açılışta içerik yeniden yaratılır; `initContent` yeni DOM'a bağlanır).
- [ ] Katman kapanınca kaynaklar temizleniyor: `hero3d` `stop()` (renderer, geometri, doku dispose), game `removeEventListener`.
- [ ] Null kontrolleri: `querySelector` sonucu, `localStorage` erişimi (try/catch), `Image` yüklenmeden çizim.
- [ ] Asenkron yarış: `fade` + `setTimeout` zincirleri; `siteOpen`, `mode`, `foc`, `seat` durumları tutarlı mı?

## 3. Performans (kasma = kullanıcının 1 numaralı şikâyeti)
- [ ] Her karede yeni nesne (`new THREE.Vector3`, `clone()`, dizi/closure) yaratılmıyor.
- [ ] Hareketsiz nesneler `matrixAutoUpdate=false`; hareket edenler `DYN` kümesinde.
- [ ] Gölgeler statik (`shadowMap.autoUpdate=false`); yalnızca gerekince `needsUpdate`.
- [ ] Işık sayısı düşük; yeni ışık = her piksel için ek maliyet. Yeni gölgeli ışık yalnız `HI` katmanında.
- [ ] Canvas dokuları yalnızca gerekince güncelleniyor (kullanıcı ilgili odadayken, düşük sıklıkla).
- [ ] Görünmeyen dünya gizli (su altı `setUnder`), site penceresi açıkken 3B döngü duruyor.
- [ ] Kalite katmanları (`HI / medium / LOW`, `GPU`, `localStorage 'q'`) korunuyor; yeni efekt zayıf kartta kapanıyor.
- [ ] Açılışta ağır iş "gözler kapalı hazırlık" içinde (shader derleme, doku yükleme, yansıma bake).
- [ ] Büyük doku/canvas boyutu gerekçeli; mümkünse küçük. Görsel boyutu `assets/img` altında optimize.

## 4. İki dil ve içerik
- [ ] Görünen her metin `t(tr, en)`; çeviri doğal.
- [ ] Hoca şartlarındaki içerik kayıp yok: tablo, `ol/ul`, `abbr/code/pre/blockquote`, yüzdelik beceriler, ≥3 blog yazısı + görsel, galeri açıklamaları, iletişim (adres, telefon, form).
- [ ] Uydurma bilgi yok (kişisel veri/deneyim/ödül); belirsizse kullanıcıya sor.

## 5. Güvenlik ve gizlilik
- [ ] `innerHTML` ile eklenen metin güvenilir kaynaktan (build verisi); kullanıcı girdisi `innerHTML`'e gitmiyor, `textContent`/kaçış kullanılıyor.
- [ ] Form: honeypot alanı, e-posta doğrulama; üçüncü taraf servis (FormSubmit) sadece form gönderiminde çağrılır. Gizli anahtar/parola yok.
- [ ] Dış kaynaklar (unpkg Three.js) sürüm sabitli (`three@0.160.0`). Teslimde çevrimdışı çalışma gerekiyorsa yerel kopyaya geçmeyi öner.
- [ ] Fotoğraflarda başkalarının yüzü: yayın öncesi kullanıcıya hatırlat.

## 6. CSS
- [ ] Sınıflar kapsamlı (`.pg`, `.sbody`, `body.room`); genel `h1/h2/p` kuralları bu kapsamlarda ezilmiş mi?
- [ ] `!important` yalnızca eski stilleri ezmek için ve nedeni belli.
- [ ] Mobilde taşma yok (360 px), `min-width` medya sorguları.
- [ ] Animasyon `prefers-reduced-motion` altında kapalı.

## 7. Teslim öncesi (vize paketi)
- [ ] `konsept/` klasörü ve eski `u.html` yönlendirmesi kaldırıldı mı (kullanıcı onayıyla).
- [ ] `SITE_URL` gerçek alan adı mı (veya kullanıcı bilgilendirildi mi).
- [ ] `README.md` güncel mi.
- [ ] Toplam boyut < 300 MB (`Get-ChildItem -Recurse` ile ölç).
- [ ] Zip adı `20261129005-WEB.zip`, Teams için uzantı `.PDF`; Word raporu ve YouTube video bağlantısı hazır.
- [ ] `FormSubmit` etkinleştirme e-postası ilk gönderimde onaylandı mı (kullanıcı yapar).

## Rapor biçimi
Kısa özet (1-2 cümle) → şiddete göre madde madde bulgular → "Doğrulananlar" ve "Doğrulanamayanlar" → önerilen sonraki adım. Genel övgü ve dolgu yok.
