// ============================================================
//  index.html 전용 엔트리
//  이 페이지에서 쓸 기능만 골라서 조립합니다.
//  새 페이지를 만들 때는 이 파일을 복사한 뒤, 필요 없는 줄을 지우세요.
// ============================================================

import { newMenuData, bestMenuData, cardData, instaData } from '../data/donutData.js';

// --- 모든 페이지 공통 ---
import { initSmoothScroll } from '../modules/smoothScroll.js';
import { initNavScroll } from '../modules/navScroll.js';
import { initMobileMenu } from '../modules/mobileMenu.js';
import { initLoginModal } from '../modules/loginModal.js';
import { initAuthNav } from '../modules/authNav.js';
import { initAuthGuard } from '../modules/authGuard.js';
import { initFooterBear } from '../modules/footerBear.js';

// --- 이 페이지에만 있는 섹션 ---
import { initShootingStars } from '../modules/shootingStar.js';
import { initHeroDecoScroll } from '../modules/heroDecoScroll.js';
import { initClouds } from '../modules/clouds.js';
import { initDonutSection } from '../modules/donutSection.js';
import { initShopSign } from '../modules/shopSign.js';
import { initConveyor } from '../modules/conveyor.js';
import { initInstaSection } from '../modules/instaSwiper.js';

// 공통
initSmoothScroll();
initNavScroll();
initMobileMenu();
initLoginModal();
initAuthNav();
initAuthGuard();

// 히어로
initShootingStars();
initHeroDecoScroll();

// 신메뉴 / 베스트셀러
initClouds();
initDonutSection({ newData: newMenuData, bestData: bestMenuData });

// 온라인 샵
initShopSign();
initConveyor({ data: cardData });

// 인스타그램
initInstaSection({ data: instaData });

// 푸터
initFooterBear();
