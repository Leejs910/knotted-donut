// 📦 온라인 샵 배너 — 끊임없이 흐르는 컨베이어 레일 + 무작위로 지나가는 상자
//
// 레일 그림은 index.html 의 .trail-track 과 같은 것(img/trail2.svg)을 씁니다.
// 다만 그쪽은 Swiper 로 '일정한 간격'의 상품 번들(상자 + 카드)을 흘려보냅니다.
// 여기서는 상자만 보내고, 간격·색·크기를 매번 무작위로 띄웁니다.
//
// ⚠️ 레일을 background-position 으로 밀지 않습니다.
//    그 속성은 GPU 합성이 되지 않아 매 프레임 배너 전체를 메인 스레드에서
//    다시 칠합니다. 배율 200% 화면에서는 칠할 픽셀이 4배라 그게 끊김으로
//    보입니다. (같은 문제를 css/components/truck-scene.css 에 적어 두었습니다)
//    레일 띠를 '배너 폭 + 무늬 한 장' 으로 넓게 깔아 두고 transform 으로
//    밀면 합성만으로 끝나서 다시 칠하지 않습니다.
//
// ⚠️ 레일과 상자를 같은 루프에서 같은 속도로 움직입니다. 둘을 따로
//    (예: 레일은 CSS 애니메이션, 상자는 JS) 움직이면 미끄러져 보입니다.
//
// 필요 요소: #shopBeltRail, #shopBeltBoxes
// 필요 CSS: css/sections/shop-belt.css
// 필요 에셋: img/trail2.svg, img/box{Pink,Blue,Green,Yellow}.png

// ⭐ 이 값들만 바꾸면 움직임을 조절할 수 있습니다.
const SETTINGS = {
    SPEED: 110,      // 레일과 상자가 흐르는 속도 (px/초)

    // 상자 사이 간격 — 레일이 이만큼 흐른 뒤 다음 상자가 올라옵니다.
    // 매번 이 범위에서 새로 뽑으므로 줄이 고르지 않습니다.
    GAP_MIN: 240,
    GAP_MAX: 620,

    SCALE_MIN: 0.86, // 상자 크기 흔들림 (1 이 --box-h 그대로)
    SCALE_MAX: 1.14,
};

// 레일 그림 한 장의 비율 (trail2.svg 가 1455 x 357)
const TILE_RATIO = 1455 / 357;

// 상자 그림의 비율 (box*.png 가 283 x 219).
// 높이는 CSS 가 정하므로, 폭은 이 비율로 계산합니다.
// ⚠️ offsetWidth 를 쓰면 안 됩니다. 그림이 아직 안 받아졌을 때 0 이 나와
//    상자가 화면 왼쪽에서 지워지지 않습니다.
const BOX_RATIO = 283 / 219;

const BOX_IMAGES = [
    './img/boxPink.png',
    './img/boxBlue.png',
    './img/boxGreen.png',
    './img/boxYellow.png',
];

const rand = (min, max) => min + Math.random() * (max - min);

