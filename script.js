
//   // 현재 스크롤 위치가 비디오 섹션의 높이를 넘었는지 확인
//   if (window.scrollY > videoSectionHeight - 100) { 
//     // -100은 영상이 끝나기 조금 전부터 색이 바뀌게 하여 부드러운 느낌을 줌
//     nav.classList.add('scrolled');
//   } else {
//     nav.classList.remove('scrolled');
//   }
// });



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







// ==================GSAP========================
// gsap.to(".deco-wrap", {
//     scrollTrigger: {
//         trigger: ".video-hero",
//         start: "top top",
//         endTrigger: ".newAndBest",
//         end: "top center",
//         scrub: 3, 
//     },
//     y: 1200,         // 상자가 아래로 떨어짐
//     rotation: 360,  // 상자가 빙글빙글 돎

//     opacity:{
//         value:0,
//         ease: "expo.out"
//     },     // 상자가 투명해짐
//     stagger: 0.1,
//     ease: "none"
// });


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

// 각각의 버튼에 클릭 이벤트를 달아줍니다.
btnNew.addEventListener('click', () => handleToggle(btnNew, btnBest));
btnBest.addEventListener('click', () => handleToggle(btnBest, btnNew));





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
    slidesPerView: 5,
    loop: true,
    loopedSlides: 7, 

   




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





const newMenuData = [
    { 
        title: "우유 생크림 도넛", 
        imgUrl: "./img_menu/a_02.png", // 도넛 이미지 경로 (실제 파일명으로 변경)
        bgImg: "./img/cardGreen.png",   // 카드 배경 이미지
        themeColor: "#89D9B9",          // 이름표 배경색 (카드 색상과 깔맞춤)
    },
    { 
        title: "딸기 베리 도넛", 
        imgUrl: "./img/", 
        bgImg: "./img/cardPink.png", 
        themeColor: "#FFAFC8", 
    },
    { 
        title: "블루베리 크림 도넛", 
        imgUrl: "./img/donut_blueberry.png", 
        bgImg: "./img/cardBlue.svg", 
        themeColor: "#A6C8FF", 
    },
    // ... 원하는 만큼 데이터 추가 (무한루프를 위해 5개 이상 권장)
];

const bestMenuData = [
    // 베스트셀러 도넛 데이터들... (형식은 위와 동일하게 작성)
];

















// ==========================================
// 🛠️ 카드를 렌더링하는 핵심 함수
// ==========================================
function renderDonutCards(dataArray) {
    // 1. 기존 스와이퍼에 있던 슬라이드를 싹 다 지웁니다.
    cardSwiper.removeAllSlides();

    // 2. 데이터를 돌면서 HTML 구조(문자열)를 찍어냅니다.
    const newSlides = dataArray.map(item => `
        <div class="swiper-slide card">
            <img src="${item.bgImg}" class="card-bg" alt="배경">
            
            <img src="${item.imgUrl}" class="donut-pic" alt="${item.title}">
            
            <div class="donut-name-box" style="background-color: ${item.themeColor};">
                ${item.title}
            </div>
        </div>
    `);

    // 3. 만들어진 슬라이드들을 스와이퍼에 밀어 넣습니다.
    cardSwiper.appendSlide(newSlides);
    
    // 4. 버그 방지를 위해 스와이퍼 내부 렌더링을 강제로 업데이트하고 맨 처음으로 돌립니다.
    cardSwiper.update();
    cardSwiper.slideToLoop(0, 0); // (인덱스 0번, 애니메이션 속도 0초)
}


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
