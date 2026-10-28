// ✨ 메뉴 섹션의 반짝이
//
// 하는 일
//   · js/data/menuDecoData.js 에 적힌 자리에 반짝이를 하나씩 놓습니다
//   · 저마다 조금씩 다른 속도·시작점으로 둥둥 떠다니게 합니다
//
// 떠다니는 모양(어떻게 움직이는지)은 css/sections/menu-grid.css 의
// menu-star-float 에 있습니다. 여기서는 '언제' 만 정합니다 — 전부 같은
// 박자로 움직이면 한 덩어리처럼 보여서, 하나씩 어긋나게 둡니다.
//
// 필요 요소: #menuStars (없으면 조용히 끝냅니다)
// 필요 CSS: css/sections/menu-grid.css

import { menuStars } from '../data/menuDecoData.js';

// 🎚️ 떠다니는 한 주기의 길이 범위(초). 넓힐수록 제각각으로 보입니다.
const TIME_MIN = 5.5;
const TIME_MAX = 9;

export function initMenuDeco() {
    const holder = document.getElementById('menuStars');
    if (!holder) return;

    const frag = document.createDocumentFragment();

    menuStars.forEach((star, i) => {
        const el = document.createElement('img');
        el.className = 'menu-star';
        el.src = `./img/menu/${star.src}`;
        el.alt = '';

        el.style.left = `${star.left}vw`;
        el.style.top = `${star.top}vw`;
        el.style.width = `${star.size}vw`;

        // 기울기는 애니메이션이 쓰는 값과 겹치지 않게 변수로 넘깁니다.
        // (css 에서 translate 는 애니메이션이, rotate 는 이 값이 맡습니다)
        el.style.setProperty('--star-spin', `${star.spin || 0}deg`);

        // 하나씩 다른 속도와 시작점 — 규칙적으로 흩되 반복처럼 보이지 않게
        const time = TIME_MIN + ((i * 1.7) % (TIME_MAX - TIME_MIN));
        el.style.setProperty('--star-time', `${time.toFixed(2)}s`);
        el.style.animationDelay = `${-(i * 0.83).toFixed(2)}s`;

        frag.appendChild(el);
    });

    holder.appendChild(frag);
}
