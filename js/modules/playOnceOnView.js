// 요소가 화면에 보일 때 콜백을 '딱 한 번' 실행합니다.
// 등장 애니메이션(배너, 도장 등)을 1회만 재생하는 데 씁니다.
//
// ⚠️ 왜 이렇게 방어적으로 쓰는가:
//    IntersectionObserver 하나만 믿으면, 페이지가 뜨는 순간 창 크기를 아직
//    모르거나(0) 관찰자 콜백이 늦게 도는 환경에서 애니메이션을 통째로 놓칩니다.
//    실제로 그 문제를 겪어서 안전장치를 겹쳐 두었습니다.
//
// 옵션
//   threshold    : 요소가 이만큼 보이면 실행 (0~1)
//   bottomOffset : 화면 아래쪽에서 이 비율만큼은 '보인 것으로 치지 않습니다'.
//                  0.3 이면 요소가 화면 높이의 30% 위로 올라와야 실행됩니다.
//                  → 스크롤을 더 내려야 재생되게 하고 싶을 때 이 값을 키우세요.
//   fallbackMs   : 관찰자가 반응하지 않을 때를 대비한 확인 시점(ms).
//                  ⚠️ 이 시점에 '실제로 화면에 보일 때만' 실행합니다.
//                     무조건 실행하면 아직 스크롤하지 않았는데도 재생돼 버립니다.

export function playOnceOnView(target, run, {
    threshold = 0.25,
    fallbackMs = 2000,
    bottomOffset = 0,
} = {}) {
    if (!target || typeof run !== 'function') return;

    let done = false;
    const fire = () => {
        if (done) return;
        done = true;
        run();
    };

    // bottomOffset 을 반영한 '실행선'보다 위에 있는지 확인합니다.
    const isVisible = () => {
        const viewH = window.innerHeight || document.documentElement.clientHeight || 0;
        if (!viewH) return null; // 창 크기를 모르는 상태
        const rect = target.getBoundingClientRect();
        if (!rect.height) return null;
        const line = viewH * (1 - bottomOffset);
        return rect.top < line && rect.bottom > 0;
    };

    const visibleNow = isVisible();

    // 크기를 판단할 수 없거나 이미 실행선 위에 있으면 바로 재생
    if (visibleNow === null || visibleNow === true) {
        fire();
        return;
    }

    if (!('IntersectionObserver' in window)) {
        fire();
        return;
    }

    const io = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        fire();
    }, {
        threshold,
        // 아래쪽 여백을 깎아, 요소가 더 위로 올라와야 '보인다'고 판정하게 합니다.
        rootMargin: `0px 0px -${Math.round(bottomOffset * 100)}% 0px`,
    });

    io.observe(target);

    // 안전장치 — 관찰자가 조용한 환경(콜백이 안 도는 브라우저, Lenis 처럼
    // 네이티브 스크롤 이벤트를 내지 않는 환경)을 대비해 주기적으로 직접 확인합니다.
    // ⚠️ 한 번만 확인하면 '그 순간 안 보였다'는 이유로 영영 재생되지 않습니다.
    if (fallbackMs > 0) {
        const started = Date.now();
        const timer = setInterval(() => {
            if (done || Date.now() - started > 60000) {
                clearInterval(timer);
                return;
            }
            if (isVisible() !== true) return; // 아직 실행선 아래면 계속 기다립니다
            clearInterval(timer);
            io.disconnect();
            fire();
        }, fallbackMs);
    }
}
