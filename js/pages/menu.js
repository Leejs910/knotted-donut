// ============================================================
//  menu.html 전용 엔트리
//  이 페이지에서 쓸 기능만 골라서 조립합니다.
// ============================================================

import { bestMenuData, newMenuData, drinkData } from '../data/donutData.js';

// --- 모든 페이지 공통 ---
import { initPageFade } from '../modules/pageFade.js';
import { initSmoothScroll } from '../modules/smoothScroll.js';
import { initNavScroll } from '../modules/navScroll.js';
import { initMobileMenu } from '../modules/mobileMenu.js';
import { initTabFromUrl } from '../modules/tabFromUrl.js';
import { initLoginModal } from '../modules/loginModal.js';
import { initAuthNav } from '../modules/authNav.js';
import { initAuthGuard } from '../modules/authGuard.js';
import { initFooterBear } from '../modules/footerBear.js';

// --- 이 페이지에만 있는 섹션 ---
import { initPuzzleBanner } from '../modules/puzzleBanner.js';
import { initBannerOverlay } from '../modules/bannerOverlay.js';
import { initMenuDeco } from '../modules/menuDeco.js';
import { initMenuGrid } from '../modules/menuGrid.js';

// 공통
initPageFade();
initSmoothScroll();
initNavScroll();
initMobileMenu();
initLoginModal();
initAuthNav();
initAuthGuard();

// 퍼즐 배너 (onlineShop.html 과 같은 연출)
initPuzzleBanner();
initBannerOverlay({ trigger: '.puzzle', overlay: '.puzzle-overlay' });

// ✨ 배경 반짝이 (무지개와 구름은 마크업 + CSS 로만 움직입니다)
initMenuDeco();

// 메뉴 그리드
// 도넛 / 케이크는 index.html 이 쓰는 데이터를 그대로 재사용합니다.
initMenuGrid({ donut: bestMenuData, cake: newMenuData, drink: drinkData });

// 네비 하위 메뉴에서 분류를 골라 왔다면 그 탭을 열어 줍니다 (?cat=...)
initTabFromUrl('menuTabs');

// 푸터
initFooterBear();
