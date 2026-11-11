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

    // ⚠️ '트럭이 출발했는가' 를 bandEl.hidden 으로 판단하면 안 됩니다.
    //    예열(is-warming) 때문에 문이 닫히는 동안에도 이미 hidden 이 풀려 있어서,
    //    transitionend 가 오지 않는 환경에서 아래 보험이 헛돌게 됩니다.
    let truckStarted = false;

    // 이동이 시작된 뒤에도 흰 무대를 덮어 두므로, '이미 끝났는가' 를
    // bandEl.hidden 으로 알 수 없습니다. 따로 기억합니다.
    let finished = false;

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
        if (finished) return;
        finished = true;

        // ⚠️ 여기서 흰 무대를 걷어내면 안 됩니다.
        //    onFinish() 는 다음 페이지로 이동을 '시작' 할 뿐이고, 새 페이지가
        //    뜨기까지 0.1초쯤 걸립니다. 그 사이 무대가 사라지면 그 아래에
        //    닫힌 노란 문(.truck-door.is-closed)이 드러나, 셔터가 닫히는
        //    장면이 한 번 깜빡이고 지나갑니다.
        //    흰 무대를 그대로 덮어 둔 채 이동하면 흰 화면에서 흰 화면으로
        //    이어집니다. (결제완료 페이지는 들어오는 페이드도 건너뛰므로
        //     — js/modules/pageFade.js — 흰색이 끊기지 않습니다)
        window.lenis?.start(); // 잠갔던 스크롤을 풀어 줍니다
        if (typeof onFinish === 'function') onFinish();
    }

    // ③④ 트럭 등장 → 주행
    function runTruck() {
        if (truckStarted) return;
        truckStarted = true;

        // 예열해 뒀다면 여기서는 투명도만 걷어내면 됩니다 (이미 칠해져 있음).
        // 예열에 실패했더라도 hidden 을 풀어 예전과 똑같이 동작합니다.
        bandEl.hidden = false;
        bandEl.classList.remove('is-warming');

        // SVG 가 제대로 들어왔는지 확인하는 용도로만 찾습니다.
        // (애니메이션은 이제 #truckStripe 가 아니라 컨테이너 #truckSvg 에 걸립니다)
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

        // ⏱️ 트럭이 화면을 벗어나는 순간 바로 넘어갑니다.
        //
        //    예전에는 driveAway 의 animationend 를 기다렸는데, 주행 거리가
        //    150vw 라서 트럭은 주행의 43% 쯤(화면 폭 100vw 를 지나는 지점)에
        //    이미 사라집니다. 나머지 57% 동안은 빈 화면만 보고 있었습니다.
        //    1600px 화면에서 실측하니 약 1.1초가 그렇게 버려졌습니다.
        //
        //    EXIT_RATIO 는 '주행 시간의 몇 %가 지나면 넘어갈지'입니다.
        //    0.55 는 실측 퇴장 시점(0.43)보다 조금 넉넉하게 잡은 값으로,
        //    트럭이 사라지고 아주 짧은 여운만 남기고 전환됩니다.
        //    더 빠르게 하려면 줄이고, 여운을 더 주려면 키우세요.
        const EXIT_RATIO = 0.55;

        const css = getComputedStyle(stageEl);
        const ms = (name) => (parseFloat(css.getPropertyValue(name)) || 0) * 1000;
        const driveStart = ms('--zoom-dur') + ms('--hold') + ms('--judder');
        const exitAt = driveStart + ms('--drive-dur') * EXIT_RATIO;

        let settled = false;
        const timers = [];

        const done = () => {
            if (settled) return;
            settled = true;
            timers.forEach(clearTimeout);
            svgHolder.removeEventListener('animationend', onEnd);
            finish();
        };

        // animationend 는 프레임 전환 등 여러 번 오므로 이름으로 걸러냅니다.
        // (위 타이머보다 늦게 오지만, 타이머가 실패했을 때의 보험으로 남겨 둡니다)
        function onEnd(e) {
            if (e.animationName !== 'driveAway') return;
            done();
        }
        // ⚠️ driveAway 는 컨테이너(#truckSvg = svgHolder)에서 끝납니다.
        //    예전처럼 #truckStripe 에 달면 이 보험이 영영 울리지 않습니다.
        svgHolder.addEventListener('animationend', onEnd);

        timers.push(setTimeout(done, exitAt));

        // 애니메이션이 어떤 이유로든 끝나지 않아도 멈춰 있지 않도록 안전장치
        timers.push(setTimeout(() => {
            if (finished) return;
            done();
        }, 4000));
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

            // ⚠️ 예전에는 html 에 inline 으로 scroll-behavior:smooth 를 심었는데,
            //    이제는 듣지 않습니다. css/base/reset.css 의
            //    `.lenis.lenis-smooth` 규칙이 !important 로 auto 를 못박기
            //    때문입니다(그 규칙이 없으면 Lenis 가 1~2 초 뒤처집니다).
            //    inline 스타일은 !important 를 이기지 못합니다.
            //    lenis.stop() 을 해도 lenis-smooth 클래스는 그대로 남아 있어서
            //    여기서도 적용됩니다.
            //    옵션으로 넘기는 behavior 는 CSS 와 무관하게 동작하므로 이쪽을 씁니다.
            window.scrollTo({ top: y, behavior: 'smooth' });
            await new Promise((r) => setTimeout(r, 600));

            // 부드러운 스크롤이 듣지 않았으면 즉시 맞춰 놓습니다.
            if (Math.abs(window.scrollY - y) > 8) {
                window.scrollTo({ top: y, behavior: 'auto' });
                await new Promise((r) => setTimeout(r, 60));
            }
        }

        const ok = await loadSvg();
        if (!ok) {
            // 트럭을 못 불러오면 연출은 건너뛰고 완료 화면으로 바로 넘어갑니다.
            finish();
            return;
        }

        // 🔥 예열 — 문이 닫히는 1.2초 동안 트럭을 미리 칠해 둡니다.
        //    (css/components/truck-scene.css 의 .is-warming 설명 참고)
        //    이게 없으면 문 → 트럭 교체 순간에 307개 path 를 scale(2.8) 로
        //    처음 칠하는 일이 한 프레임에 몰려 그 지점만 턱 걸립니다.
        bandEl.classList.add('is-warming');
        bandEl.hidden = false;
        void stageEl.offsetWidth; // 레이아웃을 지금 확정시켜 칠하기를 앞당깁니다

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
            if (truckStarted) return;
            doorEl.removeEventListener('transitionend', onDoorEnd);
            runTruck();
        }, 1600);
    }

    // 🕗 결제 버튼을 누르기 전, 브라우저가 한가한 틈에 미리 받아 둡니다.
    //
    //    예전에는 누르는 순간 받아서, 183KB·307개 path 를 내려받고 파싱하는
    //    일이 회전 첫 장과 정확히 겹쳤습니다. 그래서 회전 시작이 항상 한 번
    //    턱 걸렸습니다.
    //
    //    ⚠️ 페이지 로딩 자체는 여전히 무겁게 하지 않습니다. idle 콜백이라
    //       화면이 다 뜨고 할 일이 없을 때만 돌고, 실패해도 play() 가 다시
    //       받으므로 연출에는 영향이 없습니다.
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => { loadSvg(); }, { timeout: 3000 });
    } else {
        setTimeout(() => { loadSvg(); }, 1200);
    }

    return { play };
}
