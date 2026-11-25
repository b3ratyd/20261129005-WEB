# Berat Yanardağ: kişisel web sitesi (3B oda)

Ana sayfa, New York'ta bir gökdelenin odasında geçen, birinci şahıs gezilebilir 3B bir sitedir (Three.js). Her nesne bir sayfadır; detaylar oda içinde tarayıcı penceresi olarak açılır. TR: `tr/`, EN: `en/`.

## Çalıştırma
- Yerel sunucu: `py -m http.server 8000` (proje klasöründe), sonra http://localhost:8000/tr/
- VS Code: `tr/index.html` üzerinde sağ tık > Open with Live Server. (3B için internet gerekir: Three.js unpkg'den yüklenir.)

## İçeriği değiştirme (build.py ile)
`tr/`, `en/`, `sitemap.xml`, `robots.txt`, `llms.txt` **üretilir**; elle düzenleme. `tools/build.py` içindeki bölümleri değiştirip `py tools/build.py` çalıştır:
- Kişisel bilgiler / alan adı: dosya başı (`SITE_URL`, `EMAIL`, `PHONE_*`, `ADDRESS`).
- Projeler: `PROJECTS`. Galeri: `GALLERY` (+ hikâyeler için `STORIES`). Oyun metinleri: `GAME_T`. Dalış dersleri: `DIVE_T`.
- Görseller: `assets/img/` (proje: `projects/`, galeri: `gallery/` ve duvar için küçük kopyalar `gallery/t/`).

## Yapı
- `assets/js/room.js`: 3B oda, gezinme, ışıklar, oyun odası, dalış. `hero3d.js`: sayfa başlığı 3B modelleri. `game.js`: Arayüz Atölyesi. `main.js`: içerik başlatıcı ve iletişim formu.
- `assets/css/`: `style.css` (taban), `room.css` (oda arayüzü), `site.css` (site penceresi/iç sayfalar).

## Performans
- Kalite katmanı ekran kartına göre otomatik seçilir; sağ üstteki "Kalite" düğmesi ile elle değiştirilir.
- Ölçüm için adrese `?perf=1` ekle (FPS, çizim çağrısı, kalite katmanı gösterilir).

## Teslim
Boyut < 300 MB. `20261129005-WEB.zip` dosyasını Teams için `.PDF` uzantısına çevir.
