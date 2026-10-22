// 🔗 주소의 ?cat=... 을 보고 그 분류 탭을 열어 줍니다
//
// 네비 하위 메뉴에서 '푸드' 를 누르면 onlineShop.html?cat=food 로 옵니다.
// 그 페이지에 도착했을 때 '전체' 가 아니라 '푸드' 가 열려 있어야 합니다.
//
// ⚠️ 탭을 직접 만지지 않고 '누른 척' 합니다. 분류를 바꿀 때 해야 하는 일
//    (목록 거르기, 배지 튀기, 배경색 바꾸기)이 탭마다 다른데, 그 일은
//    이미 각 페이지의 모듈이 클릭을 받아 하고 있기 때문입니다.
//
// 쓰는 곳: js/pages/onlineShop.js, menu.js, support.js
//          (각 페이지의 목록 모듈을 붙인 '뒤에' 불러야 합니다)

export function initTabFromUrl(tabsEl) {
    const el = typeof tabsEl === 'string' ? document.getElementById(tabsEl) : tabsEl;
    if (!el) return;

    let cat = null;
    try {
        cat = new URLSearchParams(location.search).get('cat');
    } catch {
        return;
    }
    if (!cat) return;

    const tab = el.querySelector(`.shop-tab[data-category="${CSS.escape(cat)}"]`);
    if (!tab || tab.classList.contains('is-active')) return;

    tab.click();
}
