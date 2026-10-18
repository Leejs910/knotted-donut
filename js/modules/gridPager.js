// ◀▶ 그리드 페이지 넘김 — 카드가 많아지면 이전/다음 버튼으로 나눠 보여 줍니다.
//
// onlineShop.html(상품 그리드)과 menu.html(메뉴 그리드)이 같은 방식을 쓰므로
// 공용 모듈로 뺐습니다.
//
// 한 페이지에 몇 장을 보여줄지는 '지금 화면의 열 수 × rows' 로 정합니다.
// 열 수는 CSS 반응형이 정하므로 직접 계산하지 않고 grid-template-columns 에게 물어봅니다.
//
// 필요 CSS: css/components/grid-nav.css
//
// 사용법:
//   const pager = initGridPager({ gridEl, prevBtn, nextBtn, onChange: render });
//   ...
//   function render() {
//       const visible = pager.slice(전체배열);   // 이번 페이지 몫만 돌려줍니다
//       gridEl.innerHTML = visible.map(cardHTML).join('');
//   }

export function initGridPager({
    gridEl,
    prevBtn = null,
    nextBtn = null,
    rows = 2,                 // 한 페이지에 보여줄 '줄' 수
    mobileRows = null,        // 좁은 화면에서 쓸 줄 수. null 이면 페이지를 나누지 않습니다
    mobileQuery = '(max-width: 767px)',
    onChange = () => {},
} = {}) {
    if (!gridEl) return null;

    let page = 0;

    // 📐 grid-template-columns 의 계산값은 '열 너비 목록'이라 개수를 세면 열 수가 나옵니다.
    function columnCount() {
        const cols = getComputedStyle(gridEl).gridTemplateColumns;
        if (!cols || cols === 'none') return 1;
        return cols.split(' ').filter(Boolean).length;
    }

    function pageSize(total) {
        // 좁은 화면 처리
        //   · mobileRows 를 주면 그 줄 수로 나눕니다 (버튼은 CSS 가 그리드 아래로 옮깁니다)
        //   · 주지 않으면 페이지를 나누지 않고 전부 보여 줍니다
        //     (버튼이 카드를 가려서 숨기는 쪽을 택한 경우)
        if (window.matchMedia(mobileQuery).matches) {
            return mobileRows ? Math.max(1, columnCount() * mobileRows) : (total || 1);
        }
        return Math.max(1, columnCount() * rows);
    }

    // 페이지가 하나뿐이면 버튼을 통째로 숨기고, 끝에 닿으면 비활성화합니다.
    function updateNav(pageCount) {
        if (!prevBtn || !nextBtn) return;

        const onlyOnePage = pageCount <= 1;
        prevBtn.hidden = onlyOnePage;
        nextBtn.hidden = onlyOnePage;

        prevBtn.disabled = page <= 0;
        nextBtn.disabled = page >= pageCount - 1;
    }

    // 전체 목록에서 이번 페이지 몫만 잘라 돌려주고, 버튼 상태도 함께 맞춥니다.
    function slice(all = []) {
        if (!all.length) {
            page = 0;
            updateNav(1);
            return [];
        }

        const size = pageSize(all.length);
        const pageCount = Math.ceil(all.length / size);

        // 열 수가 바뀌거나 항목이 줄어 페이지가 사라졌으면 끝 페이지로 당겨옵니다.
        if (page > pageCount - 1) page = pageCount - 1;
        if (page < 0) page = 0;

        updateNav(pageCount);

        const start = page * size;
        return all.slice(start, start + size);
    }

    function goTo(next) {
        page = next;
        onChange();
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(page - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(page + 1));

    // 창 폭이 바뀌면 열 수가 달라져 페이지 구성이 통째로 바뀝니다.
    // (연속 호출은 마지막 것만 실행)
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(onChange, 150);
    });

    return {
        slice,
        reset() { page = 0; },      // 카테고리/정렬이 바뀌면 첫 페이지로
        get page() { return page; },

        // 한 페이지 정원과 전체 페이지 수 — 마지막 페이지가 비어도 높이를
        // 유지하고 싶을 때(빈 칸 채우기) 필요합니다.
        pageSize,
        pageCount(total) {
            return total ? Math.ceil(total / pageSize(total)) : 1;
        },
    };
}
