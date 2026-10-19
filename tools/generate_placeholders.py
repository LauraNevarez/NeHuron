"""Genera PNG placeholder 512x512 (transparentes) para Avy y los accesorios.
Reemplázalos por tu arte final manteniendo el tamaño 512x512 y la alineación.
Uso: python3 tools/generate_placeholders.py
"""
import zlib, struct, os

W = 512
OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets')


def canvas():
    return [[(0, 0, 0, 0)] * W for _ in range(W)]


def put(c, x, y, col):
    if 0 <= x < W and 0 <= y < W:
        c[y][x] = col


def circle(c, cx, cy, r, col, inner=0):
    for y in range(cy - r, cy + r + 1):
        for x in range(cx - r, cx + r + 1):
            d = (x - cx) ** 2 + (y - cy) ** 2
            if inner ** 2 <= d <= r * r:
                put(c, x, y, col)


def rect(c, x0, y0, x1, y1, col):
    for y in range(y0, y1):
        for x in range(x0, x1):
            put(c, x, y, col)


def triangle(c, apex_x, apex_y, base_y, half, col):
    h = base_y - apex_y
    for y in range(apex_y, base_y):
        w = int(half * (y - apex_y) / h)
        for x in range(apex_x - w, apex_x + w + 1):
            put(c, x, y, col)


def save(c, name):
    raw = b''.join(b'\x00' + b''.join(bytes(p) for p in row) for row in c)
    def chunk(t, d):
        b = struct.pack('>I', len(d)) + t + d
        return b + struct.pack('>I', zlib.crc32(t + d) & 0xFFFFFFFF)
    png = (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', W, W, 8, 6, 0, 0, 0))
           + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))
    path = os.path.join(OUT, name)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'wb').write(png)
    print('✓', name)


# --- Avy (cuerpo) ---
c = canvas()
circle(c, 256, 300, 170, (124, 92, 255, 255))
circle(c, 256, 340, 100, (170, 150, 255, 255))
circle(c, 130, 150, 40, (124, 92, 255, 255)); circle(c, 382, 150, 40, (124, 92, 255, 255))  # orejas
circle(c, 205, 260, 30, (255, 255, 255, 255)); circle(c, 307, 260, 30, (255, 255, 255, 255))
circle(c, 210, 262, 14, (20, 20, 40, 255)); circle(c, 312, 262, 14, (20, 20, 40, 255))
rect(c, 236, 320, 276, 330, (20, 20, 40, 255))  # boca
save(c, 'avy_body.png')

# --- Sombreros ---
c = canvas(); rect(c, 160, 110, 352, 160, (255, 90, 90, 255)); rect(c, 160, 150, 440, 170, (200, 50, 50, 255)); save(c, 'accessories/hat_cap.png')
c = canvas(); triangle(c, 256, 20, 160, 110, (60, 40, 160, 255)); rect(c, 130, 150, 382, 172, (40, 25, 120, 255)); save(c, 'accessories/hat_wizard.png')
c = canvas(); rect(c, 170, 110, 342, 170, (255, 200, 40, 255))
for x in (170, 245, 320): triangle(c, x + 11, 60, 112, 22, (255, 200, 40, 255))
save(c, 'accessories/hat_crown.png')

# --- Lentes ---
c = canvas(); circle(c, 205, 260, 42, (30, 30, 30, 255), inner=34); circle(c, 307, 260, 42, (30, 30, 30, 255), inner=34); rect(c, 245, 255, 267, 265, (30, 30, 30, 255)); save(c, 'accessories/glasses_round.png')
c = canvas(); circle(c, 205, 260, 42, (20, 20, 20, 255)); circle(c, 307, 260, 42, (20, 20, 20, 255)); rect(c, 245, 252, 267, 264, (20, 20, 20, 255)); save(c, 'accessories/glasses_sun.png')
c = canvas(); rect(c, 160, 230, 252, 290, (0, 220, 120, 255)); rect(c, 260, 230, 352, 290, (0, 220, 120, 255)); rect(c, 252, 250, 260, 262, (0, 220, 120, 255)); save(c, 'accessories/glasses_pixel.png')
