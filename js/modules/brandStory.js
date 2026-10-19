// 📖 브랜드 소개 본문 — 액자 다섯 개를 그리고, 보일 때 하나씩 떠오르게 합니다
//
// 하는 일
//   · brandData.js 의 목록대로 액자를 만들어 #brandPanels 에 넣습니다
//   · 화면에 들어온 액자에 .is-in 을 붙입니다 (모양은 CSS 가 가집니다)
//   · 맨 아래 인사 그림(.brand-outro)에도 같은 방식으로 .is-in 을 붙입니다
//
// 필요 요소: #brandPanels
// 필요 CSS: css/sections/brand-story.css, css/sections/brand-outro.css

const TONE_CLASS = {
    yellow: 'brand-panel--yellow',
    blue: 'brand-panel--blue',
    pink: 'brand-panel--pink',
    green: 'brand-panel--green',
};

// 글 사이에 들어가는 <, & 를 글자 그대로 보여 줍니다
function esc(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function panelHtml(item, index, all) {
    const tone = TONE_CLASS[item.tone] || TONE_CLASS.yellow;
    const media = item.media;

    const classes = ['brand-panel', tone];
    if (item.align === 'center') classes.push('brand-panel--center');
    if (media && media.side === 'right') classes.push('brand-panel--media-right');
    // 시안에서 두 번째 칸 앞(218px)과 마지막 칸 앞(222px)만 유난히 넓습니다.
    // 나머지 사이는 83px 이라 .brand-panel + .brand-panel 이 맡습니다.
    if (index === 1 || index === all.length - 1) classes.push('is-spaced');

    const badge = item.badge
        ? `<p class="brand-panel-badge">${esc(item.badge)}</p>`
        : '';

    const picture = media
        ? `<div class="brand-panel-media brand-panel-media--${esc(media.plate)}">
               <img src="${esc(media.src)}" alt="${esc(media.alt)}" loading="lazy" decoding="async">
           </div>`
        : '';

    const lines = item.lines
        .map((line) => `<span class="brand-line">${esc(line)}</span>`)
        .join('<br>');

    return `
        <article class="${classes.join(' ')}">
            ${badge}
            ${picture}
            <p class="brand-panel-text">${lines}</p>
        </article>
    `;
}

export function initBrandStory({ panels = [] } = {}) {
    const holder = document.getElementById('brandPanels');
    if (!holder) return;

    holder.innerHTML = panels.map(panelHtml).join('');

    const targets = [
        ...holder.querySelectorAll('.brand-panel'),
        ...document.querySelectorAll('.brand-outro'),
    ];
    if (!targets.length) return;

    // 관찰자를 쓸 수 없는 환경에서는 그냥 다 보여 줍니다
    if (!('IntersectionObserver' in window)) {
        targets.forEach((el) => el.classList.add('is-in'));
        return;
    }

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
        });
    }, {
        // 액자가 화면 아래에서 조금 올라온 뒤에 켜지도록
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.08,
    });

    targets.forEach((el) => io.observe(el));

    // 안전장치 — Lenis 처럼 네이티브 스크롤 이벤트를 내지 않는 환경에서
    // 관찰자가 조용할 때를 대비해, 화면 안에 들어온 것은 직접 켜 줍니다.
    // (support 페이지의 playOnceOnView 와 같은 이유입니다)
    const sweep = setInterval(() => {
        const left = targets.filter((el) => !el.classList.contains('is-in'));
        if (!left.length) {
            clearInterval(sweep);
            return;
        }
        const viewH = window.innerHeight || 0;
        if (!viewH) return;
        left.forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.top < viewH * 0.9 && r.bottom > 0) {
                el.classList.add('is-in');
                io.unobserve(el);
            }
        });
    }, 1200);
}
