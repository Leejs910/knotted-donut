// Lenis 스무스 스크롤
// 필요 요소: 없음 (페이지 전역)
// 필요 라이브러리: Lenis (선택: gsap ScrollTrigger)

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

    // ⚠️ Lenis는 스크롤을 자기 방식으로 처리해서 ScrollTrigger가 기대하는
    //    스크롤 신호를 받지 못합니다. 이 한 줄이 없으면 ScrollTrigger로 만든
    //    효과(푸터 오버레이, 히어로 장식 낙하, 퍼즐 배너 오버레이)가
    //    등록만 되고 영영 실행되지 않습니다.
    if (typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
    }

    // 모달처럼 "열려 있는 동안 뒷배경 스크롤을 막아야 하는" 기능들이
    // window.lenis.stop() / start()로 잠글 수 있도록 밖에서도 닿게 열어둡니다.
    window.lenis = lenis;

    return lenis;
}
