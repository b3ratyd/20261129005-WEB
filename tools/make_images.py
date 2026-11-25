#!/usr/bin/env python3
"""Yer tutucu görselleri üretir (SVG + og.jpg). Gerçek görsellerinizi assets/img altına koyup
build.py içindeki dosya adlarını güncelleyebilirsiniz."""
import math, random, pathlib
from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent / "assets" / "img"
BG, BG2, LINE, INK, SIG, MINT, MID = "#0b2540", "#123a63", "#6fa3d4", "#e8f1fa", "#ff6a2b", "#8fe3c8", "#3b78b8"


def svg(w, h, body, bg=BG2):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
            f'<rect width="{w}" height="{h}" fill="{bg}"/>{body}</svg>')


def grid(w, h, step=40, op=0.16):
    s = []
    for x in range(0, w + 1, step):
        s.append(f'<line x1="{x}" y1="0" x2="{x}" y2="{h}"/>')
    for y in range(0, h + 1, step):
        s.append(f'<line x1="0" y1="{y}" x2="{w}" y2="{y}"/>')
    return f'<g stroke="{LINE}" stroke-opacity="{op}" stroke-width="1">{"".join(s)}</g>'


def save(path, content):
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")


# ---------- Portre ----------
def portrait():
    w, h = 600, 750
    b = grid(w, h, 30, 0.14)
    b += f'<circle cx="300" cy="290" r="110" fill="{MID}" stroke="{INK}" stroke-width="3"/>'
    b += f'<path d="M110 750 C110 560 200 470 300 470 C400 470 490 560 490 750 Z" fill="{MID}" stroke="{INK}" stroke-width="3"/>'
    b += f'<path d="M20 60 V20 H60 M540 20 H580 V60 M580 690 V730 H540 M60 730 H20 V690" fill="none" stroke="{SIG}" stroke-width="4"/>'
    b += f'<text x="300" y="705" text-anchor="middle" font-family="monospace" font-size="20" fill="{INK}" fill-opacity=".7">3,5 x 4,5 cm</text>'
    save("portrait.svg", svg(w, h, b))


# ---------- Projeler (Grafik Animasyon) ----------
def p1():
    w, h = 800, 600
    b = grid(w, h)
    for i in range(7):
        b += f'<circle cx="400" cy="300" r="{40 + i * 38}" fill="none" stroke="{LINE}" stroke-opacity="{0.5 - i * 0.05}" stroke-width="2"/>'
    for i in range(7):
        a = i * 15
        b += (f'<rect x="320" y="220" width="160" height="160" fill="none" stroke="{SIG}" '
              f'stroke-opacity="{0.25 + i * 0.12}" stroke-width="3" transform="rotate({a} 400 300)"/>')
    b += f'<circle cx="400" cy="300" r="22" fill="{SIG}"/>'
    save("projects/p1.svg", svg(w, h, b))


def p2():
    w, h = 800, 600
    b = grid(w, h)
    b += f'<line x1="40" y1="460" x2="760" y2="460" stroke="{INK}" stroke-width="3"/>'
    for t in range(0, 721, 40):
        b += f'<line x1="{40 + t}" y1="460" x2="{40 + t}" y2="472" stroke="{INK}" stroke-opacity=".6"/>'
    for i in range(6):
        x = 120 + i * 112
        sw = math.sin(i * math.pi / 3) * 38
        op = 0.25 + i * 0.15
        col = SIG if i == 5 else INK
        b += (f'<g stroke="{col}" stroke-opacity="{op}" stroke-width="6" stroke-linecap="round" fill="none">'
              f'<circle cx="{x}" cy="215" r="24" fill="{BG2}"/>'
              f'<line x1="{x}" y1="240" x2="{x}" y2="330"/>'
              f'<line x1="{x}" y1="330" x2="{x + sw}" y2="458"/><line x1="{x}" y1="330" x2="{x - sw}" y2="458"/>'
              f'<line x1="{x}" y1="260" x2="{x - sw * .8}" y2="320"/><line x1="{x}" y1="260" x2="{x + sw * .8}" y2="320"/></g>')
    save("projects/p2.svg", svg(w, h, b))


def p3():
    w, h = 800, 600
    b = grid(w, h)
    for i in range(9):
        o = i * 16
        col = SIG if i == 8 else INK
        op = 0.12 + i * 0.1
        b += (f'<polyline points="{150 + o},{470 - o * 1.1} {320 + o},{130 - o * .3} {490 + o},{470 - o * 1.1}" '
              f'fill="none" stroke="{col}" stroke-opacity="{op}" stroke-width="14" stroke-linejoin="miter"/>')
        b += (f'<line x1="{235 + o}" y1="{360 - o * 1.1}" x2="{405 + o}" y2="{360 - o * 1.1}" '
              f'stroke="{col}" stroke-opacity="{op}" stroke-width="14"/>')
    save("projects/p3.svg", svg(w, h, b))


