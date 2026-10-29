// 🔢 번호 페이지 넘김 — 긴 목록을 몇 개씩 끊어 보여 줍니다.
//
//   ‹ 이전   1  2  3 … 10  …   다음 ›
//
// js/modules/gridPager.js 와는 다릅니다. 그쪽은 카드 그리드를 '열 수 × 줄 수'
// 로 끊고 이전/다음 버튼만 둡니다. 여기는 세로로 쌓이는 목록을 정해진 개수로
// 끊고 번호를 찍습니다.
//
// 필요 CSS: css/components/list-pager.css
//
// 사용법:
//   const pager = initListPager({ pagerEl, pageSize: 5, onChange: render });
//   render();
//   function render() {
//       listEl.innerHTML = pager.slice(전체배열).map(itemHTML).join('');
//   }

export function initListPager({
    pagerEl,
    pageSize = 5,
    // 🎚️ 한 번에 늘어놓을 번호 개수. 이 단위로 묶여서 넘어갑니다
    //    (1~10 을 보다가 11 로 가면 11~20 이 나옵니다)
    windowSize = 10,
    onChange = () => {},
} = {}) {
    if (!pagerEl) return null;

    let page = 0;

    function pageCount(total) {
        return total ? Math.ceil(total / pageSize) : 1;
    }

    function btn(label, target, { current = false, disabled = false, cls = '' } = {}) {
        return `<button type="button" class="list-pager-btn ${cls}"
            data-page="${target}"
            ${disabled ? 'disabled' : ''}
            ${current ? 'aria-current="page"' : ''}>${label}</button>`;
    }

    function renderNav(count) {
        // 한 쪽뿐이면 번호를 보여 줄 이유가 없습니다.
        if (count <= 1) {
            pagerEl.hidden = true;
            pagerEl.innerHTML = '';
            return;
        }
        pagerEl.hidden = false;

        const blockStart = Math.floor(page / windowSize) * windowSize;
        const blockEnd = Math.min(blockStart + windowSize, count);

        let html = btn('‹ 이전', page - 1, { disabled: page <= 0, cls: 'is-step' });
        for (let i = blockStart; i < blockEnd; i++) {
            html += btn(String(i + 1), i, { current: i === page });
        }
        // 뒤에 더 있으면 말줄임으로 알립니다 (누르는 곳이 아니라 표시입니다)
        if (blockEnd < count) html += `<span class="list-pager-dots" aria-hidden="true">…</span>`;
        html += btn('다음 ›', page + 1, { disabled: page >= count - 1, cls: 'is-step' });

        pagerEl.innerHTML = html;
    }

    // 전체 목록에서 이번 쪽 몫만 잘라 돌려주고, 번호도 같이 맞춥니다.
    function slice(all = []) {
        const count = pageCount(all.length);

        // 항목이 줄어 지금 쪽이 사라졌으면 마지막 쪽으로 당겨옵니다.
        if (page > count - 1) page = count - 1;
        if (page < 0) page = 0;

        renderNav(count);
        return all.slice(page * pageSize, page * pageSize + pageSize);
    }

    // 버튼이 다시 그려져도 살아 있도록 상자에 한 번만 걸어 둡니다.
    pagerEl.addEventListener('click', (e) => {
        const b = e.target.closest('.list-pager-btn');
        if (!b || b.disabled) return;
        const next = Number(b.dataset.page);
        if (Number.isNaN(next) || next === page) return;
        page = next;
        onChange(page);
    });

    return {
        slice,
        reset() { page = 0; },
        get page() { return page; },
        pageCount,
    };
}
