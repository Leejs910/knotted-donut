// 히어로 장식(.deco-wrap)이 스크롤에 따라 떨어지며 사라지는 GSAP 애니메이션
// 필요 요소: .video-hero, .newAndBest, .deco-wrap
// 필요 라이브러리: gsap, ScrollTrigger, CustomEase

export function initHeroDecoScroll() {
    if (typeof gsap === 'undefined') return;
    if (!document.querySelector('.video-hero')) return;
    if (!document.querySelector('.deco-wrap')) return;

    // 커스텀 곡선
    if (typeof CustomEase !== 'undefined') {
        gsap.registerPlugin(CustomEase);
        CustomEase.create('myExpo', '0.7, 0, 1, 0.1');
    }

    // 타임라인에 ScrollTrigger를 한 번만 연결합니다.
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: '.video-hero',
            start: 'top top',
            endTrigger: '.newAndBest',
            end: 'top center',
            scrub: 5, // 마우스 움직임에 살짝 부드럽게 따라오게 만듦
        }
    });

    // 위치 & 회전 애니메이션 (정직하게 스크롤 속도에 맞춤)
    tl.to('.deco-wrap', {
        y: 1200,
        rotation: 360,
        stagger: 0.1, // 순차적으로 출발하게 만드는 시간차 delay
        ease: 'none'  // 가속도
    }, 0); // '0' = 타임라인의 처음부터 시작

    // 투명도 애니메이션 (지수형 감속 적용)
    tl.to('.deco-wrap', {
        opacity: 0,
        stagger: 0.1,
        ease: 'myExpo'
    }, 0); // 위치 이동 애니메이션과 완벽하게 동시에 실행
}
