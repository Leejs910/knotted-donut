// 🚚 결제완료 페이지 상단 배너 — 도로를 달리는 트럭
//
// test/truck7_manual_control.html 의 움직임을 그대로 옮겨온 것입니다.
// (일시정지 / 처음부터 버튼은 쓰지 않습니다)
//
// 흐름: 트럭이 왼쪽에서 들어와 가운데에 서고,
//       그 뒤로는 배경만 왼쪽으로 흘러 앞으로 나아가는 것처럼 보입니다.
//
// 필요 요소: #truckBannerArt (트럭), #ocRoad (도로 배경)
// 필요 CSS: css/sections/order-complete.css
// 필요 에셋: img/truckSide.svg, img/truckBackground.svg

const SVG_URL = './img/truckSide.svg';

// ⭐ 이 값들만 바꾸면 움직임을 조절할 수 있습니다.
const SETTINGS = {
    ENTRY_SPEED: 1000,          // 왼쪽에서 가운데로 들어오는 속도 (px/초)
    BACKGROUND_SPEED: 280,     // 배경이 흘러가는 속도 (px/초)
    WHEEL_SPEED: 840,          // 바퀴 회전 속도 (도/초)

    BOUNCE_POWER: 2,           // 덜컹임 전체 세기 (0이면 없음)
    BOUNCE_FREQUENCY: 5.2,     // 큰 출렁임 주기
    VIBRATION_FREQUENCY_1: 10.8, // 노면의 잔진동
    VIBRATION_FREQUENCY_2: 17.5,
    TILT_POWER: 1.2,           // 좌우로 기울어지는 정도

    ROAD_LINE_FACTOR: 2.4,     // 도로 점선이 먼 배경보다 몇 배 빨리 흐를지 (원근감)
};

// 배경 SVG 의 가로세로 비율 (6354 x 1400) — 한 장의 실제 폭을 구하는 데 씁니다.
const BG_RATIO = 6354 / 1400;

// 도로 점선 무늬 한 주기(px) — CSS 의 repeating-linear-gradient 와 맞춰야 합니다.
const LINE_PERIOD = 150;

