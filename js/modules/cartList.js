// 🛒 장바구니 목록 — 선택 / 수량 / 삭제 + 주문 예상 금액 계산
//
// 필요 요소: #cartItemList, #cartSummary, #cartLayout, #cartEmpty
//            (선택) #cartSelectAll, #cartRemoveSelected, #cartRemoveSoldOut
// 필요 CSS: css/components/cart-item.css, css/sections/cart.css
// 필요 라이브러리: 없음
//
// 데이터 한 건의 모양:
//   { title, imgUrl, price, originalPrice, qty, freeShipping, soldOut }
//
// 옵션
//   onChange(items) : 수량·삭제가 바뀔 때마다 (되돌려 저장하라고)
//   onOrder(picked) : '주문하기' 를 눌렀을 때, 체크한 것만 넘겨 줍니다

// 배송비·적립률은 checkout.html 과 같은 값을 써야 두 화면 금액이 맞습니다.
import { orderRules } from '../data/donutData.js';

const { SHIPPING_FEE, FREE_SHIPPING_OVER, POINT_RATE } = orderRules;

const won = (n) => Math.round(n).toLocaleString('ko-KR') + '원';

export function initCartList({ data = [], onChange = () => {}, onOrder = null } = {}) {
    const listEl = document.getElementById('cartItemList');
    const summaryEl = document.getElementById('cartSummary');
    if (!listEl || !summaryEl) return null;

    const layoutEl = document.getElementById('cartLayout');
    const emptyEl = document.getElementById('cartEmpty');
    const selectAllEl = document.getElementById('cartSelectAll');
    const removeSelectedEl = document.getElementById('cartRemoveSelected');
    const removeSoldOutEl = document.getElementById('cartRemoveSoldOut');

    // 원본 데이터를 건드리지 않도록 복사해서 들고 갑니다.
    // checked 는 화면에서만 쓰는 값이라 여기서 붙입니다. (품절 상품은 기본 해제)
    let items = data.map((item, i) => ({
        ...item,
        id: `cart-${i}`,
        qty: item.qty || 1,
        checked: !item.soldOut,
    }));

    // ----- 금액 계산 -----
    function getTotals() {
        const picked = items.filter((it) => it.checked && !it.soldOut);

        // 할인 전 정가 합계 (originalPrice 가 없으면 판매가가 곧 정가)
        const goodsTotal = picked.reduce(
            (sum, it) => sum + (it.originalPrice || it.price) * it.qty, 0
        );
        // 정가와 판매가의 차이 = 상품 할인금액
        const discount = picked.reduce(
            (sum, it) => sum + ((it.originalPrice || it.price) - it.price) * it.qty, 0
        );

        const payGoods = goodsTotal - discount;
        const shipping = (picked.length === 0 || payGoods >= FREE_SHIPPING_OVER)
            ? 0
            : SHIPPING_FEE;

        return {
            count: picked.length,
            goodsTotal,
            discount,
            shipping,
            orderTotal: payGoods + shipping,
            point: Math.round(payGoods * POINT_RATE),
        };
    }

    // ----- 상품 카드 -----
    function itemHTML(item) {
        const priceRow = item.originalPrice
            ? `<span class="cart-item-price">${won(item.price)}</span>
               <span class="cart-item-price-was">${won(item.originalPrice)}</span>`
            : `<span class="cart-item-price">${won(item.price)}</span>`;

        const shipBadge = item.freeShipping
            ? `<span class="cart-item-ship"><b class="cart-item-ship-badge">무료</b> 택배</span>`
            : `<span class="cart-item-ship">택배</span>`;

        return `
        <article class="cart-item${item.soldOut ? ' is-soldout' : ''}" data-id="${item.id}">
            <div class="cart-item-top">
                <label class="cart-check">
                    <input type="checkbox" class="cart-check-input" data-role="pick"
                        ${item.checked ? 'checked' : ''} ${item.soldOut ? 'disabled' : ''}>
                    <span class="cart-check-box" aria-hidden="true"></span>
                    <span class="sr-only">${item.title} 선택</span>
                </label>

                <div class="cart-item-thumb">
                    <img src="${item.imgUrl}" alt="${item.title}" loading="lazy">
                    ${item.soldOut ? '<span class="cart-item-soldout">품절</span>' : ''}
                </div>

                <div class="cart-item-info">
                    <h3 class="cart-item-name">${item.title}</h3>
                    <p class="cart-item-prices">${priceRow}</p>
                </div>

                <button type="button" class="cart-item-remove" data-role="remove"
                    aria-label="${item.title} 삭제">&times;</button>
            </div>

            <div class="cart-item-divider"></div>

            <div class="cart-item-bottom">
                <div class="cart-qty">
                    <button type="button" class="cart-qty-btn" data-role="qty" data-dir="-1"
                        aria-label="수량 감소" ${item.soldOut ? 'disabled' : ''}>&minus;</button>
                    <span class="cart-qty-value">${item.qty}</span>
                    <button type="button" class="cart-qty-btn" data-role="qty" data-dir="1"
                        aria-label="수량 증가" ${item.soldOut ? 'disabled' : ''}>+</button>
                </div>

                <div class="cart-item-sum">
                    ${shipBadge}
                    <span class="cart-item-total">${won(item.price * item.qty)}</span>
                </div>
            </div>
        </article>`;
    }

    // ----- 주문 예상 금액 -----
    function summaryHTML() {
        const t = getTotals();
        const shippingText = t.shipping === 0 ? '무료' : '+' + won(t.shipping);

        // 할인이 0원이면 할인 줄을 아예 빼서 깔끔하게 둡니다.
        const discountRows = t.discount > 0
            ? `<div class="cart-sum-row">
                   <span class="cart-sum-label">상품 할인금액</span>
                   <span class="cart-sum-value is-accent">-${won(t.discount)}</span>
               </div>
               <div class="cart-sum-row is-sub">
                   <span class="cart-sum-label">└ 즉시/기간 할인</span>
                   <span class="cart-sum-value">-${won(t.discount)}</span>
               </div>`
            : '';

        return `
        <h2 class="cart-sum-title">주문 예상 금액</h2>

        <div class="cart-sum-rows">
            <div class="cart-sum-row">
                <span class="cart-sum-label is-strong">총 상품 금액</span>
                <span class="cart-sum-value is-strong">${won(t.goodsTotal)}</span>
            </div>
            <div class="cart-sum-row">
                <span class="cart-sum-label">배송비</span>
                <span class="cart-sum-value">${shippingText}</span>
            </div>
            ${discountRows}
        </div>

        <div class="cart-sum-divider"></div>

        <div class="cart-sum-final">
            <div class="cart-sum-final-row">
                <span class="cart-sum-final-label">총 주문금액</span>
                <span class="cart-sum-final-value">${won(t.orderTotal)}</span>
            </div>
            <p class="cart-sum-point">${t.point.toLocaleString('ko-KR')} 포인트 적립예정</p>
        </div>

        <button type="button" class="cart-order-btn"${t.count ? '' : ' disabled'}>주문하기</button>`;
    }

    // ----- 그리기 -----
    function render() {
        // 수량·삭제가 바뀔 때마다 밖에 알려 줍니다 (저장은 부르는 쪽이 맡습니다)
        onChange(items);

        // 담긴 상품이 하나도 없으면 빈 장바구니 화면으로 바꿉니다.
        const isEmpty = items.length === 0;
        if (layoutEl) layoutEl.hidden = isEmpty;
        if (emptyEl) emptyEl.hidden = !isEmpty;

        if (isEmpty) {
            // 비워 두지 않으면 마지막 카드가 숨겨진 채 DOM에 남아,
            // 나중에 상품이 다시 담겼을 때 옛 내용이 한 번 깜빡입니다.
            listEl.innerHTML = '';
            summaryEl.innerHTML = '';
            return;
        }

        listEl.innerHTML = items.map(itemHTML).join('');
        summaryEl.innerHTML = summaryHTML();

        // 전체 선택 체크박스 상태 맞추기 (일부만 선택됐으면 중간 상태)
        if (selectAllEl) {
            const pickable = items.filter((it) => !it.soldOut);
            const picked = pickable.filter((it) => it.checked);
            selectAllEl.checked = pickable.length > 0 && picked.length === pickable.length;
            selectAllEl.indeterminate = picked.length > 0 && picked.length < pickable.length;
        }

        if (removeSoldOutEl) {
            removeSoldOutEl.disabled = !items.some((it) => it.soldOut);
        }
        if (removeSelectedEl) {
            removeSelectedEl.disabled = !items.some((it) => it.checked);
        }
    }

    const findItem = (el) => {
        const card = el.closest('.cart-item');
        return card ? items.find((it) => it.id === card.dataset.id) : null;
    };

    // ----- 카드 안의 조작 (체크 / 수량 / 삭제) -----
    listEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-role]');
        if (!btn || btn.dataset.role === 'pick') return;

        const item = findItem(btn);
        if (!item) return;

        if (btn.dataset.role === 'remove') {
            items = items.filter((it) => it !== item);
            render();
            return;
        }

        if (btn.dataset.role === 'qty') {
            item.qty = Math.max(1, item.qty + Number(btn.dataset.dir));
            render();
        }
    });

    listEl.addEventListener('change', (e) => {
        const input = e.target.closest('[data-role="pick"]');
        if (!input) return;

        const item = findItem(input);
        if (!item) return;

        item.checked = input.checked;
        render();
    });

    // ----- 전체 선택 -----
    if (selectAllEl) {
        selectAllEl.addEventListener('change', () => {
            items.forEach((it) => {
                if (!it.soldOut) it.checked = selectAllEl.checked;
            });
            render();
        });
    }

    // ----- 주문하기 -----
    // ⚠️ 이 단추는 금액 칸 안에 매번 새로 그려집니다. 단추에 직접 달면
    //    다시 그릴 때마다 떨어지므로, 바깥 칸에서 받습니다.
    if (onOrder) {
        summaryEl.addEventListener('click', (e) => {
            if (!e.target.closest('.cart-order-btn')) return;

            const picked = items.filter((it) => it.checked && !it.soldOut);
            if (!picked.length) return;

            // 화면에서만 쓰는 값은 빼고 넘깁니다
            onOrder(picked.map(({ id, checked, ...keep }) => keep));
        });
    }

    // ----- 선택 삭제 / 품절 삭제 -----
    if (removeSelectedEl) {
        removeSelectedEl.addEventListener('click', () => {
            items = items.filter((it) => !it.checked);
            render();
        });
    }
    if (removeSoldOutEl) {
        removeSoldOutEl.addEventListener('click', () => {
            items = items.filter((it) => !it.soldOut);
            render();
        });
    }

    render();

    return { render, getTotals };
}
