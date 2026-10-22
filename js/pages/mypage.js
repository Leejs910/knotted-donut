// ============================================================
//  mypage.html 전용 엔트리
//  이 페이지에서 쓸 기능만 골라서 조립합니다.
// ============================================================

// --- 모든 페이지 공통 ---
import { initPageFade } from '../modules/pageFade.js';
import { initSmoothScroll } from '../modules/smoothScroll.js';
import { initNavScroll } from '../modules/navScroll.js';
import { initMobileMenu } from '../modules/mobileMenu.js';
import { initLoginModal } from '../modules/loginModal.js';
import { initAuthNav } from '../modules/authNav.js';
import { initAuthGuard } from '../modules/authGuard.js';
import { initFooterBear } from '../modules/footerBear.js';
import { initBannerOverlay } from '../modules/bannerOverlay.js';

// --- 이 페이지에만 있는 섹션 ---
import { initBrandCity } from '../modules/brandCity.js';
import { initMyPage } from '../modules/myPage.js';

// 공통
initPageFade();
initSmoothScroll();
initNavScroll();
initMobileMenu();
initLoginModal();
initAuthNav();
initAuthGuard();

// 🏙️ 배너 — brand 맨 아래와 같은 도시 그림.
// ⚠️ 배너는 납작하고 그림은 1920 x 1000 이라 비율이 전혀 다릅니다.
//    slice(채워 넣기) + 아래 맞춤으로 두어 도시와 캐릭터가 남게 합니다.
initBrandCity({
    holder: document.getElementById('mypageBannerArt'),
    fit: 'xMidYMax slice',

    // 구름은 쓰지 않습니다. 그림에 배경이 없어서, 구름을 지우면 배너의
    // 바탕색(#BDE1EF)이 그대로 하늘이 됩니다.
    clouds: false,
});

// 스크롤을 내리면 배너가 어두워집니다 (다른 배너와 같은 연출)
initBannerOverlay({ trigger: '.mypage-banner', overlay: '.mypage-overlay' });

// 주문조회 / 포인트 / 회원탈퇴
initMyPage();

// 푸터
initFooterBear();
