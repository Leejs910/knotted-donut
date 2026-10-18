// 🏷️ 카테고리 탭 — 알약 모양 토글 + 가운데 리본 뱃지
//
// onlineShop.html(상품 카테고리)과 menu.html(메뉴 카테고리)이 같은 동작을 쓰므로
// 공용 모듈로 뺐습니다.
//
// 하는 일
//   · 누른 탭에 is-active / aria-selected 를 옮겨 붙입니다
//   · 가운데 리본 뱃지를 카테고리 색에 맞춰 바꾸고 통통 튀게 합니다
//   · 테마 요소에 data-active="{카테고리}" 를 붙여 CSS 가 배경색을 바꾸게 합니다
//   · 바뀐 카테고리를 onChange 로 알려 줍니다
//
// 필요 CSS: css/components/category-tabs.css
//
// 사용법:
//   initCategoryTabs({
//       tabsEl: document.getElementById('shopTabs'),
//       themeEl: document.querySelector('.shop-grid'),
//       ribbons: { all: './img/blue_ribbon.png', ... },
//       onChange: (category) => { ... },
//   });

export function initCategoryTabs({
    tabsEl,
    themeEl = null,
    ribbons = {},
    defaultCategory = 'all',
    onChange = () => {},
} = {}) {
    if (!tabsEl) return null;

    const badgeEl = tabsEl.querySelector('.shop-tabs-badge');
    const badgeImgEl = badgeEl ? badgeEl.querySelector('img') : null;

    let current = defaultCategory;

    function paint(category) {
        if (themeEl) themeEl.dataset.active = category;

        if (badgeImgEl && ribbons[category]) {
            badgeImgEl.src = ribbons[category];
        }

        // 누를 때마다 뱃지가 다시 통통 튀도록 애니메이션을 재시작합니다.
        // 클래스를 떼고 리플로우를 강제해야 같은 클래스를 다시 붙여도 재생됩니다.
        if (badgeEl) {
            badgeEl.classList.remove('animate-bounce');
            void badgeEl.offsetWidth;
            badgeEl.classList.add('animate-bounce');
        }
    }

    tabsEl.addEventListener('click', (e) => {
        const tab = e.target.closest('.shop-tab');
        if (!tab || !tabsEl.contains(tab)) return;

        current = tab.dataset.category || defaultCategory;

        tabsEl.querySelectorAll('.shop-tab').forEach((btn) => {
            const on = btn === tab;
            btn.classList.toggle('is-active', on);
            btn.setAttribute('aria-selected', String(on));
        });

        paint(current);
        onChange(current);
    });

    // 처음 상태 — 뱃지만 맞추고 통통 튀는 효과는 생략합니다.
    if (themeEl) themeEl.dataset.active = current;
    if (badgeImgEl && ribbons[current]) badgeImgEl.src = ribbons[current];

    return {
        get category() { return current; },
    };
}
