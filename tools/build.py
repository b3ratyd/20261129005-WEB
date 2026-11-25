#!/usr/bin/env python3
"""TR/EN sayfaları üretir. Kişisel bilgilerinizi aşağıdaki CONFIG bölümünden değiştirin,
sonra:  python3 tools/build.py   (proje klasörünün içinden)"""
import json, pathlib, datetime, random, re, os
from html import escape as esc

ROOT = pathlib.Path(__file__).resolve().parent.parent

# ======================= CONFIG (BURAYI DEĞİŞTİRİN) =======================
SITE_URL = "https://beratyanardag.site"          # alan adı alınınca "https://alanadin.com" yapın (sonunda / olmasın)
FIRST, LAST = "Berat", "Yanardağ"
STUDENT_NO = "20261129005"
def _env(name):
    """Kişisel e-posta kaynak koda yazılmaz: kullanıcı ortam değişkeninden (setx SITE_EMAIL ...) okunur."""
    v = os.environ.get(name)
    if v:
        return v
    try:
        import winreg
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, "Environment") as k:
            return winreg.QueryValueEx(k, name)[0]
    except Exception:
        return ""
EMAIL = _env("SITE_EMAIL")
if not EMAIL:
    raise SystemExit("SITE_EMAIL ayarlı değil. PowerShell'de bir kez çalıştırın:  setx SITE_EMAIL gmail_adresiniz")
PHONE_DISPLAY, PHONE_TEL = "0552 709 01 66", "+905527090166"
CITY = {"tr": "Antalya", "en": "Antalya"}
ADDRESS = {"tr": "Pınarbaşı Mahallesi, Anadolu Caddesi, Akdeniz Üniversitesi Kampüsü İçi No: 156/4, 07070 Konyaaltı / Antalya", "en": "Pınarbaşı Mahallesi, Anadolu Caddesi, Akdeniz University Campus No: 156/4, 07070 Konyaaltı / Antalya"}
DEPT = {"tr": "Bilgisayar Programcılığı", "en": "Computer Programming"}
GITHUB = "https://github.com/b3ratyd"            # varsa; yoksa "" bırakın
LINKEDIN = ""  # LinkedIn adresin varsa buraya yaz (ör. "https://www.linkedin.com/in/kullanici"); yoksa "" bırakın
PORTRAIT = "portrait.jpg"                      # kendi fotoğrafınız: assets/img/portrait.jpg yapıp burayı değiştirin
PORTRAIT_SIZE = (600, 750)
BUILD_DATE = datetime.date.today().isoformat()
# ===========================================================================

NAME = f"{FIRST} {LAST}"
INITIALS = FIRST[0] + LAST[0]
KEYS = ["home", "about", "projects", "blog", "gallery", "contact"]
FILES = {
    "tr": dict(home="index.html", about="hakkimda.html", projects="projeler.html", blog="blog.html", gallery="galeri.html", contact="iletisim.html"),
    "en": dict(home="index.html", about="about.html", projects="projects.html", blog="blog.html", gallery="gallery.html", contact="contact.html"),
}
NAVL = {
    "tr": dict(home="Ana sayfa", about="Hakkımda", projects="Projeler", blog="Blog", gallery="Galeri", contact="İletişim"),
    "en": dict(home="Home", about="About", projects="Projects", blog="Blog", gallery="Gallery", contact="Contact"),
}
LOCALE = {"tr": "tr_TR", "en": "en_US"}
IMG = "../assets/img/"

PROJECTS = [
    ("p1", "Ters Yüz 2 afişi", "Inside Out 2 poster",
     "Photoshop'ta History Brush (Geçmiş Fırçası) aracını öğrenmek için hazırladığım çalışma. Çok sevdiğim animasyon Ters Yüz 2'yi seçtim: karakterleri siyah-beyaza çevirip yalnızca Neşe'nin rengini fırçayla geri getirdim, böylece bakışlar tek bir noktada toplanıyor. Afişi, filmin ruhunu yansıtan özlü bir sözle tamamladım: “Bazen tek bir renk, bütün hikâyeyi anlatmaya yeter.”",
     "A study in Photoshop's History Brush tool. I chose Inside Out 2, an animation I love: I turned the characters black and white and painted only Joy's colour back in, so every eye lands on one spot. I finished the poster with a line in the film's spirit: “Sometimes a single colour is enough to tell the whole story.”",
     "History Brush · Photoshop", "History Brush · Photoshop"),
    ("p2", "Fusetea ürün afişi", "Fusetea product poster",
     "Bir ürün tanıtımı çalışması: mango ve ananas aromalı içecek için yeşilin her tonunu kullandım. Koyu zeminden yapraklara, yumuşak ışık parıltılarından kutunun metalik yüzeyine kadar tüm renkler aynı aileden; sonuç ferah, canlı ve etkileyici bir tanıtım afişi.",
     "A product promotion piece: I used every shade of green for a mango and pineapple flavoured drink. From the dark background to the leaves, from soft light bokeh to the can's metallic surface, every colour belongs to one family. The result is a fresh, vivid and striking promo poster.",
     "Ürün tanıtımı", "Product promotion"),
    ("p3", "Spawn karakter çalışması", "Spawn character study",
     "Kara kalem bir çizimin dijital boyaması. Gölgelendirmelerle karaktere hacim verdim, doğru renk seçimleriyle onu sahnenin tam merkezine taşıdım: kırmızı pelerin ve metal detaylar, sade kayalık zeminde öne çıkıyor.",
     "A digital colouring of a pencil drawing. I gave the character volume with shading and, through careful colour choices, made him the focus of the scene: the red cape and metal details stand out against the plain rocky ground.",
     "Kara kalem boyama", "Pencil-art colouring"),
    ("p5", "Çiftlik oyunu sahnesi", "Farm game scene",
     "Kendi fikrim olan bir çiftlik oyunu için Smart Object (Akıllı Nesne) tekniğiyle tasarladığım sahne. Tarla, çiçek bahçesi ve hayvan ağılları; inekler, domuzlar, koyunlar, atlar, tavuklar ve bitkiler oyunun dünyasını canlandırıyor. Smart Object sayesinde her öğe kalite kaybı olmadan düzenlenebiliyor.",
     "A scene I designed with the Smart Object technique for a farm game of my own. Fields, a flower garden and animal pens: cows, pigs, sheep, horses, chickens and plants bring the game's world to life. Thanks to Smart Objects, every element can be edited without losing quality.",
     "Smart Object", "Smart Object"),
    ("p6", "Image Stack: boş cadde", "Image Stack: an empty street",
     "Bir yerin birçok fotoğrafını çektim; karelerde hareketli araçlar vardı. Photoshop'ta bu fotoğrafları Image Stack (görüntü yığını) tekniğiyle birleştirip hareketli nesneleri kaldırdım. Yol ve bina olduğu gibi kaldı, geçen araçlar silindi.",
     "I took many photos of one place, and moving cars kept crossing the frame. In Photoshop I combined the photos with the Image Stack technique and removed the moving objects. The road and the building stayed, the passing cars vanished.",
     "Image Stack · Photoshop", "Image Stack · Photoshop"),
    ("p4", "Starbucks web sayfası", "Starbucks web page",
     "Starbucks'ın web sitesinin arayüzünü Photoshop'ta, gelişmiş tekniklerle ve büyük bir titizlikle tasarladım. Yılbaşı kampanyasına uygun renkler, içecekler / öneriler / kampanyalar şeklinde net bölümler ve okunaklı bir düzen kurdum.",
     "I designed the interface of Starbucks' website in Photoshop with advanced techniques and great care: festive campaign colours, clear sections for drinks, recommendations and offers, and a readable layout.",
     "Web arayüzü · Photoshop", "Web interface · Photoshop"),
]
# Proje ayrıntıları (web sitesi penceresi): her proje için ayrı ayrı açıklama. Sadece sahibinin anlattıkları yazıldı.
# (amaç, nasıl, sonuç, araçlar) TR ve EN
PDETAIL = {
    "p1": {"tr": ("Photoshop'ta History Brush (Geçmiş Fırçası) aracını öğrenmek.", "Çok sevdiğim animasyon Ters Yüz 2'yi seçtim. Karakterleri siyah-beyaza çevirip yalnızca Neşe'nin rengini fırçayla geri getirdim.", "Bakışlar tek bir noktada toplanıyor. Afişe filmin ruhunu yansıtan özlü bir söz ekledim: “Bazen tek bir renk, bütün hikâyeyi anlatmaya yeter.”", ["Photoshop", "History Brush"]),
           "en": ("Learning Photoshop's History Brush tool.", "I chose Inside Out 2, an animation I love. I turned the characters black and white and painted only Joy's colour back in with the brush.", "Every eye lands on one spot. I added a line in the film's spirit to the poster: “Sometimes a single colour is enough to tell the whole story.”", ["Photoshop", "History Brush"])},
    "p2": {"tr": ("Bir ürünün tanıtımını yapan etkileyici bir afiş hazırlamak.", "Mango ve ananas aromalı içecek için yeşilin her tonunu kullandım: koyu zeminden yapraklara, yumuşak ışık parıltılarından kutunun metalik yüzeyine kadar.", "Tüm renkler aynı aileden olduğu için ferah, canlı ve etkileyici bir tanıtım afişi çıktı.", ["Ürün tanıtımı", "Yeşil tonları"]),
           "en": ("Making an impressive poster that promotes a product.", "I used every shade of green for a mango and pineapple drink: from the dark background to the leaves, from soft light bokeh to the can's metallic surface.", "Because every colour belongs to one family, the result is a fresh, vivid and striking promo poster.", ["Product promotion", "Shades of green"])},
    "p3": {"tr": ("Kara kalem bir çizimi gölgelendirmelerle ve doğru renk seçimleriyle boyamak.", "Gölgelendirmelerle karaktere hacim verdim. Renkleri, karakter sahnenin odağı olacak şekilde seçtim.", "Kırmızı pelerin ve metal detaylar, sade kayalık zeminde öne çıkıyor.", ["Kara kalem boyama", "Gölgelendirme", "Renk seçimi"]),
           "en": ("Colouring a pencil drawing with shading and careful colour choices.", "I gave the character volume with shading and chose the colours so that he becomes the focus of the scene.", "The red cape and metal details stand out against the plain rocky ground.", ["Pencil-art colouring", "Shading", "Colour choice"])},
    "p6": {"tr": ("Image Stack tekniğini öğrenmek: aynı yerin fotoğraflarını birleştirip hareketli nesneleri kaldırmak.", "Bir yerin birçok fotoğrafını çektim. Karelerde araçlar hareket ediyordu. Fotoğrafları Photoshop'ta bir yığın (stack) olarak birleştirdim ve hareketli nesneleri kaldırdım.", "Yol ve bina olduğu gibi kaldı, geçen araçlar tamamen silindi: karşımda boş bir cadde fotoğrafı var.", ["Photoshop", "Image Stack"]),
           "en": ("Learning the Image Stack technique: combining photos of one place to remove moving objects.", "I took many photos of one place, with cars moving through the frames. In Photoshop I combined the photos as a stack and removed the moving objects.", "The road and the building stayed, the passing cars vanished completely: I ended up with a photo of an empty street.", ["Photoshop", "Image Stack"])},
    "p4": {"tr": ("Bir web arayüzü hazırlamak.", "Starbucks'ın web sitesinin arayüzünü Photoshop'ta, gelişmiş tekniklerle ve büyük bir titizlikle tasarladım.", "Yılbaşı kampanyasına uygun renkler, net bölümler (içecekler, öneriler, kampanyalar) ve okunaklı bir düzen çıktı. Bu çalışmayı blogda da anlattım.", ["Photoshop", "Web arayüzü"]),
           "en": ("Preparing a web interface.", "I designed the interface of Starbucks' website in Photoshop with advanced techniques and great care.", "The result has festive campaign colours, clear sections (drinks, recommendations, offers) and a readable layout. I also wrote about this work on my blog.", ["Photoshop", "Web interface"])},
    "p5": {"tr": ("Smart Object (Akıllı Nesne) tekniğini kullanarak bir oyun sahnesi tasarlamak.", "Kendi fikrim olan bir çiftlik oyunu için tarla, çiçek bahçesi ve hayvan ağılları kurdum; inekler, domuzlar, koyunlar, atlar, tavuklar ve bitkiler sahneyi canlandırıyor.", "Smart Object sayesinde her öğe kalite kaybı olmadan düzenlenebiliyor.", ["Smart Object", "Oyun görseli"]),
           "en": ("Designing a game scene with the Smart Object technique.", "For a farm game idea of my own I built fields, a flower garden and animal pens; cows, pigs, sheep, horses, chickens and plants bring the scene to life.", "Thanks to Smart Objects, every element can be edited without losing quality.", ["Smart Object", "Game art"])},
}
PLABELS = {"tr": {"goal": "Amaç", "how": "Nasıl yaptım", "result": "Sonuç", "tools": "Araçlar"}, "en": {"goal": "Goal", "how": "How I did it", "result": "Result", "tools": "Tools"}}


