// 🛍️ 장바구니 상단 가방 배너
//
// SVG를 <img> 로 넣으면 안쪽의 'middlebeg'(가운데 가방)만 따로 움직일 수 없습니다.
// 그래서 파일을 받아 와 문서 안에 그대로 펼친 뒤(인라인), 그 요소에만 클래스를 붙입니다.
//
// 필요 요소: #cartBannerArt
// 필요 CSS: css/sections/cart-banner.css
// 필요 에셋: img/cartBanner.svg  (피그마 'beg대지 1 사본 1' 프레임)
//   ⚠️ 피그마에서 내보낼 때 Export 설정의 "Include 'id' attribute" 를 켜야
//      가운데 가방이 <g id="middlebeg"> 로 들어옵니다. 이 id 가 있어야 애니메이션이 걸립니다.

import { playOnceOnView } from './playOnceOnView.js';

const SVG_URL = './img/cartBanner.svg';

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

    // 배너가 가로 폭에 맞춰 늘어나도록 고정 크기를 지우고 viewBox 만 남깁니다.
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');

    // 대소문자나 접미사가 붙어도 찾도록 단계적으로 시도합니다.
    const middle =
        svg.querySelector('#middlebeg') ||
        svg.querySelector('[id^="middlebeg" i]') ||
        svg.querySelector('[id*="middlebeg" i]');

    if (!middle) {
        console.warn(
            '[cartBanner] SVG 안에서 middlebeg 를 찾지 못했습니다. ' +
            '피그마에서 Export 시 "Include \'id\' attribute" 를 켜고 다시 내보내 주세요.'
        );
        return;
    }

    middle.classList.add('middlebeg');

    // 🎯 기준점 잡기
    // getBBox() 는 viewBox 좌표계 값을 돌려줍니다. transform-box 를 기본값(view-box)으로
    // 두고 이 좌표를 그대로 쓰면, 브라우저마다 지원이 갈리는 fill-box 를 피할 수 있습니다.
    // (가로 중앙 / 세로 바닥 → 바닥은 붙어 있고 위로 부푸는 느낌)
    try {
        const box = middle.getBBox();
        if (box.width && box.height) {
            middle.style.transformBox = 'view-box';
            middle.style.transformOrigin = `${box.x + box.width / 2}px ${box.y + box.height}px`;
        }
    } catch (e) {
        // 측정에 실패해도 CSS 에 적어 둔 기본 좌표로 동작합니다.
    }

    // 화면에 나올 때 딱 한 번만 재생합니다.
    playOnceOnView(holder, () => {
        middle.classList.add('is-popping');

        // 정말 시작됐는지 한 프레임 뒤에 확인하고, 안 됐으면 이유를 알려 줍니다.
        requestAnimationFrame(() => {
            if (middle.getAnimations && middle.getAnimations().length > 0) return;

            const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            console.warn(
                '[cartBanner] middlebeg 애니메이션이 시작되지 않았습니다.' +
                (reduced
                    ? ' 운영체제의 "동작 줄이기(reduce motion)" 설정이 켜져 있어 건너뛴 것입니다.'
                    : ' 원인을 확인해 주세요.')
            );
        });
    });
}