def p4():
    w, h = 800, 600
    b = grid(w, h)
    gy = 500
    b += f'<line x1="30" y1="{gy}" x2="770" y2="{gy}" stroke="{INK}" stroke-width="3"/>'
    x0 = 90
    for k in range(4):
        pk = 330 - k * 70 + 0 if k else 380
        top = gy - (380 - k * 90)
        pts = []
        for s in range(0, 21):
            t = s / 20
            pts.append(f"{x0 + k * 170 + t * 170:.1f},{gy - 24 - (4 * (380 - k * 90) * t * (1 - t)):.1f}")
        b += f'<polyline points="{" ".join(pts)}" fill="none" stroke="{LINE}" stroke-width="2" stroke-dasharray="6 8"/>'
        cx = x0 + k * 170 + 85
        b += f'<circle cx="{cx}" cy="{gy - 24 - (380 - k * 90)}" r="24" fill="{INK}" fill-opacity=".5"/>'
        b += f'<ellipse cx="{x0 + k * 170}" cy="{gy - 14}" rx="34" ry="14" fill="{SIG}" fill-opacity="{0.35 + k * 0.2}"/>'
    b += f'<ellipse cx="{x0 + 4 * 170}" cy="{gy - 14}" rx="34" ry="14" fill="{SIG}"/>'
    save("projects/p4.svg", svg(w, h, b))


def p5():
    w, h = 800, 600
    b = grid(w, h)
    cells = []
    for r in range(2):
        for c in range(3):
            x, y = 90 + c * 230, 100 + r * 230
            cells.append((x, y))
    icons = [
        lambda x, y: f'<circle cx="{x+80}" cy="{y+70}" r="34"/><line x1="{x+104}" y1="{y+94}" x2="{x+130}" y2="{y+122}"/>',
        lambda x, y: f'<polygon points="{x+30},{y+84} {x+80},{y+30} {x+130},{y+84}"/><rect x="{x+48}" y="{y+84}" width="64" height="50"/>',
        lambda x, y: f'<polygon points="{x+60},{y+40} {x+60},{y+120} {x+130},{y+80}"/>',
        lambda x, y: f'<polyline points="{x+36},{y+82} {x+72},{y+118} {x+128},{y+44}"/>',
        lambda x, y: f'<rect x="{x+28}" y="{y+44}" width="104" height="76"/><polyline points="{x+28},{y+44} {x+80},{y+88} {x+132},{y+44}"/>',
        lambda x, y: f'<circle cx="{x+80}" cy="{y+80}" r="40" stroke-dasharray="10 8"/><circle cx="{x+80}" cy="{y+80}" r="14"/>',
    ]
    for i, (x, y) in enumerate(cells):
        col = SIG if i == 3 else INK
        b += f'<rect x="{x}" y="{y}" width="160" height="160" fill="{BG}" fill-opacity=".5" stroke="{LINE}" stroke-opacity=".5"/>'
        b += f'<g fill="none" stroke="{col}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">{icons[i](x, y)}</g>'
    save("projects/p5.svg", svg(w, h, b))


def p6():
    w, h = 800, 600
    b = grid(w, h)
    rnd = random.Random(7)
    for r in range(6):
        y = 90 + r * 72
        b += f'<rect x="40" y="{y}" width="720" height="48" fill="{BG}" fill-opacity=".5"/>'
        s = rnd.randint(40, 300)
        e = s + rnd.randint(180, 400)
        b += f'<rect x="{40 + s}" y="{y + 8}" width="{min(e, 700) - s}" height="32" fill="{MID}" stroke="{LINE}"/>'
        for k in range(3):
            kx = 40 + s + 20 + k * rnd.randint(70, 130)
            if kx < 740:
                b += f'<polygon points="{kx},{y+14} {kx+10},{y+24} {kx},{y+34} {kx-10},{y+24}" fill="{INK}"/>'
    b += f'<line x1="470" y1="60" x2="470" y2="540" stroke="{SIG}" stroke-width="3"/><polygon points="456,50 484,50 470,70" fill="{SIG}"/>'
    save("projects/p6.svg", svg(w, h, b))


# ---------- Galeri ----------
def sky(w, h, c1, c2, extra):
    return (f'<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{c1}"/>'
            f'<stop offset="1" stop-color="{c2}"/></linearGradient></defs><rect width="{w}" height="{h}" fill="url(#g)"/>{extra}')


