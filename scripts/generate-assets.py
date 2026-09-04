from PIL import Image, ImageDraw, ImageFilter, ImageOps
import random
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "assets")
os.makedirs(OUT, exist_ok=True)

random.seed(8126)


def vertical_gradient(size, top, bottom):
    w, h = size
    grad = Image.linear_gradient("L").resize((w, h))
    top_rgb = tuple(int(c) for c in top)
    bottom_rgb = tuple(int(c) for c in bottom)
    img = ImageOps.colorize(grad, black=bottom_rgb, white=top_rgb).convert("RGB")
    return img


def radial_glow(size, center, radius, color, alpha):
    w, h = size
    glow = Image.radial_gradient("L").resize((radius * 2, radius * 2))
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    color_rgb = tuple(int(c) for c in color) + (alpha,)
    tint = ImageOps.colorize(glow, black=(0, 0, 0), white=color_rgb[:3]).convert("RGBA")
    tint.putalpha(glow.point(lambda v: int(v * alpha / 255)))
    x = int(center[0] * w - radius)
    y = int(center[1] * h - radius)
    layer.paste(tint, (x, y), tint)
    return layer


def grain(img, strength=16):
    noise = Image.effect_noise(img.size, 92).convert("L")
    noisy = Image.merge("RGB", (noise, noise, noise))
    return Image.blend(img, noisy, strength / 255)


def scanlines(img, spacing=4, alpha=16):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    w, h = img.size
    for y in range(0, h, spacing):
        d.line([(0, y), (w, y)], fill=(0, 0, 0, alpha), width=1)
    return Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")


def vlines(img, spacing=120, alpha=10):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    w, h = img.size
    for x in range(spacing, w, spacing):
        d.line([(x, 0), (x, h)], fill=(255, 255, 255, alpha), width=1)
    return Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")


