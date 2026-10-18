// ============================================================
//  menu.html 전용 엔트리
//  이 페이지에서 쓸 기능만 골라서 조립합니다.
// ============================================================

import { bestMenuData, newMenuData, drinkData } from '../data/donutData.js';

// --- 모든 페이지 공통 ---
import { initSmoothScroll } from '../modules/smoothScroll.js';
import { initNavScroll } from '../modules/navScroll.js';
import { initMobileMenu } from '../modules/mobileMenu.js';
import { initFooterBear } from '../modules/footerBear.js';
import { initBuildingSpawner } from '../modules/buildingSpawner.js';
import { initFooterOverlay } from '../modules/footerOverlay.js';

// --- 이 페이지에만 있는 섹션 ---
import { initPuzzleBanner } from '../modules/puzzleBanner.js';
import { initBannerOverlay } from '../modules/bannerOverlay.js';
import { initClouds } from '../modules/clouds.js';
import { initMenuGrid } from '../modules/menuGrid.js';

// 공통
initSmoothScroll();
initNavScroll();
initMobileMenu();

// 퍼즐 배너 (onlineShop.html 과 같은 연출)
initPuzzleBanner();
initBannerOverlay({ trigger: '.puzzle', overlay: '.puzzle-overlay' });

// 흘러가는 구름 배경 (index.html 과 같은 모듈)
initClouds();

// 메뉴 그리드
// 도넛 / 케이크는 index.html 이 쓰는 데이터를 그대로 재사용합니다.
initMenuGrid({ donut: bestMenuData, cake: newMenuData, drink: drinkData });

// 푸터
initFooterBear();
initBuildingSpawner();
initFooterOverlay();
