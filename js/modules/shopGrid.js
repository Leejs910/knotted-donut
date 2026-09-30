// 온라인 샵 상품 그리드 — 카테고리 탭 필터 + 정렬(커스텀 드롭다운) + 카드 렌더링
// 필요 요소: #shopCardGrid  (선택: #shopTabs, #shopSortWrap + #shopSort + #shopSortOptions)
// 필요 라이브러리: 없음
//
// 데이터 한 건의 모양: { title, imgUrl, imgUrl2, price, category }
//   category 는 탭의 data-category 값과 맞춰야 필터가 걸립니다.

import { openShopItemModal } from './shopItemModal.js';

// 탭 카테고리 ↔ 배지 리본 이미지 매칭 (배경색 전환은 CSS의 .shop-grid[data-active] 가 담당합니다)
const RIBBON_BY_CATEGORY = {
    all: './img/blue_ribbon.png',
    food: './img/yellow_ribbon.png',
    living: './img/pink_ribbon.png',
    bulk: './img/green_ribbon.png',
};

export function initShopGrid({ data = [] } = {}) {
    const gridEl = document.getElementById('shopCardGrid');
    if (!gridEl) return null;

    const shopGridEl = gridEl.closest('.shop-grid');
    const tabsEl = document.getElementById('shopTabs');
    const badgeEl = tabsEl ? tabsEl.querySelector('.shop-tabs-badge') : null;
    const badgeImgEl = badgeEl ? badgeEl.querySelector('img') : null;

    const sortWrapEl = document.getElementById('shopSortWrap');
    const sortTriggerEl = document.getElementById('shopSort');
    const sortValueEl = sortTriggerEl ? sortTriggerEl.querySelector('.shop-sort-value') : null;
    const sortOptionsEl = document.getElementById('shopSortOptions');

    let currentCategory = 'all';
    let currentSort = 'default';
    let renderedItems = []; // 지금 화면에 그려진 카드들 — "담기" 클릭 시 몇 번째 카드인지로 찾습니다.

    // 27900 -> "27,900 원"
    const toWon = (price) => Number(price).toLocaleString('ko-KR') + ' 원';

    // 지금 탭/정렬 상태에 맞는 목록을 만들어 돌려줍니다.
    // 원본 data 는 건드리지 않도록 항상 복사해서 정렬합니다.
    function getVisibleItems() {
        const filtered = data.filter(
            (item) => currentCategory === 'all' || item.category === currentCategory
        );

        if (currentSort === 'priceAsc') {
            return [...filtered].sort((a, b) => Number(a.price) - Number(b.price));
        }
        if (currentSort === 'priceDesc') {
            return [...filtered].sort((a, b) => Number(b.price) - Number(a.price));
        }
        return filtered; // 등록순 = 데이터에 적힌 순서 그대로
    }

    function cardHTML(item, index) {
        // imgUrl2 가 있으면 마우스를 올렸을 때 두 번째 컷으로 바뀝니다.
        const hoverImg = item.imgUrl2
            ? `<img class="shop-item-img is-hover" src="${item.imgUrl2}" alt="" aria-hidden="true" loading="lazy">`
            : '';

        return `
        <article class="shop-item" data-item-index="${index}">
            <div class="shop-item-thumb">
                <img class="shop-item-img" src="${item.imgUrl}" alt="${item.title}" loading="lazy">
                ${hoverImg}
            </div>
            <h3 class="shop-item-name">${item.title}</h3>
            <p class="shop-item-price">${toWon(item.price)}</p>
            <button type="button" class="shop-item-cart">담기</button>
        </article>`;
    }

    function render() {
        const items = getVisibleItems();
        renderedItems = items;

        if (!items.length) {
            gridEl.innerHTML = `<p class="shop-empty">이 카테고리에는 아직 상품이 없습니다.</p>`;
            return;
        }
        gridEl.innerHTML = items.map(cardHTML).join('');
    }

    // ----- 카테고리 탭 -----
    if (tabsEl) {
        tabsEl.addEventListener('click', (e) => {
            const tab = e.target.closest('.shop-tab');
            if (!tab || !tabsEl.contains(tab)) return;

            currentCategory = tab.dataset.category || 'all';

            tabsEl.querySelectorAll('.shop-tab').forEach((btn) => {
                const on = btn === tab;
                btn.classList.toggle('is-active', on);
                btn.setAttribute('aria-selected', String(on));
            });

            // 카테고리에 맞춰 섹션 배경색(CSS) + 리본 뱃지 이미지를 바꿉니다.
            if (shopGridEl) shopGridEl.dataset.active = currentCategory;
            if (badgeImgEl) badgeImgEl.src = RIBBON_BY_CATEGORY[currentCategory] || RIBBON_BY_CATEGORY.all;

            // 누를 때마다 뱃지가 통통 튀도록 애니메이션 클래스를 재시작합니다.
            if (badgeEl) {
                badgeEl.classList.remove('animate-bounce');
                void badgeEl.offsetWidth; // 리플로우를 강제해 같은 클래스를 다시 붙여도 애니메이션이 재생되게 함
                badgeEl.classList.add('animate-bounce');
            }

            render();
        });
    }

    // ----- 정렬 (둥근 커스텀 드롭다운) -----
    if (sortWrapEl && sortTriggerEl && sortOptionsEl) {
        const optionEls = Array.from(sortOptionsEl.querySelectorAll('.shop-sort-option'));

        const closeSort = () => {
            sortWrapEl.classList.remove('is-open');
            sortTriggerEl.setAttribute('aria-expanded', 'false');
        };

        const openSort = () => {
            sortWrapEl.classList.add('is-open');
            sortTriggerEl.setAttribute('aria-expanded', 'true');
        };

        sortTriggerEl.addEventListener('click', () => {
            sortWrapEl.classList.contains('is-open') ? closeSort() : openSort();
        });

        sortTriggerEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                sortWrapEl.classList.contains('is-open') ? closeSort() : openSort();
            } else if (e.key === 'Escape') {
                closeSort();
            }
        });

        optionEls.forEach((opt) => {
            opt.addEventListener('click', () => {
                currentSort = opt.dataset.value || 'default';
                if (sortValueEl) sortValueEl.textContent = opt.textContent;

                optionEls.forEach((o) => o.setAttribute('aria-selected', String(o === opt)));

                closeSort();
                render();
            });
        });

        document.addEventListener('click', (e) => {
            if (!sortWrapEl.contains(e.target)) closeSort();
        });
    }

    // ----- 카드 클릭(이미지/제목/담기 버튼 어디든) → 상품 상세 모달 -----
    gridEl.addEventListener('click', (e) => {
        const article = e.target.closest('.shop-item');
        if (!article) return;

        const item = renderedItems[Number(article.dataset.itemIndex)];
        openShopItemModal(item);
    });

    if (shopGridEl) shopGridEl.dataset.active = currentCategory;

    render();

    return { render };
}
