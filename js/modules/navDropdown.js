// 🔽 네비게이션 하위 메뉴
//
// 모니터 — 네비에 마우스를 올리면 노란 판이 아래로 내려옵니다.
//          각 칸은 위쪽 네비 글자 바로 밑에 오도록, 네비와 똑같은 모양의
//          목록을 그려서 줄을 맞춥니다.
// 폰     — 메뉴 칸마다 화살표가 붙고, 누르면 아래로 펼쳐집니다(아코디언).
//          글자를 누르면 그대로 그 페이지로 갑니다.
//
// 하위 항목은 js/data/navMenu.js 에 있습니다.
// 분류가 있는 링크는 ?cat=... 을 달고 가며, 그 페이지에서
// js/modules/tabFromUrl.js 가 읽어 해당 탭을 열어 줍니다.
//
// 필요 요소: .navbar .nav-links (없으면 조용히 끝냅니다)
// 필요 CSS: css/components/nav-dropdown.css

import { navMenu } from '../data/navMenu.js';

function esc(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/* ------------------------------------------------------------
   🖥️ 모니터 — 내려오는 노란 판
------------------------------------------------------------ */
function buildDesktop(navbar, linksEl) {
    // 네비에 실제로 있는 글자만, 그 순서대로 칸을 만듭니다.
    // (페이지마다 네비가 조금씩 달라도 줄이 어긋나지 않습니다)
    const columns = [...linksEl.querySelectorAll('li')].map((li) => {
        const label = li.textContent.trim().toUpperCase();
        const found = navMenu.find((m) => m.label.toUpperCase() === label);
        return { label, items: found ? found.items : [] };
    });

    if (!columns.some((c) => c.items.length)) return null;

    const panel = document.createElement('div');
    panel.className = 'nav-drop';
    panel.setAttribute('aria-hidden', 'true');

    panel.innerHTML = `
        <div class="nav-drop-inner">
            <ul class="nav-drop-cols">
                ${columns.map((col) => `
                    <li class="nav-drop-col">
                        <span class="sr-only">${esc(col.label)} 하위 메뉴</span>
                        ${col.items.map((item) => `
                            <a class="nav-drop-link" href="${esc(item.href)}">${esc(item.text)}</a>
                        `).join('')}
                    </li>`).join('')}
            </ul>
        </div>`;

    navbar.appendChild(panel);

    // ⚠️ 칸을 위쪽 글자에 맞추는 곳.
    //    .nav-links 는 네비(space-between) 안에서 로고와 오른쪽 단추 사이에
    //    놓이므로, 그냥 '가운데 정렬' 로는 글자와 어긋납니다.
    //    목록의 실제 자리와 폭을 재서 그대로 따라가게 하고, 칸 하나하나도
    //    위쪽 li 와 같은 폭으로 맞춥니다. (간격은 .nav-links 와 같은 64px)
    const colsEl = panel.querySelector('.nav-drop-cols');
    const cols = [...panel.querySelectorAll('.nav-drop-col')];

    function align() {
        const linkBox = linksEl.getBoundingClientRect();
        const panelBox = panel.getBoundingClientRect();
        if (!linkBox.width) return;

        colsEl.style.marginLeft = `${Math.round(linkBox.left - panelBox.left)}px`;
        colsEl.style.width = `${Math.round(linkBox.width)}px`;

        [...linksEl.querySelectorAll('li')].forEach((li, i) => {
            if (cols[i]) cols[i].style.width = `${Math.round(li.getBoundingClientRect().width)}px`;
        });
    }

    align();
    window.addEventListener('resize', align);

    let timer = null;
    const open = () => {
        clearTimeout(timer);
        align();            // 글꼴이 늦게 떠서 폭이 바뀌었을 수도 있습니다
        navbar.classList.add('nav-drop-open');
        panel.setAttribute('aria-hidden', 'false');
    };
    const close = () => {
        // ⚠️ 바로 닫으면 네비와 판 사이의 1~2px 틈을 지날 때 깜빡입니다.
        //    아주 짧게 기다렸다 닫습니다.
        clearTimeout(timer);
        timer = setTimeout(() => {
            navbar.classList.remove('nav-drop-open');
            panel.setAttribute('aria-hidden', 'true');
        }, 120);
    };

    navbar.addEventListener('mouseenter', open);
    navbar.addEventListener('mouseleave', close);

    // 키보드로 돌아다닐 때도 열립니다
    navbar.addEventListener('focusin', open);
    navbar.addEventListener('focusout', (e) => {
        if (!navbar.contains(e.relatedTarget)) close();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
    });

    return panel;
}

/* ------------------------------------------------------------
   📱 폰 — 화살표를 누르면 펼쳐지는 아코디언
------------------------------------------------------------ */
function buildMobile(listEl) {
    [...listEl.querySelectorAll('li')].forEach((li) => {
        const link = li.querySelector('a');
        if (!link) return;

        const label = link.textContent.trim().toUpperCase();
        const found = navMenu.find((m) => m.label.toUpperCase() === label);
        if (!found || found.items.length < 2) return;   // 펼칠 것이 있을 때만

        // 화살표 — 글자를 누르면 페이지로 가고, 화살표만 펼치기입니다
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'mobile-sub-toggle';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', `${link.textContent.trim()} 하위 메뉴 펼치기`);
        link.appendChild(toggle);

        const sub = document.createElement('ul');
        sub.className = 'mobile-sub';
        sub.hidden = true;
        sub.innerHTML = found.items
            .map((item) => `<li><a href="${esc(item.href)}">${esc(item.text)}</a></li>`)
            .join('');
        li.appendChild(sub);

        toggle.addEventListener('click', (e) => {
            // 화살표는 '펼치기' 전용 — 링크로 따라가지 않게 막습니다
            e.preventDefault();
            e.stopPropagation();

            const on = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!on));
            sub.hidden = on;
            li.classList.toggle('is-open', !on);
        });
    });
}

/* ------------------------------------------------------------ */
export function initNavDropdown() {
    const navbar = document.querySelector('.navbar');
    const linksEl = navbar && navbar.querySelector('.nav-links');
    if (!navbar || !linksEl) return;

    buildDesktop(navbar, linksEl);

    const mobileList = document.querySelector('.mobile-menu-list');
    if (mobileList) buildMobile(mobileList);
}
