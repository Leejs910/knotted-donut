// 신메뉴 / 베스트셀러 섹션 — 토글 버튼 + 도넛 카드 스와이퍼 + 테마 색상 전환
// 필요 요소: .mySwiper, #btn-new, #btn-best, .toggle-badge, .newAndBest, .wave-top .wave-divider
// 필요 라이브러리: Swiper

const cardThemes = [
    { bgImg: './img/cardPink.png', themeColor: '#FFAFC8' },
    { bgImg: './img/cardBlue.png', themeColor: '#A6C8FF' },
    { bgImg: './img/cardGreen.png', themeColor: '#89D9B9' },
    { bgImg: './img/cardYellow.png', themeColor: '#F4D03F' }
];

export function initDonutSection({ newData = [], bestData = [] } = {}) {
    if (typeof Swiper === 'undefined') return;
    if (!document.querySelector('.mySwiper')) return;

    const cardSwiper = new Swiper('.mySwiper', {
        effect: 'creative',
        grabCursor: true,
        centeredSlides: true,

        // 기본값 (모바일 등 가장 작은 화면 기준)
        slidesPerView: 1.2, // 가운데 1개, 양옆에 살짝 걸치게
        loop: true,
        loopedSlides: 7,

        // 화면 크기별로 보여줄 카드 개수 조절
        breakpoints: {
            768:  { slidesPerView: 3 }, // 태블릿
            1025: { slidesPerView: 4 }, // 데스크톱
            1281: { slidesPerView: 5 }  // 넓은 데스크톱
        },

        autoplay: {
            delay: 2500,
            disableOnInteraction: false, // 유저가 스와이프한 후에도 자동 재생 유지
        },

        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },

        creativeEffect: {
            // 제한을 10으로 늘려서, 화면 밖으로 밀려나는 카드들이
            // 끝에 뭉치지 않고 궤도를 따라 자연스럽게 이동하게 만듭니다.
            limitProgress: 10,
            prev: {
                shadow: false,
                translate: ['calc(-100% - 20px)', '12%', 0],
                rotate: [0, 0, -4],
            },
            next: {
                shadow: false,
                translate: ['calc(100% + 20px)', '12%', 0],
                rotate: [0, 0, 4],
            },
        },
    });

    // 카드를 렌더링하는 함수
    function renderDonutCards(dataArray) {
        cardSwiper.removeAllSlides();

        // 무한 루프가 자연스럽게 돌도록 데이터가 최소 10개가 될 때까지 복제합니다.
        let safeDataArray = [...dataArray];
        while (safeDataArray.length && safeDataArray.length < 10) {
            safeDataArray = [...safeDataArray, ...dataArray];
        }

        const newSlides = safeDataArray.map((item, index) => {
            // 인덱스를 테마 개수로 나눈 '나머지'로 4가지 색을 무한 순환시킵니다.
            const theme = cardThemes[index % cardThemes.length];

            return `
        <div class="swiper-slide">
            <div class="card-inner">
                <img src="${theme.bgImg}" class="card-bg" alt="배경">
                <img src="${item.imgUrl}" class="donut-pic" alt="${item.title}">
                <div class="donut-name-box" style="background-color: ${theme.themeColor};">
                    ${item.title}
                </div>
            </div>
        </div>
        `;
        });

        cardSwiper.appendSlide(newSlides);
        cardSwiper.update();
        cardSwiper.slideToLoop(0, 0);
    }

    // ----- 토글 버튼 -----
    const btnNew = document.getElementById('btn-new');
    const btnBest = document.getElementById('btn-best');
    const badge = document.querySelector('.toggle-badge');
    const section = document.querySelector('.newAndBest');
    const topWave = document.querySelector('.wave-top .wave-divider');

    function handleToggle(clickedBtn, otherBtn) {
        // 이미 활성화된 버튼을 또 누르면 무시합니다.
        if (clickedBtn.classList.contains('active')) return false;

        clickedBtn.classList.add('active');
        otherBtn.classList.remove('active');

        // 애니메이션을 즉시 재시작하려면 클래스를 지운 직후 Reflow를 강제해야 합니다.
        if (badge) {
            badge.classList.remove('animate-bounce');
            void badge.offsetWidth; // 브라우저에게 "크기 다시 계산해!" 라고 명령
            badge.classList.add('animate-bounce');
        }
        return true;
    }

    function setTheme(isPink) {
        if (section) section.classList.toggle('theme-pink', isPink);
        if (topWave) {
            topWave.classList.toggle('color-pink', isPink);
            topWave.classList.toggle('color-blue', !isPink);
        }
    }

    if (btnNew && btnBest) {
        btnNew.addEventListener('click', () => {
            if (!handleToggle(btnNew, btnBest)) return;
            renderDonutCards(newData);
            setTheme(false); // 파란색 테마로 원상 복구
        });

        btnBest.addEventListener('click', () => {
            if (!handleToggle(btnBest, btnNew)) return;
            renderDonutCards(bestData);
            setTheme(true); // 핑크색 테마로 변경
        });
    }

    // 최초 1회 렌더링
    renderDonutCards(newData);

    return { swiper: cardSwiper, renderDonutCards };
}
