// 🧾 결제완료 영수증 — checkout.html 이 남긴 주문 내용을 그려 줍니다.
//
// 필요 요소: #receiptOrderNo, #receiptBuyer, #receiptItems, #receiptItemCount,
//            #receiptAmounts, #receiptPay
// 필요 라이브러리: 없음
//
// 주문 내용은 sessionStorage('knotted:lastOrder') 로 넘어옵니다.
// ⚠️ 주소·연락처가 들어 있어 주소창(쿼리스트링)으로는 넘기지 않습니다.

const STORAGE_KEY = 'knotted:lastOrder';

const won = (n) => Math.round(Number(n) || 0).toLocaleString('ko-KR') + '원';

// 결제하기를 거치지 않고 주소로 바로 들어왔을 때 보여 줄 예시 주문
const FALLBACK = {
    orderNo: '—',
    paidAt: '—',
    method: '—',
    items: [],
    goodsTotal: 0, discount: 0, shipping: 0, usedPoint: 0, payTotal: 0, earnPoint: 0,
    buyer: { name: '—', phone: '', email: '', postcode: '', address: '' },
};

export function initOrderReceipt() {
    const orderNoEl = document.getElementById('receiptOrderNo');
    const itemsEl = document.getElementById('receiptItems');
    if (!orderNoEl || !itemsEl) return null;

    const buyerEl = document.getElementById('receiptBuyer');
    const countEl = document.getElementById('receiptItemCount');
    const amountsEl = document.getElementById('receiptAmounts');
    const payEl = document.getElementById('receiptPay');
    const emptyNote = document.getElementById('receiptEmptyNote');

    let order = FALLBACK;
    let hasOrder = false;

    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (raw) {
            order = { ...FALLBACK, ...JSON.parse(raw) };
            hasOrder = true;
        }
    } catch (e) {
        // 저장된 내용을 읽지 못하면 기본값으로 둡니다.
    }

    if (emptyNote) emptyNote.hidden = hasOrder;

    // ----- 주문번호 -----
    orderNoEl.textContent = order.orderNo;

    // ----- 주문자 -----
    if (buyerEl) {
        const b = order.buyer || {};
        const lines = [
            b.address ? `${b.postcode ? `(${b.postcode}) ` : ''}${b.address}` : '',
            b.phone,
            b.email,
        ].filter(Boolean);

        buyerEl.innerHTML =
            `<p class="receipt-buyer-name">${b.name || '—'}</p>` +
            lines.map((l) => `<p class="receipt-buyer-line">${l}</p>`).join('');
    }

    // ----- 주문 상품 -----
    const items = Array.isArray(order.items) ? order.items : [];
    if (countEl) countEl.textContent = `${items.length}건`;

    itemsEl.innerHTML = items.length
        ? items.map((it) => `
            <li class="receipt-item">
                <div class="receipt-item-thumb">
                    <img src="${it.imgUrl}" alt="" loading="lazy">
                </div>
                <div class="receipt-item-info">
                    <p class="receipt-item-name">${it.title}</p>
                    <p class="receipt-item-qty">${it.qty}개</p>
                </div>
            </li>`).join('')
        : `<li class="receipt-item is-empty">주문 내역이 없습니다.</li>`;

    // ----- 금액 -----
    if (amountsEl) {
        const rows = [
            ['상품금액', won(order.goodsTotal)],
            ['배송비', order.shipping ? '+' + won(order.shipping) : '무료'],
        ];
        if (order.discount > 0) rows.push(['할인/쿠폰', '-' + won(order.discount)]);
        if (order.usedPoint > 0) rows.push(['포인트 사용', '-' + won(order.usedPoint)]);

        amountsEl.innerHTML = rows.map(([label, value]) => `
            <div class="receipt-row">
                <span class="receipt-row-label">${label}</span>
                <span class="receipt-row-value">${value}</span>
            </div>`).join('');
    }

    const totalEl = document.getElementById('receiptTotal');
    if (totalEl) totalEl.textContent = won(order.payTotal);

    // ----- 결제 상세 -----
    // 실제 결제를 하지 않으므로 카드번호 같은 값은 만들지 않고,
    // 고른 결제수단과 승인 시각만 적습니다.
    if (payEl) {
        payEl.innerHTML = `
            <div class="receipt-row">
                <span class="receipt-row-label">결제수단</span>
                <span class="receipt-row-value">${order.method}</span>
            </div>
            <div class="receipt-row">
                <span class="receipt-row-label">승인일자</span>
                <span class="receipt-row-value">${order.paidAt}</span>
            </div>
            <div class="receipt-row">
                <span class="receipt-row-label">적립예정</span>
                <span class="receipt-row-value">${Number(order.earnPoint || 0).toLocaleString('ko-KR')} P</span>
            </div>`;
    }

    // 뒤로 가기로 돌아와 같은 주문이 또 보이지 않게 한 번 쓰고 비웁니다.
    try {
        sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* 무시 */ }

    return { order };
}
