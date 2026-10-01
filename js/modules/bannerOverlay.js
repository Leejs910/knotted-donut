// 🕶️ 배너에 스크롤을 내리는 순간 깔리는 어두운 막
//
// 필요 라이브러리: gsap, ScrollTrigger
//
// 원래 puzzleOverlay.js 가 onlineShop.html 전용으로 있었는데,
// checkout.html 도 같은 연출이 필요해져서 대상만 받아 쓰도록 일반화했습니다.
//
// 사용법:
//   initBannerOverlay({ trigger: '.puzzle', overlay: '.puzzle-overlay' });

export function initBannerOverlay({
    trigger,
    overlay,
    to = 'rgba(0, 0, 0, 0.5)',
    duration = 0.5,
    start = 'top+=10 top', // 맨 위에서 10px만 내려가면 = 스크롤하자마자
} = {}) {
    if (typeof gsap === 'undefined') return;
    if (!trigger || !overlay) return;
    if (!document.querySelector(trigger)) return;
    if (!document.querySelector(overlay)) return;

    gsap.to(overlay, {
        backgroundColor: to,
        duration,
        scrollTrigger: {
            trigger,
            start,

            // [진입, 이탈, 역방향 진입, 역방향 이탈]
            // 맨 위로 되돌아오면 다시 투명해집니다.
            toggleActions: 'play none none reverse',

            // markers: true, // 시작점을 눈으로 확인하고 싶을 때
        },
    });
}
