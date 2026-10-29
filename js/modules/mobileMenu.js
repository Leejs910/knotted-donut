// 햄버거 버튼 → 모바일 전체화면 메뉴 열기/닫기
// 필요 요소: #hamburger-btn, #mobile-menu, #mainNav

export function initMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const navbar = document.getElementById('mainNav');
    if (!hamburgerBtn || !mobileMenu || !navbar) return;

    hamburgerBtn.addEventListener('click', () => {
        // 햄버거 애니메이션 클래스 온/오프
        hamburgerBtn.classList.toggle('active');

        // 모바일 메뉴 아래로 쫙 펼치기
        mobileMenu.classList.toggle('active');

        // 메뉴가 하얗게 차므로 네비게이션 아이콘도 검은색으로 맞춰 변경
        navbar.classList.toggle('menu-open');

        const isOpen = mobileMenu.classList.contains('active');

        // 메뉴 활성화 시 메인 화면이 뒤에서 스크롤되지 않도록 고정
        document.body.style.overflow = isOpen ? 'hidden' : '';

        // 버튼 안에는 <span> 세 줄뿐이라 읽어 줄 글자가 없습니다.
        // 마크업의 aria-label 이 이름을 대신하고, 지금 열렸는지 닫혔는지는
        // 여기서 알려 줍니다. (안 바꾸면 늘 '닫힘' 이라고 말하게 됩니다)
        hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
        hamburgerBtn.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
    });
}
