// ============================================================
//  orderComplete.html 전용 엔트리
//  이 페이지에서 쓸 기능만 골라서 조립합니다.
// ============================================================

// --- 모든 페이지 공통 ---
import { initPageFade } from '../modules/pageFade.js';
import { initSmoothScroll } from '../modules/smoothScroll.js';
import { initNavScroll } from '../modules/navScroll.js';
import { initMobileMenu } from '../modules/mobileMenu.js';
import { initNavCurrent } from '../modules/navCurrent.js';
import { initLoginModal } from '../modules/loginModal.js';
import { initAuthNav } from '../modules/authNav.js';
import { initCartBadge } from '../modules/cartBadge.js';
import { initAuthGuard } from '../modules/authGuard.js';
import { initFooterBear } from '../modules/footerBear.js';

// --- 이 페이지에만 있는 섹션 ---
import { initTruckBanner } from '../modules/truckBanner.js';
import { initBannerOverlay } from '../modules/bannerOverlay.js';
import { initOrderReceipt } from '../modules/orderReceipt.js';
import { playOnceOnView } from '../modules/playOnceOnView.js';

// 공통
initPageFade();
initSmoothScroll();
initNavScroll();
initMobileMenu();
initNavCurrent();
initLoginModal();
initAuthNav();
initCartBadge();
initAuthGuard();

// 달리는 트럭 배너
initTruckBanner();
initBannerOverlay({ trigger: '.oc-banner', overlay: '.oc-overlay' });

// 영수증
initOrderReceipt();

// 🔴 Thank You 도장 — 스크롤해서 영수증 아래쪽이 보이면 딱 한 번 '쾅' 찍힙니다.
//
// 🎚️ 재생 시점 조절 — STAMP_TRIGGER 숫자만 바꾸면 됩니다.
//    화면 아래에서 이 비율만큼은 '아직 안 보인 것'으로 칩니다.
//      0     → 도장이 화면에 걸치자마자 재생
//      0.35  → 화면 높이의 35% 위로 올라와야 재생 (지금 값)
//      0.6   → 거의 화면 한가운데까지 와야 재생
const STAMP_TRIGGER = 0.38;

const stampEl = document.getElementById('receiptStamp');
if (stampEl) {
    playOnceOnView(stampEl, () => {
        stampEl.classList.add('is-stamped');

        // ⚠️ 애니메이션이 진행되지 않는 환경에서는 0% 상태(투명)에 갇혀
        //    도장이 영영 안 보입니다. 1.5초 뒤에도 투명하면 본체만 그냥 찍어 둡니다.
        //    (인라인 style 로 animation:none 을 박으면 다시 재생할 수 없게 되므로
        //     지웠다 붙일 수 있는 클래스로 처리합니다)
        setTimeout(() => {
            const main = stampEl.querySelector('.is-main');
            if (!main) return;
            if (parseFloat(getComputedStyle(main).opacity) > 0.1) return;
            stampEl.classList.add('is-forced');
        }, 1500);
    }, { threshold: 0.6, bottomOffset: STAMP_TRIGGER, fallbackMs: 400 });
}

// 푸터
initFooterBear();
