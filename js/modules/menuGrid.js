// 🍩 메뉴 그리드 (menu.html) — 카테고리 탭 + 카드 렌더링 + 상세 모달
//
// 필요 요소: #menuCardGrid  (선택: #menuTabs, #menuPrev + #menuNext)
// 필요 CSS : css/sections/menu-grid.css, css/components/menu-card.css,
//            css/components/category-tabs.css
// 필요 라이브러리: 없음
//
// 데이터 한 건의 모양: { title, engTitle, imgUrl, desc, allergy, origin }
//   onlineShop 과 달리 데이터에 category 를 넣지 않고, 카테고리별 배열을 따로 받습니다.
//   (도넛 = bestMenuData, 케이크 = newMenuData 를 그대로 재사용하기 위해서입니다)

import { initCategoryTabs } from './categoryTabs.js';
import { openDonutModal } from './donutModal.js';
import { initGridPager } from './gridPager.js';

// 🎨 카테고리별 테마 — 카드 그림 / 이름표 색 / 리본 뱃지가 한 세트로 움직입니다.
//    하늘(섹션 배경)색은 css/sections/menu-grid.css 의 [data-active] 가 맡습니다.
const THEMES = {
    all:   { bgImg: './img/cardBlue.png',   themeColor: '#A6C8FF' },
    donut: { bgImg: './img/cardYellow.png', themeColor: '#F4D03F' },
    cake:  { bgImg: './img/cardPink.png',   themeColor: '#FFAFC8' },
    drink: { bgImg: './img/cardGreen.png',  themeColor: '#89D9B9' },
};

// 🎚️ 한 페이지에 보여줄 '줄' 수.
//    한 페이지 카드 수 = 이 값 × 지금 화면의 열 수(CSS가 정합니다. 4 / 3 / 2열).
const PAGE_ROWS = 2;

// 🎚️ 폰(767px 이하)에서 한 페이지에 보여줄 줄 수.
//    2열 × 3줄 = 6개씩. 이걸 두지 않으면 20개가 10줄로 쭉 늘어나
//    섹션 높이가 화면의 3배가 넘습니다.
const MOBILE_PAGE_ROWS = 3;

export function initMenuGrid({ donut = [], cake = [], drink = [] } = {}) {
    const gridEl = document.getElementById('menuCardGrid');
    if (!gridEl) return null;

    const sectionEl = gridEl.closest('.menu-grid');
    const tabsEl = document.getElementById('menuTabs');
    const prevBtn = document.getElementById('menuPrev');
    const nextBtn = document.getElementById('menuNext');

    const byCategory = { donut, cake, drink };

    let currentCategory = 'all';
    let renderedItems = []; // 지금 그려진 카드들 — 클릭한 카드를 번호로 찾습니다.

    // '전체'는 도넛 → 케이크 → 음료 순으로 이어 붙입니다.
    function getItems() {
        if (currentCategory === 'all') return [...donut, ...cake, ...drink];
        return byCategory[currentCategory] || [];
    }

    function cardHTML(item, index) {
        const theme = THEMES[currentCategory] || THEMES.all;
        return `
        <article class="menu-card" data-index="${index}">
            <img class="menu-card-bg" src="${theme.bgImg}" alt="" aria-hidden="true">
            <img class="menu-card-pic" src="${item.imgUrl}" alt="${item.title}" loading="lazy">
            <div class="menu-card-name" style="background-color: ${theme.themeColor};">${item.title}</div>
        </article>`;
    }

    function render() {
        const all = getItems();

        if (!all.length) {
            renderedItems = [];
            gridEl.innerHTML = `<p class="menu-empty">이 카테고리에는 아직 메뉴가 없습니다.</p>`;
            pager.slice([]);
            return;
        }

        // 이번 페이지 몫만 잘라 옵니다. 버튼 상태도 pager 가 함께 맞춰 줍니다.
        renderedItems = pager.slice(all);

        // 📏 마지막 페이지가 덜 찼을 때 섹션 높이가 줄어드는 것을 막습니다.
        //    예) 전체 20개를 4열 2줄(8개)씩 보면 3페이지가 4개뿐이라,
        //        넘기는 순간 하늘색 배경이 한 줄 높이만큼 쑥 줄어듭니다.
        //    빈 칸(자리만 차지하는 투명 칸)으로 정원을 채워 높이를 고정합니다.
        //    페이지가 하나뿐이면 넘길 일이 없으니 채우지 않습니다.
        const size = pager.pageSize(all.length);
        const blanks = pager.pageCount(all.length) > 1
            ? Math.max(0, size - renderedItems.length)
            : 0;

        gridEl.innerHTML =
            renderedItems.map(cardHTML).join('') +
            '<div class="menu-card-blank" aria-hidden="true"></div>'.repeat(blanks);
    }

    // ----- 페이지 넘김 (onlineShop.html 과 같은 모듈) -----
    const pager = initGridPager({
        gridEl,
        prevBtn,
        nextBtn,
        rows: PAGE_ROWS,
        mobileRows: MOBILE_PAGE_ROWS,
        onChange: render,
    });

    // ----- 카테고리 탭 -----
    initCategoryTabs({
        tabsEl,
        themeEl: sectionEl,
        // ⚠️ ribbons 를 넘기지 않습니다. 넘기면 탭 모듈이 배지 그림의 src 를
        //    카테고리마다 리본으로 갈아끼웁니다 — menu.html 에 적어 둔 웃는
        //    얼굴이 켜지자마자 리본으로 바뀌어 버립니다.
        //    배지는 마크업에 적은 얼굴 하나로 고정합니다 (mypage / support 와 같은 방식).
        //    통통 튀는 효과는 그대로 동작합니다.
        onChange: (category) => {
            currentCategory = category;
            pager.reset(); // 카테고리를 바꾸면 첫 페이지부터
            render();
        },
    });

    // ----- 카드 클릭 → 둥근 상세 모달 -----
    // 카드를 다시 그려도 계속 동작하도록 그리드 전체에 한 번만 겁니다(이벤트 위임).
    gridEl.addEventListener('click', (e) => {
        const card = e.target.closest('.menu-card');
        if (!card) return;

        const item = renderedItems[Number(card.dataset.index)];
        if (!item) return;

        // 지금 카테고리의 색을 그대로 모달에 넘겨 카드와 같은 톤으로 열립니다.
        const theme = THEMES[currentCategory] || THEMES.all;
        openDonutModal(item, { themeColor: theme.themeColor, bgImg: theme.bgImg });
    });

    render();

    return { render };
}
