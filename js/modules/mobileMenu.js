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

        // 메뉴 활성화 시 메인 화면이 뒤에서 스크롤되지 않도록 고정
        if (mobileMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
}
