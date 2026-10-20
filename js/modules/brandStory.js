// 📖 브랜드 소개 본문 — 액자 다섯 개를 그리고, 보일 때 하나씩 떠오르게 합니다
//
// 하는 일
//   · brandData.js 의 목록대로 액자를 만들어 #brandPanels 에 넣습니다
//   · 화면에 들어온 액자에 .is-in 을 붙입니다 (모양은 CSS 가 가집니다)
//   · 손글씨 인사(.brand-happiness)에도 같은 방식으로 .is-in 을 붙입니다
//   · 액자 구석의 ✕ 를 누르면 그 액자만 10초 동안 감춥니다
//
// 필요 요소: #brandPanels
// 필요 CSS: css/sections/brand-story.css, css/sections/brand-outro.css

// ✕ 를 눌렀을 때 액자가 숨어 있는 시간(ms)
const HIDE_MS = 10000;

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

    // 오른쪽 위 구석의 ✕ — 누르면 그 액자만 잠깐 사라집니다
    const close = `<button type="button" class="brand-panel-close"
                       aria-label="이 칸 잠시 숨기기"></button>`;

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
            ${close}
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

    // ✕ 누르기 — 액자마다 단추를 달지 않고 묶음 하나에서 받습니다
    // (액자를 다시 그려도 이 핸들러는 그대로 살아 있습니다)
    holder.addEventListener('click', (e) => {
        const btn = e.target.closest('.brand-panel-close');
        if (!btn) return;

        const panel = btn.closest('.brand-panel');
        // 이미 숨어 있으면 무시합니다. 숨은 동안에는 단추도 같이 가려지므로
        // 연달아 눌릴 일은 없지만, 키보드로 올 수 있어 한 번 더 막아 둡니다.
        if (!panel || panel.classList.contains('is-hidden')) return;

        panel.classList.add('is-hidden');
        setTimeout(() => panel.classList.remove('is-hidden'), HIDE_MS);
    });

    // ⚠️ 아래 도시 구간(.brand-outro)은 여기서 보지 않습니다.
    //    구름 흘리기는 js/modules/brandCity.js 가 따로 맡고 있어서,
    //    여기서 .is-in 을 붙여 봐야 쓰는 곳이 없습니다.
    const targets = [
        ...holder.querySelectorAll('.brand-panel'),
        ...document.querySelectorAll('.brand-happiness'),
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
