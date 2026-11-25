/* Oyun Odası: 4 oyun (3 öğretici + 1 eğlence) ve ders duvarı için seviye seçici.
   startArcade(G, urls, onClaim, which, onLevel)  which: 'atelier' | 'tag' | 'bug' | 'squash' | 'lesson' | boş = menü */
import { startGame } from './game.js';

const EN = document.documentElement.lang === 'en';
const T2 = (tr, en) => (EN ? en : tr);

export const LESSON = {
  names: [T2('Sıfırdan', 'From zero'), T2('Biraz biliyorum', 'I know a bit'), T2('İyi biliyorum', 'I know well')],
  titles: EN ? [
    ['What is a website?', 'Your browser asks a server for the page, and the server sends HTML, CSS and JavaScript files. The page you see is these three put together.'],
    ['A page has 3 parts', 'HTML is the skeleton, CSS the clothes, JavaScript the movement. We will learn each one step by step.'],
    ['HTML 1: a heading', 'The <h1> tag is the biggest heading of a page. You wrap your words in <h1>.'],
    ['HTML 2: a paragraph', 'The <p> tag is normal text. Use it to add a sentence under the heading.'],
    ['HTML 3: a button', 'The <button> tag makes a clickable button. For now it only appears; movement comes from JavaScript.'],
    ['Tags open and close', 'Every tag opens with < > and closes with </ >. Your words go between the two.'],
    ['CSS 1: colour', 'With CSS you choose the colour of text. Just give the color property a colour.'],
    ['CSS 2: size and corners', 'font-size makes text bigger, border-radius rounds corners. Change the number and see the result at once.'],
    ['JavaScript: movement', 'What should happen on a click? n++ raises a number by one. Now the page reacts to clicks.'],
    ['Flexbox: alignment', 'display: flex puts boxes in a row, justify-content chooses where they sit.'],
    ['Responsive design', 'When the screen shrinks, cards stack. @media lets you design phone and desktop separately.'],
    ['Contrast', 'Text needs at least a 4.5:1 ratio against its background, or it cannot be read.'],
    ['Speed: loading time', 'Shrink images, lazy-load, minify code: every step saves seconds.'],
    ['Accessibility', 'The page must work with the keyboard (Tab), show focus, and label every element.'],
    ['SEO: the search result', 'Title and description make the card shown in search results. Keep them short and clear.']
  ] : [
    ['Web sitesi nedir?', 'Tarayıcın sunucudan sayfayı ister, sunucu HTML, CSS ve JavaScript dosyalarını gönderir. Gördüğün sayfa bu üçünün birleşimidir.'],
    ['Bir sayfa 3 parçadır', 'HTML iskelet, CSS giysi, JavaScript hareket verir. Üçünü de tek tek öğreneceğiz.'],
    ['HTML 1: başlık', '<h1> etiketi sayfanın en büyük başlığıdır. Yazını <h1> ile sararsın.'],
    ['HTML 2: paragraf', '<p> etiketi normal yazıdır. Başlığın altına bir cümle eklemek için kullanırsın.'],
    ['HTML 3: düğme', '<button> etiketi tıklanabilir bir düğme yapar. Şimdilik sadece görünür; hareketi JavaScript verecek.'],
    ['Etiket açılır ve kapanır', 'Her etiket < > ile açılır, </ > ile kapanır. Yazın bu ikisinin arasına girer.'],
    ['CSS 1: renk', 'CSS ile yazının rengini seçersin. color özelliğine bir renk yazman yeter.'],
    ['CSS 2: boyut ve köşe', 'font-size yazıyı büyütür, border-radius köşeleri yuvarlar. Sayıyı değiştir, sonucu hemen gör.'],
    ['JavaScript: hareket', 'Tıklayınca ne olsun? n++ sayıyı bir artırır. Sayfa artık tıklamaya cevap veriyor.'],
    ['Flexbox: hizalama', 'display: flex kutuları satıra dizer, justify-content yerlerini seçer.'],
    ['Duyarlı tasarım', 'Ekran daralınca kartlar alt alta geçer. @media ile telefonu ve bilgisayarı ayrı düşünürsün.'],
    ['Kontrast', 'Yazı ile zemin arasında en az 4,5:1 oran olmalı, yoksa okunmaz.'],
    ['Hız: yükleme süresi', 'Görselleri küçült, geç yükle, kodu sıkıştır: her adım saniyeler kazandırır.'],
    ['Erişilebilirlik', 'Sayfa klavyeyle (Tab) gezilebilmeli, odak görünmeli, her öğenin etiketi olmalı.'],
    ['SEO: arama sonucu', 'Başlık ve açıklama, arama sonucunda görünen kartı oluşturur. Kısa ve net yaz.']
  ],
  /* her ders için ayrıntı: [açıklama, örnek kod, ipucu] (oynatıcıda gösterilir) */
  more: EN ? [
    [`When you type an address and press Enter, the browser tells a server "give me this page". The server sends the HTML file first. The browser then asks for the CSS, JavaScript and images mentioned inside it, puts everything together and draws the page.`, `https://site.com/about.html\n→ HTML + CSS + JS + images`, `Right-click a page and choose "View page source" to read the HTML of any site.`],
    [`Think of a house: HTML builds the walls and doors (structure), CSS paints and furnishes it (looks), JavaScript adds the light switch and doorbell (behaviour). The three live in separate files.`, `<link rel="stylesheet" href="style.css">\n<script src="code.js"></script>`, `Learn them in this order: HTML first, then CSS, then JavaScript. It is the easiest path.`],
    [`A page should have one <h1>. It tells what the page is about. Use <h2>, <h3> for smaller headings. Screen readers and search engines read headings to understand the page.`, `<h1>Hello</h1>\n<h2>My projects</h2>`, `Pick a heading for its meaning, not its size. CSS controls the size.`],
    [`<p> makes each paragraph its own block. For a new paragraph, open a new <p>. Pressing Enter inside the text is not enough: HTML treats many spaces and line breaks as one space.`, `<p>I am Berat.</p>\n<p>I am learning web design.</p>`, `After each change refresh the page with F5 (or Ctrl+F5) to see it.`],
    [`<button> is for an action ("send", "count"). To go to another page use a link, <a>. The difference matters for people who use the keyboard or a screen reader.`, `<button>Click</button>`, `The words on a button should say what it does: "Send", "Save".`],
    [`The opening tag is <p>, the closing tag is </p> (it has a /). You can put a tag inside another tag, but the one opened last must be closed first.`, `<p>I am <b>Berat</b>.</p>`, `If the page looks broken, first check whether you forgot to close a tag.`],
    [`A CSS rule is: which element { property: value; }. You can write a colour name (red), a hex code (#ff7a3d) or rgb(). color changes the text, background changes the fill.`, `h1 {\n  color: #ff7a3d;\n  background: #0b1220;\n}`, `End every line with ; or the next line will not work.`],
    [`font-size sets the text size and border-radius rounds the corners. px is a fixed size; rem follows the user's own text setting, so rem is better for text.`, `h1 { font-size: 2rem; }\nbutton { border-radius: 24px; }`, `Change one value, save, and look at the result. It is the fastest way to learn.`],
    [`JavaScript listens to the page: when something happens (a click, a key) it runs your code. let stores a number, n++ adds one, onclick catches the click.`, `let n = 0;\nbutton.onclick = () => {\n  n++;\n  console.log(n);\n};`, `Is something wrong? Press F12 and open Console: it tells you where.`],
    [`Flexbox lines up the children of a box in a row or a column. justify-content places them along the main (horizontal) axis, align-items along the cross (vertical) axis, gap adds space between.`, `.box {\n  display: flex;\n  justify-content: space-between;\n  gap: 1rem;\n}`, `To centre something: justify-content: center; align-items: center;`],
    [`Phones and computers have different widths. Rules inside @media (max-width: 600px) only work on narrow screens. The page also needs the viewport meta tag in <head>.`, `@media (max-width: 600px) {\n  .cards { flex-direction: column; }\n}`, `Design for the phone first, then add rules for wide screens (mobile first).`],
    [`Contrast is the brightness difference between text and background. Normal text needs at least 4.5:1, large text 3:1. Light grey text on white is unreadable for many people.`, `Dark #0b1220 on orange #ffb25a → 9.8:1 ✓\nWhite #fff on orange #ffb25a → 1.9:1 ✗`, `The browser developer tools show the contrast ratio for you.`],
    [`The slower a page opens, the more visitors leave. Images give the biggest win: save them at the right size, load them only when they appear with loading="lazy", and minify your code.`, `<img src="photo.jpg" alt="..."\n     width="800" height="600" loading="lazy">`, `On a phone the first load should not take more than about 3 seconds.`],
    [`Everyone should be able to use your site: with a keyboard (Tab to move, Enter to choose), with a screen reader, with low vision. Write alt text for images, connect each form box to a label, never remove the focus outline.`, `<img src="p1.jpg" alt="Screenshot of a project">\n<label for="mail">Email</label>\n<input id="mail">`, `Put the mouse away and try to use your site with only the Tab key.`],
    [`A search engine shows your <title> as the blue headline and the meta description as the text under it. Keep the title near 60 characters and the description near 155, and make every page different.`, `<title>Berat Yanardağ | Web Design</title>\n<meta name="description" content="Projects, blog and gallery.">`, `Write the keyword naturally. Repeating the same word does not help.`]
  ] : [
    [`Adresi yazıp Enter'a basınca tarayıcı sunucuya "bu sayfayı ver" der. Sunucu önce HTML dosyasını gönderir. Tarayıcı içinde geçen CSS, JavaScript ve görselleri de tek tek ister, hepsini birleştirip sayfayı çizer.`, `https://site.com/hakkimda.html\n→ HTML + CSS + JS + görseller`, `Sayfada sağ tık → "Sayfa kaynağını görüntüle" ile her sitenin HTML'ini okuyabilirsin.`],
    [`Bir ev gibi düşün: HTML duvarları ve kapıları (yapı), CSS boyayı ve mobilyayı (görünüm), JavaScript ışık düğmesini ve kapı zilini (davranış) yapar. Üçü ayrı dosyalarda durur.`, `<link rel="stylesheet" href="stil.css">\n<script src="kod.js"></script>`, `Bu sırayla öğren: önce HTML, sonra CSS, en son JavaScript. En kolay yol budur.`],
    [`Bir sayfada tek <h1> olmalı; sayfanın konusunu söyler. Daha küçük başlıklar için <h2>, <h3> kullanılır. Ekran okuyucular ve arama motorları başlıklara bakarak sayfayı anlar.`, `<h1>Merhaba</h1>\n<h2>Projelerim</h2>`, `Başlığı büyüklüğü için değil, anlamı için seç. Boyutu CSS ayarlar.`],
    [`<p> her paragrafı ayrı bir blok yapar. Yeni paragraf için yeni <p> açarsın. Yazının içinde Enter'a basmak yetmez: HTML art arda gelen boşlukları ve satır sonlarını tek boşluk sayar.`, `<p>Ben Berat.</p>\n<p>Web tasarım öğreniyorum.</p>`, `Her değişiklikten sonra sayfayı F5 (veya Ctrl+F5) ile yenile.`],
    [`<button> bir eylem içindir ("gönder", "say"). Başka bir sayfaya gitmek için bağlantı, yani <a> kullanılır. Bu ayrım klavye ve ekran okuyucu kullananlar için önemlidir.`, `<button>Tıkla</button>`, `Düğmenin üstündeki yazı ne yaptığını anlatsın: "Gönder", "Kaydet".`],
    [`Açılış etiketi <p>, kapanış etiketi </p> (içinde / vardır). Bir etiketin içine başka etiket koyabilirsin ama en son açılan en önce kapanır.`, `<p>Ben <b>Berat</b>.</p>`, `Sayfa bozuk görünüyorsa önce kapatmayı unuttuğun bir etiket var mı diye bak.`],
    [`CSS kuralı şöyle yazılır: hangi öğe { özellik: değer; }. Renk adı (red), onaltılık kod (#ff7a3d) ya da rgb() yazabilirsin. color yazı rengini, background zemin rengini değiştirir.`, `h1 {\n  color: #ff7a3d;\n  background: #0b1220;\n}`, `Her satırın sonuna ; koy, yoksa sonraki satır çalışmaz.`],
    [`font-size yazı boyutu, border-radius köşe yuvarlaklığıdır. px sabit boyuttur; rem ise kullanıcının kendi yazı ayarına uyar, o yüzden yazıda rem daha iyidir.`, `h1 { font-size: 2rem; }\nbutton { border-radius: 24px; }`, `Bir değeri değiştir, kaydet, sonucu hemen gör: en hızlı öğrenme yolu budur.`],
    [`JavaScript sayfayı dinler: bir şey olunca (tık, tuş) kodunu çalıştırır. let ile sayı saklarsın, n++ ile bir artırırsın, onclick ile tıklamayı yakalarsın.`, `let n = 0;\nbutton.onclick = () => {\n  n++;\n  console.log(n);\n};`, `Hata mı var? F12'ye basıp Console sekmesine bak, nerede yanıldığını söyler.`],
    [`Flexbox bir kutunun çocuklarını satıra ya da sütuna dizer. justify-content ana eksende (yatay) yerleştirir, align-items çapraz eksende (dikey) hizalar, gap araya boşluk koyar.`, `.kutu {\n  display: flex;\n  justify-content: space-between;\n  gap: 1rem;\n}`, `Ortalamak için: justify-content: center; align-items: center;`],
    [`Telefon ve bilgisayarın genişliği farklıdır. @media (max-width: 600px) içine yazdığın kurallar sadece dar ekranda çalışır. Sayfanın <head> bölümünde viewport meta etiketi de gerekir.`, `@media (max-width: 600px) {\n  .kartlar { flex-direction: column; }\n}`, `Önce telefonu düşün, sonra geniş ekran için kural ekle (mobil önce).`],
    [`Kontrast, yazı rengi ile zemin arasındaki parlaklık farkıdır. Normal yazı için en az 4,5:1, büyük yazı için 3:1 olmalı. Beyaz üstünde açık gri yazı birçok kişi için okunmaz.`, `Koyu #0b1220 / turuncu #ffb25a → 9,8:1 ✓\nBeyaz #fff / turuncu #ffb25a → 1,9:1 ✗`, `Tarayıcının geliştirici araçları kontrast oranını senin için gösterir.`],
    [`Sayfa ne kadar geç açılırsa o kadar çok kişi çıkar. En büyük kazanç görsellerden gelir: doğru boyutta kaydet, loading="lazy" ile ekrana gelince yükle, kodu küçült.`, `<img src="foto.jpg" alt="..."\n     width="800" height="600" loading="lazy">`, `Telefonda ilk açılış yaklaşık 3 saniyeyi geçmemeli.`],
    [`Herkes siteni kullanabilmeli: klavyeyle (Tab ile gezip Enter ile seçerek), ekran okuyucuyla, az görenler de. Görsele alt metin yaz, form kutusunu bir label'a bağla, odak çizgisini silme.`, `<img src="p1.jpg" alt="Proje ekran görüntüsü">\n<label for="mail">E-posta</label>\n<input id="mail">`, `Fareyi bırak, sitende sadece Tab tuşuyla gezmeyi dene.`],
    [`Arama motoru <title> etiketini mavi başlık, meta description'ı altındaki yazı olarak gösterir. Başlık yaklaşık 60, açıklama yaklaşık 155 karakteri geçmesin; her sayfanın kendine özgü olsun.`, `<title>Berat Yanardağ | Web Tasarım</title>\n<meta name="description" content="Projeler, blog ve galeri.">`, `Anahtar kelimeyi doğal yaz; aynı kelimeyi tekrarlamak işe yaramaz.`]
  ]
};