def beams(img, origin, targets, color, alpha, width_range=(8, 42)):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    color_rgba = tuple(int(c) for c in color) + (alpha,)
    for target in targets:
        x0, y0 = origin
        x1, y1 = target
        width = random.randint(*width_range)
        spread = random.uniform(0.02, 0.09)
        d.polygon(
            [
                (x0 - width // 2, y0),
                (x0 + width // 2, y0),
                (x1 + width * spread, y1),
                (x1 - width * spread, y1),
            ],
            fill=color_rgba,
        )
    return Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")


def hero_poster():
    size = (1920, 1080)
    img = vertical_gradient(size, (18, 18, 20), (6, 6, 8))
    img = Image.alpha_composite(
        img.convert("RGBA"),
        radial_glow(size, (0.72, 0.42), 640, (214, 166, 106), 78),
    ).convert("RGB")
    img = beams(
        img,
        (1500, 130),
        [(300, 900), (760, 980), (1200, 1020), (1700, 900), (200, 620)],
        (204, 158, 104),
        22,
    )
    img = beams(
        img,
        (1640, 60),
        [(540, 820), (980, 900), (1500, 940)],
        (136, 146, 148),
        15,
    )
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.line([(0, 900), (1920, 900)], fill=(238, 234, 224, 38), width=1)
    d.line([(60, 0), (60, 1080)], fill=(238, 234, 224, 20), width=1)
    d.rectangle([(1520, 76), (1580, 136)], outline=(210, 162, 103, 110), width=1)
    img = Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")
    img = scanlines(img, 4, 12)
    img = grain(img, 20)
    img.save(os.path.join(OUT, "hero-poster.jpg"), quality=88)


def portrait():
    size = (1200, 1500)
    img = vertical_gradient(size, (24, 24, 27), (8, 8, 10))
    img = Image.alpha_composite(
        img.convert("RGBA"),
        radial_glow(size, (0.3, 0.28), 430, (218, 168, 108), 62),
    ).convert("RGB")

    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    # Shoulder and neck silhouette.
    d.polygon(
        [
            (245, 1500),
            (300, 1050),
            (360, 790),
            (440, 760),
            (470, 690),
            (500, 650),
            (550, 636),
            (620, 636),
            (670, 660),
            (700, 730),
            (760, 780),
            (860, 830),
            (1010, 920),
            (1080, 1500),
        ],
        fill=(9, 9, 11, 245),
    )
    d.ellipse([(525, 330), (710, 590)], fill=(9, 9, 11, 245))
    d.polygon([(560, 470), (650, 430), (645, 520), (560, 560)], fill=(9, 9, 11, 245))

    # Rim light on the profile.
    d.line(
        [(710, 344), (722, 410), (716, 470), (700, 530), (686, 562), (660, 596), (642, 634)],
        fill=(222, 175, 116, 210),
        width=2,
    )
    d.line(
        [(245, 1500), (300, 1050), (360, 790), (440, 760), (470, 690), (500, 650)],
        fill=(222, 175, 116, 120),
        width=1,
    )

    # Thin technical lines across the portrait.
    for y in (340, 610, 900, 1180):
        d.line([(60, y), (1140, y)], fill=(238, 234, 224, 18), width=1)
    d.rectangle([(58, 58), (1142, 1442)], outline=(238, 234, 224, 42), width=1)
    d.rectangle([(78, 78), (1122, 1422)], outline=(238, 234, 224, 14), width=1)
    d.line([(80, 480), (180, 480)], fill=(210, 162, 103, 150), width=2)
    d.line([(1040, 1010), (1140, 1010)], fill=(210, 162, 103, 150), width=2)
    img = Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")
    img = scanlines(img, 5, 10)
    img = grain(img, 18)
    img.save(os.path.join(OUT, "portrait.jpg"), quality=90)


def project_snc():
    size = (2000, 1250)
    img = vertical_gradient(size, (26, 25, 27), (7, 7, 9))
    img = Image.alpha_composite(
        img.convert("RGBA"),
        radial_glow(size, (0.5, 0.12), 720, (214, 160, 98), 74),
    ).convert("RGB")
    img = beams(
        img,
        (1010, 40),
        [
            (150, 920),
            (430, 1050),
            (760, 1130),
            (1100, 1150),
            (1450, 1080),
            (1760, 930),
            (1950, 760),
        ],
        (222, 172, 112),
        26,
    )
    img = beams(
        img,
        (740, 30),
        [(250, 820), (620, 980), (980, 1080)],
        (150, 158, 160),
        14,
    )

    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for x in range(-100, 2100, random.randint(30, 70)):
        h = random.randint(180, 360)
        d.rounded_rectangle(
            [x, 1250 - h, x + random.randint(38, 84), 1250],
            radius=22,
            fill=(7, 7, 9, 205),
        )
    for _ in range(130):
        x = random.randint(0, 2000)
        y = random.randint(300, 900)
        r = random.randint(2, 8)
        d.ellipse(
            [x - r, y - r, x + r, y + r],
            fill=(238, 230, 210, random.randint(22, 70)),
        )
    d.rectangle([(60, 60), (1940, 1190)], outline=(238, 234, 224, 40), width=1)
    d.line([(60, 1020), (1940, 1020)], fill=(238, 234, 224, 34), width=1)
    img = Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")
    img = scanlines(img, 4, 12)
    img = grain(img, 19)
    img.save(os.path.join(OUT, "project-snc.jpg"), quality=88)


def project_melody():
    size = (2000, 1250)
    img = vertical_gradient(size, (17, 20, 22), (6, 7, 9))
    img = Image.alpha_composite(
        img.convert("RGBA"),
        radial_glow(size, (0.22, 0.28), 560, (178, 196, 188), 46),
    ).convert("RGB")
    img = Image.alpha_composite(
        img.convert("RGBA"),
        radial_glow(size, (0.82, 0.6), 620, (222, 170, 106), 58),
    ).convert("RGB")

    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for i in range(14):
        y = 210 + i * 58
        x1 = random.randint(120, 700)
        x2 = random.randint(1100, 1880)
        color = (204, 168, 126, random.randint(26, 64))
        d.line([(x1, y), (x2, y + random.randint(-40, 60))], fill=color, width=2)
    for i in range(10):
        x = 180 + i * 185
        d.line([(x, 260), (x, 1130)], fill=(238, 234, 224, random.randint(8, 18)), width=1)
    for _ in range(90):
        x = random.randint(80, 1920)
        y = random.randint(220, 1120)
        r = random.randint(2, 7)
        d.ellipse(
            [x - r, y - r, x + r, y + r],
            fill=(232, 226, 210, random.randint(14, 54)),
        )
    d.polygon(
        [(0, 980), (0, 1250), (2000, 1250), (2000, 1060), (1500, 960), (900, 1020), (400, 940)],
        fill=(8, 8, 10, 225),
    )
    d.rectangle([(60, 60), (1940, 1190)], outline=(238, 234, 224, 36), width=1)
    d.line([(60, 1010), (1940, 1010)], fill=(238, 234, 224, 30), width=1)
    img = Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")
    img = scanlines(img, 4, 12)
    img = grain(img, 19)
    img.save(os.path.join(OUT, "project-melody.jpg"), quality=88)


def project_tv():
    size = (2000, 1250)
    img = vertical_gradient(size, (21, 22, 24), (7, 7, 8))
    img = Image.alpha_composite(
        img.convert("RGBA"),
        radial_glow(size, (0.75, 0.3), 520, (196, 204, 202), 42),
    ).convert("RGB")

    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.polygon(
        [
            (1360, 0),
            (1940, 0),
            (1940, 650),
            (1780, 500),
            (1580, 470),
            (1360, 560),
        ],
        fill=(235, 238, 230, 34),
    )
    d.polygon(
        [(320, 1250), (360, 850), (470, 820), (610, 850), (700, 1250)],
        fill=(10, 10, 12, 245),
    )
    d.ellipse([(410, 720), (560, 880)], fill=(10, 10, 12, 245))
    d.line([(415, 758), (452, 806), (490, 850), (522, 888)], fill=(218, 168, 108, 180), width=2)

    # Interview boom and mic silhouette.
    d.line([(1280, 420), (1760, 720)], fill=(12, 12, 14, 255), width=10)
    d.ellipse([(1740, 692), (1810, 766)], fill=(10, 10, 12, 255))
    d.ellipse([(1780, 640), (1830, 810)], outline=(238, 234, 224, 60), width=2)

    for x in range(90, 2000, 180):
        d.line([(x, 0), (x, 1250)], fill=(238, 234, 224, 8), width=1)
    for y in range(90, 1250, 180):
        d.line([(0, y), (2000, y)], fill=(238, 234, 224, 8), width=1)
    d.rectangle([(60, 60), (1940, 1190)], outline=(238, 234, 224, 42), width=1)
    d.rectangle([(80, 80), (1920, 1170)], outline=(238, 234, 224, 14), width=1)
    d.line([(1580, 90), (1580, 170)], fill=(210, 162, 103, 180), width=2)
    img = Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")
    img = scanlines(img, 4, 12)
    img = grain(img, 18)
    img.save(os.path.join(OUT, "project-tv.jpg"), quality=88)


def project_film():
    size = (2000, 1250)
    img = vertical_gradient(size, (20, 22, 23), (6, 7, 9))
    img = Image.alpha_composite(
        img.convert("RGBA"),
        radial_glow(size, (0.72, 0.42), 640, (206, 164, 108), 58),
    ).convert("RGB")

    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.rounded_rectangle([(170, 180), (1830, 1070)], radius=8, fill=(9, 9, 11, 250))
    d.rounded_rectangle([(230, 250), (1770, 720)], radius=4, fill=(24, 27, 27, 255))
    d.rectangle([(230, 780), (1770, 960)], fill=(16, 16, 18, 255))

    # Color grading scopes.
    d.line([(300, 930), (390, 870), (480, 910), (570, 820), (660, 890)], fill=(220, 178, 124, 210), width=2)
    d.line([(760, 820), (850, 940), (940, 860), (1030, 930)], fill=(124, 168, 164, 190), width=2)
    d.line([(1120, 920), (1210, 840), (1300, 910), (1390, 880)], fill=(212, 210, 196, 170), width=2)

    d.line([(300, 860), (1450, 860)], fill=(238, 234, 224, 24), width=1)
    d.line([(300, 900), (1450, 900)], fill=(238, 234, 224, 24), width=1)
    for x in range(300, 1460, 120):
        d.line([(x, 830), (x, 940)], fill=(238, 234, 224, 10), width=1)

    # Film perforations.
    for x in range(220, 1800, 56):
        d.rectangle([x, 160, x + 34, 196], fill=(28, 28, 30, 255))
        d.rectangle([x, 1054, x + 34, 1090], fill=(28, 28, 30, 255))

    d.rectangle([(230, 250), (1770, 720)], outline=(238, 234, 224, 54), width=1)
    d.line([(230, 780), (1770, 780)], fill=(238, 234, 224, 44), width=1)
    d.line([(60, 60), (1940, 60)], fill=(238, 234, 224, 40), width=1)
    d.line([(60, 1190), (1940, 1190)], fill=(238, 234, 224, 40), width=1)
    d.rectangle([(60, 60), (1940, 1190)], outline=(238, 234, 224, 34), width=1)
    d.line([(1800, 80), (1800, 160)], fill=(210, 162, 103, 190), width=2)
    img = Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")
    img = scanlines(img, 4, 12)
    img = grain(img, 17)
    img.save(os.path.join(OUT, "project-film.jpg"), quality=88)


def project_lumix():
    size = (2000, 1250)
    img = vertical_gradient(size, (22, 22, 24), (7, 7, 9))
    img = Image.alpha_composite(
        img.convert("RGBA"),
        radial_glow(size, (0.3, 0.38), 620, (216, 168, 108), 52),
    ).convert("RGB")

    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    # Camera body on a tripod.
    d.line([(930, 690), (930, 1030)], fill=(12, 12, 14, 255), width=14)
    d.polygon(
        [(840, 1030), (930, 880), (1020, 1030)],
        fill=(12, 12, 14, 255),
    )
    d.rounded_rectangle([(660, 430), (1280, 690)], radius=16, fill=(10, 10, 12, 255))
    d.rounded_rectangle([(1040, 470), (1220, 610)], radius=8, fill=(18, 18, 20, 255))
    d.ellipse([(700, 470), (920, 650)], fill=(24, 25, 27, 255))
    d.ellipse([(740, 510), (880, 610)], fill=(7, 7, 9, 255))
    d.ellipse([(786, 556), (836, 606)], fill=(140, 150, 152, 220))

    # Light panel and soft glow.
    d.rounded_rectangle([(150, 250), (470, 760)], radius=8, fill=(236, 232, 218, 42))
    d.rounded_rectangle([(160, 260), (460, 750)], radius=6, fill=(238, 234, 224, 26))
    for x in range(180, 450, 44):
        d.line([(x, 270), (x, 740)], fill=(12, 12, 14, 80), width=2)

    for x in range(0, 2000, 170):
        d.line([(x, 0), (x, 1250)], fill=(238, 234, 224, 8), width=1)
    for y in range(0, 1250, 170):
        d.line([(0, y), (2000, y)], fill=(238, 234, 224, 8), width=1)
    d.rectangle([(60, 60), (1940, 1190)], outline=(238, 234, 224, 42), width=1)
    d.rectangle([(80, 80), (1920, 1170)], outline=(238, 234, 224, 14), width=1)
    d.line([(1780, 100), (1780, 180)], fill=(210, 162, 103, 190), width=2)
    d.line([(120, 1140), (1880, 1140)], fill=(238, 234, 224, 24), width=1)
    img = Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")
    img = scanlines(img, 4, 12)
    img = grain(img, 17)
    img.save(os.path.join(OUT, "project-lumix.jpg"), quality=88)


def footer_bg():
    size = (1920, 1080)
    img = vertical_gradient(size, (18, 18, 20), (7, 7, 9))
    img = Image.alpha_composite(
        img.convert("RGBA"),
        radial_glow(size, (0.5, 0.16), 900, (214, 164, 102), 52),
    ).convert("RGB")
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.line([(0, 660), (1920, 660)], fill=(238, 234, 224, 50), width=1)
    d.line([(0, 662), (1920, 662)], fill=(238, 234, 224, 14), width=1)
    for x in range(0, 2000, 160):
        d.line([(x, 0), (x, 1080)], fill=(238, 234, 224, 10), width=1)
    for y in range(0, 1080, 160):
        d.line([(0, y), (1920, y)], fill=(238, 234, 224, 8), width=1)
    d.polygon(
        [(0, 760), (0, 1080), (1920, 1080), (1920, 800), (1600, 700), (900, 780), (360, 720)],
        fill=(7, 7, 9, 235),
    )
    d.rectangle([(88, 88), (1832, 992)], outline=(238, 234, 224, 38), width=1)
    d.line([(1680, 110), (1680, 190)], fill=(210, 162, 103, 190), width=2)
    img = Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")
    img = scanlines(img, 4, 11)
    img = grain(img, 18)
    img.save(os.path.join(OUT, "footer-bg.jpg"), quality=88)


hero_poster()
portrait()
project_snc()
project_melody()
project_tv()
project_film()
project_lumix()
footer_bg()

print("Assets generated in", OUT)
