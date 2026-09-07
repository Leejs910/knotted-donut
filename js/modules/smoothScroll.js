// Lenis 스무스 스크롤
// 필요 요소: 없음 (페이지 전역)
// 필요 라이브러리: Lenis

export function initSmoothScroll() {
    if (typeof Lenis === 'undefined') return null;

    const lenis = new Lenis({
        duration: 1.2, // 스크롤이 미끄러지는 시간 (클수록 부드러움)
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 모달처럼 "열려 있는 동안 뒷배경 스크롤을 막아야 하는" 기능들이
    // window.lenis.stop() / start()로 잠글 수 있도록 밖에서도 닿게 열어둡니다.
    window.lenis = lenis;

    return lenis;
}
