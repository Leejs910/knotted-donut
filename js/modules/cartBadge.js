// 🔴 네비게이션 장바구니에 담긴 개수 표시
//
// 하는 일
//   · 장바구니 단추(PC) 와 아이콘(모바일) 에 분홍 동그라미를 하나씩 붙입니다
//   · 담거나 빼면 숫자가 바로 바뀝니다 (cartStore 가 알려 줍니다)
//   · 비어 있거나 로그인하지 않았으면 동그라미를 숨깁니다
//
// 담긴 '종류' 수를 셉니다. 수량이 아니라서 같은 상품을 셋 담아도 1 입니다
// — 장바구니에 줄이 몇 개 생겼는지와 같은 숫자라 눈으로 맞춰보기 쉽습니다.
//
// 필요 요소: 없어도 조용히 넘어갑니다
//   a.pc-btn[href$="cart.html"] (PC) · a.mobile-cart (모바일)
// 필요 CSS: css/components/cart-badge.css

import { onCartChange } from './cartStore.js';

// 🎚️ 이 수를 넘으면 '9+' 처럼 줄여서 보여 줍니다.
const MAX_SHOWN = 99;

function badgeFor(el) {
    let b = el.querySelector(':scope > .cart-badge');
    if (b) return b;

    b = document.createElement('span');
    b.className = 'cart-badge';
    // 읽어 주는 글자는 숫자만으로는 뜻이 통하지 않아 따로 적습니다.
    // (아래에서 개수에 맞춰 다시 씁니다)
    b.setAttribute('aria-hidden', 'true');
    el.appendChild(b);
    return b;
}

export function initCartBadge() {
    // 장바구니로 가는 링크 전부 — PC 단추와 모바일 아이콘
    const targets = [
        ...document.querySelectorAll('.nav-actions a.pc-btn[href*="cart.html"]'),
        ...document.querySelectorAll('a.mobile-cart'),
    ];
    if (!targets.length) return;

    // ⚠️ 동그라미를 단추 모서리에 걸치려면 기준점이 필요합니다.
    //    nav.css 를 건드리지 않고 여기서 한 번만 세워 둡니다.
    targets.forEach((el) => {
        if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    });

    onCartChange((items) => {
        const count = Array.isArray(items) ? items.length : 0;

        targets.forEach((el) => {
            const b = badgeFor(el);

            if (!count) {
                b.hidden = true;
                el.removeAttribute('data-cart-count');
                return;
            }

            b.hidden = false;
            b.textContent = count > MAX_SHOWN ? `${MAX_SHOWN}+` : String(count);
            // 화면 낭독기에는 링크 이름 뒤에 붙여 읽히게 합니다.
            el.setAttribute('data-cart-count', String(count));
            el.setAttribute('aria-label', `장바구니 (${count}개 담김)`);
        });
    });
}
