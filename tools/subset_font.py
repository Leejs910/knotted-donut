# -*- coding: utf-8 -*-
"""
TTF 글꼴에서 '쓰는 글자만' 남겨 작게 만듭니다. (외부 라이브러리 없음)

왜 필요한가
    신촌랩소디 원본은 한글이 전부 들어 있어 1.78MB 입니다.
    brand.html 은 영문 대문자 몇 개만 쓰므로, 그 글리프만 남기면 15KB 가 됩니다.

쓰는 법
    python tools/subset_font.py <원본.ttf> <결과.ttf> "<남길 글자들>"

실제로 쓴 명령 (font/SinchonRhapsody-ExtraBold-subset.ttf 를 만든 줄)
    python tools/subset_font.py "SinchonRhapsodyTTF-ExtraBold.ttf"         font/SinchonRhapsody-ExtraBold-subset.ttf         "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,&!?'-"

    → 배경 글자를 다른 영문으로 바꿔도 다시 만들 필요가 없도록
      알파벳·숫자·기호를 통째로 남겨 두었습니다.
      한글을 넣으려면 원본을 구해 그 글자들을 넣고 다시 돌리세요.

⚠️ GPOS/GSUB/kern(커닝·합자)은 버립니다. 제목용 큰 글자라 영향이 없습니다.
"""
import struct, sys

def u16(b, o): return struct.unpack('>H', b[o:o+2])[0]
def s16(b, o): return struct.unpack('>h', b[o:o+2])[0]
def u32(b, o): return struct.unpack('>I', b[o:o+4])[0]

def read_tables(d):
    num = u16(d, 4)
    t = {}
    for i in range(num):
        tag, cs, off, ln = struct.unpack('>4sIII', d[12+16*i:28+16*i])
        t[tag.decode('latin1')] = (off, ln)
    return t

def parse_cmap(d, off, ln):
    n = u16(d, off+2)
    best = None
    for i in range(n):
        pid, eid, sub = struct.unpack('>HHI', d[off+4+8*i:off+12+8*i])
        if u16(d, off+sub) == 4 and (pid, eid) in ((3, 1), (3, 10), (0, 3), (0, 4)):
            best = off + sub
            if (pid, eid) == (3, 1):
                break
    if best is None:
        raise SystemExit('no format-4 cmap subtable')
    segX2 = u16(d, best+6)
    seg = segX2 // 2
    endO = best + 14
    startO = endO + segX2 + 2
    deltaO = startO + segX2
    rangeO = deltaO + segX2
    m = {}
    for i in range(seg):
        end = u16(d, endO+2*i)
        sta = u16(d, startO+2*i)
        dlt = s16(d, deltaO+2*i)
        rng = u16(d, rangeO+2*i)
        if sta == 0xFFFF:
            continue
        for c in range(sta, end+1):
            if rng == 0:
                g = (c + dlt) & 0xFFFF
            else:
                gi = rangeO + 2*i + rng + 2*(c-sta)
                if gi + 2 > len(d):
                    continue
                g = u16(d, gi)
                if g:
                    g = (g + dlt) & 0xFFFF
            if g:
                m[c] = g
    return m

def glyph_range(fmt, loca, g):
    if fmt == 0:
        return u16(loca, 2*g)*2, u16(loca, 2*g+2)*2
    return u32(loca, 4*g), u32(loca, 4*g+4)

def components(glyf, s, e):
    """Positions and glyph ids referenced by a composite glyph."""
    if e - s < 10:
        return []
    if s16(glyf, s) >= 0:
        return []
    o = s + 10
    out = []
    while True:
        flags = u16(glyf, o)
        gi = u16(glyf, o+2)
        out.append((o+2, gi))
        o += 4
        o += 4 if (flags & 1) else 2
        if flags & 0x0008:
            o += 2
        elif flags & 0x0040:
            o += 4
        elif flags & 0x0080:
            o += 8
        if not (flags & 0x0020):
            break
    return out

def build_cmap4(mapping):
    chars = sorted(mapping)
    segs = []
    i = 0
    while i < len(chars):
        j = i
        while j + 1 < len(chars) and chars[j+1] == chars[j] + 1:
            j += 1
        segs.append((chars[i], chars[j]))
        i = j + 1
    segs.append((0xFFFF, 0xFFFF))
    n = len(segs)
    ends = b''.join(struct.pack('>H', e) for s, e in segs)
    stas = b''.join(struct.pack('>H', s) for s, e in segs)
    deltas = b''
    ranges = b''
    tail = []
    for k, (s, e) in enumerate(segs):
        if s == 0xFFFF:
            deltas += struct.pack('>h', 1)
            ranges += struct.pack('>H', 0)
            continue
        deltas += struct.pack('>h', 0)
        ranges += struct.pack('>H', (n - k) * 2 + len(tail) * 2)
        for c in range(s, e+1):
            tail.append(mapping[c])
    glyphs = b''.join(struct.pack('>H', g) for g in tail)
    arrays = ends + b'\x00\x00' + stas + deltas + ranges + glyphs
    # format 4 머리말은 일곱 칸입니다:
    #   format, length, language, segCountX2, searchRange, entrySelector, rangeShift
    # rangeShift 를 빠뜨리면 뒤의 배열이 2바이트씩 밀려 글꼴이 통째로 깨집니다.
    sr = 2
    while sr * 2 <= n * 2:
        sr *= 2
    es = sr.bit_length() - 2
    sub = struct.pack('>HHHHHHH', 4, 14 + len(arrays), 0, n*2, sr, es, n*2 - sr) + arrays
    return struct.pack('>HHHHI', 0, 1, 3, 1, 12) + sub

