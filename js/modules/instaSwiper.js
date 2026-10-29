// 인스타그램 피드 섹션 — 카드 렌더링 + 롤링 스와이퍼
// 필요 요소: #insta-wrapper, .insta-swiper, .insta-btn-prev, .insta-btn-next
// 필요 라이브러리: Swiper

export function initInstaSection({ data = [] } = {}) {
    if (typeof Swiper === 'undefined') return;

    const wrapper = document.getElementById('insta-wrapper');
    if (!wrapper) return;

    // 1. 카드 동적 렌더링
    //
    // ⚠️ loading="lazy" 를 빼지 마세요. 이 섹션은 한참 아래에 있는데도
    //    스무 장을 첫 화면에서 한꺼번에 받습니다. 폰에서는 그것만으로
    //    첫 화면이 몇 초씩 늦어집니다.
    //    자리는 .insta-card 의 aspect-ratio 가 미리 잡아 두므로,
    //    늦게 와도 레이아웃이 밀리지 않습니다.
    // ⚠️ 바깥 사이트(인스타)로 나가므로 rel 을 같이 답니다.
    wrapper.innerHTML = data.map(item => `
        <div class="swiper-slide">
            <a href="${item.linkUrl}" class="insta-card" target="_blank" rel="noopener noreferrer">
                <img src="${item.imgUrl}" alt="인스타그램 피드 이미지"
                     loading="lazy" decoding="async">
            </a>
        </div>
    `).join('');

    // 2. DOM에 카드를 먼저 주입한 뒤 스와이퍼 모터를 켭니다.
    setTimeout(() => {
        new Swiper('.insta-swiper', {
            loop: true,
            speed: 800,
            spaceBetween: 25,

            autoplay: {
                delay: 3000,
                disableOnInteraction: false, // 마우스 건드려도 안 멈춤
                pauseOnMouseEnter: true,     // 마우스 올렸을 때만 일시정지
            },

            navigation: {
                nextEl: '.insta-btn-next',
                prevEl: '.insta-btn-prev',
            },

            // 화면 크기에 따라 보여지는 카드 개수 자동 조절
            breakpoints: {
                320:  { slidesPerView: 1.2, spaceBetween: 15 },
                768:  { slidesPerView: 3,   spaceBetween: 20 },
                1024: { slidesPerView: 4,   spaceBetween: 25 },
                1400: { slidesPerView: 5,   spaceBetween: 30 },
            }
        });
    }, 100);
}
