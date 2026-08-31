// 인스타그램 피드 섹션 — 카드 렌더링 + 롤링 스와이퍼
// 필요 요소: #insta-wrapper, .insta-swiper, .insta-btn-prev, .insta-btn-next
// 필요 라이브러리: Swiper

export function initInstaSection({ data = [] } = {}) {
    if (typeof Swiper === 'undefined') return;

    const wrapper = document.getElementById('insta-wrapper');
    if (!wrapper) return;

    // 1. 카드 동적 렌더링
    wrapper.innerHTML = data.map(item => `
        <div class="swiper-slide">
            <a href="${item.linkUrl}" class="insta-card" target="_blank">
                <img src="${item.imgUrl}" alt="인스타그램 피드 이미지">
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