def pdetail(pid, lang):
    g, h, r, tl = PDETAIL[pid][lang]
    return {"goal": g, "how": h, "result": r, "tools": tl}


# id, w, h, başlık tr/en, açıklama tr/en  (açıklamalar geçici, sahibi düzenleyecek)
GALLERY = [
    ("g1", 788, 1400, "Lodos", "Lodos", "Lodos, 7 yaşında.", "Lodos, 7 years old."),
    ("g2", 1050, 1400, "Merdivenden iniş", "Coming down the stairs", "Sırtım dönük, merdivenden iniyorum.", "Back turned, walking down the stairs."),
    ("g3", 1050, 1400, "Kahverengi ceket", "Brown jacket", "Kahverengi ceketle bir kare.", "A shot in my brown jacket."),
    ("g4", 1050, 1400, "Sapanca", "Sapanca", "Kahverengi gömlek, içinde beyaz tişört.", "Brown shirt over a white tee."),
    ("g5", 1050, 1400, "Kırmızı ışıkta", "In red light", "Kırmızı fayanslı bir ayna önünde.", "In front of a mirror with red tiles."),
    ("g6", 1050, 1400, "Alanya, gece", "Alanya at night", "Gece denizi ve şehir ışıkları.", "The night sea and the city lights."),
    ("g7", 1050, 1400, "Yaz tatili", "Summer holiday", "Siyah şort, siyah kombin.", "Black shorts, all-black outfit."),
    ("g8", 1050, 1400, "Dalgaların içinde", "In the waves", "Denizin tam önünde.", "Right in front of the sea."),
    ("g9", 1050, 1400, "Tamamen siyah", "All black", "Elim kafamda.", "Hand on my head."),
    ("g10", 1050, 1400, "Pembe tuz gölü", "The pink salt lake", "Pembe suyun önünde bir selfie.", "A selfie by the pink water."),
    ("g11", 1050, 1400, "İstanbul", "Istanbul", "Gece İstanbul.", "Istanbul at night."),
    ("g13", 1400, 1225, "Kemer'de dalış", "Diving in Kemer", "Antalya'nın Kemer ilçesinde.", "In Kemer, Antalya."),
    ("g14", 1179, 1191, "Halloween", "Halloween", "Çığlık maskesi.", "The scream mask."),
    ("g15", 1050, 1400, "Mavi pantolon", "Blue jeans", "Beyaz tişört, mavi pantolon.", "White tee, blue jeans."),
]


def page_url(lang, key):
    f = FILES[lang][key]
    return f"{SITE_URL}/{lang}/" if f == "index.html" else f"{SITE_URL}/{lang}/{f}"


def abs_img(name):
    return f"{SITE_URL}/assets/img/{name}"


# fotoğraf kimliği: (TR hikâye, EN story). Hikâyesi olmayan kareler boş bırakılır.
STORIES = {
    "g1": ("Bu, 7 yaşındaki köpeğim Lodos. Kafede, kahvemin hemen yanında bana öyle sevimli baktı ki fotoğrafını çekmeden duramadım.",
           "This is Lodos, my 7-year-old dog. Right beside my coffee at the café he looked at me so sweetly that I couldn't help taking his picture."),
    "g2": ("Kombinimi o gün çok beğenmiştim. Merdivenden iniyormuş havası vermek istedim ve bu kareyi böyle, sırtım dönük çektirdim.",
           "I loved my outfit that day. I wanted the feel of walking down the stairs, so I had this shot taken with my back turned."),
    "g4": ("Sapanca'daydım. Kahverengi gömleğimin içine beyaz tişört giymiştim ve aynada bu kareyi çektim.",
           "I was in Sapanca. I wore a white tee under my brown shirt and took this shot in the mirror."),
    "g6": ("Alanya'yı çok seviyorum. Her yaz oraya gidiyorum ve geceleri denize girmeyi çok seviyorum.",
           "I love Alanya. I go there every summer and I love swimming in the sea at night."),
    "g7": ("Yaz tatiline gittiğimde bu siyah kombinle çekildim.",
           "I took this one in my black outfit when I went on summer holiday."),
    "g8": ("Bu fotoğraf için pantolonumdan vazgeçtim: denizin tam önünde, dalgaların içinde durup çektirdim.",
           "I gave up my trousers for this photo: I stood right in front of the sea, in the waves, to get this shot."),
    "g9": ("Tamamen siyah giyindiğim gün. O gün sadece kuaföre gittiğim için çekilmiş bir fotoğraf; elim saçımın üstünde.",
           "The day I dressed all in black. It was taken only because I had been to the barber that day; my hand is on my hair."),
    "g10": ("Pembe tuz gölünün fotoğrafını çekmiştim; orada bir de selfie yaptım.",
            "I had photographed the pink salt lake, and I took a selfie there too."),
    "g11": ("İstanbul'u gerçekten çok seviyorum. O yüzden bu kareyi galeriye eklemek istedim.",
            "I really love Istanbul, which is why I wanted to add this frame to the gallery."),
    "g13": ("Antalya'nın Kemer ilçesinde tüplü dalış yaptım; aynı gün içinde iki kez daldım. Balıklara çok yakındım. Bir ara ayağım takıldı ve telaşlandım.",
            "I went scuba diving in Kemer, Antalya, and dived twice on the same day. I was very close to the fish. At one point my foot got caught and I panicked."),
    "g14": ("Halloween kostümüm buydu: bir çığlık maskesi.", "This was my Halloween costume: a scream mask."),
    "g15": ("Beyaz tişört ve mavi pantolonla çektiğim ayna fotoğrafı; kombinimi yine çok beğenmiştim.",
            "A mirror shot in a white tee and blue jeans; I really liked my outfit again."),
}
GAME_T = {
    "tr": {"title": "Arayüz Atölyesi", "hint": "Tasarım masasında üç kısa görevle bir web sayfası kur. Hepsini tamamla, Web Tasarım Rozeti'ni kazan!", "steps": ["Yerleşim: bölümleri doğru sıraya koy", "Etiketler: doğru HTML etiketini seç", "Renk ve mobil: okunabilir ve telefon dostu tasarla"],
           "start": "Başla", "maxErr": 5, "step": "Görev", "next": "Devam →", "right": "Doğru!", "wrong": "Henüz değil", "sample": "Merhaba",
           "layout": {"t": "1 · Yerleşim", "d": "Bir web sayfasının bölümlerini ziyaretçinin okuma sırasına göre, yukarıdan aşağı sırayla seç.", "hint": "Ziyaretçi önce kim olduğunu ve nereye gidebileceğini görmeli.",
                      "done": "Harika! Ziyaretçi sayfayı yukarıdan aşağı okur: önce kimlik ve menü, sonra ana mesaj, içerik, iletişim ve en altta alt bilgi.",
                      "parts": [["Üst bilgi: logo + menü", "#5ee1ff"], ["Hero: büyük başlık + buton", "#ffb25a"], ["İçerik: proje kartları", "#b98bff"], ["İletişim formu", "#5fe0a8"], ["Alt bilgi (footer)", "#ff6f91"]]},
           "tags": {"t": "2 · Etiketler", "qs": [
               {"q": "Sayfanın en üstündeki logo ve menü bölümü için hangi HTML etiketi uygundur?", "o": ["<header>", "<footer>", "<aside>", "<p>"], "a": 0, "e": "<header> sayfanın üst bölümünü anlamlı şekilde işaretler; ekran okuyucular ve arama motorları bunu anlar."},
               {"q": "Görme engelli bir kullanıcı için resmin ne anlattığını hangi özellik söyler?", "o": ["alt", "src", "href", "class"], "a": 0, "e": "alt metni, resim görünmediğinde ya da ekran okuyucu kullanıldığında resmi anlatır."},
               {"q": "Sayfanın ana başlığı (sayfada tek bir tane) hangi etiketle yazılır?", "o": ["<h1>", "<h6>", "<title>", "<b>"], "a": 0, "e": "<h1> sayfanın ana konusudur; SEO ve erişilebilirlik için her sayfada bir tane olmalı."}]},
           "design": {"t": "3 · Renk ve mobil", "qs": [
               {"type": "contrast", "q": "Hangi yazı / arka plan çifti herkes için en rahat okunur?", "o": [["#9aa6b8", "#c3ccd8"], ["#ffffff", "#0b0d16"], ["#ffb25a", "#ffd9a0"]], "e": "Yeterli kontrast (en az 4,5:1) herkesin, özellikle az görenlerin rahat okumasını sağlar."},
               {"q": "Sitene çoğunlukla telefondan girilecek. Tasarıma nereden başlamak en doğrusu?", "o": ["Önce geniş ekran, sonra telefon", "Önce telefon (mobile-first), sonra büyüt", "Yalnızca masaüstü", "Sadece resim kullan"], "a": 1, "e": "Mobile-first: önce en dar ekranı çözmek, geri kalan her şeyi kolaylaştırır."}]},
           "winT": "Web Tasarım Rozeti kazandın! 🏅", "winD": "Yerleşimi kurdun, doğru etiketleri seçtin ve okunabilir, mobil dostu bir tasarım yaptın: iyi bir arayüzün temelleri bunlar.",
           "prize": "Ödülün: Berat ile kahve eşliğinde ücretsiz bir web / arayüz sohbeti ☕", "codeL": "Rozet kodun", "claim": "Ödülü iste →", "again": "Tekrar oyna", "close": "Kapat",
           "loseT": "Bu sefer olmadı", "loseD": "Canların bitti. İpuçlarını okuyup bir daha dene!", "savedT": "Rozetin hazır 🏅"},
    "en": {"title": "UI Workshop", "hint": "Build a web page at the design desk in three short tasks. Finish them all to earn the Web Design Badge!", "steps": ["Layout: put the sections in the right order", "Tags: pick the right HTML tag", "Colour and mobile: design for readability and phones"],
           "start": "Start", "maxErr": 5, "step": "Task", "next": "Next →", "right": "Correct!", "wrong": "Not yet", "sample": "Hello",
           "layout": {"t": "1 · Layout", "d": "Pick the sections of a web page from top to bottom, in the order a visitor reads them.", "hint": "Visitors should first see who you are and where they can go.",
                      "done": "Great! Visitors read top to bottom: identity and menu first, then the main message, content, contact and the footer at the end.",
                      "parts": [["Header: logo + menu", "#5ee1ff"], ["Hero: big headline + button", "#ffb25a"], ["Content: project cards", "#b98bff"], ["Contact form", "#5fe0a8"], ["Footer", "#ff6f91"]]},
           "tags": {"t": "2 · Tags", "qs": [
               {"q": "Which HTML tag fits the logo and menu area at the top of the page?", "o": ["<header>", "<footer>", "<aside>", "<p>"], "a": 0, "e": "<header> marks the top area semantically; screen readers and search engines understand it."},
               {"q": "Which attribute tells a blind user what an image shows?", "o": ["alt", "src", "href", "class"], "a": 0, "e": "Alt text describes the image when it can't be seen or a screen reader is used."},
               {"q": "Which tag holds the page's main heading (only one per page)?", "o": ["<h1>", "<h6>", "<title>", "<b>"], "a": 0, "e": "<h1> is the page's main topic; one per page helps SEO and accessibility."}]},
           "design": {"t": "3 · Colour and mobile", "qs": [
               {"type": "contrast", "q": "Which text / background pair is the easiest for everyone to read?", "o": [["#9aa6b8", "#c3ccd8"], ["#ffffff", "#0b0d16"], ["#ffb25a", "#ffd9a0"]], "e": "Enough contrast (at least 4.5:1) lets everyone, especially low-vision users, read comfortably."},
               {"q": "Most visitors will use a phone. Where should the design start?", "o": ["Wide screen first, then phone", "Phone first (mobile-first), then scale up", "Desktop only", "Images only"], "a": 1, "e": "Mobile-first: solving the narrowest screen first makes everything else easier."}]},
           "winT": "You earned the Web Design Badge! 🏅", "winD": "You built the layout, picked the right tags and designed something readable and mobile-friendly: the foundations of a good interface.",
           "prize": "Your prize: a free web / UI chat with Berat over coffee ☕", "codeL": "Your badge code", "claim": "Claim prize →", "again": "Play again", "close": "Close",
           "loseT": "Not this time", "loseD": "You're out of lives. Read the hints and try again!", "savedT": "Your badge is ready 🏅"},
}
DIVE_T = {
    "tr": {"k": "PAKET", "l1": "Dalışta", "l2": "Web'de", "hint": ["Paketleri topla 🤿", "Deniz dibinde 5 paket var: HTML, CSS, JS, bir hata ve sunucu. Her biri hem dalıştan bir ipucu hem de bir web dersi anlatıyor."],
           "orbs": [["HTML: iskelet", "Dalışa başlamadan önce ekipman kontrol edilir: her parça yerinde mi?", "Web sayfasının da önce iskeleti vardır: başlık, paragraf, bağlantı. HTML bu iskeleti kurar."],
                    ["CSS: renkler", "Birkaç metre aşağıda ışık azalır, renkler ve balıklar belirir.", "CSS renk, boyut ve yerleşimle sayfayı giydirir; aynı iskelet farklı görünür."],
                    ["JavaScript: hareket", "Su altında her hareket yavaş ve kontrollüdür; küçük bir hareket sonucu değiştirir.", "JavaScript sayfayı hareketlendirir: tıklayınca bir şey olur, sayfa cevap verir."],
                    ["Hata: takılan ekipman", "Ekipman bir yere takılırsa panik yapılmaz: dur, nefes al, sorunu çöz.", "Kodda hata çıkınca da panik yok: önce hatayı oku, sakin kal, sonra çöz."],
                    ["Sunucu: derinlik", "Derinde her şey sakin ve düzenli ilerler; hazırlık güven verir.", "Sayfanın dosyaları sunucuda durur. Tarayıcın ister, sunucu gönderir."]],
           "gate": ["Siteyi yayına al", "Sunucu hazır. Parlayan kapıya yüzerek siteni yayına al."],
           "done": ["Yayındasın 🤿", "Beş paketi birleştirdin: bir sayfanın nasıl geldiğini ve hata çıkınca sakin kalmayı öğrendin. Yüzeye çıkmak için yukarıdaki düğmeyi kullanabilirsin."]},
    "en": {"k": "PACKET", "l1": "Diving", "l2": "On the web", "hint": ["Collect the packets 🤿", "There are 5 packets on the seabed: HTML, CSS, JS, a bug and the server. Each gives a diving tip and a web lesson."],
           "orbs": [["HTML: the skeleton", "Before a dive, the gear is checked: is every part in place?", "A web page has a skeleton first: heading, paragraph, link. HTML builds it."],
                    ["CSS: colours", "A few metres down the light fades and the colours and fish appear.", "CSS dresses the page with colour, size and layout; the same skeleton looks different."],
                    ["JavaScript: movement", "Underwater every move is slow and controlled; a small move changes the result.", "JavaScript makes the page move: something happens on a click, the page answers."],
                    ["Bug: snagged gear", "If gear snags, you don't panic: stop, breathe, solve it.", "When code throws an error, no panic: read it, stay calm, then fix it."],
                    ["Server: the depth", "Deep down everything moves calmly and in order; preparation gives confidence.", "The page's files rest on the server. Your browser asks, the server sends."]],
           "gate": ["Deploy the site", "The server is ready. Swim into the glowing gate to deploy your site."],
           "done": ["You are live 🤿", "You combined the five packets: you learned how a page arrives and how to stay calm when a bug appears. Use the button above to surface."]},
}
ROOM_SCHED = [("Pzt", "Mon", "13:30-17:20", "MBIL 101", "Programlamanın Temelleri", "Fundamentals of Programming", "303/L23"),
    ("Sal", "Tue", "08:30-10:20", "TDB 101", "Türk Dili I", "Turkish Language I", "Uzaktan"),
    ("Sal", "Tue", "13:30-15:20", "ATA 101", "Atatürk İlk. ve İnkılap T. I", "Atatürk's Principles I", "Uzaktan"),
    ("Sal", "Tue", "15:30-17:20", "YBD 121", "İngilizce I", "English I", "Uzaktan"),
    ("Çar", "Wed", "08:30-10:20", "MYO 123", "Fizik I", "Physics I", "Z05"),
    ("Çar", "Wed", "10:30-12:20", "MYO 131", "Temel Matematik", "Basic Mathematics", "Z03"),
    ("Çar", "Wed", "13:30-17:20", "MBIL 103", "Veri Tabanı I", "Database I", "303/L23"),
    ("Per", "Thu", "08:30-12:20", "MBIL 105", "Grafik Animasyon I", "Graphic Animation I", "L23/303"),
    ("Per", "Thu", "13:30-15:20", "MBIL 113", "Web Tasarımının Temelleri", "Web Design Basics", "303/L23"),
    ("Cum", "Fri", "13:30-15:20", "MBIL 111", "Ofis Yazılımları", "Office Software", "303/L23")]