def pad4(b):
    return b + b'\x00' * ((4 - len(b) % 4) % 4)

def csum(b):
    b = pad4(b)
    s = 0
    for i in range(0, len(b), 4):
        s = (s + u32(b, i)) & 0xFFFFFFFF
    return s

def subset(src, dst, text):
    d = open(src, 'rb').read()
    T = read_tables(d)
    head = bytearray(d[T['head'][0]:T['head'][0]+T['head'][1]])
    loca_fmt = s16(head, 50)
    maxp = bytearray(d[T['maxp'][0]:T['maxp'][0]+T['maxp'][1]])
    numGlyphs = u16(maxp, 4)
    hhea = bytearray(d[T['hhea'][0]:T['hhea'][0]+T['hhea'][1]])
    numH = u16(hhea, 34)
    loca = d[T['loca'][0]:T['loca'][0]+T['loca'][1]]
    glyf = d[T['glyf'][0]:T['glyf'][0]+T['glyf'][1]]
    hmtx = d[T['hmtx'][0]:T['hmtx'][0]+T['hmtx'][1]]
    cm = parse_cmap(d, *T['cmap'])

    want = {0}
    cmap_new = {}
    for ch in sorted(set(text)):
        g = cm.get(ord(ch))
        if g is None:
            print('  missing char:', repr(ch))
            continue
        want.add(g)
        cmap_new[ord(ch)] = g

    stack = list(want)
    while stack:
        g = stack.pop()
        s, e = glyph_range(loca_fmt, loca, g)
        for _, gi in components(glyf, s, e):
            if gi not in want:
                want.add(gi)
                stack.append(gi)

    order = sorted(want)
    remap = {old: new for new, old in enumerate(order)}
    cmap_new = {c: remap[g] for c, g in cmap_new.items()}

    new_glyf = bytearray()
    new_loca = []
    for old in order:
        new_loca.append(len(new_glyf))
        s, e = glyph_range(loca_fmt, loca, old)
        data = bytearray(glyf[s:e])
        for pos, gi in components(glyf, s, e):
            struct.pack_into('>H', data, pos - s, remap[gi])
        new_glyf += data
        new_glyf += b'\x00' * ((4 - len(new_glyf) % 4) % 4)
    new_loca.append(len(new_glyf))
    loca_b = b''.join(struct.pack('>I', v) for v in new_loca)

    struct.pack_into('>h', head, 50, 1)
    struct.pack_into('>I', head, 8, 0)
    struct.pack_into('>H', maxp, 4, len(order))

    def metric(g):
        if g < numH:
            return struct.unpack('>Hh', hmtx[4*g:4*g+4])
        aw = struct.unpack('>H', hmtx[4*(numH-1):4*(numH-1)+2])[0]
        lsb = s16(hmtx, 4*numH + 2*(g-numH))
        return aw, lsb

    hmtx_b = b''.join(struct.pack('>Hh', *metric(g)) for g in order)
    struct.pack_into('>H', hhea, 34, len(order))

    out = {
        'head': bytes(head), 'hhea': bytes(hhea), 'maxp': bytes(maxp),
        'OS/2': d[T['OS/2'][0]:T['OS/2'][0]+T['OS/2'][1]],
        'name': d[T['name'][0]:T['name'][0]+T['name'][1]],
        'cmap': build_cmap4(cmap_new),
        'loca': loca_b, 'glyf': bytes(new_glyf), 'hmtx': hmtx_b,
        # post 3.0 — 글리프 이름 없음. 머리말 32바이트가 전부입니다.
        'post': struct.pack('>IihhIIIII', 0x00030000, 0, 0, 0, 0, 0, 0, 0, 0),
    }
    for t in ('cvt ', 'fpgm', 'prep', 'gasp'):
        if t in T:
            out[t] = d[T[t][0]:T[t][0]+T[t][1]]

    tags = sorted(out)
    n = len(tags)
    sr = 1
    while sr * 2 <= n:
        sr *= 2
    hdr = struct.pack('>IHHHH', 0x00010000, n, sr*16, (sr).bit_length()-1, n*16 - sr*16)
    off = 12 + 16*n
    dirb = b''
    body = b''
    for t in tags:
        b = out[t]
        dirb += struct.pack('>4sIII', t.encode('latin1'), csum(b), off, len(b))
        body += pad4(b)
        off += len(pad4(b))
    font = hdr + dirb + body
    total = (0xB1B0AFBA - csum(font)) & 0xFFFFFFFF
    hstart = u32(font, 12 + 16*tags.index('head') + 8)
    font = font[:hstart+8] + struct.pack('>I', total) + font[hstart+12:]
    open(dst, 'wb').write(font)
    print('  %d bytes -> %d bytes  (glyphs %d -> %d)' % (len(d), len(font), numGlyphs, len(order)))

subset(sys.argv[1], sys.argv[2], sys.argv[3])
