

// 1. SVG 파일이 있는 경로를 적어줍니다 (실제 경로에 맞게 수정하세요)
const svgUrl = './img/bear-sign.svg';
// 2. fetch 함수로 파일을 불러옵니다
fetch(svgUrl)
    .then(response => response.text()) // 파일 내용을 '글자(텍스트)'로 변환
    .then(svgCode => {
        // 3. 변환된 기나긴 SVG 코드를 HTML의 빈 상자 안에 통째로 집어넣습니다!
        document.querySelector('#shopTitleBox').innerHTML = svgCode;
    })
    .catch(error => console.error('SVG를 불러오는데 실패했습니다:', error));


import { newMenuData } from './donutData.js';
import { bestMenuData } from './donutData.js';
import { cardData } from './donutData.js'; // 데이터 파일 경로에 맞게 수정하세요
import { instaData } from './donutData.js'; // 데이터 파일 경로에 맞게 수정하세요



// ==========================================
// 1. Lenis 스무스 스크롤 초기화
// ==========================================
const lenis = new Lenis({
    duration: 1.2, // 스크롤이 미끄러지는 시간 (클수록 부드러움)
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);







// 1. 필요한 요소 선택
const navbar = document.querySelector('.navbar');
let lastScrollY = window.scrollY; // 초기 스크롤 위치 저장

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY; // 현재 스크롤 위치

  // 조건 1: 스크롤이 맨 위(0)에 도달했을 때
  if (currentScrollY <= 0) {
    navbar.classList.remove('nav-hidden'); // 보이게 함
    navbar.classList.remove('nav-solid');  // 투명하게 만듦 (배경 제거)
  } 
  // 조건 2: 스크롤을 아래로 내릴 때 (현재 위치가 이전 위치보다 클 때)
  else if (currentScrollY > lastScrollY) {
    navbar.classList.add('nav-hidden');    // 위로 숨김
  } 
  // 조건 3: 스크롤을 위로 올릴 때 (현재 위치가 이전 위치보다 작을 때)
  else {
    navbar.classList.remove('nav-hidden'); // 다시 내려와서 보이게 함
    navbar.classList.add('nav-solid');     // 배경색을 흰색으로 채움
  }

  // 2. 다음 스크롤 이벤트를 위해 현재 위치를 이전 위치로 업데이트
  lastScrollY = currentScrollY;
});


// --- 별똥별 생성 로직 ---
function createShootingStar() {
    // 1. 별똥별을 담을 부모 요소 찾기
    const decorations = document.querySelector('.decorations');
    if (!decorations) return; // 요소가 없으면 실행 안 함

    // 2. 별똥별 태그 <div> 생성
    const star = document.createElement('div');
    star.classList.add('shooting-star');

    // 3. 시작 위치를 화면 윗부분의 랜덤한 곳으로 설정
    // 가로: 화면 너비 전체 중 랜덤
    const startX = Math.random() * window.innerWidth;
    // 세로: 화면 상단 0 ~ 40% 사이 랜덤 (너무 아래에서 시작하지 않게)
    const startY = Math.random() * (window.innerHeight * 0.4);

    star.style.left = `${startX}px`;
    star.style.top = `${startY}px`;

    // 4. 화면에 별똥별 추가
    decorations.appendChild(star);

    // 5. 애니메이션이 끝난 후(1.5초) HTML에서 완전히 삭제하여 메모리 관리
    setTimeout(() => {
        star.remove();
    }, 1500); 
}

// --- 2. 랜덤 무리(Burst) 생성 로직 (여기가 핵심!) ---
function randomShootingStarLoop() {
    // 이번 턴에 떨어뜨릴 별의 개수를 1개 ~ 3개 중에서 랜덤으로 뽑기
    // Math.random() * 3 은 0~2.999... 를 반환하므로 floor로 버림 후 +1을 해줍니다.
    const starCount = Math.floor(Math.random() * 3) + 1;

    // 뽑힌 개수만큼 반복해서 별똥별 생성
    for (let i = 0; i < starCount; i++) {
        // 여러 개가 한 번에 떨어질 때 약간의 시차(0초 ~ 0.5초)를 주어 자연스럽게 연출
        const delay = Math.random() * 500; 
        
        setTimeout(() => {
            createShootingStar();
        }, delay);
    }

    // 다음 유성우가 내릴 때까지의 대기 시간 (예: 2초 ~ 5초 사이)
    const nextTime = Math.random() * 3000 + 2000; 
    setTimeout(randomShootingStarLoop, nextTime);
}

// --- 3. 실행 ---
window.addEventListener('DOMContentLoaded', () => {
    randomShootingStarLoop();
});







