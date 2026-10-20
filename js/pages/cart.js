// ============================================================
//  cart.html 전용 엔트리
//  이 페이지에서 쓸 기능만 골라서 조립합니다.
//  새 페이지를 만들 때는 이 파일을 복사한 뒤, 필요 없는 줄을 지우세요.
// ============================================================

import { getCartItems, setCartItems, setCheckoutItems } from '../modules/cartStore.js';

// --- 모든 페이지 공통 ---
import { initSmoothScroll } from '../modules/smoothScroll.js';
import { initNavScroll } from '../modules/navScroll.js';
import { initMobileMenu } from '../modules/mobileMenu.js';
import { initLoginModal } from '../modules/loginModal.js';
import { initAuthNav } from '../modules/authNav.js';
import { initAuthGuard } from '../modules/authGuard.js';
import { initFooterBear } from '../modules/footerBear.js';
import { initBannerOverlay } from '../modules/bannerOverlay.js';

// --- 이 페이지에만 있는 섹션 ---
import { initCartBanner } from '../modules/cartBanner.js';
import { initCartList } from '../modules/cartList.js';

// 공통
initSmoothScroll();
initNavScroll();
initMobileMenu();
initLoginModal();
initAuthNav();
initAuthGuard();

// 가방 배너 (가운데 가방이 한 번 통통 튑니다)
initCartBanner();

// 스크롤을 내리면 배너가 어두워집니다 (onlineShop / checkout 과 같은 연출)
initBannerOverlay({ trigger: '.cart-banner', overlay: '.cart-overlay' });

// 장바구니 목록 + 주문 예상 금액
// 담긴 상품은 js/modules/cartStore.js 가 들고 있습니다.
// 수량·삭제가 바뀔 때마다 되돌려 저장해야 결제 화면과 맞습니다.
initCartList({
    data: getCartItems(),
    onChange: setCartItems,

    // 주문하기 → 체크한 것만 들고 결제 화면으로
    onOrder: (picked) => {
        setCheckoutItems(picked);
        location.href = './checkout.html';
    },
});

// 푸터
initFooterBear();
