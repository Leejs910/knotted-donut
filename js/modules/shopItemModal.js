// 🛍️ 온라인 샵 상품 상세 모달
//
// js/modules/donutModal.js 와 같은 방식으로 HTML을 스스로 만들어 넣습니다.
// onlineShop.html 에는 아무것도 추가할 필요가 없습니다.
//
// 필요 CSS: css/components/shop-item-modal.css
//
// 사용법:
//   import { openShopItemModal } from './shopItemModal.js';
//   openShopItemModal(상품데이터); // { title, imgUrl, imgUrl2, price }
//   openShopItemModal(상품데이터, { onClose: () => ... }); // 닫힐 때 할 일이 있으면

const MODAL_HTML = `
<div id="shop-item-modal" class="shop-modal-overlay" role="dialog" aria-modal="true" aria-hidden="true">
    <div class="shop-modal-box">

        <div class="shop-modal-topbar">
            <nav class="shop-modal-breadcrumb" aria-label="이동 경로">
                <a href="./index.html">HOME</a>
                <span class="shop-modal-breadcrumb-sep">&rsaquo;</span>
                <span class="shop-modal-breadcrumb-current">SHOP</span>
            </nav>
            <button type="button" class="shop-modal-close" aria-label="닫기">&times;</button>
        </div>

        <div class="shop-modal-body">
            <div class="shop-modal-gallery">
                <button type="button" class="shop-modal-arrow shop-modal-arrow-prev" aria-label="이전 이미지">&lsaquo;</button>
                <div class="shop-modal-gallery-frame">
                    <img class="shop-modal-gallery-img" src="" alt="">
                </div>
                <button type="button" class="shop-modal-arrow shop-modal-arrow-next" aria-label="다음 이미지">&rsaquo;</button>
            </div>

            <div class="shop-modal-info">
                <h3 class="shop-modal-title">
                    <span class="shop-modal-title-icon" aria-hidden="true">
                        <img src="" alt="">
                    </span>
                    <span class="shop-modal-title-text"></span>
                </h3>
                <p class="shop-modal-price"></p>

                <div class="shop-modal-divider"></div>
                <div class="shop-modal-row">
                    <span class="shop-modal-label">적립</span>
                    <span class="shop-modal-value shop-modal-reward"></span>
                </div>

                <div class="shop-modal-divider"></div>
                <div class="shop-modal-row shop-modal-row-shipping">
                    <span class="shop-modal-label">배송</span>
                    <span class="shop-modal-value">
                        택배 기본 3,000원 도서산간 배송비 <span class="shop-modal-info-icon">ⓘ</span><br>
                        5000원 이상 구매시 무료배송 <span class="shop-modal-info-icon">ⓘ</span>
                    </span>
                </div>

                <div class="shop-modal-divider"></div>
                <div class="shop-modal-row">
                    <span class="shop-modal-label">수량</span>
                    <div class="shop-modal-qty">
                        <button type="button" class="shop-modal-qty-btn" data-dir="-1" aria-label="수량 감소">&minus;</button>
                        <span class="shop-modal-qty-value">1</span>
                        <button type="button" class="shop-modal-qty-btn" data-dir="1" aria-label="수량 증가">+</button>
                    </div>
                </div>

                <div class="shop-modal-divider"></div>
                <div class="shop-modal-row shop-modal-row-total">
                    <span class="shop-modal-label">총 상품금액</span>
                    <span class="shop-modal-total-value"></span>
                </div>

                <div class="shop-modal-actions">
                    <button type="button" class="shop-modal-buy">구매하기</button>
                    <button type="button" class="shop-modal-cart-btn">장바구니</button>
                </div>
            </div>
        </div>

        <div class="shop-modal-bottom-rule"></div>
    </div>
</div>
`;

// 상품의 category 값에 따른 리본 아이콘 + 원형 테두리 색.
// js/modules/shopGrid.js 의 카테고리 탭 배지·배경색과 같은 조합입니다.
const CATEGORY_BADGE = {
    all:    { ribbon: './img/blue_ribbon.png',  ring: '#8CD8FF' },
    food:   { ribbon: './img/yellow_ribbon.png', ring: '#FFF09F' },
    living: { ribbon: './img/pink_ribbon.png',   ring: '#FFC9E1' },
    bulk:   { ribbon: './img/green_ribbon.png',  ring: '#50BD83' },
};

let overlay = null;   // 모달 최상위 요소
let els = null;       // 자주 쓰는 자식 요소 모음
let onCloseHook = null; // 닫힐 때 실행할 콜백 (컨베이어 재생 등)

