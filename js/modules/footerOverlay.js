// 푸터에 다다르면 어두운 오버레이가 깔려 글자 가독성을 높이는 스크롤 애니메이션
// 필요 요소: .site-footer, .footer-overlay
// 필요 라이브러리: gsap, ScrollTrigger

export function initFooterOverlay() {
    if (typeof gsap === 'undefined') return;
    if (!document.querySelector('.footer-overlay')) return;
    if (!document.querySelector('.site-footer')) return;

    gsap.to('.footer-overlay', {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        duration: 0.5,
        scrollTrigger: {
            trigger: '.site-footer',

            // 푸터 높이 기준 약 2/3(66%) 지점이 화면 하단에 닿을 때 실행
            start: '66% bottom',

            // [진입 시, 이탈 시, 역방향 진입 시, 역방향 이탈 시]
            toggleActions: 'play none none reverse',

            // markers: true, // 시작점을 눈으로 확인하고 싶을 때 주석 해제
        }
    });
}
