// ☁️ 고객센터 상단 배너 — 구름이 왼쪽에서 오른쪽으로 아주 천천히 흘러갑니다
//
// SVG를 <img> 로 넣으면 안쪽 그룹(#cloudGroup)을 따로 움직일 수 없어서,
// 파일을 받아 와 문서 안에 그대로 펼친 뒤(인라인) 그룹을 직접 제어합니다.
// (cart.html 의 js/modules/cartBanner.js 와 같은 방식입니다)
//
// 끊김 없이 돌리는 방법
//   구름 그룹을 한 벌 복제해 원본 왼쪽(-viewBox 폭)에 붙여 두고,
//   둘을 담은 트랙을 0 → viewBox 폭 만큼 밀어냅니다.
//   다 밀면 복제본이 원본이 있던 자리에 정확히 놓이므로, 거기서 0 으로
//   되돌려도 화면은 그대로입니다. 이음매가 보이지 않습니다.
//
// 필요 요소: #supportBannerArt
// 필요 CSS: css/sections/support-banner.css
// 필요 에셋: img/supportBanner.svg (안에 id="cloudGroup" 이 있어야 합니다)

const SVG_URL = './img/supportBanner.svg';

export async function initSupportBanner({
    // 🎚️ 구름이 한 바퀴 도는 데 걸리는 시간(초). 키울수록 느려집니다.
    cloudDuration = 180,
} = {}) {
    const holder = document.getElementById('supportBannerArt');
    if (!holder) return;

    let svgText;
    try {
        const res = await fetch(SVG_URL);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        svgText = await res.text();
    } catch (err) {
        console.warn(`[supportBanner] ${SVG_URL} 를 불러오지 못했습니다.`, err);
        holder.classList.add('is-missing');
        return;
    }

    holder.innerHTML = svgText;

    const svg = holder.querySelector('svg');
    if (!svg) return;

    svg.removeAttribute('width');
    svg.removeAttribute('height');

    // 배너를 가득 채웁니다. 그림 아래쪽(언덕과 캐릭터)이 중요하므로
    // 세로로 잘릴 때 위쪽을 먼저 버리도록 Max(아래 정렬)로 둡니다.
    svg.setAttribute('preserveAspectRatio', 'xMidYMax slice');

    const clouds = svg.querySelector('#cloudGroup');
    if (!clouds) {
        console.warn('[supportBanner] SVG 안에서 #cloudGroup 을 찾지 못했습니다.');
        return;
    }

    // viewBox 폭 = 한 바퀴 밀어낼 거리
    const viewBox = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
    const width = viewBox[2];
    if (!width) return;

    // 구름 그룹을 트랙으로 감싸고, 왼쪽에 복제본을 한 벌 더 붙입니다.
    const ns = 'http://www.w3.org/2000/svg';
    const track = document.createElementNS(ns, 'g');
    track.setAttribute('class', 'cloud-track');

    clouds.parentNode.insertBefore(track, clouds);
    track.appendChild(clouds);

    const twin = clouds.cloneNode(true);
    twin.removeAttribute('id');            // id 는 문서에 하나만 있어야 합니다
    twin.setAttribute('class', 'cloud-twin');
    twin.setAttribute('transform', `translate(${-width} 0)`);
    track.appendChild(twin);

    // 움직임을 불편해하는 사용자에게는 더 느리게. 끄지는 않습니다 —
    // 구름이 흐르는 것 자체가 이 배너에서 의도한 연출이라서요.
    // (1.5 배까지만 늦춥니다. 더 늘리면 이 설정을 켠 환경에서는 아예
    //  멈춘 것처럼 보여서 '구름이 안 움직인다'가 되어 버립니다)
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    track.style.setProperty('--cloud-shift', `${width}px`);
    track.style.setProperty('--cloud-duration', `${cloudDuration * (calm ? 1.5 : 1)}s`);
}
