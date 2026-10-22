// 🧸 구름 접시 위의 친구들 — 접시가 통통 튀어오르고 뒤에서 고개를 내밉니다
//
// SVG를 <img> 로 넣으면 안쪽 조각(#plate, #donutcake, #pinkbear …)을 따로
// 움직일 수 없어서, 파일을 받아 와 문서 안에 그대로 펼칩니다(인라인).
// (support.html 의 js/modules/supportBanner.js 와 같은 방식입니다)
//
// 움직임의 순서와 모양은 전부 css/sections/brand-hero.css 가 가집니다.
// 여기서는 그림을 펼쳐 넣는 일만 합니다.
//   · 접시 + 도넛케이크 : 젤리처럼 통통 튀며 나타납니다
//     (menu.html 의 .shop-tabs-badge.animate-bounce 와 같은 곡선)
//   · 분홍곰 · 파랑강아지 · 토끼 : 접시 뒤에서 차례로 고개를 올립니다
//
// 필요 요소: #brandDolls
// 필요 CSS: css/sections/brand-hero.css
// 필요 에셋: img/brand/dolls.svg (안에 id="plate" 등이 있어야 합니다)

const SVG_URL = './img/brand/dolls.svg';

// 이 id 들이 있어야 각자 따로 움직일 수 있습니다
const PARTS = ['plate', 'donutcake', 'pinkbear', 'bluedog', 'rabbit'];

export async function initBrandDolls() {
    const holder = document.getElementById('brandDolls');
    if (!holder) return;

    let svgText;
    try {
        const res = await fetch(SVG_URL);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        svgText = await res.text();
    } catch (err) {
        console.warn(`[brandDolls] ${SVG_URL} 를 불러오지 못했습니다.`, err);
        holder.classList.add('is-missing');
        return;
    }

    holder.innerHTML = svgText;

    const svg = holder.querySelector('svg');
    if (!svg) return;

    // 크기는 CSS(.brand-dolls)가 정합니다
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // ⚠️ 조각이 튀어오를 때 그림 상자 밖으로 조금 나갑니다. 잘리지 않게 둡니다.
    svg.style.overflow = 'visible';

    const missing = PARTS.filter((id) => !svg.querySelector(`#${id}`));
    if (missing.length) {
        console.warn('[brandDolls] SVG 안에서 못 찾은 조각:', missing.join(', '));
    }

    // 그림이 들어온 뒤에야 애니메이션을 겁니다.
    // (먼저 걸면 조각이 없어서 아무 일도 일어나지 않습니다)
    holder.classList.add('is-loaded');
}