export async function initTruckBanner() {
    const holder = document.getElementById('truckBannerArt');
    const road = document.getElementById('ocRoad');       // 먼 배경 (하늘·구름·언덕)
    const lines = document.getElementById('ocRoadLines'); // 도로 가운데 점선
    if (!holder) return;

    // ----- 트럭 SVG 불러와 펼치기 -----
    try {
        const res = await fetch(SVG_URL);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        holder.innerHTML = await res.text();
    } catch (err) {
        console.warn(`[truckBanner] ${SVG_URL} 를 불러오지 못했습니다.`, err);
        holder.classList.add('is-missing');
        return;
    }

    const svg = holder.querySelector('svg');
    if (!svg) return;

    svg.removeAttribute('width');
    svg.removeAttribute('height');
    holder.classList.add('is-ready');

    const bodyEl = holder.querySelector('#truckbody');
    const wheels = [
        ...holder.querySelectorAll('#tireMid, [id^="tireBack"], [id^="tireFront"]'),
    ];

    // 움직임을 불편해하는 사용자에게는 절반 속도로 — 끄지는 않습니다.
    // (아예 멈추면 '배달 중'이라는 화면의 뜻이 사라집니다)
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const speedScale = calm ? 0.5 : 1;
    const bouncePower = SETTINGS.BOUNCE_POWER * (calm ? 0.35 : 1);

    // ----- 상태 -----
    let stageWidth = 0;
    let truckWidth = 0;
    let bgTileWidth = 0;

    let x = 0;              // 트럭의 현재 x
    let targetX = 0;        // 가운데에 섰을 때의 x
    let wheelAngle = 0;
    let bgOffset = 0;
    let lineOffset = 0;
    let state = 'enter';    // enter → cruise
    let last = performance.now();

    function measure() {
        const banner = holder.closest('.oc-banner') || holder.parentElement;
        stageWidth = banner.clientWidth;
        truckWidth = holder.offsetWidth;
        targetX = (stageWidth - truckWidth) / 2;

        // 배경 한 장이 화면에 그려지는 실제 폭 (높이에 맞춰 늘어나므로)
        bgTileWidth = banner.clientHeight * BG_RATIO;
    }

    let ticked = false; // 루프가 한 번이라도 돌았는지

    function start() {
        measure();
        x = -truckWidth - 20; // 화면 왼쪽 바깥에서 출발
        state = 'enter';
        last = performance.now();

        // 첫 프레임 전에도 자리가 맞도록 시작 위치를 바로 찍어 둡니다.
        holder.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;

        // ⚠️ requestAnimationFrame 이 돌지 않는 환경(백그라운드 탭 등)에서는
        //    루프가 한 번도 실행되지 않아 트럭이 화면 밖에 멈춰 있게 됩니다.
        //    1초 안에 아무 프레임도 오지 않으면 가운데에 세워 두고 끝냅니다.
        setTimeout(() => {
            if (ticked) return;
            x = targetX;
            state = 'cruise';
            holder.style.transform = `translate3d(${targetX.toFixed(2)}px, 0, 0)`;
        }, 1000);
    }

    function frame(now) {
        ticked = true;
        const dt = Math.min((now - last) / 1000, 0.04);
        last = now;

        // ① 왼쪽에서 가운데로 진입
        if (state === 'enter') {
            x += SETTINGS.ENTRY_SPEED * speedScale * dt;
            if (x >= targetX) {
                x = targetX;
                state = 'cruise';
            }
        }

        // ② 가운데 도착 후에는 트럭은 고정, 배경과 도로만 흐릅니다
        if (state === 'cruise') {
            const move = SETTINGS.BACKGROUND_SPEED * speedScale * dt;

            // 먼 배경 — 한 장만큼 흘렀으면 되돌립니다 (반복 배경이라 이음매 없음)
            if (road && bgTileWidth > 0) {
                bgOffset -= move;
                if (bgOffset <= -bgTileWidth) bgOffset += bgTileWidth;
                road.style.backgroundPositionX = `${bgOffset.toFixed(2)}px`;
            }

            // 도로 점선 — 가까이 있으므로 더 빨리 흘러야 원근감이 납니다.
            // 점선 무늬가 150px 주기라 그만큼 가면 처음으로 되돌립니다.
            if (lines) {
                lineOffset -= move * SETTINGS.ROAD_LINE_FACTOR;
                if (lineOffset <= -LINE_PERIOD) lineOffset += LINE_PERIOD;
                lines.style.backgroundPositionX = `${lineOffset.toFixed(2)}px`;
            }
        }

        // ③ 바퀴는 계속 회전
        wheelAngle -= SETTINGS.WHEEL_SPEED * speedScale * dt;
        for (const wheel of wheels) {
            wheel.style.transform = `rotate(${wheelAngle.toFixed(2)}deg)`;
        }

        // ④ 덜컹임 — 큰 출렁임과 잔진동을 섞습니다
        const t = now * 0.001;

        const bigBounce = Math.sin(t * SETTINGS.BOUNCE_FREQUENCY) * 1.9;
        const roadVibration =
            Math.sin(t * SETTINGS.VIBRATION_FREQUENCY_1 + 0.4) * 0.85 +
            Math.sin(t * SETTINGS.VIBRATION_FREQUENCY_2 + 1.1) * 0.35;

        const bounceY = (bigBounce + roadVibration) * bouncePower;
        const tilt =
            (Math.sin(t * SETTINGS.BOUNCE_FREQUENCY + 0.55) * 0.48 +
                Math.sin(t * 12.0) * 0.14) * bouncePower * SETTINGS.TILT_POWER;

        holder.style.transform =
            `translate3d(${x.toFixed(2)}px, ${bounceY.toFixed(2)}px, 0) rotate(${tilt.toFixed(2)}deg)`;

        // 차체만 한 번 더 미세하게 흔들어 서스펜션 느낌을 냅니다
        if (bodyEl) {
            const bodyBounce = Math.sin(t * 8.2 + 0.8) * 0.45 * bouncePower;
            bodyEl.style.transform = `translateY(${bodyBounce.toFixed(2)}px)`;
        }

        requestAnimationFrame(frame);
    }

    // 창 크기가 바뀌면 가운데 좌표와 배경 한 장 폭을 다시 잽니다.
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const wasCruising = state === 'cruise';
            measure();
            if (wasCruising) x = targetX; // 이미 가운데였다면 그대로 가운데 유지
        }, 150);
    });

    start();
    requestAnimationFrame(frame);
}
