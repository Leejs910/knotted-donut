// 👤 로그인 상태에 따라 네비게이션을 바꿉니다
//
// 바꾸는 곳
//   · 모니터 네비의 Login 버튼  →  "Logout" (옆의 Cart 와 나란히)
//   · Mypage 버튼               →  로그인했을 때만 보입니다
//   · 폰 메뉴 머리말            →  로그인하면 안내문은 감추고
//                                  '마이페이지 / 로그아웃' 을 남깁니다
//
// 상태는 js/modules/auth.js 가 들고 있고, 바뀔 때마다 여기로 알려 줍니다.
// 필요 CSS: css/layout/nav.css (.is-logged-in)

import { onAuthChange, logout, getUser } from './auth.js';

export function initAuthNav() {
    const pcBtn = [...document.querySelectorAll('.pc-btn')]
        .find((el) => el.dataset.authBtn === 'login'
            || el.textContent.trim().toLowerCase() === 'login');

    const mobileText = document.querySelector('.mobile-login-header p');
    const mobileLink = document.querySelector('.mobile-login-header .login-link');

    // 로그인했을 때만 보이는 것들
    const myBtn = document.querySelector('.pc-btn-mypage');
    const myMobile = document.querySelector('.mobile-mypage');

    if (!pcBtn && !mobileLink) return;

    // 글자가 바뀌어도 다시 찾을 수 있도록 표식을 남겨 둡니다
    if (pcBtn) pcBtn.dataset.authBtn = 'login';

    // 로그아웃은 '되돌릴 수 있는' 동작이라 따로 묻지 않습니다.
    // 모달이 같이 열리는 건 loginModal 쪽에서 isLoggedIn() 으로 막습니다.
    function handleLogout(e) {
        e.preventDefault();
        logout();
    }

    function paint(user) {
        const on = Boolean(user);

        // 마이페이지는 로그인한 사람에게만 보입니다
        if (myBtn) myBtn.hidden = !on;
        if (myMobile) myMobile.hidden = !on;

        if (pcBtn) {
            // 이름 대신 할 일을 적습니다. 옆의 Cart 와 같은 모양으로 나란히 섭니다.
            pcBtn.textContent = on ? 'Logout' : 'Login';
            pcBtn.setAttribute('aria-label', on ? `로그아웃 (${user.name} 님)` : '로그인');

            pcBtn.removeEventListener('click', handleLogout);
            if (on) pcBtn.addEventListener('click', handleLogout);
        }

        // 로그인한 뒤에는 안내문을 감추고 '로그아웃' 하나만 남깁니다.
        // (링크는 nav.css 의 margin-left: auto 로 오른쪽에 그대로 붙어 있습니다)
        if (mobileText) {
            mobileText.textContent = on ? '' : '로그인이 필요합니다.';
            mobileText.hidden = on;
        }

        if (mobileLink) {
            mobileLink.textContent = on ? '로그아웃' : '로그인';
            mobileLink.removeEventListener('click', handleLogout);
            if (on) mobileLink.addEventListener('click', handleLogout);
        }
    }

    // 붙이는 즉시 지금 상태로 한 번 그려 줍니다 (새로고침 후에도 유지되도록)
    onAuthChange(paint);

    return { get user() { return getUser(); } };
}
