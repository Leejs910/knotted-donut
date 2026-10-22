// 🛒 장바구니 보관소 (포트폴리오 전시용)
//
// 서버가 없으므로 담은 상품을 localStorage 에 적어 두고,
// 온라인샵 → 장바구니 → 결제로 페이지를 옮겨 다녀도 이어지게 합니다.
//
// 📦 장바구니는 '계정마다' 따로입니다.
//    저장되는 칸 이름이 noteddount:cart:<이메일> 이라, 로그아웃하고 다른
//    계정으로 들어오면 그 사람의 장바구니가 나옵니다. 다시 돌아오면
//    자기 것이 그대로 있습니다.
//    로그인하지 않았으면 담을 곳이 없으므로 읽으면 빈 목록, 쓰면 무시합니다.
//
// ⚠️ 진짜 장바구니가 아닙니다. 이 브라우저 안에만 남고, 값을 고치면
//    아무 상품이나 넣을 수 있습니다. 실제 서비스라면 서버가 들고 있어야 합니다.
//
// 쓰는 곳: js/modules/shopItemModal.js (담기), js/pages/cart.js,
//          js/pages/checkout.js
//
// 한 건의 모양은 js/modules/cartList.js 가 쓰는 것과 같습니다:
//   { title, imgUrl, price, originalPrice, qty, freeShipping, soldOut }

import { orderRules } from '../data/donutData.js';
import { getUser } from './auth.js';

const CART_PREFIX = 'noteddount:cart:';

// 장바구니에서 '주문하기' 로 넘길 때, 체크한 것만 따로 적어 둡니다.
// (장바구니에 5개가 있어도 2개만 고르고 주문할 수 있어야 하니까요)
const CHECKOUT_PREFIX = 'noteddount:checkout:';

/** 지금 누구의 장바구니인가 — 로그인하지 않았으면 null */
function owner() {
    const user = getUser();
    return user && user.email ? user.email.toLowerCase() : null;
}

const cartKey = () => (owner() ? CART_PREFIX + owner() : null);
const checkoutKey = () => (owner() ? CHECKOUT_PREFIX + owner() : null);

// ⚠️ 시크릿 창이나 저장소를 막아 둔 환경에서는 읽기·쓰기가 예외를 던집니다.
//    그래도 화면은 정상으로 보여야 하므로 전부 try 로 감쌉니다.
//    (저장을 못 하면 이번 페이지 안에서만 유지됩니다)
//
// ⚠️ 빠르게 쓰려고 들고 있는 사본에는 '누구 것인지' 를 같이 적어 둡니다.
//    안 그러면 로그아웃하고 다른 계정으로 들어왔을 때 앞사람 장바구니가
//    그대로 나옵니다.
let memory = null;
let memoryOwner = undefined;

function read() {
    const me = owner();
    if (memory && memoryOwner === me) return memory;

    memoryOwner = me;
    if (!me) {
        memory = null;        // 로그인하지 않았으면 담을 곳이 없습니다
        return memory;
    }
    try {
        const raw = localStorage.getItem(cartKey());
        const list = raw ? JSON.parse(raw) : null;
        memory = Array.isArray(list) ? list : null;
    } catch {
        memory = null;
    }
    return memory;
}

function write(list) {
    const key = cartKey();
    if (!key) return;         // 로그인하지 않았으면 조용히 넘어갑니다

    memory = list;
    memoryOwner = owner();
    try {
        localStorage.setItem(key, JSON.stringify(list));
    } catch {
        /* 저장을 못 해도 memory 에는 남아 이번 페이지에서는 동작합니다 */
    }
}

/** 상점 상품( cardData 한 건 ) → 장바구니 한 줄 */
function toLine(product, qty) {
    const price = Number(product.price) || 0;
    return {
        title: product.title,
        imgUrl: product.imgUrl,
        price,
        originalPrice: null,
        qty: Math.max(1, qty),
        // 한 줄 금액이 무료배송 기준을 넘으면 배지를 붙입니다
        freeShipping: price * qty >= orderRules.FREE_SHIPPING_OVER,
    };
}

/** 지금 장바구니에 담긴 것들 (아직 쓴 적이 없으면 빈 배열) */
export function getCartItems() {
    return read() || [];
}

/** 장바구니를 통째로 덮어씁니다 (수량 변경·삭제 뒤 되돌려 저장할 때) */
export function setCartItems(items) {
    // 화면에서만 쓰는 값(id, checked)은 빼고 저장합니다
    write(items.map(({ id, checked, ...keep }) => keep));
}

/**
 * 상품을 담습니다. 이미 있는 상품이면 수량만 더합니다.
 * @returns 담은 뒤의 전체 개수
 */
export function addToCart(product, qty = 1) {
    const items = getCartItems();
    const found = items.find((it) => it.title === product.title);

    if (found) {
        found.qty += Math.max(1, qty);
        found.freeShipping = found.price * found.qty >= orderRules.FREE_SHIPPING_OVER;
    } else {
        items.push(toLine(product, qty));
    }

    write(items);
    return items.length;
}

export function clearCart() {
    write([]);
}

/* ------------------------------------------------------------
   🧾 주문하기로 넘기는 목록
   장바구니에서 체크한 것만 결제 화면으로 넘깁니다.
   비워 두면 결제 화면은 장바구니 전체를 보여 줍니다.
------------------------------------------------------------ */
export function setCheckoutItems(items) {
    const key = checkoutKey();
    if (!key) return;
    try {
        // 화면에서만 쓰는 값(id, checked)은 빼고 적습니다
        localStorage.setItem(key,
            JSON.stringify(items.map(({ id, checked, ...keep }) => keep)));
    } catch {
        /* 저장을 못 하면 결제 화면이 장바구니 전체를 보여 줍니다 */
    }
}

/** 결제 화면이 보여 줄 목록 — 고른 게 없으면 장바구니 전체 */
export function getCheckoutItems() {
    const key = checkoutKey();
    if (!key) return [];
    try {
        const raw = localStorage.getItem(key);
        const list = raw ? JSON.parse(raw) : null;
        if (Array.isArray(list) && list.length) return list;
    } catch {
        /* 읽지 못하면 아래로 내려갑니다 */
    }
    return getCartItems();
}

export function clearCheckout() {
    const key = checkoutKey();
    if (!key) return;
    try {
        localStorage.removeItem(key);
    } catch {
        /* 지우지 못해도 다음 주문에서 덮어써집니다 */
    }
}

/**
 * 주문이 끝난 것들만 장바구니에서 뺍니다.
 * ⚠️ 통째로 비우면 안 됩니다. 5개 중 2개만 골라 주문했을 때
 *    고르지 않은 3개까지 사라져 버립니다.
 */
export function removeOrdered(items) {
    const titles = new Set(items.map((it) => it.title));
    write(getCartItems().filter((it) => !titles.has(it.title)));
    clearCheckout();
}
