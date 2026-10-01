# -*- coding: utf-8 -*-
"""
cart.html 상단 배너 SVG(img/cartBanner.svg)를 만듭니다.

C:/Users/Lee/Downloads/SVG/shopbags/shoppingBag1~5.svg 를 하나로 합칩니다.
일러스트레이터가 내보낸 파일은 전부 .cls-1, .cls-2 ... 같은 같은 이름의 클래스와
id(shadow 등)를 쓰기 때문에, 그대로 한 문서에 넣으면 서로 덮어써서 색이 뒤섞입니다.
그래서 파일마다 b1 / b2 ... 접두사를 붙여 떼어 놓습니다.

애니메이션이 잡을 수 있도록 각 가방에 클래스를 달아 둡니다.
  · .bag-body   — 튀어오르는 가방 전체 (원본의 shopping_bag 그룹)
  · .bag-shadow — 바닥 그림자 타원을 감싼 그룹 (원본의 shadow 그룹)

다시 만들려면:  python tools/build_cart_banner.py
"""
import re
import pathlib

SRC_DIR = pathlib.Path(r'C:/Users/Lee/Downloads/SVG/shopbags')
OUT = pathlib.Path('img/cartBanner.svg')

# --- 배너 전체 좌표계 (스크린샷 비율) ---
VB_W, VB_H = 1920.0, 404.0
FLOOR_Y = 228.0          # 초록 / 핑크 경계선
GREEN, PINK = '#50BD83', '#FFC9E1'

# --- 가방 배치 ---
# BAG_H 는 404 보다 작게 둡니다. 위로는 점프할 공간이, 아래로는 그림자가
# 배너 바닥에 딱 붙어 잘리지 않을 공간이 필요합니다.
BAG_H = 340.0            # 가방 한 개의 높이
BOTTOM_PAD = 16.0        # 그림자 아래로 남기는 여백
COUNT = 5


def read_parts(path):
    """원본 SVG에서 viewBox / style / 그림 알맹이를 꺼냅니다."""
    t = path.read_text(encoding='utf-8')
    vb = re.search(r'viewBox="([^"]+)"', t).group(1)
    style = ''
    m = re.search(r'<style>(.*?)</style>', t, re.S)
    if m:
        style = m.group(1)
    # <metadata> 안의 <?xpacket ...?> 는 중첩하면 깨지므로 버립니다.
    t = re.sub(r'<metadata>.*?</metadata>', '', t, flags=re.S)
    t = re.sub(r'<defs>.*?</defs>', '', t, flags=re.S)

    # 바깥 <svg> 껍데기를 벗기고 안쪽만 가져옵니다.
    # ⚠️ 먼저 <?xml ... ?> 선언을 지워야 합니다. 이게 남아 있으면 '첫 번째 >' 가
    #    선언의 ?> 라서 정작 <svg> 여는 태그가 안쪽에 그대로 남고, 닫는 </svg> 만
    #    떨어져 나갑니다. 그 결과 가방 5개가 서로 안으로 말려 들어갑니다.
    t = re.sub(r'<\?xml[^>]*\?>', '', t)
    t = re.sub(r'<!DOCTYPE[^>]*>', '', t, flags=re.I)
    m = re.search(r'<svg\b[^>]*>(.*)</svg>', t, re.S)
    if not m:
        raise SystemExit(f'{path.name}: <svg> 를 찾지 못했습니다')
    return vb, style, m.group(1)


def namespace(style, inner, n):
    """클래스와 id 에 b{n} 접두사를 붙여 파일끼리 충돌하지 않게 합니다."""
    pre = f'b{n}'
    style = re.sub(r'\.cls-(\d+)', rf'.{pre}cls-\1', style)

    def fix_class(m):
        names = [f'{pre}{c}' if c.startswith('cls-') else c for c in m.group(1).split()]
        return 'class="' + ' '.join(names) + '"'

    inner = re.sub(r'class="([^"]*)"', fix_class, inner)
    inner = re.sub(r'id="([^"]*)"', lambda m: f'id="{pre}-{m.group(1)}"', inner)
    return style, inner