def hills(name, w, h, c1, c2, sun, layers, sx=0.7, sy=0.3, sr=0.1):
    b = f'<circle cx="{w*sx}" cy="{h*sy}" r="{w*sr}" fill="{sun}"/>'
    for i, col in enumerate(layers):
        base = h * (0.55 + i * 0.12)
        pts = [f"0,{h}"]
        for x in range(0, w + 20, 20):
            pts.append(f"{x},{base + math.sin(x / (90 + i * 40) + i * 2) * (24 + i * 8):.1f}")
        pts.append(f"{w},{h}")
        b += f'<polygon points="{" ".join(pts)}" fill="{col}"/>'
    save(f"gallery/{name}.svg", svg(w, h, sky(w, h, c1, c2, b), c1))


def city(name, w, h, c1, c2, win):
    rnd = random.Random(name)
    b = ""
    x = 0
    while x < w:
        bw = rnd.randint(50, 110)
        bh = rnd.randint(int(h * .25), int(h * .65))
        b += f'<rect x="{x}" y="{h-bh}" width="{bw-4}" height="{bh}" fill="{BG}"/>'
        for wy in range(h - bh + 16, h - 10, 26):
            for wx in range(x + 10, x + bw - 18, 18):
                if rnd.random() > .55:
                    b += f'<rect x="{wx}" y="{wy}" width="8" height="12" fill="{win}"/>'
        x += bw
    b += f'<circle cx="{w*.8}" cy="{h*.2}" r="{w*.05}" fill="{INK}" fill-opacity=".85"/>'
    save(f"gallery/{name}.svg", svg(w, h, sky(w, h, c1, c2, b), c1))


def sea(name, w, h, c1, c2, sea1, sea2):
    b = f'<circle cx="{w*.3}" cy="{h*.38}" r="{w*.09}" fill="{SIG}"/>'
    b += f'<rect y="{h*.55}" width="{w}" height="{h*.45}" fill="{sea1}"/>'
    for i in range(6):
        y = h * .6 + i * h * .07
        pts = " ".join(f"{x},{y + math.sin(x / 40 + i) * 5:.1f}" for x in range(0, w + 10, 10))
        b += f'<polyline points="{pts}" fill="none" stroke="{sea2}" stroke-width="3" stroke-opacity=".7"/>'
    fx, fy = w * .55, h * .55
    b += (f'<path d="M{fx} {fy-8} h{w*.22} l-14 22 h-{w*.2} z" fill="{INK}"/>'
          f'<rect x="{fx+w*.05}" y="{fy-30}" width="{w*.1}" height="22" fill="{INK}" fill-opacity=".85"/>'
          f'<rect x="{fx+w*.1}" y="{fy-48}" width="{w*.03}" height="18" fill="{SIG}"/>')
    save(f"gallery/{name}.svg", svg(w, h, sky(w, h, c1, c2, b), c1))


def gallery():
    hills("g1", 900, 675, "#173d6b", "#f3a469", "#ffd9a0", ["#3b78b8", "#1f5a96", "#0b2540"])
    city("g2", 800, 1000, "#0b1f38", "#1b4a7c", "#f2c14e")
    sea("g3", 900, 600, "#2a5f9a", "#f7b27a", "#134a7c", "#8fb9e2")
    hills("g4", 800, 1000, "#0d2d52", "#6fa3d4", "#e8f1fa", ["#5b8fc4", "#2d6aa3", "#123a63"], 0.35, 0.22, 0.07)
    city("g5", 900, 600, "#102a4a", "#5e8fc2", "#e8f1fa")
    sea("g6", 800, 800, "#14355c", "#ff8a4c", "#0e3a66", "#6fa3d4")
    hills("g7", 900, 675, "#1a2f55", "#ff6a2b", "#ffe3a8", ["#2f5f95", "#1b4373", "#0b2540"], 0.5, 0.45, 0.14)
    hills("g8", 800, 1000, "#143a66", "#8fe3c8", "#e8f1fa", ["#3f86a0", "#276a8a", "#0f3558"], 0.25, 0.2, 0.08)


# ---------- Blog ekran görüntüleri ----------
def window(name, title, lines, w=900):
    lh = 30
    h = 70 + lh * len(lines) + 30
    b = f'<rect x="0" y="0" width="{w}" height="46" fill="#0d2f52"/>'
    for i, c in enumerate(["#ff6a2b", "#f2c14e", "#8fe3c8"]):
        b += f'<circle cx="{28 + i * 26}" cy="23" r="7" fill="{c}"/>'
    b += f'<text x="{w/2}" y="29" text-anchor="middle" font-family="monospace" font-size="15" fill="{INK}" fill-opacity=".7">{title}</text>'
    for i, (t, kind) in enumerate(lines):
        col = {"p": SIG, "c": MINT, "t": INK, "k": "#9fc6ee"}.get(kind, INK)
        t = t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        b += (f'<text x="32" y="{86 + i * lh}" font-family="DejaVu Sans Mono, Menlo, Consolas, monospace" '
              f'font-size="19" fill="{col}" xml:space="preserve">{t}</text>')
    save(f"blog/{name}.svg", svg(w, h, b, BG))