//커스텀 곡선
gsap.registerPlugin(CustomEase);
CustomEase.create("myExpo", "0.7, 0, 1, 0.1");
// 1. 타임라인(Timeline) 생성: 여기에 ScrollTrigger를 한 번만 연결합니다.
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".video-hero",
        start: "top top",
        endTrigger: ".newAndBest",
        end: "top center",
        scrub: 5, // 마우스 움직임에 살짝 부드럽게 따라오게 만듦
    }
});

// 2. 위치 & 회전 애니메이션 (정직하게 스크롤 속도에 맞춤)
tl.to(".deco-wrap", {
    y: 1200,
    rotation: 360,
    stagger: 0.1, //순차적으로 출발하게 만드는 시간차 delay
    ease: "none"  //가속도 
}, 0); // 👈 맨 끝의 '0'은 타임라인의 '0초(처음)'부터 시작하라는 뜻입니다.

// 3. 투명도 애니메이션 (지수형 감속 적용)
tl.to(".deco-wrap", {
    opacity: 0,
    stagger: 0.1,
    
    // ✨ 스크롤을 내릴 때 처음엔 선명하다가, 끝날 때쯤 스르륵 사라지게 하려면 'expo.in'이 훨씬 자연스럽습니다.
    ease: "myExpo"   
}, 0); // 👈 여기도 '0'을 주어, 위치 이동 애니메이션과 완벽하게 동시에 실행되도록 묶어줍니다.





// ----------------------------------------------- bestAndNew------------------

// HTML에서 버튼과 뱃지 요소를 찾아옵니다.
const btnNew = document.getElementById('btn-new');
const btnBest = document.getElementById('btn-best');
const badge = document.querySelector('.toggle-badge');

// 토글 기능 함수
function handleToggle(clickedBtn, otherBtn) {
    // 이미 활성화된 버튼을 또 누르면 무시합니다.
    if (clickedBtn.classList.contains('active')) return;

    // 1. 색상 반전 (클래스 교체)
    clickedBtn.classList.add('active');
    otherBtn.classList.remove('active');

    // 2. 통통 튕기는 애니메이션 실행
    // 💡 마법의 코드: 애니메이션을 즉시 재시작하려면, 클래스를 지운 직후 브라우저 렌더링을 강제로 한 번 새로고침(Reflow) 해줘야 합니다.
    badge.classList.remove('animate-bounce');
    void badge.offsetWidth; // 브라우저에게 "크기 다시 계산해!" 라고 명령 (Reflow)
    badge.classList.add('animate-bounce');
}

// ✨ 1. 색상을 바꿀 대상 요소들을 미리 찾아둡니다.
const sectionNewAndBest = document.querySelector('.newAndBest');
// (주의: HTML에 <div class="wave-divider color-blue"> 처럼 되어있다고 가정합니다)
const topWave = document.querySelector('.wave-top .wave-divider');

// 각각의 버튼에 클릭 이벤트를 달아줍니다.
// ✨ 2. 신메뉴 버튼 클릭 시 (파란색으로 원상 복구)
btnNew.addEventListener('click', () => {
    handleToggle(btnNew, btnBest);
    renderDonutCards(newMenuData); 
    
    // 섹션 배경을 다시 파란색(기본값)으로
    sectionNewAndBest.classList.remove('theme-pink');
    
    // 물결 색상을 핑크에서 파란색으로 교체
    topWave.classList.remove('color-pink');
    topWave.classList.add('color-blue');
});


// ✨ 3. 베스트 버튼 클릭 시 (핑크색 테마로 변경)
btnBest.addEventListener('click', () => {
    handleToggle(btnBest, btnNew);
    renderDonutCards(bestMenuData); 
    
    // 섹션 배경에 핑크색 클래스 추가
    sectionNewAndBest.classList.add('theme-pink');
    
    // 물결 색상을 파란색에서 핑크색으로 교체
    topWave.classList.remove('color-blue');
    topWave.classList.add('color-pink');
});