def tag_targets(inner, n):
    """애니메이션이 잡을 .bag-shadow / .bag-body 클래스를 달아 줍니다.

    그림자는 파일에 따라 shadow 안에 shadow-2 가 한 번 더 있습니다.
    실제로 타원을 직접 감싼 쪽(= 가장 안쪽)에 클래스를 붙여야 크기 조절이 먹습니다.
    """
    pre = f'b{n}'
    # 가장 안쪽 그림자 그룹 = 바로 다음에 <ellipse 가 오는 <g>
    def shadow_repl(m):
        return m.group(0).replace('<g ', '<g class="bag-shadow" ', 1) \
            if 'class=' not in m.group(1) else \
            m.group(0).replace(m.group(1), m.group(1).replace('class="', 'class="bag-shadow ', 1))
    inner = re.sub(r'<g ([^>]*id="' + pre + r'-shadow(?:-2)?"[^>]*)>(?=\s*<ellipse)',
                   shadow_repl, inner)

    # 가방 본체 그룹 — id 가 파일마다 제각각(shoppinbag1, shoppingBags2, shopping_bag ...)
    inner = re.sub(r'<g (id="' + pre + r'-shopp[^"]*")>',
                   r'<g \1 class="bag-body">', inner)
    return inner


bags, styles = [], []
for i in range(1, COUNT + 1):
    vb, style, inner = read_parts(SRC_DIR / f'shoppingBag{i}.svg')
    style, inner = namespace(style, inner, i)
    inner = tag_targets(inner, i)
    styles.append(style.strip())
    bags.append((vb, inner))

# 가로로 나란히 — 양끝과 사이사이에 같은 간격을 둡니다.
#
# ⚠️ 중첩 <svg> 대신 <g transform> 을 씁니다.
#    VS Code 의 Live Server 는 응답에서 </svg> 를 찾을 때마다 자기 새로고침
#    스크립트를 끼워 넣습니다. 중첩 <svg> 가 5개면 네 번이나 끼어들면서
#    파일이 중간에서 잘려, 5번 가방의 색이 통째로 날아갔습니다.
#    <g> 로 바꾸면 파일 전체에 </svg> 가 딱 하나(맨 끝)뿐이라 안전합니다.
#    덤으로 <g> 는 잘라내지도 않아서, 점프가 위로 잘릴 걱정도 없습니다.
sizes = []
for vb, _ in bags:
    vb_w, vb_h = float(vb.split()[2]), float(vb.split()[3])
    s = BAG_H / vb_h                 # 높이를 BAG_H 로 맞추는 배율
    sizes.append((s, vb_w * s))

gap = (VB_W - sum(w for _, w in sizes)) / (COUNT + 1)
y = VB_H - BOTTOM_PAD - BAG_H

parts = []
x = gap
for i, ((s, w), (vb, inner)) in enumerate(zip(sizes, bags)):
    parts.append(
        f'  <g class="bag" transform="translate({x:.2f} {y:.2f}) scale({s:.5f})">\n'
        f'{inner}\n  </g>'
    )
    x += w + gap

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {VB_W:.0f} {VB_H:.0f}" overflow="visible">
  <!-- ⚠️ 이 파일은 tools/build_cart_banner.py 가 만듭니다. 직접 고치지 마세요.
       원본: Downloads/SVG/shopbags/shoppingBag1~5.svg -->
  <style>
    /* 가방 5개가 각자 다른 파일에서 왔고 클래스 이름이 겹쳐서,
       파일마다 b1 / b2 ... 접두사를 붙여 두었습니다. */
{chr(10).join('    ' + s.replace(chr(10), chr(10) + '    ') for s in styles)}
  </style>

  <!-- 맨 뒤: 초록 배경. 배너 비율이 어떻게 바뀌어도 덮이도록 넉넉하게 그립니다. -->
  <rect x="{-VB_W:.0f}" y="{-VB_H * 3:.0f}" width="{VB_W * 3:.0f}" height="{VB_H * 4 + FLOOR_Y:.0f}" fill="{GREEN}"/>

  <!-- 그 다음: 핑크 바닥 -->
  <rect x="{-VB_W:.0f}" y="{FLOOR_Y:.0f}" width="{VB_W * 3:.0f}" height="{VB_H * 4:.0f}" fill="{PINK}"/>

  <!-- 맨 앞: 쇼핑백 5개 -->
{chr(10).join(parts)}
</svg>
'''

OUT.write_text(svg, encoding='utf-8')
print(f'{OUT} created: {OUT.stat().st_size:,} bytes')
print(f'bags {[round(w, 1) for _, w in sizes]} x {BAG_H:.0f}, gap {gap:.1f}, floor y={FLOOR_Y:.0f}')
