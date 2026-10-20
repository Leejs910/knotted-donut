// 📄 페이지를 옮길 때 흰 막이 덮였다 걷히게 합니다
//
// 들어올 때 걷히는 것은 CSS 가 알아서 합니다(css/components/page-fade.css).
// 여기서는 '나갈 때' 만 맡습니다 — 링크를 누르면 바로 넘어가지 않고,
// 막이 덮인 뒤에 넘어갑니다.
//
// 건드리지 않는 링크
//   · 다른 사이트 / 새 탭(target) / 내려받기
//   · 같은 페이지 안의 앵커(#...), tel:, mailto:
//   · Ctrl·Shift·Cmd 를 누른 채 누른 것 (새 탭으로 열려는 것이니까요)
//   · 이미 다른 곳에서 막아 둔 것 (예: 로그인해야 하는 Cart — authGuard.js)
//
// 필요 요소: .page-fade (각 HTML 의 <body> 맨 앞)
// 필요 CSS: css/components/page-fade.css

const FALLBACK_MS = 600;   // 전환이 끝났다는 신호가 안 오더라도 넘어갈 시간

export function initPageFade() {
    const veil = document.querySelector('.page-fade');
    if (!veil) return;

    // ⚠️ 뒤로 가기로 돌아왔을 때 (bfcache) 막이 덮인 채로 멈춰 있습니다.
    //    .is-leaving 을 떼면 animation-name 이 되돌아가면서 다시 걷힙니다.
    window.addEventListener('pageshow', (e) => {
        if (e.persisted) veil.classList.remove('is-leaving');
    });

    document.addEventListener('click', (e) => {
        // 다른 곳에서 이미 막았으면 그 뜻을 따릅니다
        if (e.defaultPrevented) return;
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        const link = e.target.closest('a');
        if (!link || link.target || link.hasAttribute('download')) return;

        const href = link.getAttribute('href');
        if (!href || href.startsWith('#')) return;

        const url = new URL(link.href, location.href);
        if (url.origin !== location.origin) return;

        // 지금 보고 있는 페이지와 같은 곳이면 넘어갈 것도 없습니다
        if (url.pathname === location.pathname && url.search === location.search) return;

        e.preventDefault();
        veil.classList.add('is-leaving');

        // 막이 다 덮이면 넘어갑니다.
        // ⚠️ animationend 만 믿으면, 탭이 뒤에 있어 애니메이션이 멈춘 동안
        //    영영 넘어가지 않습니다. 시간으로도 한 번 더 받쳐 둡니다.
        let gone = false;
        const go = () => {
            if (gone) return;
            gone = true;
            location.href = url.href;
        };

        veil.addEventListener('animationend', go, { once: true });
        setTimeout(go, FALLBACK_MS);
    });
}