export function initShopBeltBanner() {
    const rail = document.getElementById('shopBeltRail');
    const stage = document.getElementById('shopBeltBoxes');
    if (!rail || !stage) return;

    const banner = rail.closest('.page-banner') || rail.parentElement;
    if (!banner) return;

    // 움직임을 불편해하는 사용자에게는 느리게 — 멈추지는 않습니다.
    // (멈추면 '컨베이어' 라는 화면의 뜻이 사라집니다)
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const speed = SETTINGS.SPEED * (calm ? 0.45 : 1);

    let stageWidth = 0;
    let tileWidth = 0;
    let railOffset = 0;      // 레일 띠가 왼쪽으로 밀린 거리 (음수)
    let travelToNext = 0;    // 다음 상자까지 남은 거리
    let lastImage = -1;      // 같은 색이 연달아 나오지 않게

    const boxes = [];        // { el, x, w }

    function measure() {
        stageWidth = banner.clientWidth;
        tileWidth = rail.clientHeight * TILE_RATIO;

        // 띠를 '배너 폭 + 무늬 한 장' 으로 넓혀 둡니다.
        // 한 장만큼 밀어도 오른쪽에 빈 틈이 생기지 않습니다.
        rail.style.width = `${Math.ceil(stageWidth + tileWidth)}px`;

        // 배너 높이가 줄면 무늬 한 장도 좁아집니다. 이미 그보다 많이 밀려
        // 있으면 한 바퀴 범위를 벗어나므로 되감아 둡니다.
        if (tileWidth > 0) railOffset = -(Math.abs(railOffset) % tileWidth);
    }

    function boxHeight() {
        // CSS 가 정한 상자 높이 (--box-h). 비율로 적혀 있어도 px 로 돌아옵니다.
        const probe = stage.querySelector('.shop-belt-box');
        if (probe) return probe.offsetHeight;
        return banner.clientHeight * 0.38; // 아직 한 개도 없을 때의 어림값
    }

    function spawn(startX) {
        // 같은 색을 연달아 쓰지 않습니다
        let i = Math.floor(Math.random() * BOX_IMAGES.length);
        if (i === lastImage) i = (i + 1) % BOX_IMAGES.length;
        lastImage = i;

        const el = document.createElement('img');
        el.className = 'shop-belt-box';
        el.src = BOX_IMAGES[i];
        el.alt = '';                 // 장식입니다 — 읽어 줄 내용이 없습니다
        el.setAttribute('aria-hidden', 'true');
        el.decoding = 'async';
        el.loading = 'eager';        // 지나가는 중에 떠오르면 눈에 띕니다

        const scale = rand(SETTINGS.SCALE_MIN, SETTINGS.SCALE_MAX);
        el.style.setProperty('--box-scale', scale.toFixed(3));

        stage.appendChild(el);

        const h = boxHeight() * scale;
        const box = { el, x: stageWidth - startX, w: h * BOX_RATIO };
        el.style.transform = `translate3d(${box.x.toFixed(2)}px, 0, 0)`;
        boxes.push(box);
    }

    // 처음부터 상자가 깔려 있게 합니다.
    // ⚠️ 이게 없으면 배너가 한동안 텅 비어 있습니다. requestAnimationFrame 이
    //    돌지 않는 환경(숨은 탭 등)에서는 영영 비어 있게 됩니다.
    function prefill() {
        let x = 0;
        while (x < stageWidth + 200) {
            spawn(x);
            x += rand(SETTINGS.GAP_MIN, SETTINGS.GAP_MAX);
        }
        travelToNext = rand(SETTINGS.GAP_MIN, SETTINGS.GAP_MAX);
    }

    let last = performance.now();

    function frame(now) {
        // 한 프레임이 길어졌을 때 그만큼 더 움직여 실제 흐른 시간과 맞춥니다.
        // (상한은 탭을 한참 떠났다 돌아왔을 때 순간이동만 막는 정도)
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;

        const move = speed * dt;

        // ① 레일 — 한 장만큼 흘렀으면 되돌립니다 (반복 무늬라 이음매 없음)
        if (tileWidth > 0) {
            railOffset -= move;
            if (railOffset <= -tileWidth) railOffset += tileWidth;
            rail.style.transform = `translate3d(${railOffset.toFixed(2)}px, 0, 0)`;
        }

        // ② 상자 — 레일과 같은 속도라 레일 위에 놓인 것처럼 보입니다
        for (let i = boxes.length - 1; i >= 0; i -= 1) {
            const box = boxes[i];
            box.x -= move;

            if (box.x + box.w < -40) {
                box.el.remove();
                boxes.splice(i, 1);
                continue;
            }
            box.el.style.transform = `translate3d(${box.x.toFixed(2)}px, 0, 0)`;
        }

        // ③ 다음 상자
        travelToNext -= move;
        while (travelToNext <= 0) {
            // 남은 거리만큼 이미 진행한 자리에 놓습니다.
            // 그냥 오른쪽 끝에 두면, 프레임이 밀린 뒤 여러 개가 한 자리에
            // 겹쳐 나옵니다.
            spawn(-travelToNext);
            travelToNext += rand(SETTINGS.GAP_MIN, SETTINGS.GAP_MAX);
        }

        requestAnimationFrame(frame);
    }

    // 창 크기가 바뀌면 띠 폭과 무늬 한 장 폭을 다시 잽니다.
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(measure, 150);
    });

    measure();
    prefill();
    requestAnimationFrame(frame);
}
