// ✨ 히어로의 반짝이(.brand-spark)가 스크롤에 맞춰 하나씩 떨어지며 사라집니다
//
// index.html 의 js/modules/heroDecoScroll.js 와 같은 방식입니다.
// 거기서는 .deco-wrap 을 움직이는데, 여기서는 .brand-spark 가 같은 역할을 합니다.
// (안쪽 <img> 는 그대로 두고 바깥 틀만 움직입니다. 그래야 반짝이는
//  brand-twinkle 애니메이션과 서로 덮어쓰지 않습니다)
//
// 필요 요소: .brand-hero, .brand-spark, .brand-story
// 필요 라이브러리: gsap, ScrollTrigger (선택: CustomEase)

export function initBrandHeroScroll() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const hero = document.querySelector('.brand-hero');
    const sparks = document.querySelectorAll('.brand-spark');
    if (!hero || !sparks.length) return;

    gsap.registerPlugin(ScrollTrigger);

    // 떨어질수록 빠르게 옅어지는 곡선 (index 의 'myExpo' 와 같은 값)
    let fade = 'power2.in';
    if (typeof CustomEase !== 'undefined') {
        gsap.registerPlugin(CustomEase);
        CustomEase.create('brandExpo', '0.7, 0, 1, 0.1');
        fade = 'brandExpo';
    }

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: '.brand-hero',
            start: 'top top',

            // ⚠️ index 처럼 '다음 섹션이 화면 가운데 올 때'로 끝을 잡으면,
            //    폰에서는 히어로(화면폭 기준)가 화면 절반보다 낮아서
            //    끝 지점이 시작보다 앞서 버립니다. 그러면 구간 길이가 0 이
            //    되어 반짝이가 영영 떨어지지 않습니다.
            //    그래서 '화면 높이의 60% 만큼 내리는 동안'으로 잡습니다.
            end: () => '+=' + Math.round(window.innerHeight * 0.6),

            scrub: 5,   // 스크롤을 따라오되 살짝 늦게 — index 와 같은 값입니다
            invalidateOnRefresh: true,
        },
    });

    // 자리 이동과 회전. stagger 가 '하나씩 차례로' 떨어지게 만듭니다.
    tl.to('.brand-spark', {
        y: 1200,
        rotation: 360,
        stagger: 0.1,
        ease: 'none',
    }, 0);

    // 투명도는 같은 시각에 시작하되 곡선만 다르게 (끝에서 훅 사라집니다)
    tl.to('.brand-spark', {
        opacity: 0,
        stagger: 0.1,
        ease: fade,
    }, 0);
}
