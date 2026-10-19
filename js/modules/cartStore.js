// 🛒 장바구니 보관소 (포트폴리오 전시용)
//
// 서버가 없으므로 담은 상품을 localStorage 에 적어 두고,
// 온라인샵 → 장바구니 → 결제로 페이지를 옮겨 다녀도 이어지게 합니다.
//
// ⚠️ 진짜 장바구니가 아닙니다. 이 브라우저 안에만 남고, 값을 고치면
//    아무 상품이나 넣을 수 있습니다. 실제 서비스라면 서버가 들고 있어야 합니다.
//
// 쓰는 곳: js/modules/shopItemModal.js (담기), js/pages/cart.js,
//          js/pages/checkout.js
//
// 한 건의 모양은 js/modules/cartList.js 가 쓰는 것과 같습니다:
//   { title, imgUrl, price, originalPrice, qty, freeShipping, soldOut }

import { cardData, orderRules } from '../data/donutData.js';
import { onAuthChange } from './auth.js';

const CART_KEY = 'noteddount:cart';
const SEEDED_KEY = 'noteddount:cart-seeded';

// ⚠️ 시크릿 창이나 저장소를 막아 둔 환경에서는 읽기·쓰기가 예외를 던집니다.
//    그래도 화면은 정상으로 보여야 하므로 전부 try 로 감쌉니다.
//    (저장을 못 하면 이번 페이지 안에서만 유지됩니다)
let memory = null;

function read() {
    if (memory) return memory;
    try {
        const raw = localStorage.getItem(CART_KEY);
        const list = raw ? JSON.parse(raw) : null;
        memory = Array.isArray(list) ? list : null;
    } catch {
        memory = null;
    }
    return memory;
}

function write(list) {
    memory = list;
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(list));
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

/**
 * 처음 로그인했을 때 장바구니에 상점 상품 하나를 무작위로 넣어 둡니다.
 * 빈 장바구니만 보여 주면 이어지는 화면(결제)을 볼 수 없어서입니다.
 *
 * ⚠️ 한 번만 합니다. 이후에는 비워 두든 담든 사용자가 한 대로 둡니다.
 */
export function initCartSeed() {
    onAuthChange((user) => {
        if (!user) return;

        let seeded = false;
        try {
            seeded = localStorage.getItem(SEEDED_KEY) === '1';
        } catch {
            seeded = true;   // 저장소를 못 쓰면 매번 넣지 않도록 건너뜁니다
        }
        if (seeded || read()) return;

        const pick = cardData[Math.floor(Math.random() * cardData.length)];
        if (!pick) return;

        write([toLine(pick, 1)]);
        try {
            localStorage.setItem(SEEDED_KEY, '1');
        } catch {
            /* 다음에 또 넣더라도 화면은 정상입니다 */
        }
    });
}