BODIES = {}
PROJ_DESC_NOTE = "açıklamalar sahibi tarafından verilecek"


def room_data(lang):
    t = lambda tr, en: tr if lang == "tr" else en
    proj = [[p[0], t(p[1], p[2]), t(p[3], p[4]), pdetail(p[0], lang)] for p in PROJECTS]
    photos = [[f"gallery/t/{g[0]}.jpg", g[1], g[2], t(g[3], g[4]), t(g[5], g[6]), t(*STORIES.get(g[0], ("", "")))] for g in GALLERY]
    hs = {
        "about": [NAVL[lang]["about"], t("özgeçmiş duvarı", "CV wall"), t("Özgeçmişin ve becerilerin duvarda büyük yazılı. Sayfada çok daha ayrıntılısı var.", "Your CV and skills are written large on the wall. The page has much more detail.")],
        "schedule": [t("Ders programı", "Class schedule"), t("duvar tablosu", "wall table"), t("Haftalık ders programın duvara yansıyor. Sayfada tam tablo ve ders ayrıntıları var.", "Your weekly timetable is projected on the wall. The page has the full table and course details.")],
        "projects": [NAVL[lang]["projects"], t("sinema salonu", "cinema room"), ""],
        "gallery": [NAVL[lang]["gallery"], t("fotoğraf duvarı", "photo wall"), t("Seni anlatan fotoğraflar duvarda büyük asılı. Sayfada hepsi tek tek, açıklamalarıyla.", "Photos that describe you hang large on the wall. The page shows each one with its caption.")],
        "blog": ["Blog", t("laptop", "laptop"), t("IT yazıların ekran görüntüleriyle laptopta. Sayfada tam yazılar var.", "Your IT posts with screenshots on the laptop. The page has the full articles.")],
        "contact": [NAVL[lang]["contact"], t("telefon", "phone"), t("Adres, telefon, e-posta ve mesaj formu. Telefon titriyor!", "Address, phone, email and a message form. The phone is buzzing!")],
        "slide": [t("Pencere", "Window"), t("kaydırak → başka evren", "slide → another universe"), t("Pencereden çıkan kaydıraktan kay, denize in ve tüple deniz dibine dal.", "Ride the slide out of the window, splash into the sea and scuba dive to the seabed.")],
    }
    hs["game"] = [t("Arayüz Atölyesi", "UI Workshop"), t("web tasarım oyunu", "web design game"), t("Tasarım masasında 3 kısa görevle web sayfası kurmayı öğren: yerleşim, etiketler, renk. Bitirince Web Tasarım Rozeti kazan!", "Learn to build a web page in 3 short tasks at the design desk: layout, tags, colour. Finish to earn the Web Design Badge!")]
    hs["tag"] = [t("Etiket Eşleştir", "Tag Match"), t("öğretici oyun", "learning game"), t("HTML etiketlerini kartlarla eşleştir. Kolay ve kısa.", "Match HTML tags with cards. Easy and short.")]
    hs["bug"] = [t("Hata Dedektifi", "Bug Detective"), t("öğretici oyun", "learning game"), t("Kodlardaki hatayı bul. İpuçları sana öğretir, bilgi gerekmez. Puan topla, rekor kır.", "Find the mistake in the code. Hints teach you, no experience needed. Score points, beat your record.")]
    hs["squash"] = [t("Böcek Avı", "Bug Squash"), t("eğlence oyunu", "fun game"), t("25 saniyede olabildiğince çok böceği ez.", "Squash as many bugs as you can in 25 seconds.")]
    hs["lesson"] = [t("Ders duvarı", "Lesson wall"), t("seviyene göre ders", "lessons for your level"), t("Ne kadar bildiğini seç, duvarda sana uygun mini ders dönsün.", "Pick how much you know and the wall plays a mini lesson that fits.")]
    cv = {
        "tag": t("// HAKKIMDA", "// ABOUT ME"), "name": NAME, "sub": t("Bilgisayar Programcılığı · Akdeniz Üniversitesi · 1. sınıf", "Computer Programming · Akdeniz University · 1st year"),
        "bio": [t("27 Ağustos 2007'de Ankara Sincan'da doğdum. İlkokul, ortaokul ve liseyi başarıyla tamamladım; ardından Akdeniz Üniversitesi'ni kazandım.", "I was born on 27 August 2007 in Sincan, Ankara. I completed school successfully, then won a place at Akdeniz University."),
                t("Yazılım geliştirme, web arayüz tasarımı ve dijital görsel üretim alanlarında çalışıyorum. Teknik bilgiyi görsel detaylarla birleştiren projeler geliştiriyorum.", "I work in software development, web interface design and digital visual production, building projects that combine technical knowledge with visual detail."),
                t("Sekiz ay baristalık yaptım; yoğun saatlerde sakin kalmayı ve ekip çalışmasını orada öğrendim. Şimdi web ve tasarım alanında yoğunlaşıyorum.", "I worked as a barista for eight months, learning to stay calm in a rush and to work in a team. Now I'm focusing on web and design.")],
        "skillsT": t("// BECERİLER", "// SKILLS"), "skills": [["HTML5", 90], ["CSS3", 85], ["JavaScript", 70], ["Git", 75], ["Python", 60], [t("Animasyon", "Animation"), 65]],
        "roadT": t("// YOL HARİTASI", "// ROADMAP"), "road": [["2026 →", t("Akdeniz Üniv. · Bilgisayar Programcılığı", "Akdeniz Univ. · Computer Programming")], [t("8 ay", "8 months"), "Barista"], [t("İlgi", "Interests"), t("Tasarım · Koşu · Keşfetmek", "Design · Running · Exploring")]],
        "schT": t("// DERS PROGRAMI · 2026-2027 GÜZ", "// CLASS SCHEDULE · 2026-2027 FALL"), "week": t("Haftam", "My week"), "days": [t(d, e) for d, e in (("Pzt", "Mon"), ("Sal", "Tue"), ("Çar", "Wed"), ("Per", "Thu"), ("Cum", "Fri"))], "lunch": t("Öğle arası", "Lunch break"), "bioT": t("// PROFİL", "// PROFILE"), "stats": [[t("1.", "1st"), t("sınıf", "year")], [t("8 ay", "8 mo"), "barista"], [str(len(PROJECTS)), t("proje", "projects")], [str(len(GALLERY)), t("fotoğraf", "photos")]],
        "cols": [t("GÜN", "DAY"), t("SAAT", "TIME"), t("KOD", "CODE"), t("DERS", "COURSE"), t("YER", "ROOM")],
        "sched": [[r[0] if lang == "tr" else r[1], r[2], r[3], r[4] if lang == "tr" else r[5], r[6]] for r in ROOM_SCHED],
    }
    return {"urls": {k: FILES[lang][k] for k in KEYS}, "proj": proj, "photos": photos, "hs": hs, "cv": cv,
            "plabels": PLABELS[lang],
            "roles": [t("Yazılım geliştirme", "Software development"), t("Web arayüz tasarımı", "Web interface design"), t("Dijital görsel üretim", "Digital visual production")],
            "fly": {"from": "Antalya", "to": "Gmail", "route": "ANTALYA → GMAIL (MOUNTAIN VIEW)", "sending": t("Mesajın yola çıktı…", "Your message is on its way…"), "done": t("Mesajın ulaştı ✓", "Message delivered ✓"), "fail": t("Yolculuk yarıda kaldı", "The journey was interrupted")},
            "game": GAME_T[lang], "dive": DIVE_T[lang], "blogT": [t("AI ile 3B site", "A 3D site with AI"), t("Backend'siz form", "A form, no backend"), t("Photoshop → web", "Photoshop → web")], "t": {"aboutCap": t("Web & hareketli grafik", "Web & motion graphics"), "play": t("Oyna ▶", "Play ▶"), "noStory": t("✎ Bu karenin hikâyesini yakında anlatacağım.", "✎ I'll tell this photo's story soon."), "open": t("Sayfayı aç →", "Open page →"), "slide": t("Kay! 🛝", "Slide! 🛝"), "deep": [t("Derinlik", "Depth"), t("tüp dalış: sessizlik, nefes ve merak", "scuba diving: silence, breath and curiosity")]}}


