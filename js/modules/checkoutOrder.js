// 🧾 주문/결제 — 주문 상품 목록 + 금액 계산 + 폼 동작
//
// 필요 요소: #checkoutItems, #checkoutSummary  (나머지는 있으면 동작)
// 필요 라이브러리: 없음
//
// ⚠️ 실제 결제는 하지 않는 포트폴리오용 화면입니다.
//    그래서 카드번호 같은 결제 수단 정보는 받지 않고, 수단 선택만 합니다.

import { orderRules } from '../data/donutData.js';
import { getPoints } from './memberStore.js';

const { SHIPPING_FEE, FREE_SHIPPING_OVER, POINT_RATE } = orderRules;

const won = (n) => Math.round(n).toLocaleString('ko-KR') + '원';
const num = (n) => Math.round(n).toLocaleString('ko-KR');

export function initCheckoutOrder({ data = [], onPay = null } = {}) {
    const itemsEl = document.getElementById('checkoutItems');
    const summaryEl = document.getElementById('checkoutSummary');
    if (!itemsEl || !summaryEl) return null;

    const formEl = document.getElementById('checkoutForm');
    const sameAsBuyerEl = document.getElementById('sameAsBuyer');
    const pointInputEl = document.getElementById('pointInput');
    const pointAllEl = document.getElementById('pointUseAll');
    const pointOwnedEl = document.getElementById('pointOwned');
    const resultEl = document.getElementById('checkoutResult');

    // 품절 상품은 주문할 수 없으니 제외합니다.
    const items = data.filter((it) => !it.soldOut);

    // ⚠️ 보유 포인트는 더 이상 고정값이 아닙니다 — 계정마다 쌓이고 줄어듭니다.
    //    (js/modules/memberStore.js) 모듈을 읽어 들이는 시점이 아니라
    //    화면을 그리는 시점에 물어봐야 로그인한 사람의 잔액이 나옵니다.
    const OWNED_POINT = getPoints();

    let usedPoint = 0;

    // ----- 금액 -----
    function getTotals() {
        const goodsTotal = items.reduce(
            (sum, it) => sum + (it.originalPrice || it.price) * it.qty, 0
        );
        const discount = items.reduce(
            (sum, it) => sum + ((it.originalPrice || it.price) - it.price) * it.qty, 0
        );

        const payGoods = goodsTotal - discount;
        const shipping = (items.length === 0 || payGoods >= FREE_SHIPPING_OVER) ? 0 : SHIPPING_FEE;

        // 포인트는 '상품값 + 배송비' 를 넘게 쓸 수 없습니다.
        const maxPoint = Math.min(OWNED_POINT, payGoods + shipping);
        const point = Math.min(usedPoint, maxPoint);

        return {
            goodsTotal, discount, shipping, maxPoint,
            usedPoint: point,
            payTotal: payGoods + shipping - point,
            earnPoint: Math.round(payGoods * POINT_RATE),
        };
    }

    // ----- 주문 상품 목록 -----
    function renderItems() {
        if (!items.length) {
            itemsEl.innerHTML = `<p class="co-empty">주문할 상품이 없습니다.</p>`;
            return;
        }

        itemsEl.innerHTML = items.map((item) => {
            const was = item.originalPrice
                ? `<span class="co-item-was">${won(item.originalPrice)}</span>` : '';

            return `
            <li class="co-item">
                <div class="co-item-thumb">
                    <img src="${item.imgUrl}" alt="${item.title}" loading="lazy">
                </div>
                <div class="co-item-info">
                    <p class="co-item-name">${item.title}</p>
                    <p class="co-item-price">
                        <span class="co-item-now">${won(item.price)}</span>${was}
                        <span class="co-item-qty">· ${item.qty}개</span>
                    </p>
                </div>
                <span class="co-item-total">${won(item.price * item.qty)}</span>
            </li>`;
        }).join('');
    }

    // ----- 주문 요약 -----
    function renderSummary() {
        const t = getTotals();
        const shippingText = t.shipping === 0 ? '무료' : '+' + won(t.shipping);

        const discountRow = t.discount > 0
            ? `<div class="co-sum-row">
                   <span>상품 할인금액</span>
                   <span class="is-accent">-${won(t.discount)}</span>
               </div>` : '';

        const pointRow = t.usedPoint > 0
            ? `<div class="co-sum-row">
                   <span>포인트 사용</span>
                   <span class="is-accent">-${won(t.usedPoint)}</span>
               </div>` : '';

        summaryEl.innerHTML = `
        <h2 class="co-card-title">주문 요약</h2>

        <div class="co-sum-rows">
            <div class="co-sum-row">
                <span class="is-strong">총 상품금액</span>
                <span class="is-strong">${won(t.goodsTotal)}</span>
            </div>
            <div class="co-sum-row">
                <span>배송비</span>
                <span>${shippingText}</span>
            </div>
            ${discountRow}
            ${pointRow}
        </div>

        <div class="co-divider"></div>

        <div class="co-sum-final">
            <span class="co-sum-final-label">총 결제금액</span>
            <span class="co-sum-final-value">${won(t.payTotal)}</span>
        </div>
        <p class="co-sum-point">${num(t.earnPoint)} 포인트 적립예정</p>`;
    }

    function render() {
        renderItems();
        renderSummary();
    }

    // ----- 주문자 정보와 동일 -----
    // 체크하면 주문자 칸의 값을 배송지 칸으로 복사하고, 배송지 입력을 잠급니다.
    if (sameAsBuyerEl && formEl) {
        const pairs = [
            ['buyerName', 'receiverName'],
            ['buyerPhone', 'receiverPhone'],
        ];

        const sync = () => {
            const on = sameAsBuyerEl.checked;
            pairs.forEach(([fromId, toId]) => {
                const from = document.getElementById(fromId);
                const to = document.getElementById(toId);
                if (!from || !to) return;
                if (on) to.value = from.value;
                to.readOnly = on;
                to.classList.toggle('is-locked', on);
            });
        };

        sameAsBuyerEl.addEventListener('change', sync);
        // 체크된 상태에서 주문자 정보를 고치면 배송지도 같이 따라갑니다.
        pairs.forEach(([fromId]) => {
            document.getElementById(fromId)?.addEventListener('input', () => {
                if (sameAsBuyerEl.checked) sync();
            });
        });
        sync();
    }

    // ----- 포인트 -----
    if (pointOwnedEl) pointOwnedEl.textContent = num(OWNED_POINT);

    function applyPoint(value) {
        const t = getTotals();
        // 보유량과 결제금액을 동시에 넘지 않도록 자릅니다.
        usedPoint = Math.max(0, Math.min(Math.floor(Number(value) || 0), t.maxPoint));
        if (pointInputEl) pointInputEl.value = usedPoint ? usedPoint : '';
        renderSummary();
    }

    if (pointInputEl) {
        pointInputEl.addEventListener('input', () => applyPoint(pointInputEl.value));
    }
    if (pointAllEl) {
        pointAllEl.addEventListener('click', () => applyPoint(getTotals().maxPoint));
    }

    // ----- 결제하기 -----
    // 실제 결제 연동은 없습니다. 입력이 채워졌는지만 보고 안내 문구를 띄웁니다.
    if (formEl) {
        formEl.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!items.length) {
                if (resultEl) {
                    resultEl.textContent = '주문할 상품이 없습니다.';
                    resultEl.className = 'checkout-result is-error';
                }
                return;
            }

            const required = formEl.querySelectorAll('[required]');
            const missing = [...required].find((el) => !el.value.trim());
            if (missing) {
                missing.focus();
                if (resultEl) {
                    resultEl.textContent = '필수 항목을 모두 입력해 주세요.';
                    resultEl.className = 'checkout-result is-error';
                }
                return;
            }

            if (resultEl) {
                resultEl.textContent = '';
                resultEl.className = 'checkout-result';
            }

            const t = getTotals();
            const method = formEl.querySelector('input[name="payMethod"]:checked');
            const val = (id) => document.getElementById(id)?.value.trim() || '';

            // 실제 결제 대신, 페이지가 넘겨준 연출(트럭)을 실행합니다.
            // 영수증 화면에서 쓸 내용을 한 덩어리로 정리해서 넘깁니다.
            if (typeof onPay === 'function') {
                onPay({
                    items: items.map((it) => ({
                        title: it.title, imgUrl: it.imgUrl, qty: it.qty, price: it.price,
                    })),
                    goodsTotal: t.goodsTotal,
                    discount: t.discount,
                    shipping: t.shipping,
                    usedPoint: t.usedPoint,
                    payTotal: t.payTotal,
                    earnPoint: t.earnPoint,
                    method: method ? method.dataset.label : '결제수단 미선택',
                    buyer: {
                        name: val('buyerName'),
                        phone: val('buyerPhone'),
                        email: val('buyerEmail'),
                        postcode: val('postcode'),
                        address: [val('address1'), val('address2')].filter(Boolean).join(' '),
                    },
                });
            }
        });
    }

    render();

    return { render, getTotals };
}