// ==========================================
// ☁️ 리소스 최적화: 랜덤 구름 생성기 (Object Pooling)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('cloud-container');
    if (!container) return;

    const MAX_CLOUDS = 6; // 화면에 동시에 띄울 구름 개수 (조절 가능)

    // 구름에 랜덤 속성을 부여하고 출발시키는 함수
    function respawnCloud(cloudElement, isFirstSpawn = false) {
        // 1. 랜덤 값 추출
        const randomImgNum = Math.floor(Math.random() * 6) + 1; // 1 ~ 6번 이미지
        const randomTop = Math.random() * 50; // 0% ~ 50% (하늘 윗부분에서만 스폰)
        const randomWidth = Math.random() * 100 + 400; // 100px ~ 200px 사이의 랜덤 크기
        const randomDuration = Math.random() * 30 + 20; // 20초 ~ 50초 사이의 랜덤 이동 속도

        // 2. 구름 요소에 랜덤 값 주입
        cloudElement.src = `./img/cloud_${randomImgNum}.png`;
        cloudElement.style.top = `${randomTop}%`;
        cloudElement.style.width = `${randomWidth}px`;
        cloudElement.style.animationDuration = `${randomDuration}s`;

        // 3. 엇박자 스폰을 위한 초기 딜레이 설정 (첫 생성 시에만)
        if (isFirstSpawn) {
            // 처음 렌더링될 때 구름들이 뭉쳐서 나오지 않도록 0~20초 사이의 랜덤 딜레이를 줌
            cloudElement.style.animationDelay = `${Math.random() * 20}s`;
        } else {
            // 끝까지 갔다가 다시 스폰될 때는 딜레이 없이 바로 출발
            cloudElement.style.animationDelay = '0s'; 
        }

        // 4. 애니메이션 초기화 및 재시작 (Reflow Trick)
        cloudElement.classList.remove('cloud-moving');
        void cloudElement.offsetWidth; // 브라우저에게 변경사항을 즉시 계산하도록 강제함
        cloudElement.classList.add('cloud-moving');
    }

    // 초기 구름 5개 생성 및 배치
    for (let i = 0; i < MAX_CLOUDS; i++) {
        const cloud = document.createElement('img');
        cloud.classList.add('random-cloud');
        
        container.appendChild(cloud);

        // 🌟 핵심: 구름의 애니메이션이 끝나는(화면 밖으로 나가는) 순간을 감지
        cloud.addEventListener('animationend', () => {
            // 끝났으면 위치, 크기, 이미지를 새로 뽑아서 다시 출발시킴!
            respawnCloud(cloud, false); 
        });

        // 최초 1회 스폰 실행  
        respawnCloud(cloud, true); 
    }
});

// ======================카드 섹션 Swiper 초기화===========================
const cardSwiper = new Swiper('.mySwiper', {
    effect: 'creative', 
    grabCursor: true,
    centeredSlides: true,
    // slidesPerView: 5,
    // loop: true,
    // loopedSlides: 7, 

    // 📱 기본값 (모바일 등 가장 작은 화면 기준)
    slidesPerView: 1.5, // 모바일에서는 가운데 1개, 양옆에 살짝 걸치게
    loop: true,
    loopedSlides: 7, 

    // ✨ 핵심 해결 로직: 화면 크기별로 보여줄 카드 개수 조절
    breakpoints: {
        // 💻 1024px 이하 (태블릿 환경) - 1024px이 '넘기 전' 구간
        768: {
            slidesPerView: 3, // 카드 크기를 유지하면서 3개만 널찍하게 보여줌
        },
        // 🖥️ 1025px 이상 (데스크톱 환경)
        1025: {
            slidesPerView: 4, // 기존 데스크톱 화면처럼 5개 유지
        },
        // 🖥️ 1280px 이상 (데스크톱 환경)
        1281: {
            slidesPerView: 5, // 기존 데스크톱 화면처럼 5개 유지
        }
    },




    // ✨ 1. 자동 재생 기능 추가
    autoplay: {
        delay: 2500, // 2.5초마다 자동으로 넘어감 (1000 = 1초)
        disableOnInteraction: false, // 유저가 카드를 만지거나 스와이프한 후에도 자동 재생 유지
    },

    // ✨ 2. 좌우 화살표 버튼 연결
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
creativeEffect: {
        // ✨ 마법 1: 제한을 10으로 확 늘려서, 화면 밖으로 밀려나는 카드들이 
        // 끝에 뭉치지 않고 궤도를 따라 저 멀리 우주 끝까지(?) 자연스럽게 이동하게 만듭니다.
        limitProgress: 10, 
        
        prev: {
            shadow: false, 
            translate: ['calc(-100% - 20px)', '12%', 0], 
            rotate: [0, 0, -4], 
            
            // ❌ opacity: 0.5; (지워주세요. JS에서는 모든 카드를 선명하게 유지합니다)
        },
        
        next: {
            shadow: false,
            translate: ['calc(100% + 20px)', '12%', 0], 
            rotate: [0, 0, 4], 
            
            // ❌ opacity: 0.5; (지워주세요)
        },
    },
});


const cardThemes = [
    { bgImg: "./img/cardPink.png", themeColor: "#FFAFC8" },
    { bgImg: "./img/cardBlue.png", themeColor: "#A6C8FF" },
    { bgImg: "./img/cardGreen.png", themeColor: "#89D9B9" },
    { bgImg: "./img/cardYellow.png", themeColor: "#F4D03F" } // 노란색 카드 (색상값은 원하시는 대로 수정)
];