def _head(lang, key, title, desc, ld, css):
    other = "en" if lang == "tr" else "tr"
    alt = "".join(f'<link rel="alternate" hreflang="{l}" href="{page_url(l, key)}">' for l in ("tr", "en")) + f'<link rel="alternate" hreflang="x-default" href="{page_url("tr", key)}">'
    ldj = "".join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' for x in (ld or []))
    fav = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%2302030a'/%3E"
           "%3Cpath d='M6 28V12h6v16M14 28V6h6v22M22 28V14h5v14' fill='%23ffb25a'/%3E%3C/svg%3E")
    return f"""<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta name="author" content="{NAME}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#0b0d16">
<link rel="canonical" href="{page_url(lang, key)}">
{alt}
<meta property="og:type" content="website">
<meta property="og:site_name" content="{NAME}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{page_url(lang, key)}">
<meta property="og:image" content="{abs_img('og.jpg')}">
<meta property="og:locale" content="{LOCALE[lang]}">
<meta property="og:locale:alternate" content="{LOCALE[other]}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{fav}">
{css}
{ldj}"""


def layout(lang, key, title, desc, body, ld=None, hero=False):
    other = "en" if lang == "tr" else "tr"
    t = lambda tr, en: tr if lang == "tr" else en
    # ana sayfada tek <h1> kalsın: şablonlardaki (iç sayfa) <h1>'ler <h1x> olarak saklanır, oda penceresi açılırken room.js geri çevirir
    h1x = lambda s: re.sub(r"<(/?)h1(?=[\s>])", r"<\1h1x", s)
    if key == "home":
        css = '<link rel="stylesheet" href="../assets/css/style.css"><link rel="stylesheet" href="../assets/css/room.css"><link rel="stylesheet" href="../assets/css/site.css">'
        dock = "".join(f'<button data-t="{k}">{lbl}</button>' for k, lbl in [("home", t("Ana oda", "Main room")), ("about", NAVL[lang]["about"]), ("projects", "🎬 " + NAVL[lang]["projects"]), ("gallery", NAVL[lang]["gallery"]), ("blog", "Blog"), ("contact", NAVL[lang]["contact"]), ("game", "🎨 " + t("Atölye · oyun", "Studio · game")), ("slide", "🛝 " + t("Kaydırak", "Slide"))])
        data = json.dumps(room_data(lang), ensure_ascii=False).replace("</", "<\\/")
        return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
{_head(lang, key, title, desc, ld, css)}
</head>
<body class="room" data-lang="{lang}">
<div class="vig"></div><div class="lid t"></div><div class="lid b"></div>
<div id="msg">{t("uyan, Berat…<br>güne başlıyoruz.", "wake up, Berat…<br>let's start the day.")}</div>
<h1 class="sr">{esc(title)}</h1>
<div class="hud">{t("W A S D: yürü · Shift: hızlan · sürükle: bak<br>E ya da etiket: gir · alttaki çubuk: ışınlan", "W A S D: walk · Shift: run · drag: look<br>E or a label: enter · bottom bar: teleport")}</div>
<div class="top"><button id="sumbtn" type="button">{t("Ana sayfa özeti", "Home summary")}</button><a href="../{other}/{FILES[other][key]}" hreflang="{other}" lang="{other}" data-setlang="{other}">{lang.upper()} | <b>{other.upper()}</b></a></div>
<div id="game" hidden role="dialog" aria-modal="true" aria-label="{t("Arayüz Atölyesi oyunu", "UI Workshop game")}"></div><div id="story" hidden role="dialog" aria-modal="true" aria-label="{t("Fotoğraf hikâyesi", "Photo story")}"><div class="sbox"><img alt=""><div><h2></h2><p class="sc"></p><p class="st"></p><div class="sb"><button id="sp" aria-label="‹">‹</button><button id="sn" aria-label="›">›</button><button id="sx" aria-label="✕">✕</button></div></div></div></div>
<div id="mask" aria-hidden="true"></div><div id="dive" aria-hidden="true"><div><small>{t("DERİNLİK", "DEPTH")}</small><b id="dd">0.0 m</b></div><div><small>{t("TÜP", "TANK")}</small><b id="dt">200 bar</b></div><div><small>{t("SÜRE", "TIME")}</small><b id="dm">00:00</b></div><div><small>{t("PAKET", "PACKETS")}</small><b id="dq">0/5</b></div></div><div id="dlesson" hidden role="status" aria-live="polite"></div><button id="dup" type="button" aria-label="{t("Yukarı yüz", "Swim up")}">▲</button><button id="ddn" type="button" aria-label="{t("Aşağı yüz", "Swim down")}">▼</button><div id="dtouch" aria-hidden="true">{t("Parmağınla sürükle: bak · ◉ ileri yüz · ▲ ▼ yukarı/aşağı", "Drag to look · ◉ swim forward · ▲ ▼ up/down")}</div><div id="dkeys" aria-hidden="true"><div><span class="kc">W</span><span class="kc">A</span><span class="kc">S</span><span class="kc">D</span> {t("yüz", "swim")}</div><div><span class="kc">Shift</span> {t("hızlı yüz", "swim faster")}</div><div><span class="kc">Q</span><span class="kc">E</span> {t("aşağı / yukarı", "down / up")}</div><div><span class="kc">{t("Fare", "Mouse")}</span> {t("etrafa bak", "look around")}</div><div><span class="kc">Esc</span> {t("yüzeye çık", "surface")}</div></div>
<div id="prompt"></div><button id="fwd" aria-label="{t("ileri", "forward")}">▲</button>
<div id="card"><h2></h2><p></p><button class="go">{t("Aç →", "Open →")}</button><button class="pn" id="pv">‹</button><button class="pn" id="nx">›</button><button class="bk">{t("← Geri", "← Back")}</button></div>
<nav id="dock" aria-label="{t("Kısa yollar", "Shortcuts")}">{dock}</nav>
<button id="back">{t("← Yüzeye çık, odaya dön (Esc)", "← Surface and return to the room (Esc)")}</button><div id="fade"></div>
<aside id="summary" aria-label="{t("Ana sayfa özeti", "Home summary")}">{re.sub(r'<h1 id="hero-title">(.*?)</h1>', r'<div id="hero-title" role="heading" aria-level="2">\1</div>', body, count=1, flags=re.S)}</aside>
<div id="site" hidden role="dialog" aria-modal="true" aria-label="{t("Site", "Site")}"><div class="swin"><div class="sbar"><span class="sdots" aria-hidden="true"><i></i><i></i><i></i></span><div class="surl">🔒 <span id="surl"></span></div><nav class="stabs">{"".join(f'<a href="{FILES[lang][k]}" data-site="{k}">{NAVL[lang][k]}</a>' for k in KEYS if k != "home")}</nav><button id="sclose" type="button">{t("← Odaya dön", "← Back to the room")}</button></div><div class="sbody pg" id="sbody"></div></div></div>
{"".join(f'<template id="tpl-{k}">{h1x(BODIES[(lang, k)])}</template>' for k in KEYS if k != "home")}
<script type="importmap">{{"imports":{{"three":"https://unpkg.com/three@0.160.0/build/three.module.js","three/addons/":"https://unpkg.com/three@0.160.0/examples/jsm/"}}}}</script>
<script type="application/json" id="rdata">{data}</script>
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script><script defer src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script type="module" src="../assets/js/room.js"></script>
<script src="../assets/js/main.js" defer></script>
</body>
</html>
"""
    BODIES[(lang, key)] = body
    css = '<link rel="stylesheet" href="../assets/css/style.css"><link rel="stylesheet" href="../assets/css/site.css">'
    nav = "".join(f'<a href="{FILES[lang][k]}"{" aria-current=page" if k == key else ""}>{NAVL[lang][k] if k != "home" else t("🏠 Odaya dön", "🏠 Back to the room")}</a>' for k in KEYS)
    sw = (f'<div class="lang" role="group" aria-label="{t("Dil", "Language")}"><span aria-current="true">{lang.upper()}</span>'
          f'<a href="../{other}/{FILES[other][key]}" hreflang="{other}" lang="{other}" data-setlang="{other}" aria-label="{t("English", "Türkçe")}">{other.upper()}</a></div>')
    links = "".join(f'<a href="{FILES[lang][k]}">{NAVL[lang][k]}</a>' for k in KEYS)
    social = "".join(f'<a href="{u}" rel="me noopener" target="_blank">{n}</a>' for u, n in ((GITHUB, "GitHub"), (LINKEDIN, "LinkedIn")) if u)
    idx = KEYS.index(key) + 1
    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
{_head(lang, key, title, desc, ld, css)}
<script>document.documentElement.classList.add('js')</script>
</head>
<body class="inner">
<a class="skip" href="#main">{t("Ana içeriğe geç", "Skip to content")}</a>
<header class="site-header">
  <div class="wrap bar">
    <a class="brand" href="index.html" aria-label="{NAME}, {NAVL[lang]['home']}"><span class="brand-mark" aria-hidden="true"><span>{INITIALS}</span></span>{NAME}</a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="nav" aria-label="{t("Menüyü aç/kapat", "Toggle menu")}"><i></i></button>
    <nav class="nav" id="nav" aria-label="{t("Ana menü", "Main menu")}">{nav}{sw}</nav>
  </div>
</header>
<div class="skyline" aria-hidden="true"></div>
<main id="main" class="pg">
{body}
</main>
<footer class="site-footer">
  <div class="wrap">
    <div class="titleblock" role="group" aria-label="{t("Antet", "Title block")}">
      <div><small>{t("Hazırlayan", "Made by")}</small>{NAME}</div>
      <div><small>{t("Öğrenci no", "Student no")}</small>{STUDENT_NO}</div>
      <div><small>{t("Sayfa", "Page")}</small>{idx} / {len(KEYS)}</div>
      <div><small>{t("Tarih", "Date")}</small><time datetime="{BUILD_DATE}">{BUILD_DATE[:4]}</time></div>
    </div>
    <div class="footer-links">{links}{social}</div>
  </div>
</footer>
<script src="../assets/js/main.js" defer></script>
</body>
</html>
"""


