// 🚚 결제 트럭 연출 — 문 닫힘 → 트럭으로 교체 → 주행 → 완료
//
// test/truckAnime.html 의 흐름을 모듈로 옮긴 것입니다.
//
// 필요 요소: #truckDoor, #truckStageBand, #truckStage, #truckSvg
// 필요 CSS: css/components/truck-scene.css
// 필요 에셋: img/truck.svg  (truckStripe / truck1~7 / tire* / truckbody id 포함)
//
// 사용법:
//   const truck = initTruckScene({ onFinish: () => { ... } });
//   truck.play();

const SVG_URL = './img/truck.svg';

export function initTruckScene({ scrollTarget = null, onFinish = null } = {}) {
    const doorEl = document.getElementById('truckDoor');
    const bandEl = document.getElementById('truckStageBand');
    const stageEl = document.getElementById('truckStage');
    const svgHolder = document.getElementById('truckSvg');

    if (!doorEl || !bandEl || !stageEl || !svgHolder) return null;

    let svgLoaded = false;
    let playing = false;

    // 트럭 SVG 는 180KB 정도라 결제 버튼을 누른 뒤에 불러옵니다.
    // (평소 결제 화면 로딩을 무겁게 만들지 않기 위해)
    async function loadSvg() {
        if (svgLoaded) return true;
        try {
            const res = await fetch(SVG_URL);
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            svgHolder.innerHTML = await res.text();

            const svg = svgHolder.querySelector('svg');
            if (svg) {
                svg.removeAttribute('width');
                svg.removeAttribute('height');
            }
            svgLoaded = true;
            return true;
        } catch (err) {
            console.warn(`[truckScene] ${SVG_URL} 를 불러오지 못했습니다.`, err);
            return false;
        }
    }

    function finish() {
        bandEl.hidden = true;
        window.lenis?.start(); // 잠갔던 스크롤을 풀어 줍니다
        if (typeof onFinish === 'function') onFinish();
    }

    // ③④ 트럭 등장 → 주행
    function runTruck() {
        bandEl.hidden = false;

        const stripe = svgHolder.querySelector('#truckStripe');
        if (!stripe) {
            console.warn('[truckScene] SVG 안에서 #truckStripe 를 찾지 못했습니다.');
            finish();
            return;
        }

        // 방금 hidden 을 푼 요소라, 레이아웃을 한 번 강제로 계산시킨 뒤
        // 클래스를 붙여야 애니메이션이 처음부터 재생됩니다.
        // ⚠️ requestAnimationFrame 에 맡기면, rAF 가 멈춘 환경(백그라운드 탭 등)에서
        //    클래스가 영영 안 붙어 트럭이 출발하지 않습니다.
        void stageEl.offsetWidth;
        stageEl.classList.add('start-animation');

        // 주행(driveAway)이 끝나면 완료 화면으로 넘어갑니다.
        // animationend 는 프레임 전환 등 여러 번 오므로 이름으로 걸러냅니다.
        const onEnd = (e) => {
            if (e.animationName !== 'driveAway') return;
            stripe.removeEventListener('animationend', onEnd);
            finish();
        };
        stripe.addEventListener('animationend', onEnd);

        // 애니메이션이 어떤 이유로든 끝나지 않아도 멈춰 있지 않도록 안전장치
        setTimeout(() => {
            if (bandEl.hidden) return;
            stripe.removeEventListener('animationend', onEnd);
            finish();
        }, 4000);
    }

    async function play() {
        if (playing) return;
        playing = true;

        // 🎬 연출이 보이도록 무대를 화면 가운데로 옮긴 뒤 스크롤을 잠급니다.
        //
        //    ⚠️ 기준은 반드시 '결제 섹션'이어야 합니다. 무대(stageEl)는 이 시점에
        //       아직 hidden 이라 크기·위치가 0 이고, 그걸로 계산하면 스크롤이
        //       0 으로 가버려 트럭이 화면 아래에서 재생됩니다.
        //    ⚠️ Lenis 의 scrollTo 는 내부적으로 requestAnimationFrame 으로 움직입니다.
        //       rAF 가 멈춘 환경에서는 한 픽셀도 가지 않아 트럭이 화면 밖에서
        //       재생됩니다. 그래서 Lenis 를 먼저 끄고 브라우저 기본 스크롤을
        //       쓴 뒤, 목표 지점에 닿았는지 직접 확인합니다.
        window.lenis?.stop();

        const anchor = scrollTarget || stageEl;
        if (anchor) {
            const rect = anchor.getBoundingClientRect();
            const NAV_H = 84; // 고정 네비게이션이 가리지 않도록
            const gap = Math.max(NAV_H, (window.innerHeight - rect.height) / 2);
            const y = Math.max(0, Math.round(rect.top + window.scrollY - gap));

            const html = document.documentElement;
            const prevBehavior = html.style.scrollBehavior;

            html.style.scrollBehavior = 'smooth';
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 600));

            // 부드러운 스크롤이 듣지 않았으면 즉시 맞춰 놓습니다.
            if (Math.abs(window.scrollY - y) > 8) {
                html.style.scrollBehavior = 'auto';
                window.scrollTo(0, y);
                await new Promise((r) => setTimeout(r, 60));
            }

            html.style.scrollBehavior = prevBehavior;
        }

        const ok = await loadSvg();
        if (!ok) {
            // 트럭을 못 불러오면 연출은 건너뛰고 완료 화면으로 바로 넘어갑니다.
            finish();
            return;
        }

        // ① 문 닫기
        doorEl.classList.add('is-closed');

        // ② 문이 다 닫힌 순간 트럭으로 교체 (이 타이밍이 '마술'의 핵심)
        const onDoorEnd = (e) => {
            if (e.propertyName !== 'transform') return;
            doorEl.removeEventListener('transitionend', onDoorEnd);
            runTruck();
        };
        doorEl.addEventListener('transitionend', onDoorEnd);

        // transitionend 가 안 오는 경우(탭이 숨겨져 있는 등) 대비
        setTimeout(() => {
            if (!bandEl.hidden) return;
            doorEl.removeEventListener('transitionend', onDoorEnd);
            runTruck();
        }, 1600);
    }

    return { play };
}
