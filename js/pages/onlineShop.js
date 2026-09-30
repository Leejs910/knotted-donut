// ============================================================
//  onlineShop.html 전용 엔트리
//  이 페이지에서 쓸 기능만 골라서 조립합니다.
//  새 페이지를 만들 때는 이 파일을 복사한 뒤, 필요 없는 줄을 지우세요.
// ============================================================

import { cardData } from '../data/donutData.js';

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
import { initShopGrid } from '../modules/shopGrid.js';

// 공통
initSmoothScroll();
initNavScroll();
initMobileMenu();

// 퍼즐 배너
initPuzzleBanner();
initBannerOverlay({ trigger: '.puzzle', overlay: '.puzzle-overlay' });

// 상품 그리드
initShopGrid({ data: cardData });

// 푸터
initFooterBear();
initBuildingSpawner();
initFooterOverlay();
