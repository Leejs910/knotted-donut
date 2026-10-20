// 👤 마이페이지 — 주문조회 / 포인트 / 회원탈퇴
//
// 하는 일
//   · 탭을 누르면 해당 칸만 보여 줍니다 (탭 동작은 categoryTabs.js 가 담당)
//   · 지난 주문과 포인트를 memberStore 에서 읽어 그립니다
//   · '회원 탈퇴' 를 누르면 확인 상자를 띄우고, 확인하면 계정과 기록을 지웁니다
//
// 필요 요소: #mypageTabs, #mypageOrders, #mypagePoints, #mypageHello,
//            #leaveOverlay 와 그 안의 단추들
// 필요 CSS: css/sections/mypage.css, css/components/category-tabs.css,
//           css/components/modal-screen.css

import { getUser, removeAccount } from './auth.js';
import { getOrders, getPoints, clearMemberData, WELCOME_POINT } from './memberStore.js';
import { initCategoryTabs } from './categoryTabs.js';

const won = (n) => Math.round(Number(n) || 0).toLocaleString('ko-KR') + '원';
const num = (n) => Math.round(Number(n) || 0).toLocaleString('ko-KR');

// 글 안의 <, & 를 글자 그대로 보여 줍니다
function esc(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function emptyHTML(message) {
    return `
        <div class="mypage-empty">
            <p>${esc(message)}</p>
            <a class="mypage-empty-btn" href="./onlineShop.html">상품 둘러보기</a>
        </div>`;
}

/* ------------------------------------------------------------
   📦 주문조회
------------------------------------------------------------ */
function orderHTML(order) {
    const items = Array.isArray(order.items) ? order.items : [];
    const first = items[0];
    const rest = items.length - 1;

    return `
        <article class="mypage-order">
            <div class="mypage-order-head">
                <span class="mypage-order-no">주문번호 ${esc(order.orderNo)}</span>
                <span class="mypage-order-date">${esc(order.paidAt)}</span>
                <span class="mypage-order-method">${esc(order.method)}</span>
            </div>

            <div class="mypage-order-body">
                ${first && first.imgUrl
                    ? `<img class="mypage-order-thumb" src="${esc(first.imgUrl)}" alt=""
                           loading="lazy" decoding="async">`
                    : ''}

                <p class="mypage-order-names">
                    ${esc(first ? first.title : '주문 상품')}
                    ${rest > 0 ? `<span class="mypage-order-more">외 ${rest}건</span>` : ''}
                </p>

                <div class="mypage-order-pay">
                    <div class="mypage-order-total">${won(order.payTotal)}</div>
                    ${order.earnPoint
                        ? `<div class="mypage-order-earn">${num(order.earnPoint)}P 적립</div>`
                        : ''}
                </div>
            </div>
        </article>`;
}

function renderOrders(el, orders) {
    if (!el) return;
    el.innerHTML = orders.length
        ? orders.map(orderHTML).join('')
        : emptyHTML('아직 주문하신 내역이 없습니다.');
}

/* ------------------------------------------------------------
   ⭐ 포인트
   따로 적어 두지 않고, 주문 내역에서 '쓴 것 / 쌓인 것' 을 끌어냅니다.
   (잔액만 memberStore 가 들고 있습니다)
------------------------------------------------------------ */
function pointLogHTML(orders) {
    const rows = [];

    orders.forEach((order) => {
        if (order.earnPoint) {
            rows.push({ when: order.paidAt, what: `주문 적립 (${order.orderNo})`, delta: order.earnPoint });
        }
        if (order.usedPoint) {
            rows.push({ when: order.paidAt, what: `주문 사용 (${order.orderNo})`, delta: -order.usedPoint });
        }
    });

    rows.push({ when: '가입 선물', what: '회원가입 환영 포인트', delta: WELCOME_POINT });

    return rows.map((row) => `
        <div class="mypage-point-row">
            <span class="mypage-point-when">${esc(row.when)}</span>
            <span class="mypage-point-what">${esc(row.what)}</span>
            <span class="mypage-point-delta ${row.delta > 0 ? 'is-plus' : 'is-minus'}">
                ${row.delta > 0 ? '+' : '−'}${num(Math.abs(row.delta))}P
            </span>
        </div>`).join('');
}

function renderPoints(el, orders) {
    if (!el) return;
    el.innerHTML = `
        <div class="mypage-point-card">
            <p class="mypage-point-label">사용 가능 포인트</p>
            <p class="mypage-point-value">${num(getPoints())}<span>P</span></p>
            <p class="mypage-point-note">
                주문하시면 상품금액의 3%가 쌓이고, 결제할 때 1P = 1원으로 쓰실 수 있습니다.<br>
                회원가입 선물로 ${num(WELCOME_POINT)}P를 드렸습니다.
            </p>
        </div>

        <div class="mypage-point-log">${pointLogHTML(orders)}</div>`;
}

/* ------------------------------------------------------------
   🚪 회원탈퇴 확인 상자
------------------------------------------------------------ */
function initLeaveModal() {
    const overlay = document.getElementById('leaveOverlay');
    if (!overlay) return;

    const openBtn = document.getElementById('mypageLeaveOpen');
    const cancelBtn = document.getElementById('leaveCancel');
    const confirmBtn = document.getElementById('leaveConfirm');
    const errorEl = document.getElementById('leaveError');

    let lastFocused = null;

    function open() {
        lastFocused = document.activeElement;
        if (errorEl) errorEl.hidden = true;

        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        cancelBtn?.focus({ preventScroll: true });
    }

    function close() {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        lastFocused?.focus?.({ preventScroll: true });
    }

    openBtn?.addEventListener('click', open);
    cancelBtn?.addEventListener('click', close);

    // 바깥을 누르면 닫습니다 (상자 안을 누른 것은 그대로 둡니다)
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) close();
    });

    confirmBtn?.addEventListener('click', () => {
        const user = getUser();
        if (!user) return;

        // ⚠️ 순서가 중요합니다. removeAccount 가 로그아웃까지 하므로,
        //    그 뒤에는 '누구 것인지' 를 알 수 없어 기록을 지울 수 없습니다.
        const email = user.email;
        const result = removeAccount(email);

        if (!result.ok) {
            if (errorEl) {
                errorEl.textContent = result.reason;
                errorEl.hidden = false;
            }
            return;
        }

        clearMemberData(email);

        // 로그아웃된 상태라 authGuard 가 첫 화면으로 보내지만,
        // 여기서 바로 보내 주는 편이 기다림이 없습니다.
        location.replace('./index.html');
    });
}

/* ------------------------------------------------------------ */
export function initMyPage() {
    const tabsEl = document.getElementById('mypageTabs');
    if (!tabsEl) return;

    const user = getUser();
    const orders = getOrders();

    const helloEl = document.getElementById('mypageHello');
    if (helloEl && user) {
        helloEl.innerHTML = `<b>${esc(user.name)}</b> 님, 안녕하세요.`;
    }

    renderOrders(document.getElementById('mypageOrders'), orders);
    renderPoints(document.getElementById('mypagePoints'), orders);

    const panels = {
        orders: document.getElementById('panelOrders'),
        points: document.getElementById('panelPoints'),
        leave: document.getElementById('panelLeave'),
    };

    initCategoryTabs({
        tabsEl,
        defaultCategory: 'orders',
        // ⚠️ ribbons 를 넘기지 않습니다. 배지 그림은 마크업에 적어 둔
        //    스마일 하나로 고정하고, 탭을 바꿔도 그림은 그대로 둡니다.
        //    (통통 튀는 효과는 그대로 동작합니다 — support 와 같은 방식)
        onChange: (category) => {
            Object.entries(panels).forEach(([name, panel]) => {
                if (panel) panel.hidden = name !== category;
            });
        },
    });

    initLeaveModal();
}
