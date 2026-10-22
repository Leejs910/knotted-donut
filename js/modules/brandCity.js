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
// 두 곳에서 같은 그림을 씁니다 — brand.html 맨 아래와 mypage.html 배너.
// 그래서 '어느 칸에 펼칠지' 와 '어떻게 채울지' 를 밖에서 받습니다.
//
// 필요 요소: 넘겨 준 holder (기본 #brandCity)
// 필요 CSS: css/sections/brand-outro.css / css/sections/mypage.css
// 필요 에셋: img/brand/cityscape.svg (안에 id="cloudGroup" 이 있어야 합니다)

import { playOnceOnView } from './playOnceOnView.js';

const SVG_URL = './img/brand/cityscape.svg';

export async function initBrandCity({
    // 그림을 펼칠 칸
    holder = document.getElementById('brandCity'),
    // 배너처럼 납작한 칸에서는 그림을 채워 넣고 아래쪽(도시)을 남깁니다.
    // 본문처럼 비율대로 놓을 때는 meet 로 둡니다.
    fit = null,
    // 구름을 쓸지. false 면 구름 뭉치를 아예 지우고 흘러가는 연출도 걸지
    // 않습니다. 그림에 배경이 없으므로(rect 가 하나도 없습니다) 구름을
    // 지우면 칸의 바탕색이 그대로 하늘이 됩니다.
    clouds = true,
} = {}) {
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
    if (fit) svg.setAttribute('preserveAspectRatio', fit);

    const cloudGroup = svg.querySelector('#cloudGroup');

    if (!clouds) {
        // 구름을 안 쓰는 칸 — 뭉치를 지우고 끝냅니다.
        // (남겨 두고 CSS 로 숨기면 흘러가는 연출이 보이지 않는 채로 계속 돕니다)
        cloudGroup?.remove();
        holder.classList.add('is-cloudless');
        return;
    }

    if (!cloudGroup) {
        console.warn('[brandCity] SVG 안에서 #cloudGroup 을 찾지 못했습니다.');
        return;
    }

    // 구름 뭉치의 오른쪽 끝이 그림 왼쪽 밖으로 나가는 거리 (+여유 40)
    const box = cloudGroup.getBBox();
    const shift = Math.ceil(box.x + box.width) + 40;
    cloudGroup.style.setProperty('--cloud-shift', `${shift}px`);

    // 화면에 들어왔을 때 딱 한 번 출발합니다.
    // (페이지를 열자마자 시작하면, 한참 스크롤해 내려왔을 때는 이미
    //  절반쯤 흘러가 버려서 움직이는 걸 못 봅니다)
    playOnceOnView(holder, () => holder.classList.add('is-drifting'), {
        threshold: 0.1,
        bottomOffset: 0.1,
    });
}