def make_skyline():
    rnd = random.Random(5)
    out = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 420" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1530"/><stop offset="1" stop-color="#0b0d16"/></linearGradient></defs>']
    x = 0
    while x < 1600:
        w = rnd.randint(40, 110); h = rnd.randint(90, 360)
        out.append(f'<rect x="{x}" y="{420 - h}" width="{w}" height="{h}" fill="url(#g)"/>')
        for _ in range(h // 14):
            if rnd.random() < .5:
                wx = x + 6 + rnd.randint(0, max(1, w - 18)); wy = 420 - h + 8 + rnd.randint(0, max(1, h - 20))
                out.append(f'<rect x="{wx}" y="{wy}" width="6" height="8" fill="#ffc46b" opacity="{rnd.choice([.9, .7, .5])}"/>')
        x += w + rnd.randint(0, 6)
    out.append('<rect x="760" y="40" width="3" height="60" fill="#cfd6e6"/><rect x="740" y="100" width="44" height="320" fill="#161228"/><circle cx="761" cy="38" r="4" fill="#ff3b30"/></svg>')
    return "".join(out)


def person_ld(lang):
    same = [u for u in (GITHUB, LINKEDIN) if u]
    return {
        "@context": "https://schema.org", "@type": "Person", "@id": f"{SITE_URL}/#person",
        "name": NAME, "url": f"{SITE_URL}/{lang}/", "email": EMAIL, "telephone": PHONE_TEL,
        "image": abs_img(PORTRAIT), "jobTitle": "Student" if lang == "en" else "Öğrenci",
        "description": ("Information technology student focused on web development and motion graphics." if lang == "en"
                        else "Web geliştirme ve hareketli grafik üzerine çalışan bilişim teknolojileri öğrencisi."),
        "address": {"@type": "PostalAddress", "addressLocality": CITY[lang], "addressCountry": "TR"},
        "knowsAbout": ["HTML", "CSS", "JavaScript", "Git", "Motion graphics", "Responsive design"],
        "sameAs": same,
    }


def website_ld(lang):
    return {"@context": "https://schema.org", "@type": "WebSite", "@id": f"{SITE_URL}/#website", "url": f"{SITE_URL}/",
            "name": NAME, "inLanguage": ["tr", "en"], "author": {"@id": f"{SITE_URL}/#person"}}


def crumbs(lang, key):
    items = [{"@type": "ListItem", "position": 1, "name": NAVL[lang]["home"], "item": page_url(lang, "home")}]
    if key != "home":
        items.append({"@type": "ListItem", "position": 2, "name": NAVL[lang][key], "item": page_url(lang, key)})
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": items}


# ============================ SAYFALAR ============================
def plate(lang, p, link):
    t = lambda tr, en: tr if lang == "tr" else en
    pid, ttr, ten, dtr, den, gtr, gen = p
    title, desc, tag = t(ttr, ten), t(dtr, den), t(gtr, gen)
    alt = f"{title}: {desc}"
    return (f'<figure class="plate"><a href="{link}"><div class="plate-img"><img src="{IMG}projects/{pid}.jpg" alt="{esc(alt)}" width="800" height="1000" loading="lazy"></div>'
            f'<figcaption><span class="plate-tag">{tag}</span><h3>{title}</h3><p>{desc}</p></figcaption></a></figure>')


def home(lang):
    t = lambda tr, en: tr if lang == "tr" else en
    proj = "".join(plate(lang, p, FILES[lang]["projects"] + "#" + p[0]) for p in PROJECTS[:3])
    strip = ""
    for gid, w, h, ttr, ten, dtr, den in [GALLERY[i] for i in (7, 10, 9, 2)]:
        title = t(ttr, ten)
        strip += f'<figure><img src="{IMG}gallery/{gid}.jpg" alt="{esc(title)}: {esc(t(dtr, den))}" width="{w}" height="{h}" loading="lazy"></figure>'
    body = f"""
<section class="hero" aria-labelledby="hero-title">
    <svg class="hero-deco" viewBox="0 0 400 400" aria-hidden="true" focusable="false"><g fill="none" stroke="#6fa3d4" stroke-width="1.5"><circle cx="200" cy="200" r="190"/><circle cx="200" cy="200" r="140" stroke-dasharray="4 8"/><circle cx="200" cy="200" r="80"/><path d="M0 200H400M200 0V400" stroke-opacity=".5"/><path d="M200 200L340 80" stroke="#ff6a2b" stroke-width="3"/><path d="M270 200A70 70 0 0 0 249 150" stroke="#ff6a2b" stroke-width="3"/></g><circle cx="200" cy="200" r="7" fill="#ff6a2b"/><text x="262" y="176" font-family="monospace" font-size="16" fill="#ff6a2b">42°</text></svg>
  <div class="xh-x" aria-hidden="true"></div><div class="xh-y" aria-hidden="true"></div><div class="xh-read" aria-hidden="true"></div>
  <div class="wrap">
    <p class="hero-meta">{t("Öğrenci no", "Student no")}: {STUDENT_NO}, {DEPT[lang]}</p>
    <h1 id="hero-title"><span>{FIRST}</span><span>{LAST}</span></h1>
    <div class="dim" aria-hidden="true"><span>{t("web arayüzü + hareketli grafik", "web interfaces + motion graphics")}</span></div>
    <p class="lead">{t("Web arayüzleri ve hareketli grafikler tasarlayan bir bilişim öğrencisiyim. Fikri çizerim, kodlarım, hareket ettiririm.", "I'm an IT student who designs web interfaces and motion graphics. I sketch the idea, code it, then make it move.")}</p>
    <div class="hero-actions">
      <a class="btn primary" href="{FILES[lang]['projects']}">{t("Projelerimi gör", "See my projects")}</a>
      <a class="btn" href="{FILES[lang]['contact']}">{t("İletişime geç", "Get in touch")}</a>
    </div>
    <ul class="hero-stats">
      <li><b data-count="5">5</b><span>{t("animasyon projesi", "animation projects")}</span></li>
      <li><b data-count="3">3</b><span>{t("blog yazısı", "blog posts")}</span></li>
      <li><b data-count="15">15</b><span>{t("galeri karesi", "gallery frames")}</span></li>
      <li><b data-count="10">10</b><span>{t("haftalık ders", "weekly courses")}</span></li>
    </ul>
  </div>
  <div class="hero-orb" aria-hidden="true"></div>
</section>

<div class="marquee" aria-hidden="true"><div class="marquee-track">{"".join("<span>HTML5</span><span>CSS3</span><span>JavaScript</span><span>Git</span><span>Python</span><span>Motion</span><span>Responsive</span><span>SEO</span>" for _ in range(2))}</div></div>

<section class="section" aria-labelledby="about-h">
  <div class="wrap about-split">
    <img class="portrait" src="{IMG}{PORTRAIT}" alt="{t("Vesikalık fotoğraf", "Portrait photo")}: {NAME}" width="{PORTRAIT_SIZE[0]}" height="{PORTRAIT_SIZE[1]}" loading="lazy">
    <div>
      <h2 id="about-h">{t("Merhaba", "Hello")}</h2>
      <p class="lead" style="margin-top:1.25rem">{t(
        f"Ben {NAME}. 27 Ağustos 2007'de Ankara Sincan'da doğdum; bugün Akdeniz Üniversitesi'nde {DEPT['tr']} bölümünün birinci sınıf öğrencisiyim. Yazılım geliştirme, web arayüz tasarımı ve dijital görsel üretim alanlarında çalışıyorum.",
        f"I'm {NAME}, born on 27 August 2007 in Sincan, Ankara. I'm now a first-year {DEPT['en']} student at Akdeniz University, working in software development, web interface design and digital visual production.")}</p>
      <p>{t("Teknik bilgiyi görsel detaylarla birleştiren projeler geliştiriyorum. Bu site de temiz kodu, okunaklı tasarımı ve her ekrana uyan düzeni bir araya getirdiğim bir örnek.",
            "I build projects that combine technical knowledge with visual detail. This site is one example, bringing clean code, readable design and layouts that fit every screen together.")}</p>
      <a class="more" href="{FILES[lang]['about']}">{t("Özgeçmişimin tamamını oku", "Read my full CV")}</a>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="proj-h">
  <div class="wrap">
    <div class="section-head"><h2 id="proj-h">{t("Projeler", "Projects")}</h2><p>{t("Grafik Animasyon dersinden üç çalışma.", "Three pieces from my Graphic Animation course.")} <a class="more" href="{FILES[lang]['projects']}">{t("Tümünü gör", "View all")}</a></p></div>
    <div class="plates home">{proj}</div>
  </div>
</section>

<section class="section" aria-labelledby="gal-h">
  <div class="wrap">
    <div class="section-head"><h2 id="gal-h">{t("Galeri", "Gallery")}</h2><p>{t("Beni anlatan kareler.", "Frames that say something about me.")} <a class="more" href="{FILES[lang]['gallery']}">{t("Galeriye git", "Open the gallery")}</a></p></div>
    <div class="strip">{strip}</div>
  </div>
</section>
"""
    ld = [website_ld(lang), person_ld(lang), crumbs(lang, "home")]
    title = t(f"{NAME} | Web ve Hareketli Grafik Portföyü", f"{NAME} | Web and Motion Graphics Portfolio")
    desc = t(f"{NAME}, {DEPT['tr']} öğrencisi. Web arayüzü projeleri, grafik animasyon çalışmaları, blog yazıları ve galeri.",
             f"{NAME}, {DEPT['en']} student. Web interface projects, motion graphics work, blog posts and a photo gallery.")
    return layout(lang, "home", title, desc, body, ld, hero=True)


def about(lang):
    t = lambda tr, en: tr if lang == "tr" else en
    ab = lambda a, full: f'<abbr title="{full}">{a}</abbr>'
    # (gün tr, gün en, saat, kod, ders tr, ders en, yer tr, yer en, öğretim elemanı)
    sched = [
        ("Pzt", "Mon", "13:30-17:20", "MBIL 101", "Programlamanın Temelleri", "Fundamentals of Programming", "303 ve Lab L23", "303 and Lab L23", "Öğr.Gör. Hasan Özalp"),
        ("Sal", "Tue", "08:30-10:20", "TDB 101", "Türk Dili I", "Turkish Language I", "Uzaktan", "Remote", "Öğr.Gör. Talha Tunç"),
        ("Sal", "Tue", "13:30-15:20", "ATA 101", "Atatürk İlkeleri ve İnkılap Tarihi I", "Principles of Atatürk and History of Reforms I", "Uzaktan", "Remote", "Öğr.Gör.Dr. Koray Ergin"),
        ("Sal", "Tue", "15:30-17:20", "YBD 121", "İngilizce I", "English I", "Uzaktan", "Remote", "Öğr.Gör. Bengü Şahin Kimyon"),
        ("Çar", "Wed", "08:30-10:20", "MYO 123", "Fizik I", "Physics I", "Z05", "Z05", "Öğr.Gör.Dr. Reyhan Özaydın Özkara"),
        ("Çar", "Wed", "10:30-12:20", "MYO 131", "Temel Matematik", "Basic Mathematics", "Z03", "Z03", "Prof.Dr. Harun Barış Çolakoğlu"),
        ("Çar", "Wed", "13:30-17:20", "MBIL 103", "Veri Tabanı I", "Database I", "303 ve Lab L23", "303 and Lab L23", "Öğr.Gör. Hasan Özalp"),
        ("Per", "Thu", "08:30-12:20", "MBIL 105", "Grafik Animasyon I", "Graphic Animation I", "Lab L23 ve 303", "Lab L23 and 303", "Öğr.Gör.Dr. Erokan Canbazoğlu"),
        ("Per", "Thu", "13:30-15:20", "MBIL 113", "Web Tasarımının Temelleri", "Fundamentals of Web Design", "303 ve Lab L23", "303 and Lab L23", "Öğr.Gör.Dr. Erokan Canbazoğlu"),
        ("Cum", "Fri", "13:30-15:20", "MBIL 111", "Ofis Yazılımları", "Office Software", "303 ve Lab L23", "303 and Lab L23", "Öğr.Gör. Hasan Özalp"),
    ]
    rows = "".join(f'<tr><th scope="row" data-label="{t("Gün", "Day")}">{t(a, b)}</th><td data-label="{t("Saat", "Time")}"><time>{c}</time></td><td data-label="{t("Kod", "Code")}">{d}</td><td data-label="{t("Ders", "Course")}">{t(e, f)}</td><td data-label="{t("Yer", "Room")}">{t(g, h)}</td><td data-label="{t("Öğretim elemanı", "Instructor")}">{i}</td></tr>'
                   for a, b, c, d, e, f, g, h, i in sched)
    interests = [t("Tasarım projeleri yapmak", "Making design projects"), t("Koşu yapmak", "Running"), t("Yeni yerler keşfetmek", "Exploring new places")]
    talents = [t("8 aylık barista deneyimi", "8 months of barista experience"), t("Web sayfası tasarlama ve kodlama", "Web page design and coding"),
               t("Grafik animasyon", "Graphic animation"), t("Veri tabanı temelleri", "Database fundamentals"),
               t("Ofis yazılımları", "Office software"), t("Müşteriyle iletişim ve takım çalışması", "Customer communication and teamwork")]
    skills = [("HTML5", 90), ("CSS3", 85), ("JavaScript", 70), ("Git", 75), ("Python", 60), (t("Animasyon (Animate, After Effects)", "Animation (Animate, After Effects)"), 65)]
    sk = "".join(f'<li><div class="skill-top"><span>{n}</span><output>%{v}</output></div>'
                 f'<div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="{v}" aria-label="{esc(n)}"><i style="--v:{v}%"></i></div></li>' for n, v in skills)
    code = ('const ben = {\n  ad: "%s",\n  bolum: "%s",\n  odak: ["web", "hareketli grafik"],\n  kahve: true\n};\n\nconsole.log(`Merhaba, ben ${ben.ad}!`);' % (NAME, DEPT["tr"])) if lang == "tr" else \
           ('const me = {\n  name: "%s",\n  major: "%s",\n  focus: ["web", "motion graphics"],\n  coffee: true\n};\n\nconsole.log(`Hello, I am ${me.name}!`);' % (NAME, DEPT["en"]))
    body = f"""
<div class="wrap page-head">
  <h1>{t("Hakkımda", "About")}</h1>
  <p>{t("Kısa özgeçmişim, ders programım ve yeteneklerim.", "My short CV, class schedule and skills.")}</p>
</div>
<div class="wrap about-layout">
  <aside>
    <figure class="id-photo"><img src="{IMG}{PORTRAIT}" alt="{t("Vesikalık fotoğraf", "ID photo")}: {NAME}" width="{PORTRAIT_SIZE[0]}" height="{PORTRAIT_SIZE[1]}"><figcaption>{NAME}</figcaption></figure>
    <dl class="facts">
      <dt>{t("Öğrenci no", "Student no")}</dt><dd>{STUDENT_NO}</dd>
      <dt>{t("Bölüm", "Department")}</dt><dd>{DEPT[lang]}</dd>
      <dt>{t("Doğum", "Born")}</dt><dd>{t("27.08.2007, Sincan / Ankara", "27.08.2007, Sincan / Ankara")}</dd>
      <dt>{t("Şehir", "City")}</dt><dd>{CITY[lang]}</dd>
      <dt>{t("Dil", "Languages")}</dt><dd>{t("Türkçe, İngilizce", "Turkish, English")}</dd>
    </dl>
  </aside>
  <div class="prose">
    <h2>{t("Özgeçmiş", "CV")}</h2>
    <p>{t(f"Merhaba, ben {NAME}. 27 Ağustos 2007'de Ankara Sincan'da doğdum. İlkokul, ortaokul ve liseyi başarıyla tamamladım; ardından Akdeniz Üniversitesi'ni kazanarak {DEPT['tr']} bölümünde eğitime başladım ve şu anda birinci sınıf öğrencisiyim.",
             f"Hi, I'm {NAME}. I was born on 27 August 2007 in Sincan, Ankara. I completed primary, middle and high school successfully, then won a place at Akdeniz University and began studying {DEPT['en']}. I'm currently a first-year student.")}</p>
    <p>{t(f"Yazılım geliştirme, web arayüz tasarımı ve dijital görsel üretim alanlarında çalışıyorum. Teknik bilgiyi görsel detaylarla birleştiren projeler geliştirmeyi seviyorum: sayfaları {ab('HTML', 'HyperText Markup Language')} ve {ab('CSS', 'Cascading Style Sheets')} ile kuruyor, <code>JavaScript</code> ile canlandırıyor, grafik çalışmalarımı dijital ortamda üretiyorum. Arama motorlarında bulunabilirlik ({ab('SEO', 'Search Engine Optimization')}) ve erişilebilirlik de işin doğal bir parçası.",
             f"I work in software development, web interface design and digital visual production. I enjoy building projects that combine technical knowledge with visual detail: I build pages with {ab('HTML', 'HyperText Markup Language')} and {ab('CSS', 'Cascading Style Sheets')}, bring them to life with <code>JavaScript</code>, and create my graphic work digitally. Findability ({ab('SEO', 'Search Engine Optimization')}) and accessibility are a natural part of the job too.")}</p>
    <p>{t("Eğitimimin yanında sekiz ay baristalık yaptım. Yoğun saatlerde sakin kalmayı, müşteriyle hızlı ve net iletişim kurmayı ve ekip halinde çalışmayı orada öğrendim. Şu dönemde web sitesi geliştirme ve tasarım alanlarına yoğunlaşıyor, yeni işler üstlenerek kendimi hızla geliştirmeyi hedefliyorum.",
            "Alongside my studies I worked as a barista for eight months, where I learned to stay calm in a rush, communicate quickly and clearly with customers, and work as part of a team. Right now I'm focusing on website development and design, taking on new work to grow quickly.")}</p>
    <blockquote><p>{t("Önce çalıştır, sonra doğru yap, sonra hızlı yap.", "Make it work, make it right, make it fast.")}</p><footer>{t("Kent Beck'e atfedilen söz", "Attributed to Kent Beck")}</footer></blockquote>
    <p>{t("Kısaca kendimi kodla anlatırsam:", "If I describe myself in code:")}</p>
    <pre><code>{esc(code)}</code></pre>
    <p>{t("Çalışırken <kbd>Ctrl</kbd> + <kbd>S</kbd> alışkanlığım o kadar güçlü ki, kaydedilmemiş bir dosya görünce <mark>huzursuz olurum</mark>.", "My <kbd>Ctrl</kbd> + <kbd>S</kbd> habit is so strong that an unsaved file makes me <mark>restless</mark>.")}</p>

    <h2>{t("Eğitim ve deneyim", "Education and experience")}</h2>
    <ol class="timeline">
      <li><time datetime="2026">2026 - {t("devam ediyor", "ongoing")}</time><strong>{t("Akdeniz Üniversitesi", "Akdeniz University")}, {DEPT[lang]}</strong>{t("Birinci sınıf öğrencisi", "First-year student")}</li>
      <li><time datetime="P8M">{t("8 ay", "8 months")}</time><strong>{t("Barista", "Barista")}</strong>{t("Müşteri iletişimi, hız ve ekip çalışması", "Customer communication, speed and teamwork")}</li>
    </ol>

    <h2>{t("Ders programı", "Class schedule")}</h2>
    <div class="table-wrap" tabindex="0" role="region" aria-label="{t("Ders programı tablosu", "Class schedule table")}">
      <table>
        <caption>{t("2026-2027 güz dönemi haftalık ders programı", "2026-2027 fall semester weekly timetable")}</caption>
        <thead><tr><th scope="col">{t("Gün", "Day")}</th><th scope="col">{t("Saat", "Time")}</th><th scope="col">{t("Kod", "Code")}</th><th scope="col">{t("Ders", "Course")}</th><th scope="col">{t("Yer", "Room")}</th><th scope="col">{t("Öğretim elemanı", "Instructor")}</th></tr></thead>
        <tbody>{rows}</tbody>
      </table>
    </div>

    <h2>{t("İlgi alanlarım ve yeteneklerim", "Interests and abilities")}</h2>
    <div class="lists">
      <div><h3>{t("İlgi alanlarım (öncelik sırasıyla)", "Interests (in order of priority)")}</h3><ol>{"".join(f"<li>{i}</li>" for i in interests)}</ol></div>
      <div><h3>{t("Yeteneklerim", "Abilities")}</h3><ul>{"".join(f"<li>{i}</li>" for i in talents)}</ul></div>
    </div>

    <h2>{t("Beceri düzeyim", "Skill levels")}</h2>
    <p>{t("Yüzdeler, kendimi değerlendirmemdir.", "Percentages are my own self-assessment.")}</p>
    <ul class="skills">{sk}</ul>
  </div>
</div>
"""
    title = t(f"Hakkımda | {NAME}: Özgeçmiş, Ders Programı", f"About | {NAME}: CV, Class Schedule and Skills")
    desc = t(f"{NAME} kimdir? {DEPT['tr']} öğrencisinin özgeçmişi, haftalık ders programı, ilgi alanları ve yüzdelerle gösterilen yetenekleri.",
             f"Who is {NAME}? CV of an {DEPT['en']} student with weekly class schedule, interests and skills shown as percentages.")
    ld = [person_ld(lang), {"@context": "https://schema.org", "@type": "ProfilePage", "url": page_url(lang, "about"), "mainEntity": {"@id": f"{SITE_URL}/#person"}}, crumbs(lang, "about")]
    return layout(lang, "about", title, desc, body, ld)


def projects(lang):
    t = lambda tr, en: tr if lang == "tr" else en
    items = ""
    for p in PROJECTS:
        items += f'<div id="{p[0]}">{plate(lang, p, "#" + p[0])}</div>'
    items = items.replace('<div id=', '<div class="plate-slot" id=')
    def _pd(pid):
        d, L = pdetail(pid, lang), PLABELS[lang]
        ba = (f'<div class="ba"><figure><img src="{IMG}projects/p6-once.jpg" alt="{esc(t("Önce: yolda hareketli araçlar", "Before: moving cars on the road"))}" width="450" height="600" loading="lazy"><figcaption>{t("Önce", "Before")}</figcaption></figure>'
              f'<figure><img src="{IMG}projects/p6.jpg" alt="{esc(t("Sonra: araçlar kaldırılmış boş cadde", "After: the empty street, cars removed"))}" width="450" height="600" loading="lazy"><figcaption>{t("Sonra", "After")}</figcaption></figure></div>') if pid == "p6" else ""
        return (ba + '<dl class="pdetail">' + "".join(f'<div><dt>{L[k]}</dt><dd>{esc(d[k])}</dd></div>' for k in ("goal", "how", "result"))
                + f'<div><dt>{L["tools"]}</dt><dd>' + "".join(f'<span class="chip">{esc(x)}</span>' for x in d["tools"]) + '</dd></div></dl>')
    plates = "".join(plate(lang, p, "#" + p[0]).replace('<figure class="plate">', f'<figure class="plate" id="{p[0]}">').replace('</p></figcaption></a></figure>', '</p>' + _pd(p[0]) + '</figcaption></a></figure>') for p in PROJECTS)
    body = f"""
<div class="wrap page-head">
  <h1>{t("Projeler", "Projects")}</h1>
  <p>{t("Grafik Animasyon I dersi kapsamında hazırladığım çalışmalar.", "Work I prepared for the Graphic Animation I course.")}</p>
</div>
<section class="wrap" style="padding-bottom:4rem" aria-label="{t("Proje listesi", "Project list")}">
  <div class="plates all">{plates}</div>
</section>
"""
    title = t(f"Projeler | {NAME}: Grafik Animasyon Çalışmaları", f"Projects | {NAME}: Graphic Animation Work")
    desc = t("Film afişi, ürün afişi, karakter çizimi, web arayüzü ve oyun sahnesi: Grafik Animasyon I dersinde hazırlanan çalışmalar.",
             "Film poster, product poster, character art, web interface and game scene: work made in the Graphic Animation I course.")
    ld = [{"@context": "https://schema.org", "@type": "CollectionPage", "name": title, "url": page_url(lang, "projects"),
           "hasPart": [{"@type": "CreativeWork", "name": t(p[1], p[2]), "description": t(p[3], p[4]), "image": abs_img(f"projects/{p[0]}.jpg"), "creator": {"@id": f"{SITE_URL}/#person"}} for p in PROJECTS]},
          crumbs(lang, "projects")]
    return layout(lang, "projects", title, desc, body, ld)


GIT_CODE = "git init\ngit add .\ngit commit -m \"ilk sürüm\"\ngit log --oneline"
GIT_CODE_EN = "git init\ngit add .\ngit commit -m \"first version\"\ngit log --oneline"
CSS_CODE = ".grid { display: grid; gap: 1rem; }\n\n@media (min-width: 48em) {\n  .grid { grid-template-columns: 1fr 1fr; }\n}"
JS_CODE = "const yanit = await fetch('/api/projeler');\nif (!yanit.ok) throw new Error(yanit.status);\nconst veri = await yanit.json();"
JS_CODE_EN = "const res = await fetch('/api/projects');\nif (!res.ok) throw new Error(res.status);\nconst data = await res.json();"


def blog(lang):
    t = lambda tr, en: tr if lang == "tr" else en
    fig = lambda n, cap, alt: (f'<figure><img src="{IMG}blog/{n}.svg" alt="{esc(alt)}" width="900" height="{ {"git-1": 340, "git-2": 340, "css-1": 370, "css-2": 480, "js-1": 310, "js-2": 250}[n] }" loading="lazy"><figcaption>{cap}</figcaption></figure>')
    posts = [
        dict(id="git", date="2026-10-02", mins=5, tags=("Git", "Sürüm kontrolü"), tags_en=("Git", "Version control"),
             title=t("Git ile ilk gün: sürüm kontrolünü anlamak", "Day one with Git: understanding version control"),
             intro=t("Dosya adlarının sonuna \"final\", \"final2\", \"gerçekten_son\" yazmaktan vazgeçtiren araç: Git.", "The tool that stops you naming files \"final\", \"final2\" and \"really_final\": Git."),
             body=f"""
<h3>{t("Depoyu başlatmak", "Starting a repository")}</h3>
<p>{t("Proje klasörünün içinde <code>git init</code> yazdığınızda Git gizli bir <code>.git</code> klasörü oluşturur ve değişikliklerinizi izlemeye başlar. <code>git add .</code> ile dosyaları sahneye alır, <code>git commit</code> ile o anın fotoğrafını çekersiniz.",
        "Run <code>git init</code> inside the project folder and Git creates a hidden <code>.git</code> folder and starts tracking changes. <code>git add .</code> stages the files and <code>git commit</code> takes a snapshot of that moment.")}</p>
<pre><code>{esc(GIT_CODE if lang == "tr" else GIT_CODE_EN)}</code></pre>
{fig("git-1", t("Ekran görüntüsü: ilk commit ve geçmişin listelenmesi.", "Screenshot: the first commit and the history listing."), t("Terminalde git init, add, commit ve log komutlarının çıktısı", "Terminal output of git init, add, commit and log"))}
<h3>{t("Dallar ve birleştirme", "Branches and merging")}</h3>
<p>{t("Yeni bir özelliği ana koda dokunmadan denemek için dal açarsınız. Beğenirseniz <code>git merge</code> ile ana dala katarsınız; beğenmezseniz dalı silip hiçbir şey olmamış gibi devam edersiniz.",
        "To try a feature without touching the main code you open a branch. If you like it, <code>git merge</code> brings it into the main branch; if not, delete the branch and carry on as if nothing happened.")}</p>
{fig("git-2", t("Ekran görüntüsü: galeri dalı oluşturulup main dalına birleştirildi.", "Screenshot: the gallery branch created and merged into main."), t("Terminalde yeni dal açma ve birleştirme komutları", "Terminal showing branch creation and merge commands"))}
<p>{t("Öğrendiğim en önemli ders: küçük ve açıklayıcı commit mesajları, altı ay sonraki kendinize yazdığınız notlardır.", "The most important lesson I learned: small, descriptive commit messages are notes to yourself six months from now.")}</p>
"""),
        dict(id="mobile-first", date="2026-10-16", mins=4, tags=("CSS", "Responsive"), tags_en=("CSS", "Responsive"),
             title=t("Mobile-first CSS: önce telefon, sonra geniş ekran", "Mobile-first CSS: phone first, wide screens later"),
             intro=t("Önce en dar ekranı çözmek, geri kalan her şeyi kolaylaştırır.", "Solving the narrowest screen first makes everything else easier."),
             body=f"""
<h3>{t("Neden önce telefon?", "Why phone first?")}</h3>
<p>{t("Telefon ekranında yer kıttır; hangi içeriğin gerçekten önemli olduğuna karar vermeye zorlar. Temel stilleri dar ekran için yazar, ekran büyüdükçe <code>min-width</code> medya sorgularıyla düzeni zenginleştirirsiniz.",
        "A phone screen has little room, which forces you to decide what content really matters. Write base styles for narrow screens, then enrich the layout with <code>min-width</code> media queries as the screen grows.")}</p>
<pre><code>{esc(CSS_CODE)}</code></pre>
{fig("css-1", t("Ekran görüntüsü: tek sütundan iki sütuna geçen CSS.", "Screenshot: CSS that moves from one column to two."), t("Medya sorgusu içeren bir CSS dosyası", "A CSS file containing a media query"))}
<h3>{t("Üç ekranda test", "Testing on three screens")}</h3>
<p>{t("Tarayıcı geliştirici araçlarındaki cihaz modunda 360, 768 ve 1280 piksel genişlikleri denemek, çoğu taşma hatasını yakalamaya yeter. Yatay kaydırma çubuğu çıkıyorsa bir öğe sabit genişlikte kalmıştır.",
        "Trying 360, 768 and 1280 pixel widths in the browser's device mode catches most overflow bugs. If a horizontal scrollbar appears, some element is stuck at a fixed width.")}</p>
{fig("css-2", t("Ekran görüntüsü: aynı sayfa üç genişlikte.", "Screenshot: the same page at three widths."), t("Telefon, tablet ve dizüstü genişliğinde aynı sayfanın şematik görünümü", "Schematic view of one page at phone, tablet and laptop widths"))}
"""),
        dict(id="fetch-api", date="2026-11-06", mins=5, tags=("JavaScript", "API"), tags_en=("JavaScript", "API"),
             title=t("fetch ile bir API'den veri çekmek", "Fetching data from an API with fetch"),
             intro=t("Sayfanızı statik olmaktan çıkarıp sunucudan veri alan bir yapıya dönüştürmenin ilk adımı.", "The first step in turning a static page into one that loads data from a server."),
             body=f"""
<h3>{t("İlk istek", "The first request")}</h3>
<p>{t("<code>fetch</code> bir söz (promise) döndürür. <code>await</code> ile sonucu bekler, yanıtın başarılı olup olmadığını <code>ok</code> özelliğiyle denetler ve gövdeyi <code>json()</code> ile okursunuz.",
        "<code>fetch</code> returns a promise. You wait for it with <code>await</code>, check success with the <code>ok</code> property, and read the body with <code>json()</code>.")}</p>
<pre><code>{esc(JS_CODE if lang == "tr" else JS_CODE_EN)}</code></pre>
{fig("js-1", t("Ekran görüntüsü: async işlev içinde fetch kullanımı.", "Screenshot: using fetch inside an async function."), t("fetch çağrısı içeren bir JavaScript dosyası", "A JavaScript file with a fetch call"))}
<h3>{t("Sonucu konsolda görmek", "Seeing the result in the console")}</h3>
<p>{t("Önce veriyi <code>console.log</code> ile yazdırıp yapısına bakın, sonra sayfaya yerleştirin. Hata durumunu da unutmayın: ağ kopabilir, sunucu 404 dönebilir.",
        "Print the data with <code>console.log</code> and inspect its shape before placing it in the page. Don't forget the error case: the network can drop and the server can answer 404.")}</p>
{fig("js-2", t("Ekran görüntüsü: konsolda dönen proje listesi.", "Screenshot: the project list returned in the console."), t("Tarayıcı konsolunda üç öğelik bir dizi", "A three-item array in the browser console"))}
"""),
    ]
    arts = ""
    for p in posts:
        tags = p["tags"] if lang == "tr" else p["tags_en"]
        arts += f"""<article class="post wrap" id="{p['id']}" itemscope itemtype="https://schema.org/BlogPosting">
  <div class="post-aside"><p class="post-meta"><time datetime="{p['date']}" itemprop="datePublished">{p['date']}</time><br>{p['mins']} {t("dk okuma", "min read")}<br>{", ".join(tags)}</p></div>
  <div><h2 itemprop="headline">{p['title']}</h2><p class="lead" itemprop="description" style="margin-top:1rem">{p['intro']}</p><div class="post-body" itemprop="articleBody">{p['body']}</div></div>
</article>"""
    toc = "".join(f'<li><a href="#{p["id"]}">{p["title"]}</a></li>' for p in posts)
    body = f"""
<div class="wrap page-head">
  <h1>Blog</h1>
  <p>{t("Öğrendiklerimi not aldığım üç yazı.", "Three posts where I write down what I learn.")}</p>
  <ul class="toc">{toc}</ul>
</div>
{arts}
"""
    title = t(f"Blog | {NAME}: Git, Mobile-First CSS ve fetch API Yazıları", f"Blog | {NAME}: Git, Mobile-First CSS and fetch API Posts")
    desc = t("Git ile sürüm kontrolü, mobile-first CSS ve fetch ile API kullanımı hakkında ekran görüntülü, adım adım üç yazı.",
             "Three step-by-step posts with screenshots on version control with Git, mobile-first CSS and using APIs with fetch.")
    ld = [{"@context": "https://schema.org", "@type": "Blog", "name": f"{NAME} Blog", "url": page_url(lang, "blog"), "inLanguage": lang,
           "blogPost": [{"@type": "BlogPosting", "headline": p["title"], "description": p["intro"], "datePublished": p["date"],
                         "url": page_url(lang, "blog") + "#" + p["id"], "inLanguage": lang, "image": abs_img("og.jpg"),
                         "author": {"@id": f"{SITE_URL}/#person"}} for p in posts]},
          person_ld(lang), crumbs(lang, "blog")]
    return layout(lang, "blog", title, desc, body, ld)


def gallery(lang):
    t = lambda tr, en: tr if lang == "tr" else en
    shots = ""
    for n, (gid, w, h, ttr, ten, dtr, den) in enumerate(GALLERY, 1):
        title, text = t(ttr, ten), t(dtr, den)
        alt = f"{title}: {text}"
        shots += (f'<figure class="shot"><button type="button" data-full="{IMG}gallery/{gid}.jpg" data-alt="{esc(alt)}" data-title="{esc(title)}" data-text="{esc(text)}" aria-label="{esc(t("Büyüt", "Enlarge"))}: {esc(title)}">'
                  f'<img src="{IMG}gallery/{gid}.jpg" alt="{esc(alt)}" width="{w}" height="{h}" loading="lazy"></button>'
                  f'<figcaption><span class="no">{n:02d}</span><strong>{title}</strong><span class="tx">{text}</span>{("<em>" + esc(t(*STORIES[gid])) + "</em>") if gid in STORIES else ""}</figcaption></figure>')
    body = f"""
<div class="wrap page-head">
  <h1>{t("Galeri", "Gallery")}</h1>
  <p>{t("Beni en çok yansıttığını düşündüğüm kareler. Büyütmek için bir fotoğrafa tıklayın.", "The frames I think reflect me best. Select a photo to enlarge it.")}</p>
</div>
<section class="wrap hall" aria-label="{t("Fotoğraflar", "Photos")}"><header class="hall-t"><small>{NAME} · {t("Kişisel koleksiyon", "Personal collection")}</small><h2>{t("Kare Kare", "Frame by Frame")}</h2><span class="rule"></span></header><div class="masonry">{shots}</div></section>
<dialog class="lightbox" aria-label="{t("Fotoğraf önizleme", "Photo preview")}">
  <div class="lb-body"><img alt="">
    <div class="lb-cap"><p><strong data-lb-title></strong><br><span data-lb-text></span></p>
      <div class="lb-ctrl"><button type="button" data-lb-prev>{t("Önceki", "Previous")}</button><button type="button" data-lb-next>{t("Sonraki", "Next")}</button><button type="button" data-lb-close>{t("Kapat", "Close")}</button></div>
    </div></div>
</dialog>
"""
    title = t(f"Galeri | {NAME}: Fotoğraflarla Beni Tanıyın", f"Gallery | {NAME}: Get to Know Me Through Photos")
    desc = t("Gün batımından gece şehrine, on beş fotoğraf ve her birinin kısa hikâyesi. Beni en iyi anlatan kareler.",
             "From sunsets to city nights, fifteen photos each with a short story. The frames that describe me best.")
    ld = [{"@context": "https://schema.org", "@type": "ImageGallery", "name": title, "url": page_url(lang, "gallery"),
           "image": [{"@type": "ImageObject", "contentUrl": abs_img(f"gallery/{g[0]}.jpg"), "name": t(g[3], g[4]), "description": t(g[5], g[6])} for g in GALLERY]},
          crumbs(lang, "gallery")]
    return layout(lang, "gallery", title, desc, body, ld)


def contact(lang):
    t = lambda tr, en: tr if lang == "tr" else en
    msg = {"required": t("Bu alan zorunlu.", "This field is required."),
           "email": t("Geçerli bir e-posta adresi yazın, örneğin ad@ornek.com.", "Enter a valid email address, for example name@example.com."),
           "short": t("Mesaj en az 10 karakter olmalı.", "The message must be at least 10 characters."),
           "ok": t("Mesajınız gönderildi, teşekkürler! En kısa sürede dönüş yapacağım.", "Your message was sent, thank you! I'll get back to you soon."),
           "sending": t("Gönderiliyor...", "Sending..."),
           "wait": t("Lütfen birkaç saniye bekleyip tekrar deneyin.", "Please wait a few seconds and try again."),
           "fail": t("Gönderilemedi. E-posta uygulamanız açılıyor, mesajı oradan iletebilirsiniz.", "Could not send. Your email app is opening so you can send the message from there.")}
    body = f"""
<div class="wrap page-head">
  <h1>{t("İletişim", "Contact")}</h1>
  <p>{t("Proje, staj ya da sadece merhaba demek için yazabilirsiniz.", "Write to me about a project, an internship, or just to say hello.")}</p>
</div>
<div class="wrap contact">
  <dl class="contact-list">
    <div><dt>{t("Adres", "Address")}</dt><dd><address>{ADDRESS[lang]}</address></dd></div>
    <div><dt>{t("Telefon", "Phone")}</dt><dd><a href="tel:{PHONE_TEL}">{PHONE_DISPLAY}</a></dd></div>
    <div><dt>{t("E-posta", "Email")}</dt><dd><a href="mailto:{EMAIL}">{EMAIL}</a></dd></div>
    <div><dt>{t("Yanıt süresi", "Response time")}</dt><dd>{t("Genellikle iki iş günü içinde", "Usually within two business days")}</dd></div>
  </dl>
  <form id="contact-form" novalidate data-to="{EMAIL}" data-msg='{esc(json.dumps(msg, ensure_ascii=False), quote=True)}' aria-label="{t("İletişim formu", "Contact form")}">
    <div class="field"><label for="name">{t("Adınız", "Your name")}</label><input id="name" name="name" autocomplete="name" required aria-describedby="name-err"><p class="err" aria-live="polite" id="name-err"></p></div>
    <div class="field"><label for="email">{t("E-posta adresiniz", "Your email")}</label><input id="email" name="email" type="email" autocomplete="email" required aria-describedby="email-err"><p class="err" aria-live="polite" id="email-err"></p></div>
    <div class="field"><label for="subject">{t("Konu", "Subject")}</label><input id="subject" name="subject" required aria-describedby="subject-err"><p class="err" aria-live="polite" id="subject-err"></p></div>
    <div class="field"><label for="message">{t("Mesajınız", "Your message")}</label><textarea id="message" name="message" required minlength="10" maxlength="2000" aria-describedby="message-err"></textarea><p class="err" aria-live="polite" id="message-err"></p></div>
    <div class="hp" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
    <button class="btn primary" type="submit">{t("Mesajı gönder", "Send message")}</button>
    <p class="status" id="form-status" role="status" tabindex="-1"></p>
  </form>
</div>
"""
    title = t(f"İletişim | {NAME}: Adres, Telefon ve İletişim Formu", f"Contact | {NAME}: Address, Phone and Contact Form")
    desc = t(f"{NAME} ile iletişime geçin: adres, telefon numarası, e-posta ve mesaj formu. Genellikle iki iş günü içinde yanıt veriyorum.",
             f"Get in touch with {NAME}: address, phone number, email and message form. I usually reply within two business days.")
    ld = [{"@context": "https://schema.org", "@type": "ContactPage", "url": page_url(lang, "contact"), "name": title, "mainEntity": {"@id": f"{SITE_URL}/#person"}},
          person_ld(lang), crumbs(lang, "contact")]
    return layout(lang, "contact", title, desc, body, ld)


import blog_content  # tools/blog_content.py: blog yazıları burada
BUILDERS = dict(home=home, about=about, projects=projects, blog=lambda lang: blog_content.blog(lang, globals()), gallery=gallery, contact=contact)


def main():
    for lang in ("tr", "en"):
        d = ROOT / lang
        d.mkdir(exist_ok=True)
        for k in [x for x in KEYS if x != "home"] + ["home"]:
            (d / FILES[lang][k]).write_text(BUILDERS[k](lang), encoding="utf-8")
    # kök yönlendirme
    (ROOT / "index.html").write_text(f"""<!DOCTYPE html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{NAME} | Portfolio</title>
<meta name="description" content="{NAME}: web ve hareketli grafik portföyü. Web and motion graphics portfolio.">
<link rel="canonical" href="{SITE_URL}/tr/">
<link rel="alternate" hreflang="tr" href="{SITE_URL}/tr/"><link rel="alternate" hreflang="en" href="{SITE_URL}/en/"><link rel="alternate" hreflang="x-default" href="{SITE_URL}/tr/">
<noscript><meta http-equiv="refresh" content="0; url=tr/"></noscript>
<script>try{{var l=localStorage.getItem('lang')||(navigator.language||'tr').slice(0,2);location.replace(l==='en'?'en/':'tr/')}}catch(e){{location.replace('tr/')}}</script>
<style>body{{font-family:system-ui,sans-serif;background:#0b2540;color:#e8f1fa;display:grid;place-items:center;min-height:100vh;margin:0}}a{{color:#ff6a2b;font-size:1.4rem;margin:0 1rem}}</style>
</head><body><p><a href="tr/">Türkçe</a> <a href="en/">English</a></p></body></html>
""", encoding="utf-8")
    # sitemap
    urls = ""
    for lang in ("tr", "en"):
        for k in KEYS:
            urls += (f"<url><loc>{page_url(lang, k)}</loc><lastmod>{BUILD_DATE}</lastmod>"
                     f'<xhtml:link rel="alternate" hreflang="tr" href="{page_url("tr", k)}"/>'
                     f'<xhtml:link rel="alternate" hreflang="en" href="{page_url("en", k)}"/>'
                     f'<xhtml:link rel="alternate" hreflang="x-default" href="{page_url("tr", k)}"/></url>\n')
    (ROOT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + urls + "</urlset>\n", encoding="utf-8")
    bots = "\n".join(f"User-agent: {b}\nAllow: /\n" for b in ("GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "CCBot"))
    (ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nDisallow: /tools/\n\n{bots}\nSitemap: {SITE_URL}/sitemap.xml\n", encoding="utf-8")
    llms = f"""# {NAME}

> {NAME} is an {DEPT['en']} student in {CITY['en']} working on web interfaces and motion graphics. This is a bilingual (Turkish/English) personal portfolio site.
> {NAME}, {CITY['tr']}'da {DEPT['tr']} okuyan; web arayüzü ve hareketli grafik üzerine çalışan bir öğrencidir.

## English
- [Home]({page_url('en', 'home')}): introduction, featured projects, gallery preview
- [About]({page_url('en', 'about')}): CV, class schedule, interests, skills
- [Projects]({page_url('en', 'projects')}): Graphic Animation I course pieces
- [Blog]({page_url('en', 'blog')}): posts on building a 3D site with AI, a backend-free contact form, designing a web interface in Photoshop
- [Gallery]({page_url('en', 'gallery')}): fifteen photos with short captions
- [Contact]({page_url('en', 'contact')}): address, phone, email and contact form

## Türkçe
- [Ana sayfa]({page_url('tr', 'home')})
- [Hakkımda]({page_url('tr', 'about')})
- [Projeler]({page_url('tr', 'projects')})
- [Blog]({page_url('tr', 'blog')})
- [Galeri]({page_url('tr', 'gallery')})
- [İletişim]({page_url('tr', 'contact')})
"""
    (ROOT / "llms.txt").write_text(llms, encoding="utf-8")
    (ROOT / "assets/img/skyline.svg").write_text(make_skyline(), encoding="utf-8")
    # önbellek kırıcı: css/js adreslerine sürüm eklenir (telefonlar eski dosyayı tutmasın). Sürümü artırmak için ASSET_V değiştir.
    ASSET_V = "20261126c"
    for lg in ("tr", "en"):
        for f in (ROOT / lg).glob("*.html"):
            h = f.read_text(encoding="utf-8")
            h2 = re.sub(r'(assets/(?:css|js)/[\w.-]+\.(?:css|js))(?!\?)', r'\1?v=' + ASSET_V, h)
            if h2 != h:
                f.write_text(h2, encoding="utf-8")
    print("Sayfalar üretildi.")


if __name__ == "__main__":
    main()

