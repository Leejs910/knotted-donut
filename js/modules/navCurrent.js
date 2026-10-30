// 📍 지금 보고 있는 페이지의 네비게이션 항목 다루기
//
// 하는 일
//   · 지금 페이지를 가리키는 링크에 aria-current="page" 를 붙입니다
//   · 그 링크를 누르면 다시 불러오지 않고, 모바일 메뉴만 닫습니다
//
// 왜 필요한가
//   예전에는 마크업에서 지금 페이지의 링크를 href="#" 로 죽여 뒀습니다.
//   그런데 모바일에서 햄버거를 열고 그 항목을 누르면 아무 일도 일어나지
//   않아, 메뉴가 열린 채로 갇혔습니다. 닫으려면 X 를 따로 눌러야 했습니다.
//   게다가 손으로 적다 보니 페이지마다 어긋났습니다 — mypage 에서는 엉뚱하게
//   Support 가 죽어 있어서 고객센터로 아예 못 갔습니다.
//
//   그래서 링크는 전부 제 주소를 갖게 두고, '지금 페이지인지' 는 여기서
//   주소를 비교해 판단합니다. 페이지가 늘어도 손댈 곳이 없습니다.
//
// 필요 요소: .nav-links a, .mobile-menu-list a (없으면 조용히 끝냅니다)

import { closeMobileMenu } from './mobileMenu.js';

const SELECTOR = '.nav-links a, .mobile-menu-list a';

// /menu.html 과 ./menu.html 처럼 적는 법이 달라도 같은 곳이면 같다고 봅니다.
// 끝의 index.html 과 / 도 같은 것으로 칩니다.
function samePage(href) {
    try {
        const url = new URL(href, location.href);
        if (url.origin !== location.origin) return false;
        const norm = (p) => p.replace(/\/index\.html$/, '/').replace(/\/$/, '/');
        return norm(url.pathname) === norm(location.pathname);
    } catch {
        return false;   // href 가 # 이나 mailto: 처럼 주소가 아닐 때
    }
}

export function initNavCurrent() {
    const links = [...document.querySelectorAll(SELECTOR)];
    if (!links.length) return;

    links.forEach((a) => {
        const href = a.getAttribute('href');
        if (!href || href.startsWith('#') || !samePage(href)) return;

        a.setAttribute('aria-current', 'page');

        a.addEventListener('click', (e) => {
            // 새 탭으로 열려는 것은 그대로 둡니다
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

            // ⚠️ 여기서 막지 않으면 같은 페이지를 그대로 다시 불러옵니다.
            //    보고 있던 자리도 잃고, 받을 것도 다시 받습니다.
            e.preventDefault();
            closeMobileMenu();
        });
    });
}
