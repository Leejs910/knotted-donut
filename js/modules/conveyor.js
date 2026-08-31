// 온라인 샵 컨베이어 벨트 — 상품 스와이퍼 + 재생/일시정지/배속 컨트롤러
// 필요 요소: .trail-swiper, .trail-track, #btn-ff, #btn-play, #btn-pause, #btn-rew
// 필요 라이브러리: Swiper

const boxThemes = [
    { bgImg: './img/boxPink.png', themeColor: '#FFAFC8' },
    { bgImg: './img/boxBlue.png', themeColor: '#A6C8FF' },
    { bgImg: './img/boxGreen.png', themeColor: '#89D9B9' },
    { bgImg: './img/boxYellow.png', themeColor: '#F4D03F' }
];

export function initConveyor({ data = [] } = {}) {
    if (typeof Swiper === 'undefined') return;
    if (!document.querySelector('.trail-swiper')) return;

    const trailSwiper = new Swiper('.trail-swiper', {
        loop: true,

        // [1] 기본값: 767px 이하 모바일 환경 (일반 카드 스와이프)
        slidesPerView: 'auto',
        centeredSlides: true, // 보고 있는 카드를 화면 정중앙에 고정
        spaceBetween: 20,
        speed: 400,
        autoplay: {
            delay: 1000,
            disableOnInteraction: false, // 손가락으로 만진 후에도 자동 재생 유지
        },

        // [2] 768px 이상: 다시 부드러운 컨베이어 벨트로 전환
        breakpoints: {
            768: {
                slidesPerView: 'auto',
                centeredSlides: false,
                spaceBetween: 80,
                speed: 5000,    // 아주 느린 속도로 딜레이 없이 흘러가게 만듦
                autoplay: {
                    delay: 0,   // 대기 시간 없이 continuous 재생
                    disableOnInteraction: false,
                },
                allowTouchMove: false,
            }
        }
    });

    // ----- 미디어 컨트롤러 -----
    const track = document.querySelector('.trail-track');
    const btnFF = document.getElementById('btn-ff');
    const btnPlay = document.getElementById('btn-play');
    const btnPause = document.getElementById('btn-pause');
    const btnRew = document.getElementById('btn-rew');

    const btns = [btnFF, btnPlay, btnPause, btnRew].filter(Boolean);
    let currentMode = 'play';
    let conveyorTimeout = null;

    function setActiveBtn(activeBtn) {
        btns.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }

    // 스와이퍼와 레일의 상태를 한 번에 조작하는 마스터 함수
    function changeConveyorState(mode) {
        currentMode = mode;
        if (conveyorTimeout) clearTimeout(conveyorTimeout);

        // 1. 강제 정지 및 상태 초기화
        trailSwiper.autoplay.stop();
        trailSwiper.setTranslate(trailSwiper.getTranslate());
        trailSwiper.setTransition(0);
        trailSwiper.animating = false;

        // 브라우저 강제 새로고침(Reflow)
        void trailSwiper.wrapperEl.offsetWidth;

        // Web Animations API로 CSS 레일 가져오기
        const anims = track ? track.getAnimations() : [];

        if (mode === 'pause') {
            if (anims.length > 0) anims[0].pause();
            return;
        }

        // [재생 / 빨리감기 / 되감기 모드]
        let targetSpeed = 5000;
        let trackRate = 1;
        let isReverse = false;

        if (mode === 'play')     { targetSpeed = 5000; trackRate = 1;  isReverse = false; }
        else if (mode === 'ff')  { targetSpeed = 1000; trackRate = 5;  isReverse = false; }
        else if (mode === 'rew') { targetSpeed = 1000; trackRate = -5; isReverse = true; }

        if (anims.length > 0) {
            const anim = anims[0];

            // 트레일러 '시간 여행 (Time Travel)'
            // 뒤로 감기를 하는데 애니메이션 시간이 얼마 안 지났다면,
            // 0초의 벽에 부딪히지 않도록 100바퀴의 시간을 미래로 워프시킵니다.
            if (trackRate < 0) {
                const duration = anim.effect.getTiming().duration;
                if (anim.currentTime < duration * 10) {
                    anim.currentTime += duration * 100;
                }
            }

            anim.playbackRate = trackRate;
            anim.play(); // 멈췄던 레일 출발
        }

        trailSwiper.params.speed = targetSpeed;
        trailSwiper.params.autoplay.reverseDirection = isReverse;

        // slideNext 대신 '정확한 타겟 인덱스'를 추적 (워프 버그 방지)
        const currentTranslate = trailSwiper.getTranslate();
        const snapGrid = trailSwiper.snapGrid;
        const absTranslate = Math.abs(currentTranslate);

        let targetIndex = 0;
        if (!isReverse) {
            targetIndex = snapGrid.findIndex(pos => pos > absTranslate + 1);
            if (targetIndex === -1) targetIndex = snapGrid.length - 1;
        } else {
            for (let i = snapGrid.length - 1; i >= 0; i--) {
                if (snapGrid[i] < absTranslate - 1) {
                    targetIndex = i;
                    break;
                }
            }
        }

        const targetTranslate = -snapGrid[targetIndex];
        const distance = Math.abs(currentTranslate - targetTranslate);
        const slideSize = snapGrid[1] - snapGrid[0] || 360;

        let remainingTime = (distance / slideSize) * targetSpeed;
        if (remainingTime < 10) remainingTime = targetSpeed;

        // 계산된 목적지 인덱스로 오차 없이 즉시 출발
        trailSwiper.slideTo(targetIndex, remainingTime);

        // 목적지에 도착하면 무한 스크롤 엔진 재가동
        conveyorTimeout = setTimeout(() => {
            if (currentMode === mode) {
                trailSwiper.params.speed = targetSpeed;
                trailSwiper.autoplay.start();
            }
        }, remainingTime);
    }

    const modeButtons = [
        [btnPlay, 'play'],
        [btnPause, 'pause'],
        [btnFF, 'ff'],
        [btnRew, 'rew'],
    ];
    modeButtons.forEach(([btn, mode]) => {
        if (!btn) return;
        btn.addEventListener('click', () => {
            if (currentMode === mode) return;
            setActiveBtn(btn);
            changeConveyorState(mode);
        });
    });

    // ----- 트레일러 카드 렌더링 -----
    function renderTrailerCards(dataArray) {
        trailSwiper.removeAllSlides();

        // 무한 루프가 자연스럽게 돌도록 데이터 개수 불리기 (최소 10개)
        let safeDataArray = [...dataArray];
        while (safeDataArray.length && safeDataArray.length < 10) {
            safeDataArray = [...safeDataArray, ...dataArray];
        }

        const newSlides = safeDataArray.map((item, index) => {
            // 4개의 테마를 순서대로 무한 반복 배정
            const theme = boxThemes[index % boxThemes.length];

            // 숫자로 변환 후 한국식 천 단위 쉼표 + '원'
            const formattedPrice = Number(item.price).toLocaleString('ko-KR') + '원';

            return `
        <div class="swiper-slide">
            <div class="product-bundle">

                <div class="product-card" style="border-color: ${theme.themeColor};">
                    <div class="card-img-wrap">
                        <img src="${item.imgUrl}" alt="${item.title}">
                    </div>
                    <div class="card-info">
                        <h4 class="item-name">${item.title}</h4>
                        <p class="item-price" style="color: ${theme.themeColor};">${formattedPrice}</p>
                    </div>
                </div>

                <img src="${theme.bgImg}" class="box-img" alt="박스">

            </div>
        </div>
        `;
        });

        trailSwiper.appendSlide(newSlides);
        trailSwiper.update();
        trailSwiper.slideToLoop(0, 0);
    }

    renderTrailerCards(data);

    // 렌더링 직후 꺼져버린 모터에 강제 시동을 겁니다.
    // (브라우저가 상자를 다 그릴 때까지 0.1초 기다린 뒤 출발)
    setTimeout(() => {
        currentMode = null; // 중복 클릭 방지 로직을 통과시키기 위해 잠시 비움
        changeConveyorState('play');
    }, 100);

    return { swiper: trailSwiper, renderTrailerCards, changeConveyorState };
}
