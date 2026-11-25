---
name: ui-ux-design
description: Bu sitenin kullanıcı deneyimini, gezinmesini, etkileşimlerini ve içerik akışını tasarlarken ya da eleştirirken kullan (3B oda gezinmesi, site penceresi, galeri hikâye paneli, oyun, form, dock çubuğu). Yeni özellik fikrini değerlendirmek için de uygundur.
---

# UI/UX Design: Berat Yanardağ sitesi

## Sitenin amacı
Vize projesi: Berat'ı tanıtan, **görsel olarak etkileyici** ve ödev şartlarını eksiksiz karşılayan iki dilli (TR/EN) kişisel site. Yaratıcılık serbest ama **hoca şartları ve kullanılabilirlik** önce gelir.

## Kullanıcı yolculuğu (korunacak)
1. Açılış: gözler kapalı hazırlık → uyanma animasyonu (≈4 sn) → serbest gezinme.
2. Gezinme: sürükle = bak, W A S D / ok = yürü, E ya da etiket = gir, alt çubuk (dock) = ışınlan.
3. Nesne → kamera odaklanır → kart → **"Sayfayı aç"** → odanın içinde tarayıcı penceresi (adres çubuğu, sekmeler, 3B başlık modeli).
4. Çıkış her zaman açık olmalı: ✕ / "← Odaya dön", **Esc**, tarayıcı geri tuşu.

## Tasarım ilkeleri
1. **Keşfedilebilirlik:** Etkileşimli nesneler etiketle işaretlenir; yaklaşınca "E" ipucu çıkar. Bilgisayar bilmeyen biri de dock çubuğundan her sayfaya 1 tıkla gidebilmeli (kısa yol).
2. **Geri bildirim:** Her tıklama bir tepki üretir (kamera hareketi, kart, geçiş, form durumu). Beklemeli işlemde durum göster (yükleme çizgisi, "Gönderiliyor…").
3. **Kontrol ve çıkış:** Kullanıcı hiçbir yerde sıkışmamalı. Dalış, oyun, hikâye paneli, site penceresi: hepsinde görünür çıkış + Esc.
4. **Bilişsel yük:** Bir ekranda tek ana mesaj. Site penceresinde önce başlık+özet, detay kaydırınca.
5. **Tutarlılık:** Aynı eylem her yerde aynı görünür/söylenir (ör. "Odaya dön").
6. **Hata önleme:** Form alanlarında satır içi doğrulama, anlaşılır hata, bal kupası (honeypot) alanı korunur. Gönderilemezse mailto yedeği.
7. **Güven ve kimlik:** Gerçek iletişim bilgileri (adres, telefon, e-posta) hep ulaşılabilir; sahte/uydurma bilgi koyma.

## Eğitici oyun (Arayüz Atölyesi) tasarım kuralları
- Amaç öğretmek: her yanlış cevapta **neden** açıklanır; ceza değil öğrenme.
- 3 görev, 5 can, ilerleme çubuğu, net "Devam →" adımı. Kısa (≈2 dk).
- Ödül anlamlı ve siteyle ilgili: Web Tasarım Rozeti + İletişim formuna hazır dolu mesaj. Ödül vaadi (kahve/sohbet) **sahibinin onayıyla** değişir, kendi başına yeni taahhüt ekleme.

## Dalış deneyimi
Amaç: Berat'ın tüp dalış deneyimini ziyaretçiye yaşatmak (5 deneyim küresi, her biri bir ders + web paraleli). Kişisel hikâye gerekiyorsa uydurma, kullanıcıdan iste.

## Metin (UX writing)
- Kısa, etken, samimi-profesyonel; TR ve EN doğal çeviri (kelime kelime değil).
- Buton: eylem fiili ("Sayfayı aç →", "Gönder"), belirsiz "Tıkla" yok.
- Hata: ne oldu + ne yapmalı.

## Değerlendirme çerçevesi (yeni fikir için)
Önerinin şunlara cevabını yaz: (1) hangi ödev şartına/kullanıcı hedefine hizmet ediyor, (2) performans maliyeti, (3) mobilde ne oluyor, (4) erişilebilirlik, (5) en küçük uygulanabilir sürüm. Büyük fikirleri **önce küçük bir konsept/ayrı dosya** olarak göster, onay sonrası siteye uygula.