def devices(name):
    w, h = 900, 480
    b = grid(w, h, 30, .12)
    def dev(x, y, dw, dh, label, rows):
        s = f'<rect x="{x}" y="{y}" width="{dw}" height="{dh}" rx="14" fill="{BG}" stroke="{INK}" stroke-width="3"/>'
        s += f'<rect x="{x+14}" y="{y+16}" width="{dw-28}" height="26" fill="{SIG}"/>'
        for i in range(rows):
            s += f'<rect x="{x+14}" y="{y+58+i*34}" width="{dw-28}" height="22" fill="{MID}"/>'
        s += f'<text x="{x+dw/2}" y="{y+dh+30}" text-anchor="middle" font-family="monospace" font-size="18" fill="{INK}">{label}</text>'
        return s
    b += dev(70, 70, 160, 320, "360px", 6)
    b += dev(300, 90, 250, 300, "768px", 5)
    b += dev(620, 120, 240, 270, "1280px", 4)
    save(f"blog/{name}.svg", svg(w, h, b, BG2))


def blog():
    window("git-1", "Terminal - proje-klasoru", [
        ("$ git init", "p"), ("Initialized empty Git repository in .git/", "c"), ("$ git add .", "p"),
        ('$ git commit -m "ilk sürüm: ana sayfa"', "p"), ("[main (root-commit) 3f2a9c1] ilk sürüm: ana sayfa", "t"),
        (" 4 files changed, 128 insertions(+)", "t"), ("$ git log --oneline", "p"), ("3f2a9c1 ilk sürüm: ana sayfa", "k")])
    window("git-2", "Terminal - dal ve birleştirme", [
        ("$ git switch -c galeri", "p"), ("Switched to a new branch 'galeri'", "c"), ('$ git commit -am "galeri eklendi"', "p"),
        ("$ git switch main", "p"), ("$ git merge galeri", "p"), ("Updating 3f2a9c1..b81d4e7", "t"),
        ("Fast-forward", "c"), (" galeri.html | 42 ++++++++", "t")])
    window("css-1", "style.css - mobile-first", [
        ("/* Önce telefon */", "c"), (".grid { display: grid; gap: 1rem; }", "t"), ("", "t"),
        ("@media (min-width: 48em) {", "k"), ("  .grid { grid-template-columns: 1fr 1fr; }", "t"), ("}", "k"),
        ("@media (min-width: 72em) {", "k"), ("  .grid { grid-template-columns: repeat(4, 1fr); }", "t"), ("}", "k")])
    devices("css-2")
    window("js-1", "app.js - fetch ile veri çekme", [
        ("async function yukle() {", "k"), ("  const yanit = await fetch('/api/projeler');", "t"),
        ("  if (!yanit.ok) throw new Error(yanit.status);", "t"), ("  const veri = await yanit.json();", "t"),
        ("  console.log(veri);", "t"), ("}", "k"), ("yukle().catch(console.error);", "p")])
    window("js-2", "Konsol", [
        ("> yukle()", "p"), ("Array(3) [", "c"), ('  { id: 1, ad: "Logo animasyonu" },', "t"),
        ('  { id: 2, ad: "Yürüyüş döngüsü" },', "t"), ('  { id: 3, ad: "Kinetik tipografi" }', "t"), ("]", "c")])


# ---------- OG görseli ----------
def og():
    w, h = 1200, 630
    im = Image.new("RGB", (w, h), (11, 37, 64))
    d = ImageDraw.Draw(im)
    for x in range(0, w, 40):
        d.line([(x, 0), (x, h)], fill=(22, 60, 96), width=1)
    for y in range(0, h, 40):
        d.line([(0, y), (w, y)], fill=(22, 60, 96), width=1)
    d.rectangle([60, 60, w - 60, h - 60], outline=(111, 163, 212), width=2)
    d.rectangle([60, h - 180, 380, h - 60], fill=(255, 106, 43))
    d.ellipse([w - 320, 120, w - 120, 320], outline=(232, 241, 250), width=4)
    d.line([(w - 320, 220), (w - 120, 220)], fill=(255, 106, 43), width=4)
    im.save(ROOT / "og.jpg", quality=84, optimize=True)


if __name__ == "__main__":
    portrait(); p1(); p2(); p3(); p4(); p5(); p6(); gallery(); blog(); og()
    print("Görseller üretildi:", ROOT)
