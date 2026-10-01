// 🐰 주문/결제 상단 배너 — 토끼가 책상 밑에서 쏙 올라옵니다
//
// SVG를 <img> 로 넣으면 안쪽의 'bunny' 만 따로 움직일 수 없어서,
// 파일을 받아 와 문서 안에 그대로 펼친 뒤(인라인) 그 요소에만 클래스를 붙입니다.
// (js/modules/cartBanner.js 와 같은 방식입니다)
//
// 필요 요소: #checkoutBannerArt
// 필요 CSS: css/sections/checkout-banner.css
// 필요 에셋: img/checkoutBanner.svg
//   ⚠️ 피그마 Export 시 "Include 'id' attribute" 를 켜야 <g id="bunny"> 가 들어옵니다.
//
// 책상과 진열대는 SVG 안에서 토끼보다 '나중에' 그려지므로,
// 토끼를 아래로 내리면 별도 처리 없이 자연스럽게 가려집니다.

import { playOnceOnView } from './playOnceOnView.js';

const SVG_URL = './img/checkoutBanner.svg';

// 🎚️ 토끼 등장 높이 조절 — 이 두 숫자만 바꾸면 됩니다 (단위: SVG viewBox 좌표)
//
//   EAR_PEEK : 시작할 때 책상 위로 내밀 높이. 클수록 귀가 더 많이 보입니다.
//              70 → 귀 끝이 살짝, 150 → 귀 전체와 머리 윗부분까지
//   DESK_TOP : 책상 윗선의 y 좌표. 이 SVG에서 책상(Group_7/8)이 578 부근에서
//              시작하므로, 그보다 EAR_PEEK 만큼 위가 토끼의 시작 지점이 됩니다.
const EAR_PEEK = 70;
const DESK_TOP = 578;

export async function initCheckoutBanner() {
    const holder = document.getElementById('checkoutBannerArt');
    if (!holder) return;

    let svgText;
    try {
        const res = await fetch(SVG_URL);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        svgText = await res.text();
    } catch (err) {
        console.warn(`[checkoutBanner] ${SVG_URL} 를 불러오지 못했습니다.`, err);
        holder.classList.add('is-missing');
        return;
    }

    holder.innerHTML = svgText;

    const svg = holder.querySelector('svg');
    if (!svg) return;

    svg.removeAttribute('width');
    svg.removeAttribute('height');
    // 상자를 SVG 원본 비율로 맞춰 뒀으므로 meet 로 두면 잘리는 곳 없이 꽉 찹니다.
    // (slice 로 두면 화면 비율에 따라 양옆이나 위아래가 잘립니다)
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    const bunny =
        svg.querySelector('#bunny') ||
        svg.querySelector('[id^="bunny" i]') ||
        svg.querySelector('[id*="bunny" i]');

    if (!bunny) {
        console.warn(
            '[checkoutBanner] SVG 안에서 bunny 를 찾지 못했습니다. ' +
            '피그마에서 Export 시 "Include \'id\' attribute" 를 켜고 다시 내보내 주세요.'
        );
        return;
    }

    bunny.classList.add('bunny');

    // 🐰 시작 위치를 얼마나 아래로 내릴지 계산합니다.
    //    getBBox() 는 viewBox 좌표계 값이고 SVG transform 도 같은 단위라,
    //    배너가 커지든 작아지든 비율이 저절로 맞습니다.
    //
    //    ✂️ 귀가 보이는 정도를 조절하려면 아래 EAR_PEEK 만 바꾸면 됩니다.
    //       숫자를 키우면 처음부터 더 많이 보이고, 0 이면 책상선에 딱 맞춰 숨습니다.
    //       (음수로 주면 책상 아래로 완전히 사라진 채 시작합니다)
    try {
        const box = bunny.getBBox();
        if (box.height) {
            const travel = Math.round(DESK_TOP - box.y - EAR_PEEK);
            bunny.style.setProperty('--bunny-travel', `${Math.max(0, travel)}px`);
        }
    } catch (e) {
        // 측정에 실패해도 CSS 의 기본값으로 동작합니다.
    }

    // 화면에 보일 때 딱 한 번만 재생합니다.
    playOnceOnView(holder, () => {
        bunny.classList.add('is-rising');

        requestAnimationFrame(() => {
            if (bunny.getAnimations && bunny.getAnimations().length > 0) return;
            console.warn('[checkoutBanner] bunny 애니메이션이 시작되지 않았습니다.');
        });
    });
}
