// 🧾 회원의 주문 내역과 포인트 (포트폴리오 전시용)
//
// 장바구니와 같은 방식으로 계정마다 따로 적어 둡니다.
//   noteddount:orders:<이메일>   지난 주문들 (최근 것이 앞)
//   noteddount:points:<이메일>   포인트 잔액
//
// ⚠️ 진짜가 아닙니다. 이 브라우저 안에만 남고, 저장소 값을 고치면
//    포인트도 주문 내역도 마음대로 만들 수 있습니다.
//    실제 서비스라면 서버가 들고 있어야 합니다.
//
// 쓰는 곳: js/pages/checkout.js (주문 기록), js/modules/myPage.js (조회)

import { getUser } from './auth.js';

const ORDERS_PREFIX = 'noteddount:orders:';
const POINTS_PREFIX = 'noteddount:points:';

// 가입하면 주는 환영 포인트. 처음 조회할 때 이 값으로 시작합니다.
export const WELCOME_POINT = 3000;

// 주문 내역을 끝없이 쌓아 두면 저장소가 금방 찹니다. 최근 것만 남깁니다.
const KEEP_ORDERS = 20;

function who() {
    const user = getUser();
    return user && user.email ? user.email.toLowerCase() : null;
}

function readJSON(key, fallback) {
    if (!key) return fallback;
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function writeJSON(key, value) {
    if (!key) return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* 저장을 못 해도 화면은 정상으로 보여야 합니다 */
    }
}

const ordersKey = () => (who() ? ORDERS_PREFIX + who() : null);
const pointsKey = () => (who() ? POINTS_PREFIX + who() : null);

/* ------------------------------------------------------------
   📦 주문 내역
------------------------------------------------------------ */
export function getOrders() {
    const list = readJSON(ordersKey(), []);
    return Array.isArray(list) ? list : [];
}

/** 결제가 끝났을 때 한 건 적어 둡니다 (최근 것이 맨 앞) */
export function addOrder(order) {
    const key = ordersKey();
    if (!key || !order) return;
    writeJSON(key, [order, ...getOrders()].slice(0, KEEP_ORDERS));
}

/* ------------------------------------------------------------
   ⭐ 포인트
------------------------------------------------------------ */
export function getPoints() {
    const key = pointsKey();
    if (!key) return 0;

    const saved = readJSON(key, null);
    if (typeof saved === 'number' && Number.isFinite(saved)) return Math.max(0, saved);

    // 처음 보는 계정이면 환영 포인트로 시작합니다
    writeJSON(key, WELCOME_POINT);
    return WELCOME_POINT;
}

/**
 * 주문 한 건을 포인트에 반영합니다. 쓴 만큼 빼고 쌓인 만큼 더합니다.
 * @returns 반영한 뒤의 잔액
 */
export function settlePoints({ used = 0, earned = 0 } = {}) {
    const key = pointsKey();
    if (!key) return 0;

    const next = Math.max(0, getPoints() - (Number(used) || 0) + (Number(earned) || 0));
    writeJSON(key, next);
    return next;
}

/* ------------------------------------------------------------
   🧹 탈퇴 — 이 계정이 남긴 것을 전부 지웁니다
   (계정 자체를 명부에서 빼는 일은 js/modules/auth.js 의 removeAccount 가 합니다)
------------------------------------------------------------ */
export function clearMemberData(email) {
    const mail = String(email || '').toLowerCase();
    if (!mail) return [];

    // 이 계정 앞으로 쌓인 칸들 — 장바구니·주문·포인트·배송지
    const keys = [
        `noteddount:cart:${mail}`,
        `noteddount:checkout:${mail}`,
        `noteddount:ship:${mail}`,
        ORDERS_PREFIX + mail,
        POINTS_PREFIX + mail,
    ];

    keys.forEach((key) => {
        try {
            localStorage.removeItem(key);
        } catch {
            /* 못 지워도 계정은 명부에서 빠집니다 */
        }
    });

    return keys;
}
