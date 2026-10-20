// ✍️ 결제 화면 — 아는 것은 미리 채워 두고, 나머지는 단추 하나로
//
// 세 가지를 합니다.
//   1. 가입할 때 적은 이름·이메일을 주문자 정보에 미리 넣습니다
//   2. 지난번에 주문한 배송지가 있으면 그대로 다시 채웁니다
//   3. '채우기' 를 누르면 남은 칸(연락처·주소)까지 예시 값으로 채웁니다
//      (로그인 창의 데모 '채우기' 와 같은 역할입니다)
//
// 지난 배송지는 계정마다 따로 적어 둡니다 — noteddount:ship:<이메일>
// ⚠️ 주소·연락처가 들어 있는 값이라 이 브라우저 밖으로는 나가지 않습니다.
//    로그아웃해도 남습니다. 지우려면 브라우저의 사이트 데이터를 비우면 됩니다.
//
// 필요 요소: #checkoutForm 과 그 안의 입력칸들, (선택) #checkoutDemoFill
// 쓰는 곳: js/pages/checkout.js

import { getUser } from './auth.js';
import { demoOrder } from '../data/demoUsers.js';

const SHIP_PREFIX = 'noteddount:ship:';

// 기억해 둘 칸들 — 값이 있는 것만 적고, 다음에 그대로 되돌려 놓습니다
const FIELDS = [
    'buyerName', 'buyerPhone', 'buyerEmail',
    'receiverName', 'receiverPhone',
    'postcode', 'address1', 'address2', 'deliveryMemo',
];

const el = (id) => document.getElementById(id);

function shipKey() {
    const user = getUser();
    return user && user.email ? SHIP_PREFIX + user.email.toLowerCase() : null;
}

function readSaved() {
    const key = shipKey();
    if (!key) return null;
    try {
        const raw = localStorage.getItem(key);
        const saved = raw ? JSON.parse(raw) : null;
        return saved && typeof saved === 'object' ? saved : null;
    } catch {
        return null;
    }
}

/** 비어 있는 칸만 채웁니다. 사람이 적어 둔 값은 건드리지 않습니다. */
function fillEmpty(values) {
    let touched = false;
    Object.entries(values).forEach(([id, value]) => {
        const input = el(id);
        if (!input || !value) return;
        if (input.value.trim()) return;      // 이미 적혀 있으면 그대로 둡니다
        input.value = value;
        touched = true;
    });
    return touched;
}

/** 주문자 이름·연락처를 고친 것처럼 알려 줍니다.
 *  ('주문자 정보와 동일' 이 켜져 있으면 배송지가 따라오게 하려는 것입니다) */
function syncReceiver() {
    ['buyerName', 'buyerPhone'].forEach((id) => {
        el(id)?.dispatchEvent(new Event('input', { bubbles: true }));
    });
}

export function initCheckoutPrefill() {
    const formEl = document.getElementById('checkoutForm');
    if (!formEl) return null;

    // ── 1·2. 계정 정보 + 지난 배송지 ───────────────────────────
    const user = getUser();
    if (user) {
        fillEmpty({ buyerName: user.name, buyerEmail: user.email });
    }

    const saved = readSaved();
    if (saved) fillEmpty(saved);

    syncReceiver();

    // ── 3. '채우기' 단추 ───────────────────────────────────────
    el('checkoutDemoFill')?.addEventListener('click', () => {
        fillEmpty({
            buyerName: user ? user.name : '김도넛',
            buyerEmail: user ? user.email : 'demo@noteddount.com',
            buyerPhone: demoOrder.phone,
            receiverPhone: demoOrder.phone,
            postcode: demoOrder.postcode,
            address1: demoOrder.address1,
            address2: demoOrder.address2,
        });

        const memo = el('deliveryMemo');
        if (memo && !memo.value) memo.value = demoOrder.memo;

        syncReceiver();
    });

    return {
        /** 결제가 끝났을 때 — 이번에 적은 배송지를 다음을 위해 적어 둡니다 */
        remember() {
            const key = shipKey();
            if (!key) return;

            const data = {};
            FIELDS.forEach((id) => {
                const value = el(id)?.value.trim();
                if (value) data[id] = value;
            });
            if (!Object.keys(data).length) return;

            try {
                localStorage.setItem(key, JSON.stringify(data));
            } catch {
                /* 못 적어 두면 다음에 다시 입력하면 됩니다 */
            }
        },
    };
}