let images = [];      // 지금 보고 있는 상품의 이미지 목록 (imgUrl, imgUrl2)
let imgIndex = 0;
let unitPrice = 0;
let qty = 1;

// 27900 -> "27,900원"
const toWon = (n) => Math.round(n).toLocaleString('ko-KR') + '원';

// 모달 HTML을 페이지에 한 번만 심고, 이벤트를 연결합니다.
function ensureModal() {
    if (overlay) return overlay;

    const holder = document.createElement('div');
    holder.innerHTML = MODAL_HTML.trim();
    overlay = holder.firstElementChild;
    document.body.appendChild(overlay);

    els = {
        closeBtn: overlay.querySelector('.shop-modal-close'),
        prevBtn: overlay.querySelector('.shop-modal-arrow-prev'),
        nextBtn: overlay.querySelector('.shop-modal-arrow-next'),
        galleryImg: overlay.querySelector('.shop-modal-gallery-img'),
        titleIconImg: overlay.querySelector('.shop-modal-title-icon img'),
        titleText: overlay.querySelector('.shop-modal-title-text'),
        price: overlay.querySelector('.shop-modal-price'),
        reward: overlay.querySelector('.shop-modal-reward'),
        qtyValue: overlay.querySelector('.shop-modal-qty-value'),
        qtyBtns: overlay.querySelectorAll('.shop-modal-qty-btn'),
        totalValue: overlay.querySelector('.shop-modal-total-value'),
    };

    // 어두운 배경(오버레이 자신)을 눌렀을 때만 닫힘 (박스 위를 눌렀을 때는 안 닫힘)
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeShopItemModal();
    });
    els.closeBtn.addEventListener('click', closeShopItemModal);

    // ESC 키로도 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeShopItemModal();
        }
    });

    els.prevBtn.addEventListener('click', () => showImage(imgIndex - 1));
    els.nextBtn.addEventListener('click', () => showImage(imgIndex + 1));

    els.qtyBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            qty = Math.max(1, qty + Number(btn.dataset.dir));
            updateQtyUI();
        });
    });

    return overlay;
}

// 화살표로 imgUrl / imgUrl2 사이를 순환합니다.
function showImage(index) {
    if (!images.length) return;
    imgIndex = (index + images.length) % images.length;
    els.galleryImg.src = images[imgIndex];
}

function updateQtyUI() {
    els.qtyValue.textContent = String(qty);
    els.totalValue.textContent = toWon(unitPrice * qty);
}

/**
 * 모달을 엽니다.
 * @param {object} item - { title, imgUrl, imgUrl2, price }
 * @param {object} opts - { onClose } 닫힐 때 실행할 함수
 */
export function openShopItemModal(item, opts = {}) {
    if (!item) return;
    ensureModal();

    onCloseHook = opts.onClose || null;

    images = [item.imgUrl, item.imgUrl2].filter(Boolean);
    unitPrice = Number(item.price) || 0;
    qty = 1;

    // 사진이 한 장뿐이면 화살표를 숨깁니다.
    const hasMultiple = images.length > 1;
    els.prevBtn.hidden = !hasMultiple;
    els.nextBtn.hidden = !hasMultiple;

    showImage(0);
    els.galleryImg.alt = item.title || '';
    els.titleText.textContent = item.title || '';

    // 상품 카테고리에 맞는 리본 아이콘 + 원형 테두리 색
    const badge = CATEGORY_BADGE[item.category] || CATEGORY_BADGE.all;
    els.titleIconImg.src = badge.ribbon;
    overlay.style.setProperty('--modal-ring-color', badge.ring);

    els.price.textContent = toWon(unitPrice);
    // 적립금은 판매가의 3% 로 어림잡아 계산합니다.
    els.reward.textContent = `${Math.round(unitPrice * 0.03).toLocaleString('ko-KR')} 포인트 적립예정`;
    updateQtyUI();

    // 뒤쪽 페이지가 같이 스크롤되지 않도록 잠금
    document.body.style.overflow = 'hidden';
    window.lenis?.stop();

    // 브라우저가 애니메이션 시작점을 인식할 수 있도록 한 프레임 뒤에 켭니다.
    requestAnimationFrame(() => {
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        els.closeBtn.focus();
    });
}

export function closeShopItemModal() {
    if (!overlay) return;

    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');

    document.body.style.overflow = '';
    window.lenis?.start();

    if (onCloseHook) {
        onCloseHook();
        onCloseHook = null;
    }
}
