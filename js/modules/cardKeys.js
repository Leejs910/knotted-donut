// ⌨️ 마우스로만 열리던 카드를 키보드로도 열 수 있게 합니다
//
// 카드(도넛 슬라이드 · 메뉴 카드 등)는 안에 이미지와 글이 겹겹이 들어 있어
// <button> 으로 감싸기 어렵습니다. 그래서 카드에 tabindex="0" role="button" 을
// 붙여 Tab 으로 닿게 하고, 여기서 Enter / Space 를 '클릭' 으로 바꿔 줍니다.
// 카드를 여는 일 자체는 원래 있던 click 리스너가 그대로 합니다.
//
// 쓰는 법
//   initCardKeys(카드들을 담은 요소, '.카드-선택자');
//   카드 마크업에는  tabindex="0" role="button" aria-label="이름 자세히 보기"
// 필요 CSS: css/base/reset.css 의 [role="button"][tabindex="0"]:focus-visible

export function initCardKeys(container, selector) {
    if (!container) return;

    // 카드를 다시 그려도 계속 듣도록 바깥 상자에 한 번만 겁니다(이벤트 위임)
    container.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;

        // ⚠️ 카드 '자신' 에 초점이 있을 때만 — 카드 안의 다른 단추에서 누른
        //    Enter 까지 가로채면 그 단추가 두 번 눌립니다.
        const card = e.target.closest(selector);
        if (!card || card !== e.target) return;

        e.preventDefault(); // Space 가 페이지를 내리지 않도록
        card.click();
    });
}
