// 🛍️ 장바구니 상단 배너 — 쇼핑백 5개가 물결치듯 차례로 튀어오릅니다
//
// SVG를 <img> 로 넣으면 안쪽 그룹을 따로 움직일 수 없어서,
// 파일을 받아 와 문서 안에 그대로 펼친 뒤(인라인) 각 그룹을 직접 제어합니다.
//
// 필요 요소: #cartBannerArt
// 필요 CSS: css/sections/cart-banner.css
// 필요 에셋: img/cartBanner.svg  ← tools/build_cart_banner.py 가 만듭니다
//
// 움직임 계산은 test/shoppingBags_anime.html 의 로직을 그대로 옮겼습니다.
// 가방마다 시작 위상(phase)을 조금씩 어긋나게 줘서 물결처럼 보이게 합니다.

import { playOnceOnView } from './playOnceOnView.js';

const SVG_URL = './img/cartBanner.svg';

// 🎚️ 움직임 조절 — 이 숫자들만 바꾸면 됩니다.
const SETTINGS = {
    SPEED: 0.4,          // 한 번 튀는 데 걸리는 속도 (클수록 빠름)
    BOUNCE_HEIGHT: 170,  // 바닥에서 위로 튀는 높이 (가방 자체 좌표 기준)
    SQUASH: 0.1,         // 착지할 때 좌우로 퍼지는 정도
    STRETCH: 0.1,        // 착지할 때 위아래로 눌리는 정도
    SHADOW_SHRINK: 0.35, // 공중에 떴을 때 그림자가 작아지는 정도

    // 🌊 물결 — 옆 가방과 얼마나 어긋나게 시작할지 (한 사이클을 1로 봤을 때)
    //    0 이면 다섯 개가 동시에 튀고, 0.2 면 정확히 한 바퀴에 걸쳐 퍼집니다.
    WAVE_OFFSET: 0.12,
};

// 0 → 1 → 0. 바닥에서 0, 꼭대기에서 1.
function bounceCurve(phase) {
    return 4 * phase * (1 - phase);
}

export async function initCartBanner() {
    const holder = document.getElementById('cartBannerArt');
    if (!holder) return;

    let svgText;
    try {
        const res = await fetch(SVG_URL);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        svgText = await res.text();
    } catch (err) {
        console.warn(`[cartBanner] ${SVG_URL} 를 불러오지 못했습니다.`, err);
        holder.classList.add('is-missing');
        return;
    }

    holder.innerHTML = svgText;

    const svg = holder.querySelector('svg');
    if (!svg) return;

    svg.removeAttribute('width');
    svg.removeAttribute('height');
    // 배너를 가득 채우되 가방 비율은 지킵니다. 배경 사각형이 viewBox 밖까지
    // 넉넉히 그려져 있어서, 잘려도 초록·핑크가 빈 곳 없이 덮입니다.
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');

    const bodies = [...svg.querySelectorAll('.bag-body')];
    const shadows = [...svg.querySelectorAll('.bag-shadow')];

    if (!bodies.length) {
        console.warn(
            '[cartBanner] SVG 안에서 .bag-body 를 찾지 못했습니다. ' +
            'tools/build_cart_banner.py 로 img/cartBanner.svg 를 다시 만들어 주세요.'
        );
        return;
    }

    // '동작 줄이기'가 켜진 환경에서도 멈추지는 않고, 폭만 줄여 잔잔하게 움직입니다.
    // ⚠️ 여기서 아예 꺼버리면 해당 설정에서는 가방이 전혀 움직이지 않습니다.
    // (0.6 은 '눈에 보이되 과하지 않은' 선입니다. 더 줄이면 이 설정을 켠 환경에서는
    //  움직이지 않는 것처럼 보입니다)
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const height = SETTINGS.BOUNCE_HEIGHT * (calm ? 0.6 : 1);
    const squash = SETTINGS.SQUASH * (calm ? 0.6 : 1);
    const stretch = SETTINGS.STRETCH * (calm ? 0.6 : 1);
    const speed = SETTINGS.SPEED * (calm ? 0.8 : 1);

    let startTime = null;
    let rafId = null;

    function frame(now) {
        if (startTime === null) startTime = now;
        const t = ((now - startTime) / 1000) * speed;

        bodies.forEach((body, i) => {
            // 가방마다 시작점을 어긋나게 해서 물결이 만들어집니다.
            const phase = (((t - i * SETTINGS.WAVE_OFFSET) % 1) + 1) % 1;
            const jump = bounceCurve(phase);

            // 착지 직전·직후에만 아주 잠깐 눌립니다.
            const contact = Math.pow(1 - phase, 14);

            body.style.transform =
                `translateY(${(-jump * height).toFixed(2)}px) ` +
                `scale(${(1 + contact * squash).toFixed(4)}, ${(1 - contact * stretch).toFixed(4)})`;

            const shadow = shadows[i];
            if (shadow) {
                shadow.style.transform =
                    `scaleX(${(1 - jump * SETTINGS.SHADOW_SHRINK).toFixed(4)})`;
            }
        });

        rafId = requestAnimationFrame(frame);
    }

    // 배너가 화면에 들어왔을 때 시작합니다.
    playOnceOnView(holder, () => {
        if (rafId === null) rafId = requestAnimationFrame(frame);
    });

    // 탭을 벗어나 있는 동안은 돌릴 이유가 없습니다.
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        } else if (rafId === null && startTime !== null) {
            startTime = null; // 돌아오면 그 자리에서 이어서
            rafId = requestAnimationFrame(frame);
        }
    });
}