const X = EN ? {
  title: 'Game Room', sub: 'Pick a game.', learn: 'Learn', fun: 'Fun', easy: 'Easy', hard: 'Hard', back: '← Games', close: 'Close', again: 'Play again', hubBtn: 'All games',
  g: [
    { n: 'Interface Workshop', d: 'Build a web page in 3 short tasks and earn a badge.', t: 'learn', l: 'easy' },
    { n: 'Tag Match', d: 'Flip the cards and match each HTML tag with what it does.', t: 'learn', l: 'easy' },
    { n: 'Bug Detective', d: 'Find the line with the mistake. Hints teach you as you go, no experience needed.', t: 'learn', l: 'easy' },
    { n: 'Bug Squash', d: 'Squash as many bugs as you can in 25 seconds.', t: 'fun', l: 'easy' }],
  mem: { moves: 'Moves', done: 'Well done!', doneD: (m) => `You matched every tag in ${m} moves. Now you know the basics of a page.`,
    pairs: [['<h1>', 'Main heading'], ['<p>', 'Paragraph'], ['<a>', 'Link'], ['<img>', 'Image'], ['<ul>', 'List'], ['<button>', 'Button']] },
  det: { rules: ['8 short rounds, no time limit', '5 lives', 'No experience needed: tap Hint and it shows you where to look (costs 20% of the points)', 'Answer in a row to build a streak bonus'], start: 'Start', round: 'Round', lv: 'Level', tap: 'Tap the line that has the mistake.', hint: 'Hint (-20%)', pts: 'Points', streak: 'Streak', best: 'Best', ok: 'Found it!', no: 'Not that one.', late: 'Time is up.', next: 'Next →',
    over: 'Game over', overD: (s) => `Final score: ${s}.`, won: 'Legendary detective!', rank: (s) => s >= 1500 ? 'Legend' : s >= 1000 ? 'Expert' : s >= 500 ? 'Detective' : 'Apprentice', rankL: 'Rank', newBest: 'New record!' },
  sq: { time: 'Time', score: 'Bugs', start: 'Start', ready: 'Tap the bugs as they pop up. Easy and quick!', end: 'Time is up!', rate: (s) => s >= 20 ? 'Pro debugger!' : s >= 12 ? 'Nice work!' : 'Good start, try again!' },
  les: { t: 'Lesson wall', d: 'How much do you know about building websites? The wall shows a lesson that fits you.', ok: 'Done! Look at the wall: the lessons now match your level.', cur: 'Current' },
  lvD: ['I have never built a page. Start from the very beginning.', 'I know a few tags and colours. Show me the next steps.', 'I code already. Show me speed, accessibility and SEO.']
} : {
  title: 'Oyun Odası', sub: 'Bir oyun seç.', learn: 'Öğretici', fun: 'Eğlence', easy: 'Kolay', hard: 'Zor', back: '← Oyunlar', close: 'Kapat', again: 'Tekrar oyna', hubBtn: 'Tüm oyunlar',
  g: [
    { n: 'Arayüz Atölyesi', d: '3 kısa görevle bir web sayfası kur, rozeti kazan.', t: 'learn', l: 'easy' },
    { n: 'Etiket Eşleştir', d: 'Kartları çevir, her HTML etiketini işleviyle eşleştir.', t: 'learn', l: 'easy' },
    { n: 'Hata Dedektifi', d: 'Hatalı satırı bul. İpuçları oynarken sana öğretir, bilgi gerekmez.', t: 'learn', l: 'easy' },
    { n: 'Böcek Avı', d: '25 saniyede olabildiğince çok böceği ez.', t: 'fun', l: 'easy' }],
  mem: { moves: 'Hamle', done: 'Harika!', doneD: (m) => `Tüm etiketleri ${m} hamlede eşleştirdin. Artık bir sayfanın temel parçalarını biliyorsun.`,
    pairs: [['<h1>', 'Ana başlık'], ['<p>', 'Paragraf'], ['<a>', 'Bağlantı'], ['<img>', 'Görsel'], ['<ul>', 'Liste'], ['<button>', 'Düğme']] },
  det: { rules: ['8 kısa tur, süre sınırı yok', '5 can', 'Bilgi gerekmez: İpucu\'na bas, nereye bakacağını gösterir (puanın %20\'si gider)', 'Üst üste doğru bil, seri bonusu kazan'], start: 'Başla', round: 'Tur', lv: 'Seviye', tap: 'Hatası olan satıra dokun.', hint: 'İpucu (-%20)', pts: 'Puan', streak: 'Seri', best: 'En iyi', ok: 'Buldun!', no: 'O değil.', late: 'Süre doldu.', next: 'Devam →',
    over: 'Oyun bitti', overD: (s) => `Toplam puan: ${s}.`, won: 'Efsane dedektif!', rank: (s) => s >= 1500 ? 'Efsane' : s >= 1000 ? 'Uzman' : s >= 500 ? 'Dedektif' : 'Çırak', rankL: 'Rütbe', newBest: 'Yeni rekor!' },
  sq: { time: 'Süre', score: 'Böcek', start: 'Başla', ready: 'Ortaya çıkan böceklere dokun. Kolay ve hızlı!', end: 'Süre bitti!', rate: (s) => s >= 20 ? 'Usta hata ayıklayıcı!' : s >= 12 ? 'Güzel iş!' : 'İyi başlangıç, tekrar dene!' },
  les: { t: 'Ders duvarı', d: 'Web sitesi yapma konusunda ne kadar bilgilisin? Duvarda sana uygun ders dönsün.', ok: 'Tamam! Duvara bak: dersler artık seviyene göre dönüyor.', cur: 'Seçili' },
  lvD: ['Hiç sayfa yapmadım. En baştan anlat.', 'Birkaç etiketi ve rengi biliyorum. Sonraki adımları göster.', 'Zaten kod yazıyorum. Hız, erişilebilirlik ve SEO göster.']
};

