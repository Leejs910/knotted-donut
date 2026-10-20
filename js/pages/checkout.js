// ============================================================
//  checkout.html 전용 엔트리
//  이 페이지에서 쓸 기능만 골라서 조립합니다.
//  새 페이지를 만들 때는 이 파일을 복사한 뒤, 필요 없는 줄을 지우세요.
// ============================================================

import { getCheckoutItems, removeOrdered } from '../modules/cartStore.js';

// --- 모든 페이지 공통 ---
import { initPageFade } from '../modules/pageFade.js';
import { initSmoothScroll } from '../modules/smoothScroll.js';
import { initNavScroll } from '../modules/navScroll.js';
import { initMobileMenu } from '../modules/mobileMenu.js';
import { initLoginModal } from '../modules/loginModal.js';
import { initAuthNav } from '../modules/authNav.js';
import { initAuthGuard } from '../modules/authGuard.js';
import { initFooterBear } from '../modules/footerBear.js';

// --- 이 페이지에만 있는 섹션 ---
import { initCheckoutBanner } from '../modules/checkoutBanner.js';
import { initBannerOverlay } from '../modules/bannerOverlay.js';
import { initCheckoutOrder } from '../modules/checkoutOrder.js';
import { initCheckoutPrefill } from '../modules/checkoutPrefill.js';
import { initTruckScene } from '../modules/truckScene.js';

// 공통
initPageFade();
initSmoothScroll();
initNavScroll();
initMobileMenu();
initLoginModal();
initAuthNav();
initAuthGuard();

// 배너 (토끼가 책상 밑에서 한 번 올라옵니다)
initCheckoutBanner();
initBannerOverlay({ trigger: '.checkout-banner', overlay: '.checkout-overlay' });

// 🚚 결제하기 → 트럭이 떠나면 결제완료 페이지로 이동
const sectionEl = document.getElementById('checkoutSection');

let paidInfo = null;

const truck = initTruckScene({
    // 연출을 화면 가운데에 맞출 기준 — 항상 레이아웃에 있는 결제 섹션
    scrollTarget: sectionEl,
    onFinish: () => {
        // 주문 내용을 sessionStorage 로 넘깁니다.
        // ⚠️ 주소·연락처가 들어 있어 주소창(쿼리스트링)에는 절대 싣지 않습니다.
        try {
            const now = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            const order = {
                ...paidInfo,
                orderNo:
                    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
                    String(Math.floor(Math.random() * 900000) + 100000),
                paidAt:
                    `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} ` +
                    `${pad(now.getHours())}:${pad(now.getMinutes())}`,
            };
            sessionStorage.setItem('knotted:lastOrder', JSON.stringify(order));
        } catch (e) {
            // 저장에 실패해도 완료 페이지는 기본값으로 열립니다.
        }

        // 이번에 적은 배송지를 다음 주문 때 다시 채워 주려고 적어 둡니다
        prefill?.remember();

        // 주문한 것만 장바구니에서 뺍니다 (고르지 않고 남겨 둔 것은 그대로)
        removeOrdered(getCheckoutItems());

        location.href = './orderComplete.html';
    },
});

// 주문 상품 / 금액 / 폼
initCheckoutOrder({
    data: getCheckoutItems(),
    onPay: (info) => {
        paidInfo = info;
        if (truck) truck.play();
    },
});

// 아는 것은 미리 채워 둡니다 (계정 이름·이메일 + 지난번 배송지).
// ⚠️ 반드시 initCheckoutOrder 뒤에 와야 합니다. '주문자 정보와 동일' 을
//    따라가게 하는 장치가 그 안에서 붙기 때문입니다.
const prefill = initCheckoutPrefill();

// 푸터
initFooterBear();
