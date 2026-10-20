// ============================================================
//  support.html 전용 엔트리
//  이 페이지에서 쓸 기능만 골라서 조립합니다.
// ============================================================

import { faqData, faqCategories } from '../data/faqData.js';

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
import { initSupportBanner } from '../modules/supportBanner.js';
import { initCategoryTabs } from '../modules/categoryTabs.js';
import { initFaqList } from '../modules/faqList.js';

// 공통
initPageFade();
initSmoothScroll();
initNavScroll();
initMobileMenu();
initLoginModal();
initAuthNav();
initAuthGuard();

// 구름이 흐르는 배너
initSupportBanner();

// 스크롤을 내리면 배너가 어두워집니다 (cart / onlineShop 과 같은 연출)
initBannerOverlay({ trigger: '.support-banner', overlay: '.support-overlay' });

// 질문 목록
const faq = initFaqList({
    data: faqData,
    labels: faqCategories,
});

// 카테고리 탭 (menu.html / onlineShop.html 과 같은 모듈)
initCategoryTabs({
    tabsEl: document.getElementById('supportTabs'),
    themeEl: document.querySelector('.support'),
    // ⚠️ ribbons 를 넘기지 않습니다. 배지 그림은 support.html 에 적어 둔
    //    강아지 하나로 고정하고, 카테고리를 바꿔도 그림은 그대로 둡니다.
    //    (통통 튀는 효과와 Q. 색 바뀜은 그대로 동작합니다)
    onChange: (category) => faq && faq.setCategory(category),
});

// 푸터
initFooterBear();
