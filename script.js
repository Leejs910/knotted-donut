
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
//         endTrigger: ".next-section",
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
        endTrigger: ".next-section",
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


