// 🔒 장바구니·결제는 로그인한 사람만 들어갈 수 있게 지킵니다
//
// 하는 일 세 가지
//   1. 로그아웃 상태로 Cart 를 누르면 → 넘어가지 않고 로그인 창을 엽니다
//   2. 로그아웃 상태로 장바구니/결제 주소를 직접 열면 → 첫 화면으로 보내고,
//      거기서 로그인 창을 띄웁니다
//   3. 그 페이지를 보던 중에 로그아웃하면 → 첫 화면으로 돌아갑니다
//
// ⚠️ 담아 둔 상품 자체는 지우지 않습니다. 다시 로그인하면 그대로 있습니다.
//    (한 브라우저를 여러 사람이 쓰면 앞사람 장바구니가 보일 수 있습니다.
//     진짜 서비스라면 장바구니도 계정에 매여 서버에 있어야 합니다)
//
// ⚠️ 이건 '화면을 가리는' 수준입니다. 주소를 직접 치거나 저장소 값을 고치면
//    얼마든지 들어올 수 있습니다. 진짜 보호는 서버에서 해야 합니다.
//
// 쓰는 곳: 모든 페이지 엔트리 (js/pages/*.js)
// 필요 요소: 네비게이션의 Cart 링크 (없으면 조용히 지나갑니다)

import { isLoggedIn, onAuthChange } from './auth.js';
import { openLoginModal } from './loginModal.js';

const HOME = './index.html';

// 로그인해야 들어갈 수 있는 페이지
const MEMBER_PAGES = ['cart.html', 'checkout.html'];

// '첫 화면으로 보냈으니 로그인 창을 띄워 달라'는 쪽지.
// 페이지를 넘어가야 해서 sessionStorage 를 씁니다 (탭을 닫으면 사라집니다).
const ASK_KEY = 'noteddount:ask-login';

function currentPage() {
    return location.pathname.split('/').pop() || 'index.html';
}

function goHome({ ask }) {
    if (ask) {
        try {
            sessionStorage.setItem(ASK_KEY, '1');
        } catch {
            /* 쪽지를 못 남겨도 첫 화면으로 보내는 것까지는 됩니다 */
        }
    }
    // replace 라서 '뒤로' 를 눌러도 막힌 페이지로 되돌아가지 않습니다
    location.replace(HOME);
}

export function initAuthGuard() {
    // ── 1. 남겨 둔 쪽지가 있으면 로그인 창부터 ──────────────────
    try {
        if (sessionStorage.getItem(ASK_KEY)) {
            sessionStorage.removeItem(ASK_KEY);
            openLoginModal();
        }
    } catch {
        /* 저장소를 못 쓰는 환경에서는 그냥 지나갑니다 */
    }

    // ── 2. Cart 링크 가로채기 ──────────────────────────────────
    // 모니터 네비의 Cart 와 폰 머리말의 장바구니 아이콘을 함께 잡습니다.
    document.querySelectorAll('a[href$="cart.html"], .mobile-cart').forEach((link) => {
        link.addEventListener('click', (e) => {
            if (isLoggedIn()) return;
            e.preventDefault();
            openLoginModal(link);
        });
    });

    // ── 3. 회원 전용 페이지 지키기 ─────────────────────────────
    if (!MEMBER_PAGES.includes(currentPage())) return;

    // onAuthChange 는 붙는 즉시 '지금 상태'로 한 번 불립니다.
    // 그래서 처음부터 로그아웃이면 여기서 바로 걸러집니다.
    //
    // ⚠️ 두 경우를 가려야 합니다.
    //    · 로그인한 적 없이 들어옴 → 첫 화면 + 로그인 창 (들어오려다 막힌 것)
    //    · 보던 중에 로그아웃      → 첫 화면만 (본인이 나가겠다고 한 것인데
    //                                 로그인 창을 다시 띄우면 귀찮습니다)
    let sawUser = false;

    onAuthChange((user) => {
        if (user) {
            sawUser = true;
            return;
        }
        goHome({ ask: !sawUser });
    });
}
