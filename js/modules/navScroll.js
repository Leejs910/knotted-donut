// 스크롤 방향에 따라 네비게이션을 숨기고/배경을 채우는 기능
// 필요 요소: .navbar

export function initNavScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScrollY = window.scrollY; // 초기 스크롤 위치 저장

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY; // 현재 스크롤 위치

        // 조건 1: 스크롤이 맨 위(0)에 도달했을 때
        if (currentScrollY <= 0) {
            navbar.classList.remove('nav-hidden'); // 보이게 함
            navbar.classList.remove('nav-solid');  // 투명하게 만듦 (배경 제거)
        }
        // 조건 2: 스크롤을 아래로 내릴 때 (현재 위치가 이전 위치보다 클 때)
        else if (currentScrollY > lastScrollY) {
            navbar.classList.add('nav-hidden');    // 위로 숨김
        }
        // 조건 3: 스크롤을 위로 올릴 때 (현재 위치가 이전 위치보다 작을 때)
        else {
            navbar.classList.remove('nav-hidden'); // 다시 내려와서 보이게 함
            navbar.classList.add('nav-solid');     // 배경색을 흰색으로 채움
        }

        // 다음 스크롤 이벤트를 위해 현재 위치를 이전 위치로 업데이트
        lastScrollY = currentScrollY;
    });
}