/* Hata Dedektifi soruları: kod her dilde aynı, ipucu ve açıklama iki dilli */
const Q = [
  { lv: 1, lines: ['<h1>Home</h1>', '<img src="cat.jpg">', '<p>I am Berat.</p>', '<a href="/contact">Contact</a>'], bug: 1,
    h: ['Görsel, görmeyen biri için nasıl anlatılır?', 'How would an image be described to someone who cannot see it?'], w: ['Görselin alt metni yok. Ekran okuyucular ve arama motorları görseli anlayamaz.', 'The image has no alt text. Screen readers and search engines cannot understand it.'] },
  { lv: 1, lines: ['h1 { font-size: 32px; }', 'p { color: white; background: white; }', '.btn { border-radius: 12px; }', 'a { color: royalblue; }'], bug: 1,
    h: ['Yazı ile zeminin renklerine bak.', 'Look at the text colour and the background colour.'], w: ['Beyaz zeminde beyaz yazı okunmaz. Kontrastı yüksek tut.', 'White text on a white background cannot be read. Keep contrast high.'] },
  { lv: 1, lines: ['<ul>', '  <li>Home</li>', '  <li>Projects', '</ul>'], bug: 2,
    h: ['Açılan her etiketin bir kapanışı olmalı.', 'Every opened tag needs a closing tag.'], w: ['Bu <li> hiç kapatılmamış. Açtığını kapat.', 'This <li> is never closed. Close what you open.'] },
  { lv: 1, lines: ['<title>My page</title>', '<meta charset="utf-8">', '<meta name="viewport">', '<link rel="stylesheet" href="style.css">'], bug: 2,
    h: ['Telefonda sayfanın sığması için bir ayar gerekir.', 'A setting is needed so the page fits on phones.'], w: ['Viewport etiketinin içeriği yok, sayfa telefona sığmaz: content="width=device-width, initial-scale=1".', 'The viewport tag has no content, so the page will not fit phones: content="width=device-width, initial-scale=1".'] },
  { lv: 2, lines: ['let total = 0;', 'for (let i = 0; i <= items.length; i++) {', '  total += items[i].price;', '}'], bug: 1,
    h: ['Bir dizide 5 eleman varsa son sıra numarası 4\'tür.', 'In an array of 5 items the last index is 4.'], w: ['<= bir eleman fazla döner ve hata verir. Doğrusu i < items.length.', '<= loops one time too many and breaks. It should be i < items.length.'] },
  { lv: 2, lines: ['.card { width: 300px; }', '.card img { width: 100%; }', '.card:hover { transform: scale(1.1) }', '.card { color: #333 background: #fff; }'], bug: 3,
    h: ['CSS\'te her özelliğin sonunda bir işaret olur.', 'In CSS every property ends with a mark.'], w: ['Bir noktalı virgül eksik: color: #333; background: #fff;', 'A semicolon is missing: color: #333; background: #fff;'] },
  { lv: 2, lines: ['<form>', '  <label>Email</label>', '  <input type="email" id="mail">', '  <button>Send</button>'], bug: 1,
    h: ['Etiket ile kutu birbirine bağlanmış mı?', 'Is the label connected to its box?'], w: ['label, input ile bağlı değil. <label for="mail"> gerekir; ekran okuyucu böyle anlar.', 'The label is not connected to the input. It needs <label for="mail"> so screen readers can pair them.'] },
  { lv: 2, lines: ['<head>', '  <title>Berat Yanardağ | Web</title>', '  <meta name="description" content="">', '</head>'], bug: 2,
    h: ['Arama sonucunda başlığın altındaki yazıyı düşün.', 'Think of the text under the title in search results.'], w: ['Açıklama boş. Arama motorları sonuçta ne göstereceğini bilemez; kısa bir cümle yaz.', 'The description is empty. Search engines have nothing to show; write one short sentence.'] },
  { lv: 3, lines: ['let score = 100;', 'if (score = 100) {', '  console.log("Full marks!");', '}'], bug: 1,
    h: ['İki farklı iş yapan iki farklı işaret var: biri atar, biri karşılaştırır.', 'Two different marks do two jobs: one assigns, one compares.'], w: ['Tek = değer atar. Karşılaştırmak için == ya da === kullan.', 'A single = assigns a value. Compare with == or ===.'] },
  { lv: 3, lines: ['function save() { alert("Saved"); }', 'const btn = document.querySelector(".btn");', 'btn.addEventListener("click", save());', '// should run on click'], bug: 2,
    h: ['Parantez fonksiyonu hemen çalıştırır.', 'Parentheses run the function immediately.'], w: ['save() hemen çalışır. Tıklayınca çalışması için sadece save yaz.', 'save() runs right away. Write just save so it runs on click.'] },
  { lv: 3, lines: ['.modal {', '  z-index: 999;', '  background: white;', '}'], bug: 1,
    h: ['Üst üste binme sırası yalnızca konumlandırılmış kutularda işler.', 'Stacking order only works on positioned boxes.'], w: ['position olmadan z-index işe yaramaz. position: fixed; ya da relative; ekle.', 'z-index does nothing without position. Add position: fixed; or relative;.'] },
  { lv: 3, lines: ['<h1>Order</h1>', '<p>Pick an item and send.</p>', '<div onclick="send()">Send</div>', '<footer>© 2026</footer>'], bug: 2,
    h: ['Klavye ile Tab\'a basınca hangi öğeye ulaşılır?', 'Which element can you reach with the Tab key?'], w: ['div klavyeyle seçilemez. Gerçek bir <button> kullan; erişilebilirlik bedavaya gelir.', 'A div cannot be reached by keyboard. Use a real <button>; accessibility comes for free.'] }
];

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export function startArcade(G, urls, onClaim, which, onLevel) {
  const root = document.getElementById('game');
  let timer = 0, claimed = false;
  root.hidden = false;
  const stop = () => { clearInterval(timer); timer = 0; };
  const key = (e) => { if (e.key === 'Escape') close(); };
  const close = () => { stop(); removeEventListener('keydown', key); root.hidden = true; root.innerHTML = ''; };
  addEventListener('keydown', key);
  const back = which ? close : () => hub();
  const shell = (title) => {
    stop();
    root.innerHTML = `<div class="gw" role="dialog" aria-modal="true" aria-label="${esc(title)}"><button class="gx" aria-label="${X.close}">✕</button><div class="ghead"><b>${esc(title)}</b><span class="gstep"></span></div><div class="gmain"></div></div>`;
    root.querySelector('.gx').onclick = close; root.querySelector('.gx').focus();
    return root.querySelector('.gmain');
  };
  const endPanel = (main, t, d, again, extra = '') => {
    main.innerHTML = `<div class="gpanel"><h2>${esc(t)}</h2><p>${esc(d)}</p>${extra}<div class="gbtns"><button class="gpri">${X.again}</button>${which ? '' : `<button>${X.hubBtn}</button>`}<button>${X.close}</button></div></div>`;
    const b = main.querySelectorAll('.gbtns button'); b[0].onclick = again; if (!which) b[1].onclick = back; b[b.length - 1].onclick = close;
  };

  function hub() {
    const main = shell(X.title);
    main.innerHTML = `<p class="gsub">${X.sub}</p><div class="gh">${X.g.map((g, i) => `<button class="gc" data-i="${i}" data-t="${g.t}"><span class="gci" aria-hidden="true">${['🎨', '🧩', '🔎', '🐞'][i]}</span><b>${esc(g.n)}</b><small>${esc(g.d)}</small><span class="gtag">${X[g.t]} · ${X[g.l]}</span></button>`).join('')}</div>`;
    main.querySelectorAll('.gc').forEach((b) => b.onclick = () => [atelier, memory, detective, squash][b.dataset.i]());
  }

  function atelier() {
    stop(); removeEventListener('keydown', key);
    const again = () => setTimeout(() => { if (!claimed && !which) startArcade(G, urls, onClaim); }, 0);
    startGame(G, urls, again, (c) => { claimed = true; onClaim(c); });
  }

  function memory() {
    const main = shell(X.g[1].n), P = X.mem.pairs; let first = null, lock = false, moves = 0, found = 0;
    const cards = shuffle(P.flatMap((p, i) => [{ k: i, t: p[0], c: 1 }, { k: i, t: p[1], c: 0 }]));
    main.innerHTML = `<div class="gtask"><p>${esc(X.g[1].d)} <small class="gmv">${X.mem.moves}: 0</small></p></div><div class="gmem">${cards.map((c, i) => `<button class="mc" data-i="${i}" aria-label="?"><span class="mf"></span><span class="mb ${c.c ? 'code' : ''}">${esc(c.t)}</span></button>`).join('')}</div>`;
    const bs = main.querySelectorAll('.mc'), mv = main.querySelector('.gmv');
    bs.forEach((b) => b.onclick = () => {
      const i = +b.dataset.i; if (lock || b.classList.contains('fl') || b.classList.contains('ok')) return;
      b.classList.add('fl');
      if (first === null) { first = i; return; }
      moves++; mv.textContent = `${X.mem.moves}: ${moves}`;
      const a = first; first = null;
      if (cards[a].k === cards[i].k) { bs[a].classList.add('ok'); b.classList.add('ok'); if (++found === P.length) setTimeout(() => endPanel(main, X.mem.done, X.mem.doneD(moves), memory), 600); }
      else { lock = true; setTimeout(() => { bs[a].classList.remove('fl'); b.classList.remove('fl'); lock = false; }, 800); }
    });
  }

  /* ZOR oyun: süre, can, seri, ipucu ve rekor. Önceden bilgi gerekmez; ipucu ve açıklamalar öğretir. */
  function detective() {
    const main = shell(X.g[2].n), L = EN ? 1 : 0;
    main.innerHTML = `<div class="gpanel"><p>${X.g[2].d}</p><ol class="glist">${X.det.rules.map((r) => `<li>${esc(r)}</li>`).join('')}</ol><p>${X.det.best}: <b>${+localStorage.getItem('bugBest') || 0}</b></p><div class="gbtns"><button class="gpri">${X.det.start}</button></div></div>`;
    main.querySelector('.gpri').onclick = run;
    function run() {
      const qs = Q.filter((q) => q.lv < 3).sort((a, b) => a.lv - b.lv || Math.random() - .5); let ri = 0, lives = 5, score = 0, streak = 0;
      const finish = (won) => {
        stop(); const best = +localStorage.getItem('bugBest') || 0, rec = score > best; if (rec) localStorage.setItem('bugBest', score);
        endPanel(main, won ? X.det.won : X.det.over, X.det.overD(score), detective, `<p class="gprize">${X.det.rankL}: ${X.det.rank(score)}${rec ? ' · ' + X.det.newBest : ''}</p>`);
      };
      const show = () => {
        const q = qs[ri]; let hinted = false, left = 40, done = false;
        main.innerHTML = `<div class="gstat"><span>${'❤'.repeat(lives)}${'♡'.repeat(5 - lives)}</span><span>${X.det.pts}: <b>${score}</b></span><span>${X.det.streak}: <b>${streak}</b></span><span>${X.det.round} ${ri + 1}/${qs.length} · ${X.det.lv} ${q.lv}</span></div><div class="gtm"><i></i></div><div class="gtask"><p>${X.det.tap}</p></div><div class="gcodebox">${q.lines.map((l, i) => `<button class="cl" data-i="${i}"><i>${i + 1}</i><code>${esc(l)}</code></button>`).join('')}</div><p class="gfb"></p><div class="gbtns"><button class="gh1">💡 ${X.det.hint}</button></div>`;
        const fb = main.querySelector('.gfb'), ls = main.querySelectorAll('.cl'), bar = main.querySelector('.gtm i'), hb = main.querySelector('.gh1');
        hb.onclick = () => { hinted = true; hb.disabled = true; fb.className = 'gfb'; fb.textContent = '💡 ' + q.h[L]; };
        const end = (good, msg) => {
          if (done) return; done = true; stop(); ls.forEach((x) => x.disabled = true); hb.remove(); ls[q.bug].classList.add('ok');
          if (good) { streak++; score += Math.round((100 * q.lv + left * 4) * (1 + Math.min(streak - 1, 5) * .1) * (hinted ? .8 : 1)); fb.className = 'gfb ok'; } else { streak = 0; lives--; fb.className = 'gfb no'; }
          fb.textContent = `${msg} ${q.w[L]}`;
          const d = document.createElement('div'); d.className = 'gbtns';
          d.innerHTML = `<button class="gpri">${lives <= 0 ? X.det.over : ri + 1 >= qs.length ? X.det.won : X.det.next}</button>`;
          d.firstChild.onclick = () => { ri++; if (lives <= 0) finish(false); else if (ri >= qs.length) finish(true); else show(); };
          main.appendChild(d); main.querySelector('.gstat').innerHTML = `<span>${'❤'.repeat(Math.max(0, lives))}${'♡'.repeat(5 - Math.max(0, lives))}</span><span>${X.det.pts}: <b>${score}</b></span><span>${X.det.streak}: <b>${streak}</b></span>`;
        };
        ls.forEach((b) => b.onclick = () => { if (+b.dataset.i === q.bug) end(true, X.det.ok); else { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); ls[+b.dataset.i].classList.add('no'); end(false, X.det.no); } });
        timer = setInterval(() => { left -= .1; bar.style.width = Math.max(0, left / 40 * 100) + '%'; if (left < 0) left = 0; }, 100);
      };
      show();
    }
  }

  function squash() {
    const main = shell(X.g[3].n);
    main.innerHTML = `<div class="gpanel"><p>${X.sq.ready}</p><div class="gbtns"><button class="gpri">${X.sq.start}</button></div></div>`;
    main.querySelector('.gpri').onclick = () => {
      let score = 0, left = 25;
      main.innerHTML = `<div class="gtask"><p><b class="gt">${X.sq.time}: 25</b> &nbsp; <b class="gs">${X.sq.score}: 0</b></p></div><div class="gbugs">${[...Array(12)].map(() => '<button class="hole" aria-label="bug"></button>').join('')}</div>`;
      const holes = main.querySelectorAll('.hole'), gt = main.querySelector('.gt'), gs = main.querySelector('.gs');
      holes.forEach((h) => h.onclick = () => { if (!h.classList.contains('up')) return; h.classList.remove('up'); h.textContent = '💥'; setTimeout(() => { if (!h.classList.contains('up')) h.textContent = ''; }, 250); score++; gs.textContent = `${X.sq.score}: ${score}`; });
      let tick = 0;
      timer = setInterval(() => {
        tick++;
        if (tick % 5 === 0) { left--; gt.textContent = `${X.sq.time}: ${left}`; if (left <= 0) { stop(); endPanel(main, X.sq.end, `${X.sq.score}: ${score} — ${X.sq.rate(score)}`, squash); return; } }
        if (tick % 3 !== 0) return;
        const h = holes[Math.floor(Math.random() * holes.length)]; if (h.classList.contains('up')) return;
        h.classList.add('up'); h.textContent = '🐞'; setTimeout(() => { if (h.classList.contains('up')) { h.classList.remove('up'); h.textContent = ''; } }, 1300);
      }, 200);
    };
  }

  function lesson() {
    const main = shell(X.les.t), cur = +localStorage.getItem('lv') || 0;
    main.innerHTML = `<p class="gsub">${X.les.d}</p><div class="gh gl3">${LESSON.names.map((n, i) => `<button class="gc" data-i="${i}" data-t="learn"><span class="gci" aria-hidden="true">${['🌱', '🌿', '🌳'][i]}</span><b>${esc(n)}</b><small>${esc(X.lvD[i])}</small>${i === cur ? `<span class="gtag">${X.les.cur}</span>` : ''}</button>`).join('')}</div>`;
    main.querySelectorAll('.gc').forEach((b) => b.onclick = () => {
      const i = +b.dataset.i; localStorage.setItem('lv', i); onLevel && onLevel(i, false);
      main.innerHTML = `<div class="gpanel"><h2>${esc(LESSON.names[i])}</h2><p>${X.les.ok}</p><div class="gbtns"><button class="gpri">${T2('Duvardan izle', 'Watch on the wall')}</button></div></div>`; const bb = main.querySelector('.gbtns button'); bb.onclick = close; bb.focus();
    });
  }

  ({ atelier, tag: memory, bug: detective, squash, lesson }[which] || hub)();
}