// 🛠️ 2. 카드를 렌더링하는 함수
function renderDonutCards(dataArray) {
    cardSwiper.removeAllSlides();


    // ✨ 핵심 해결 로직: 데이터가 충분해질 때까지(최소 10개) 원본 데이터를 계속 이어 붙여 복제합니다.
    let safeDataArray = [...dataArray]; // 원본 데이터 복사
    while (safeDataArray.length < 10) {
        safeDataArray = [...safeDataArray, ...dataArray]; 
    }

    // map 함수는 두 번째 인자로 현재 순서(index: 0, 1, 2, 3...)를 가져올 수 있습니다.
    const newSlides = safeDataArray.map((item, index) => {
        
        // ✨ 핵심 마법: 인덱스를 4(테마 개수)로 나눈 '나머지'를 구합니다!
        // 0 % 4 = 0 (핑크)
        // 1 % 4 = 1 (블루)
        // 2 % 4 = 2 (그린)
        // 3 % 4 = 3 (옐로우)
        // 4 % 4 = 0 (다시 핑크!) -> 무한 사이클 완성
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

// 화면 렌더링 실행
renderDonutCards(newMenuData);


// ==========================================
// 🖱️ 토글 버튼 클릭 시 데이터 교체 이벤트
// ==========================================
btnNew.addEventListener('click', () => {
    handleToggle(btnNew, btnBest); // 기존에 만드신 젤리 바운스 애니메이션 함수
    renderDonutCards(newMenuData); // 신메뉴 데이터로 화면 그리기
});

btnBest.addEventListener('click', () => {
    handleToggle(btnBest, btnNew);
    renderDonutCards(bestMenuData); // 베스트 데이터로 화면 그리기
});

// 화면이 처음 켜졌을 때 기본으로 신메뉴 카드를 보여주기 위해 1회 실행
document.addEventListener("DOMContentLoaded", () => {
    renderDonutCards(newMenuData); 
});



// --- 컨베이어 벨트용 Swiper (연속 스크롤) ---
const trailSwiper = new Swiper('.trail-swiper', {
    loop: true,               // 무한 반복
    // 📱 [1] 기본값: 767px 이하 모바일 환경 (일반 카드 스와이프)
    slidesPerView: 'auto',      // 화면에 중심 카드 1개 + 양옆 카드 꼬리가 살짝 걸치게 하여 넘김 유도
    centeredSlides: true,    // 보고 있는 카드를 화면 정중앙에 고정
    spaceBetween: 20,        // 카드와 카드 사이 여백
    speed: 400,              // 슬라이드가 넘어갈 때 걸리는 속도 (0.4초)
    autoplay: {
        delay: 1000,         // 3초마다 자동으로 스르륵 넘어감
        disableOnInteraction: false, // 손가락으로 만진 후에도 자동 재생 유지
    },

    // 🖥️ [2] 반응형 분기점: 768px 이상 (다시 부드러운 컨베이어 벨트로 전환)
    breakpoints: {
        768: {
            slidesPerView: 'auto',
            centeredSlides: false,
            spaceBetween: 80,
            speed: 5000,    // 아주 느린 속도(17.5초)로 딜레이 없이 흘러가게 만듦
            autoplay: {
                delay: 0,    // 대기 시간 없이 continuous 재생
                disableOnInteraction: false,
            },
            allowTouchMove: false, 
        }
    }



    // 기존 것 


    // slidesPerView: 'auto',    // CSS에 지정한 크기(.product-bundle)에 맞춰 배치
    // spaceBetween: 80,         // 박스와 박스 사이의 여백 (픽셀)
    
    // // ✨ 레일과 싱크를 맞출 핵심 속도 설정 (숫자를 조절해보세요)
    // speed: 5000,              // 카드가 한 바퀴를 도는 데 걸리는 시간 (밀리초)
    
    // autoplay: {
    //     delay: 0,             // 중간에 멈추는 시간 없이
    //     disableOnInteraction: false, // 마우스로 건드려도 계속 굴러가게 설정
    // },
    
    // (선택) 마우스로 잡아끄는 걸 막고 싶다면 주석을 푸세요
    // allowTouchMove: false, 
});

// =========================================
// 🎛️ 컨베이어 벨트 미디어 컨트롤러 (워프 버그 완벽 제거판)
// =========================================

const track = document.querySelector('.trail-track');
const btnFF = document.getElementById('btn-ff');
const btnPlay = document.getElementById('btn-play');
const btnPause = document.getElementById('btn-pause');
const btnRew = document.getElementById('btn-rew');

const btns = [btnFF, btnPlay, btnPause, btnRew];
let currentMode = 'play'; 
let conveyorTimeout = null; 

function setActiveBtn(activeBtn) {
    btns.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

// ⚙️ 스와이퍼와 레일의 상태를 한 번에 조작하는 마스터 함수
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
    const anims = track.getAnimations();

    if (mode === 'pause') {
        // [정지 모드]
        if (anims.length > 0) anims[0].pause(); 
    } 
    else {
        // [재생 / 빨리감기 / 되감기 모드]
        let targetSpeed = 5000; 
        let trackRate = 1;      
        let isReverse = false;  

        if (mode === 'play') { targetSpeed = 5000; trackRate = 1; isReverse = false; }
        else if (mode === 'ff') { targetSpeed = 1000; trackRate = 5; isReverse = false; }
        else if (mode === 'rew') { targetSpeed = 1000; trackRate = -5; isReverse = true; }

        if (anims.length > 0) {
            const anim = anims[0];
            
            // ✨ 핵심 마법: 트레일러 '시간 여행 (Time Travel)'
            // 뒤로 감기(trackRate < 0)를 하는데 애니메이션 시간이 얼마 안 지났다면?
            if (trackRate < 0) {
                // CSS에 설정된 1바퀴 도는 시간 (17.5초 = 17500ms)
                const duration = anim.effect.getTiming().duration; 
                // 시간이 10바퀴도 안 지났을 때 0초의 벽에 부딪히는 것을 막기 위해
                if (anim.currentTime < duration * 10) {
                    // 아무도 모르게 100바퀴(duration * 100)의 시간을 미래로 워프시킵니다!
                    anim.currentTime += duration * 100; 
                }
            }
            
            anim.playbackRate = trackRate;
            anim.play(); // 멈췄던 레일 출발
        }

        trailSwiper.params.speed = targetSpeed;
        trailSwiper.params.autoplay.reverseDirection = isReverse;
        
        // slideNext 대신 '정확한 타겟 인덱스' 추적
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

        // 계산된 목적지 인덱스로 오차 없이 즉시 출발!
        trailSwiper.slideTo(targetIndex, remainingTime);
        
        // 목적지에 도착하면 무한 스크롤 엔진 재가동
        conveyorTimeout = setTimeout(() => {
            if (currentMode === mode) {
                trailSwiper.params.speed = targetSpeed;
                trailSwiper.autoplay.start();
            }
        }, remainingTime);
    }
}
// 🖱️ 클릭 이벤트 연결
btnPlay.addEventListener('click', () => {
    if(currentMode === 'play') return; 
    setActiveBtn(btnPlay);
    changeConveyorState('play');
});

btnPause.addEventListener('click', () => {
    if(currentMode === 'pause') return;
    setActiveBtn(btnPause);
    changeConveyorState('pause');
});

btnFF.addEventListener('click', () => {
    if(currentMode === 'ff') return;
    setActiveBtn(btnFF);
    changeConveyorState('ff');
});

btnRew.addEventListener('click', () => {
    if(currentMode === 'rew') return;
    setActiveBtn(btnRew);
    changeConveyorState('rew');
});


// 2. 박스 테마 배열
const boxThemes = [
    { bgImg: "./img/boxPink.png", themeColor: "#FFAFC8" },
    { bgImg: "./img/boxBlue.png", themeColor: "#A6C8FF" },
    { bgImg: "./img/boxGreen.png", themeColor: "#89D9B9" },
    { bgImg: "./img/boxYellow.png", themeColor: "#F4D03F" } 
];

// 3. 트레일러 카드를 렌더링하는 함수 생성
function renderTrailerCards(dataArray) {
    // trailSwiper에 기존 슬라이드가 있다면 초기화 (이전 trailSwiper 선언부 아래에 작성)
    trailSwiper.removeAllSlides();

    // 무한 루프(loop: true)가 자연스럽게 돌기 위해 데이터 개수 불리기 (최소 10개 이상)
    let safeDataArray = [...dataArray];
    while (safeDataArray.length < 10) {
        safeDataArray = [...safeDataArray, ...dataArray]; 
    }

    const newSlides = safeDataArray.map((item, index) => {
        // ✨ 마법 1: 4개의 테마를 순서대로 무한 반복 배정
        const theme = boxThemes[index % boxThemes.length];

        // ✨ 마법 2: 숫자로 변환 후 한국식 천 단위 쉼표 찍기 + '원' 붙이기
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

    // 스와이퍼에 생성된 슬라이드들을 넣고 업데이트
    trailSwiper.appendSlide(newSlides);
    trailSwiper.update();
    trailSwiper.slideToLoop(0, 0); 
}

// 4. 화면이 켜질 때 최초 1회 렌더링 실행
document.addEventListener("DOMContentLoaded", () => {
    // DOM 로드 시 실행 (만약 위쪽에서 한 번에 묶어서 실행중이라면 거기에 추가하셔도 됩니다)
    renderTrailerCards(cardData);

    // ✨ 새로고침 버그 픽스: 렌더링 직후 꺼져버린 모터에 강제 시동 걸기!
    // (버튼 클릭 방지 로직을 무사히 통과하도록 currentMode를 잠시 비운 뒤 실행합니다)
    // ✨ 핵심 픽스: 브라우저가 상자를 다 그릴 때까지 0.1초(100ms)만 숨을 고릅니다!
    setTimeout(() => {
        currentMode = null; 
        changeConveyorState('play'); // 0.1초 뒤에 완벽한 타이밍으로 출발!
    }, 100);
});





// 2. 카드 동적 렌더링 함수
function renderInstaCards() {
    const wrapper = document.getElementById('insta-wrapper');
    if (!wrapper) return;

    // 데이터를 순회하며 HTML 문자열 생성
    const html = instaData.map(item => `
        <div class="swiper-slide">
            <a href="${item.linkUrl}" class="insta-card" target="_blank">
                <img src="${item.imgUrl}" alt="인스타그램 피드 이미지">
            </a>
        </div>
    `).join('');

    wrapper.innerHTML = html;
}

// 3. 인스타그램 섹션 스와이퍼 초기화 함수
function initInstaSwiper() {
    new Swiper('.insta-swiper', {
        loop: true, // 무한 반복
        speed: 800, // 넘어가는 애니메이션 속도
        spaceBetween: 25, // 카드 사이 간격
        
        // 🔄 자동 재생 설정
        autoplay: {
            delay: 3000, // 3초마다 롤링
            disableOnInteraction: false, // 마우스 건드려도 안 멈춤
            pauseOnMouseEnter: true, // 마우스 올렸을 때만 일시정지 (호버 효과를 편하게 보기 위함)
        },
        
        // 🔘 버튼 연결
        navigation: {
            nextEl: '.insta-btn-next',
            prevEl: '.insta-btn-prev',
        },
        
        // 📱 반응형 분기점 설정 (화면 크기에 따라 보여지는 카드 개수 자동 조절)
        breakpoints: {
            // 모바일
            320: { slidesPerView: 1.2, spaceBetween: 15 },
            // 태블릿
            768: { slidesPerView: 3, spaceBetween: 20 },
            // 데스크탑 (제공해주신 이미지처럼 한 화면에 4~5개 정도)
            1024: { slidesPerView: 4, spaceBetween: 25 },
            1400: { slidesPerView: 5, spaceBetween: 30 },
        }
    });
}

// 4. 문서 로드 시 실행
document.addEventListener("DOMContentLoaded", () => {
    renderInstaCards();
    // DOM에 카드를 먼저 주입한 뒤 스와이퍼 모터를 켭니다.
    setTimeout(() => {
        initInstaSwiper();
    }, 100);
});


// =========================================
// 🎨 1. 캔버스 및 반응형 세팅
// =========================================
const canvas = document.getElementById('footer-canvas');
const ctx = canvas.getContext('2d');
const BASE_WIDTH = 1440; 
let scaleRatio = 1; 

function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    scaleRatio = canvas.width / BASE_WIDTH;

    // if (scaleRatio > 1.2) scaleRatio = 1.2;
    // if (scaleRatio < 0.4) scaleRatio = 0.4;

    // 🎯 변경된 마법의 공식: 
    // 화면 너비가 1280px 이상일 때는 무조건 비율을 1(100%)로 고정합니다!
    if (canvas.width >= 1280) {
        scaleRatio = 1; 
    } else if (canvas.width >= 768) {
        // ✨ 태블릿 구간 (768px ~ 1024px): 곰돌이가 너무 작아지지 않게 방어막!
        // 0.95는 원본의 95% 크기를 의미합니다. 눈으로 보시고 0.9 ~ 1.0 사이로 입맛에 맞게 조절해 보세요.
        scaleRatio = 0.95; 
    } else {
        // 📱 모바일 구간 (767px 이하): 모바일 화면 비율에 맞춰 다시 부드럽게 축소
        // 모바일은 기준점을 768로 잡아주어야 갑자기 확 작아지지 않고 스무스하게 줄어듭니다.
        scaleRatio = canvas.width / 768; 
    }
    
    // 최소 크기 방어막 (화면이 아무리 작아져도 원래 크기의 50% 이하로는 안 줄어듦)
    if (scaleRatio < 0.5) scaleRatio = 0.5;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// =========================================
// 🐻 2. 스프라이트 시트 세팅
// =========================================
const spriteSheet = new Image();
spriteSheet.src = './img/spriteBear.png'; 
const TOTAL_FRAMES = 5; 
const walkSequence = [0, 1, 2, 3, 4, 3, 2, 1]; // 핑퐁 재생 순서

// 캐릭터 상태 (위치 이동 로직 전부 삭제)
const char = {

    // 화면에 보여질 캐릭터의 기본 크기 (원하시는 대로 조절)
    width: 330,  
    height: 396, 
    seqIndex: 0, 
    frameTimer: 0,
    frameDelay: 10 // 걸음 속도 (작을수록 발을 빨리 구름)
};

// =========================================
// 🔄 3. 고정 애니메이션 루프
// =========================================
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ✨ 애니메이션 프레임 업데이트 (무조건 계속 걷기)
    char.frameTimer++;
    if (char.frameTimer >= char.frameDelay) {
        char.seqIndex = (char.seqIndex + 1) % walkSequence.length; 
        char.frameTimer = 0;
    }

    // ✨ 곰돌이의 고정 위치 (항상 화면 정중앙, 바닥 기준)
    const fixedX = canvas.width / 2;
    const fixedY = canvas.height - (250 * scaleRatio); 

    ctx.save(); 
    ctx.translate(fixedX, fixedY); 
    // (이제 방향을 뒤집을 필요가 없으므로 scale(-1, 1) 로직도 삭제되었습니다)

    // 마법의 그리기 로직 (스프라이트 자르기)
    if (spriteSheet.complete) {
        const frameWidth = spriteSheet.width / TOTAL_FRAMES; 
        const frameHeight = spriteSheet.height;
        const currentFrame = walkSequence[char.seqIndex];
        const sourceX = currentFrame * frameWidth; 
        
        const scaledWidth = char.width * scaleRatio;
        const scaledHeight = char.height * scaleRatio;

        ctx.drawImage(
            spriteSheet,   
            sourceX, 0,    
            frameWidth, frameHeight, 
            -scaledWidth / 2, -scaledHeight / 2, 
            scaledWidth, scaledHeight 
        );
    }

    ctx.restore(); 
    requestAnimationFrame(gameLoop);
}

// 🚀 실행
spriteSheet.onload = () => {
    requestAnimationFrame(gameLoop);
};

// =========================================
// 🏪 4개의 건물 SVG 랜덤 스폰 시스템
// =========================================

// 1. 사용할 건물 SVG 파일들의 경로 배열 (임의로 building1.svg 등으로 명명)
const buildingAssets = [
    './img/building0.svg',
    './img/building1.svg',
    './img/building2.svg',
    './img/building3.svg'
];

const container = document.querySelector('.footer-store-building');

// 2. 무작위 건물을 생성하여 흘려보내는 함수
// ✨ 매개변수 `isFirst`를 추가하여 첫 번째 건물인지 구분합니다.
function spawnBuilding(isFirst = false) {
    if (!container) return; // 컨테이너가 없으면 실행 안 함

    // 🎯 마법 1: 4개의 에셋 중 무작위로 하나 선택
    const randomIndex = Math.floor(Math.random() * buildingAssets.length);
    const selectedBuilding = buildingAssets[randomIndex];

    // 🎯 마법 2: HTML <img> 태그 동적 생성
    const newBuilding = document.createElement('img');
    newBuilding.src = selectedBuilding; // 무작위로 선택된 SVG 경로 설정
    newBuilding.className = 'spawned-building'; // CSS 클래스 부여
    newBuilding.alt = '스토어 건물';


    // 🎯 핵심: 첫 번째 건물이라면 캔버스 중앙(곰돌이 뒤)에서 나타나도록 애니메이션 시간을 당깁니다.
    if (isFirst) {
        // 애니메이션 총 시간이 15초(15s)라고 가정할 때,
        // -3.5s ~ -4s 정도를 주면 화면 오른쪽에서 이미 출발해서 중앙쯤 도착한 상태로 렌더링됩니다.
        newBuilding.style.animationDelay = '-10.5s'; 
    }
    
    // 🎯 마법 3: 애니메이션이 끝나면 자동으로 DOM에서 삭제하는 기능 (최적화)
    newBuilding.addEventListener('animationend', () => {
        newBuilding.remove(); // 캔버스 밖으로 나가서 애니메이션이 끝나면 삭제
    });

    // 🎯 마법 4: 생성된 건물을 컨테이너 안에 넣기 (화면 오른쪽에 뿅 나타남)
    container.appendChild(newBuilding);
}

// 3. 무작위 간격으로 계속 스폰되도록 타이머 설정
// (주의: `spawnBuilding()` 함수 자체는 무한 루프가 아니므로, 타이머로 계속 튕겨줘야 합니다)
function initBuildingSpawner() {
    // 처음 켜지자마자 하나 스폰
    spawnBuilding(true);

    // 이후 4초~7초 사이의 무작위 간격으로 계속 스폰
    // 🎯 3. 스폰 속도 조절: 숫자를 키워서 띄엄띄엄 나오게 만듭니다
    const minDelay = 8000; // 최소 
    const maxDelay = 15000; // 최대 
    
    function randomSpawn() {
        spawnBuilding();
        const nextDelay = Math.random() * (maxDelay - minDelay) + minDelay;
        setTimeout(randomSpawn, nextDelay);
    }
    
    // 첫 스폰 후 랜덤 타이머 시작
    setTimeout(randomSpawn, Math.random() * (maxDelay - minDelay) + minDelay);
}

// 4. 문서 로드 시 스폰 시스템 시작
document.addEventListener("DOMContentLoaded", () => {
    initBuildingSpawner();
});




// 푸터 스크롤 애니메이션 
document.addEventListener("DOMContentLoaded", () => {
    
    // ... 기존 코드들 유지 ...

    // ✨ 푸터 오버레이 애니메이션
    gsap.to(".footer-overlay", {
        backgroundColor: "rgba(0, 0, 0, 0.5)", // 목표 상태: 투명도 0.5의 검은색
        duration: 0.5, // 0.5초 동안 부드럽게 변함
        scrollTrigger: {
            trigger: ".site-footer", // 애니메이션이 시작될 기준 요소
            
            // 🚨 핵심: 푸터의 높이 기준 약 2/3(66%) 지점이 화면 하단(bottom)에 닿을 때 실행
            start: "66% bottom", 
            
            // 스크롤 방향에 따른 동작 설정:
            // [화면 진입 시(play), 화면 이탈 시(none), 다시 역방향 진입 시(none), 역방향 이탈 시(reverse)]
            toggleActions: "play none none reverse",
            
            // markers: true // 💡 주석을 풀면 개발자 화면에 시작점이 선으로 표시되어 위치를 세밀하게 잡기 좋습니다.
        }
    });

});




document.addEventListener("DOMContentLoaded", () => {
    const soundBtn = document.getElementById("sound-toggle-btn");
    const soundText = document.getElementById("sound-text");

    // 🎵 실제 배경음악 파일 경로로 수정하세요
    const bgm = new Audio('./music/morning.mp3'); 
    bgm.loop = true;
    bgm.volume = 0.2;
    // 🚀 핵심 최적화: 사용자가 재생하기 전까지는 음원 데이터를 미리 다운로드하지 않음 (로딩 속도 대폭 향상)
    bgm.preload = "none";

    // 1. 기본 상태를 켜짐(true)으로 설정
    let isSoundOn = true; 

    // [보안 대책] 브라우저 자동재생 금지 정책을 우회하기 위해, 
    // 사용자가 첫 클릭을 하는 순간 사운드가 ON 상태라면 음악을 틀어줍니다.
    const playInitialBGM = () => {
        if (isSoundOn) {
            bgm.play().catch(err => console.log("자동재생 제한 우회 대기 중..."));
        }
        // 한 번 실행 후 이벤트 제거
        document.removeEventListener("click", playInitialBGM);
    };
    document.addEventListener("click", playInitialBGM);

    // 2. 사운드 버튼 클릭 이벤트
    soundBtn.addEventListener("click", (e) => {
        e.preventDefault(); // 페이지 위로 튕김 방지
        e.stopPropagation(); // 위의 playInitialBGM과 이벤트가 꼬이지 않도록 방지
        
        isSoundOn = !isSoundOn; // 상태 반전

        if (isSoundOn) {
            // 🔊 다시 켜지는 상태
            soundBtn.classList.add("is-on");
            // soundText.textContent = "SOUND ON";
            bgm.play().catch(err => console.log("재생 오류:", err));
        } else {
            // 🔇 꺼지는 상태
            soundBtn.classList.remove("is-on");
            // soundText.textContent = "SOUND OFF";
            bgm.pause();
            bgm.currentTime = 0;
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    const navbar = document.getElementById("mainNav");

    if (hamburgerBtn && mobileMenu && navbar) {
        hamburgerBtn.addEventListener("click", () => {
            // 햄버거 애니메이션 클래스 온/오프
            hamburgerBtn.classList.toggle("active");
            
            // 모바일 메뉴 아래로 쫙 펼치기
            mobileMenu.classList.toggle("active");
            
            // 메뉴가 하얗게 차므로 네비게이션 아이콘도 검은색으로 맞춰 변경
            navbar.classList.toggle("menu-open");

            // 메뉴 활성화 시 메인 화면이 뒤에서 스크롤되지 않도록 고정
            if (mobileMenu.classList.contains("active")) {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "";
            }
        });
    }
});