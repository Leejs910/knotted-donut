// 🏷️ 브랜드 소개 맨 위 — Knotted 로고가 한 번 조립되듯 나타납니다
//
// 하는 일은 하나입니다: 첫 그림(노란 리본)이 다 받아진 뒤에 .is-ready 를
// 붙여 줍니다. 나타나는 순서와 모양은 전부 css/sections/brand-hero.css 가
// 가지고 있습니다. (리본 → 글자 → 스마일 순서)
//
// ⚠️ 그림을 기다리기만 하면, 캐시가 꼬이거나 파일을 못 받았을 때 로고가
//    영영 투명한 채로 남습니다. 그래서 짧은 시간이 지나면 무조건 켭니다.
//
// 필요 요소: .brand-hero
// 필요 CSS: css/sections/brand-hero.css

export function initBrandHero() {
    const hero = document.querySelector('.brand-hero');
    if (!hero) return;

    let done = false;
    const show = () => {
        if (done) return;
        done = true;
        hero.classList.add('is-ready');
    };

    const images = [...hero.querySelectorAll('img')];
    const pending = images.filter((img) => !img.complete);

    if (!pending.length) {
        // 이미 다 받아져 있으면 한 프레임만 쉬었다 켭니다.
        // (바로 켜면 전환이 시작점을 거치지 않고 끝 모습으로 그려집니다)
        requestAnimationFrame(() => requestAnimationFrame(show));
    } else {
        let left = pending.length;
        const tick = () => { if (--left <= 0) show(); };
        pending.forEach((img) => {
            img.addEventListener('load', tick, { once: true });
            img.addEventListener('error', tick, { once: true });
        });
    }

    // 안전장치 — 그림을 못 받아도 로고는 보여야 합니다
    setTimeout(show, 1500);
}
