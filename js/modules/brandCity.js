// 🏙️ 맨 아래 도시 풍경 — 구름이 아주 천천히 왼쪽으로 흘러가 사라집니다
//
// SVG를 <img> 로 넣으면 안쪽 #cloudGroup 을 따로 움직일 수 없어서,
// 파일을 받아 와 문서 안에 그대로 펼칩니다(인라인).
// (support.html 의 js/modules/supportBanner.js 와 같은 방식입니다)
//
// ⚠️ 여기서는 배너처럼 '무한 반복'이 아닙니다. 한 번 왼쪽으로 빠져나가면
//    새로고침하기 전까지 다시 나타나지 않습니다. 그래서 복제본을 두지 않고,
//    애니메이션도 한 번만(forwards) 돌립니다.
//
// 밀어낼 거리는 그림마다 다르므로 #cloudGroup 의 실제 크기를 재서 정합니다.
// 왼쪽 끝(x)에 폭을 더하면 '오른쪽 끝이 화면 왼쪽 밖으로 나가는' 거리가 됩니다.
//
// 필요 요소: #brandCity
// 필요 CSS: css/sections/brand-outro.css
// 필요 에셋: img/brand/cityscape.svg (안에 id="cloudGroup" 이 있어야 합니다)

import { playOnceOnView } from './playOnceOnView.js';

const SVG_URL = './img/brand/cityscape.svg';

export async function initBrandCity() {
    const holder = document.getElementById('brandCity');
    if (!holder) return;

    let svgText;
    try {
        const res = await fetch(SVG_URL);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        svgText = await res.text();
    } catch (err) {
        console.warn(`[brandCity] ${SVG_URL} 를 불러오지 못했습니다.`, err);
        holder.classList.add('is-missing');
        return;
    }

    holder.innerHTML = svgText;

    const svg = holder.querySelector('svg');
    if (!svg) return;

    // 크기는 CSS 가 정합니다 (가로 100%, 세로는 비율대로)
    svg.removeAttribute('width');
    svg.removeAttribute('height');

    const clouds = svg.querySelector('#cloudGroup');
    if (!clouds) {
        console.warn('[brandCity] SVG 안에서 #cloudGroup 을 찾지 못했습니다.');
        return;
    }

    // 구름 뭉치의 오른쪽 끝이 그림 왼쪽 밖으로 나가는 거리 (+여유 40)
    const box = clouds.getBBox();
    const shift = Math.ceil(box.x + box.width) + 40;
    clouds.style.setProperty('--cloud-shift', `${shift}px`);

    // 화면에 들어왔을 때 딱 한 번 출발합니다.
    // (페이지를 열자마자 시작하면, 한참 스크롤해 내려왔을 때는 이미
    //  절반쯤 흘러가 버려서 움직이는 걸 못 봅니다)
    playOnceOnView(holder, () => holder.classList.add('is-drifting'), {
        threshold: 0.1,
        bottomOffset: 0.1,
    });
}
