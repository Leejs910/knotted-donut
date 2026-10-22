// ❓ 자주 묻는 질문 목록 — 카테고리로 거르고, 질문을 누르면 답이 펼쳐집니다
//
// 하는 일
//   · faqData 를 받아 질문 카드를 그립니다
//   · 탭에서 고른 카테고리만 남깁니다 (탭 동작은 categoryTabs.js 가 담당)
//   · 질문을 누르면 그 항목만 펼치고 나머지는 접습니다 (아코디언)
//
// 필요 요소: #faqList
// 필요 CSS: css/components/faq-item.css

export function initFaqList({ data = [], labels = {} } = {}) {
    const listEl = document.getElementById('faqList');
    if (!listEl) return null;

    const emptyEl = document.getElementById('faqEmpty');
    let category = 'all';

    function render() {
        const items = category === 'all'
            ? data
            : data.filter((item) => item.category === category);

        listEl.innerHTML = items.map((item, i) => `
            <div class="faq-item" data-category="${item.category}">
                <h3 class="faq-q-row">
                    <button type="button" class="faq-q" id="faqQ${i}"
                        aria-expanded="false" aria-controls="faqA${i}">
                        <span class="faq-mark" aria-hidden="true">Q.</span>
                        <span class="faq-q-text">${item.q}</span>
                        <span class="faq-arrow" aria-hidden="true"></span>
                    </button>
                </h3>
                <div class="faq-a" id="faqA${i}" role="region" aria-labelledby="faqQ${i}">
                    <div class="faq-a-inner">
                        <span class="faq-mark" aria-hidden="true">A.</span>
                        <p class="faq-a-text">${item.a}</p>
                    </div>
                </div>
            </div>
        `).join('');

        if (emptyEl) {
            emptyEl.hidden = items.length > 0;
            emptyEl.textContent = items.length
                ? ''
                : `${labels[category] || '이 분류'}에 등록된 질문이 아직 없습니다.`;
        }
    }

    // 질문을 누르면 그 항목만 펼칩니다.
    // (목록을 다시 그려도 동작이 유지되도록 목록 자체에 한 번만 걸어 둡니다)
    listEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.faq-q');
        if (!btn || !listEl.contains(btn)) return;

        const open = btn.getAttribute('aria-expanded') === 'true';

        listEl.querySelectorAll('.faq-q[aria-expanded="true"]').forEach((other) => {
            other.setAttribute('aria-expanded', 'false');
            other.closest('.faq-item').classList.remove('is-open');
        });

        if (!open) {
            btn.setAttribute('aria-expanded', 'true');
            btn.closest('.faq-item').classList.add('is-open');
        }
    });

    render();

    return {
        setCategory(next) {
            category = next;
            render();
        },
    };
}
