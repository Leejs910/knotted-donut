// ============================================================
//  cart.html 전용 엔트리
//  이 페이지에서 쓸 기능만 골라서 조립합니다.
//  새 페이지를 만들 때는 이 파일을 복사한 뒤, 필요 없는 줄을 지우세요.
// ============================================================

import { cartData } from '../data/donutData.js';

// --- 모든 페이지 공통 ---
import { initSmoothScroll } from '../modules/smoothScroll.js';
import { initNavScroll } from '../modules/navScroll.js';
import { initMobileMenu } from '../modules/mobileMenu.js';
import { initFooterBear } from '../modules/footerBear.js';
import { initBuildingSpawner } from '../modules/buildingSpawner.js';
import { initFooterOverlay } from '../modules/footerOverlay.js';
import { initBannerOverlay } from '../modules/bannerOverlay.js';

// --- 이 페이지에만 있는 섹션 ---
import { initCartBanner } from '../modules/cartBanner.js';
import { initCartList } from '../modules/cartList.js';

// 공통
initSmoothScroll();
initNavScroll();
initMobileMenu();

// 가방 배너 (가운데 가방이 한 번 통통 튑니다)
initCartBanner();

// 스크롤을 내리면 배너가 어두워집니다 (onlineShop / checkout 과 같은 연출)
initBannerOverlay({ trigger: '.cart-banner', overlay: '.cart-overlay' });

// 장바구니 목록 + 주문 예상 금액
initCartList({ data: cartData });

// 푸터
initFooterBear();
initBuildingSpawner();
initFooterOverlay();
