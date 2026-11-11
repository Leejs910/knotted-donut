// 🔐 로그인 모달 — 네비게이션의 Login 을 누르면 화면 위에 떠오릅니다
//
// js/modules/shopItemModal.js 와 같은 방식으로 HTML을 스스로 만들어 넣습니다.
// 페이지 HTML에는 아무것도 추가할 필요가 없습니다.
//
// 여는 버튼 (있는 것만 자동으로 연결)
//   · .pc-btn  중 글자가 Login 인 것   (모니터 네비)
//   · .login-link                      (폰 메뉴의 '로그인')
//
// 필요 CSS: css/components/modal-screen.css, css/components/login-modal.css
//
// ⚠️ 서버 없이 흉내만 내는 로그인입니다. 맞는지 확인하는 일은
//    js/modules/auth.js 가 브라우저 안에서 하고, 결과는 localStorage 에
//    남습니다. 진짜 인증이 아니라는 점은 auth.js 주석에 적어 두었습니다.
//    입력한 값은 어디로도 전송되지 않습니다.

import { login, signup, isLoggedIn } from './auth.js';
import { demoUsers } from '../data/demoUsers.js';

const MODAL_HTML = `
<!-- data-lenis-prevent 를 빼면 폰·태블릿에서 손가락으로 밀어도 안 움직입니다.
     이유는 js/modules/shopItemModal.js 의 같은 자리에 적어 두었습니다. -->
<div id="login-modal" class="modal-screen login-overlay" data-lenis-prevent role="dialog" aria-modal="true"
     aria-labelledby="login-title" aria-hidden="true" tabindex="-1">
    <div class="login-box">

        <div class="login-head">
            <h2 class="login-title" id="login-title">로그인</h2>
            <button type="button" class="login-close" aria-label="닫기">&times;</button>
        </div>

        <div class="login-body">

        <div class="login-stage">

        <!-- 로그인 화면 -->
        <div class="login-view" data-view="login">
        <p class="login-demo">
                포트폴리오용 데모입니다. 회원가입으로 계정을 만드셔도 되고,
                바로 둘러보시려면 <b class="login-demo-id"></b> /
                <b class="login-demo-pw"></b>
                <button type="button" class="login-demo-fill">채우기</button><br>
                어느 쪽이든 진짜 쓰시는 비밀번호는 넣지 말아 주세요.
            </p>

        <form class="login-form" novalidate>
            <div class="login-field" data-field="email">
                <input type="email" class="login-input" name="email" placeholder="이메일"
                    autocomplete="off" aria-label="이메일">
                <p class="login-error"></p>
            </div>

            <div class="login-field" data-field="password">
                <input type="password" class="login-input" name="password" placeholder="비밀번호"
                    autocomplete="off" aria-label="비밀번호">
                <p class="login-error"></p>
            </div>

            <label class="login-keep">
                <input type="checkbox" name="keep">
                로그인 상태 유지
            </label>

            <button type="submit" class="login-btn login-btn-primary">로그인</button>
        </form>

        <div class="login-links">
            <button type="button" class="go-signup">회원가입</button>
            <a>아이디 · 비밀번호 찾기</a>
        </div>

        </div>

        <!-- 회원가입 화면 (같은 상자 안에서 갈아 끼웁니다) -->
        <div class="login-view" data-view="signup" hidden>
        <p class="login-demo">
                포트폴리오용 데모입니다. 회원가입으로 계정을 만드셔도 되고,
                바로 둘러보시려면 <b class="login-demo-id"></b> /
                <b class="login-demo-pw"></b>
                <button type="button" class="login-demo-fill">채우기</button><br>
                어느 쪽이든 진짜 쓰시는 비밀번호는 넣지 말아 주세요.
            </p>

            <form class="signup-form" novalidate>
                <div class="login-field" data-field="name">
                    <input type="text" class="login-input" name="name" placeholder="이름"
                        autocomplete="off" aria-label="이름">
                    <p class="login-error"></p>
                </div>

                <div class="login-field" data-field="email">
                    <input type="email" class="login-input" name="email" placeholder="이메일"
                        autocomplete="off" aria-label="이메일">
                    <p class="login-error"></p>
                </div>

                <div class="login-field" data-field="password">
                    <input type="password" class="login-input" name="password"
                        placeholder="비밀번호 (8자 이상)" autocomplete="off" aria-label="비밀번호">
                    <p class="login-error"></p>
                </div>

                <div class="login-field" data-field="password2">
                    <input type="password" class="login-input" name="password2"
                        placeholder="비밀번호 확인" autocomplete="off" aria-label="비밀번호 확인">
                    <p class="login-error"></p>
                </div>

                <div class="login-field" data-field="agree">
                    <label class="login-keep">
                        <input type="checkbox" name="agree">
                        이용약관 및 개인정보처리방침에 동의합니다
                    </label>
                    <p class="login-error"></p>
                </div>

                <button type="submit" class="login-btn login-btn-primary">가입하고 시작하기</button>
            </form>

            <div class="login-links login-links-center">
                <span>이미 계정이 있으신가요?</span>
                <button type="button" class="go-login">로그인</button>
            </div>
        </div>

        <!-- 넘어갈 때 '뜯긴 종이 뒷면'을 그리는 곳.
             test/loginAnime.html 의 .flap-svg 를 그대로 가져왔습니다. -->
        <svg class="login-flap" viewBox="-200 -200 800 700" aria-hidden="true">
            <polygon class="login-flap-poly" points=""></polygon>
        </svg>

        </div>
        </div>

    </div>
</div>
`;

let overlay = null;
let els = null;
let lastFocused = null;   // 모달을 연 버튼 — 닫을 때 그 자리로 초점을 돌려줍니다

function buildModal() {
    if (overlay) return overlay;

    const holder = document.createElement('div');
    holder.innerHTML = MODAL_HTML.trim();
    overlay = holder.firstElementChild;
    document.body.appendChild(overlay);

    els = {
        box: overlay.querySelector('.login-box'),
        closeBtn: overlay.querySelector('.login-close'),
        form: overlay.querySelector('.login-form'),
        email: overlay.querySelector('[name="email"]'),
        password: overlay.querySelector('[name="password"]'),
        keep: overlay.querySelector('[name="keep"]'),
        demoIds: overlay.querySelectorAll('.login-demo-id'),
        demoPws: overlay.querySelectorAll('.login-demo-pw'),
        demoFills: overlay.querySelectorAll('.login-demo-fill'),
        title: overlay.querySelector('.login-title'),
        views: overlay.querySelectorAll('.login-view'),
        goSignup: overlay.querySelector('.go-signup'),
        goLogin: overlay.querySelector('.go-login'),
        signupForm: overlay.querySelector('.signup-form'),
        stage: overlay.querySelector('.login-stage'),
        flapPoly: overlay.querySelector('.login-flap-poly'),
    };

    // 데모 계정을 화면에 그대로 보여 줍니다 (전시용이라 가려 둘 이유가 없습니다)
    // 안내가 두 화면에 한 벌씩 있습니다 (본문 전체가 한 장으로 뜯기도록)
    const demo = demoUsers[0];
    els.demoIds.forEach((el) => { el.textContent = demo.email; });
    els.demoPws.forEach((el) => { el.textContent = demo.password; });
    els.demoFills.forEach((btn) => {
        btn.addEventListener('click', () => {
            els.email.value = demo.email;
            els.password.value = demo.password;
            clearError(els.email);
            clearError(els.password);
            if (overlay.dataset.view !== 'login') tearTo('login');
            else els.form.querySelector('[type="submit"]').focus();
        });
    });


    // 뒷배경(오버레이 자신)을 눌렀을 때만 닫힙니다. 상자 위를 눌렀을 때는 안 닫힘
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeLoginModal();
    });
    els.closeBtn.addEventListener('click', closeLoginModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeLoginModal();
        }
    });

    els.form.addEventListener('submit', onSubmit);
    els.signupForm.addEventListener('submit', onSignup);

    // 로그인 ↔ 회원가입 갈아 끼우기
    els.goSignup.addEventListener('click', (e) => { e.preventDefault(); tearTo('signup'); });
    els.goLogin.addEventListener('click', (e) => { e.preventDefault(); tearTo('login'); });

    // 가입 칸들도 다시 입력하면 빨간 표시를 지웁니다
    els.signupForm.querySelectorAll('input').forEach((input) => {
        input.addEventListener('input', () => clearError(input));
        input.addEventListener('change', () => clearError(input));
    });

    // 다시 입력하면 빨간 표시를 지웁니다
    [els.email, els.password].forEach((input) => {
        input.addEventListener('input', () => clearError(input));
    });

    return overlay;
}

function setError(input, message) {
    const field = input.closest('.login-field');
    field.classList.add('is-error');
    field.querySelector('.login-error').textContent = message;
}

function clearError(input) {
    const field = input.closest('.login-field');
    if (!field) return;
    field.classList.remove('is-error');
    field.querySelector('.login-error').textContent = '';
}

/** 상자 안의 모든 빨간 표시를 지웁니다 */
function clearAllErrors() {
    overlay.querySelectorAll('.login-field.is-error').forEach((f) => {
        f.classList.remove('is-error');
        f.querySelector('.login-error').textContent = '';
    });
}

/**
 * 로그인 / 회원가입 화면을 갈아 끼웁니다.
 * 상자는 그대로 두고 안쪽만 바꿔서, 모달이 다시 뜨는 느낌이 나지 않게 합니다.
 */
function showView(name) {
    clearAllErrors();
    els.views.forEach((v) => { v.hidden = v.dataset.view !== name; });
    els.title.textContent = name === 'signup' ? '회원가입' : '로그인';
    overlay.dataset.view = name;

    // 바뀐 화면의 첫 칸으로 초점을 옮깁니다 (폰에서는 키보드가 올라오므로 제외)
    if (!window.matchMedia('(max-width: 767px)').matches) {
        const first = overlay.querySelector(`.login-view[data-view="${name}"] input`);
        if (first) first.focus({ preventScroll: true });
    }
}

// ============================================================
//  📄 로그인 ↔ 회원가입 — 종이를 뜯어 넘깁니다
//  test/loginAnime.html 의 계산을 그대로 옮겼습니다.
//    1단계(0~45%)  왼쪽에서 오른쪽으로 대각선으로 말려 벗겨짐
//    2단계(45~100%) 떨어져 나가 오른쪽 위로 날아가며 사라짐
//  뜯기는 장은 clip-path 로 잘라 내고, 잘린 부분을 접힌 선 기준으로
//  대칭 이동시켜 '종이 뒷면'(폴리곤)을 그립니다.
// ============================================================

let isTearing = false;
let tearTimer = null;   // rAF 가 멈춰도 빠져나올 수 있게 하는 안전장치

/** 직선(p1→p2)을 기준으로 점 p 를 대칭 이동시킵니다 */
function reflectPoint(p, p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const a = (dx * dx - dy * dy) / (dx * dx + dy * dy);
    const b = (2 * dx * dy) / (dx * dx + dy * dy);
    return {
        x: a * (p.x - p1.x) + b * (p.y - p1.y) + p1.x,
        y: b * (p.x - p1.x) - a * (p.y - p1.y) + p1.y,
    };
}

function viewEl(name) {
    return overlay.querySelector(`.login-view[data-view="${name}"]`);
}

function tearTo(name) {
    if (isTearing) return;

    const from = viewEl(overlay.dataset.view === 'signup' ? 'signup' : 'login');
    const to = viewEl(name);
    if (!from || !to || from === to) return;

    isTearing = true;
    clearAllErrors();

    // 두 화면이 같은 칸에 겹쳐 있어 높이가 이미 같습니다. 크기를 건드릴 일이 없습니다.
    to.hidden = false;
    els.stage.classList.add('is-tearing');
    from.classList.add('is-leaving');
    to.classList.add('is-entering');

    els.title.textContent = name === 'signup' ? '회원가입' : '로그인';
    overlay.dataset.view = name;

    // ⚠️ 화면(.login-view) 이 아니라 무대(= 본문 전체) 크기로 잽니다.
    //    그래야 안쪽 글자만 오려지는 게 아니라 본문 한 장이 통째로 뜯깁니다.
    const W = els.stage.offsetWidth;
    const H = els.stage.offsetHeight;

    // 움직임을 불편해하는 분께는 짧게. ⚠️ 끄지는 않습니다 —
    // 장을 넘기는 것이 이 전환의 전부라서 꺼 버리면 그냥 바뀌어 버립니다.
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = calm ? 560 : 900;

    // 정리 — 떠난 장은 감추고 무대를 원래대로
    function finish() {
        if (!isTearing) return;
        clearTimeout(tearTimer);
        tearTimer = null;

        from.hidden = true;
        from.style.clipPath = '';
        from.classList.remove('is-leaving');
        to.classList.remove('is-entering');
        els.flapPoly.setAttribute('points', '');
        els.flapPoly.style.transform = 'none';
        els.flapPoly.style.opacity = '1';
        els.stage.classList.remove('is-tearing');
        isTearing = false;
    }

    // ⚠️ 탭을 벗어나면 requestAnimationFrame 이 멈춥니다. 그대로 두면
    //    isTearing 이 true 로 남아 다시는 화면을 못 넘기게 됩니다.
    //    시간이 지나면 알아서 끝낸 것으로 칩니다.
    clearTimeout(tearTimer);
    tearTimer = setTimeout(finish, duration + 400);

    const FOLD = 0.42;                        // 접히는 구간이 끝나는 지점
    const endP1 = { x: W * 0.78, y: 0 };      // 그때의 접힌 선
    const endP2 = { x: W, y: H };
    const start = performance.now();

    function frame(now) {
        const t = Math.min((now - start) / duration, 1);

        if (t < FOLD) {
            // 1단계 — 접히는 선이 왼쪽에서 오른쪽으로 지나갑니다
            const p = t / FOLD;
            const ease = 1 - Math.pow(1 - p, 2);

            const p1 = { x: 15 + ease * (endP1.x - 15), y: 0 };
            const p2 = { x: ease * endP2.x, y: H };

            from.style.clipPath =
                `polygon(${p1.x}px 0px, ${W}px 0px, ${W}px ${H}px, ${p2.x}px ${H}px)`;

            const rTL = reflectPoint({ x: 0, y: 0 }, p1, p2);
            const rBL = reflectPoint({ x: 0, y: H }, p1, p2);

            els.flapPoly.setAttribute('points',
                `${p1.x},${p1.y} ${rTL.x},${rTL.y} ${rBL.x},${rBL.y} ${p2.x},${p2.y}`);
            els.flapPoly.style.transform = 'none';
            els.flapPoly.style.opacity = '1';
        } else {
            // 2단계 — 떨어져 나가 오른쪽 위로 날아갑니다
            const p = (t - FOLD) / (1 - FOLD);
            const easeOut = 1 - Math.pow(1 - p, 3);

            // ⚠️ 남은 조각을 한 번에 지우면 '툭' 사라져 보입니다.
            //    접힌 선을 오른쪽 끝까지 마저 밀어서 자연스럽게 없앱니다.
            const close = Math.min(p / 0.35, 1);
            const x1 = endP1.x + (W - endP1.x) * (1 - Math.pow(1 - close, 2));
            from.style.clipPath =
                `polygon(${x1}px 0px, ${W}px 0px, ${W}px ${H}px, ${W}px ${H}px)`;

            const rTL = reflectPoint({ x: 0, y: 0 }, endP1, endP2);
            const rBL = reflectPoint({ x: 0, y: H }, endP1, endP2);
            const rTR = reflectPoint({ x: W, y: 0 }, endP1, endP2);

            els.flapPoly.setAttribute('points',
                `${rTR.x},${rTR.y} ${rTL.x},${rTL.y} ${rBL.x},${rBL.y} ${endP2.x},${endP2.y}`);

            els.flapPoly.style.transformOrigin = `${endP2.x}px ${endP2.y}px`;
            els.flapPoly.style.transform =
                `translate(${easeOut * 300}px, ${-easeOut * 60}px) rotate(${-easeOut * 18}deg)`;

            // ⚠️ 원본은 2단계 초반에 바로 사라졌는데(1 - p*8), 깜빡 꺼지는 것처럼
            //    보였습니다. 끝까지 날아간 뒤에 옅어지도록 늦췄습니다.
            els.flapPoly.style.opacity = `${Math.max(0, 1 - Math.pow(p, 2.2))}`;
        }

        if (t < 1) {
            requestAnimationFrame(frame);
        } else {
            finish();
        }
    }

    requestAnimationFrame(frame);
}

/** 회원가입 — 성공하면 바로 그 계정으로 로그인됩니다 */
function onSignup(e) {
    e.preventDefault();
    clearAllErrors();

    const get = (n) => els.signupForm.querySelector(`[name="${n}"]`);

    const res = signup({
        name: get('name').value,
        email: get('email').value,
        password: get('password').value,
        password2: get('password2').value,
        agree: get('agree').checked,
    });

    if (!res.ok) {
        const input = get(res.field);
        setError(input, res.message);
        input.focus();
        return;
    }

    closeLoginModal();
}

function onSubmit(e) {
    e.preventDefault();

    clearError(els.email);
    clearError(els.password);

    let ok = true;

    const email = els.email.value.trim();
    if (!email) {
        setError(els.email, '이메일을 입력해 주세요.');
        ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError(els.email, '이메일 형식이 올바르지 않습니다.');
        ok = false;
    }

    if (!els.password.value) {
        setError(els.password, '비밀번호를 입력해 주세요.');
        ok = false;
    }

    if (!ok) {
        // 처음 잘못된 칸으로 초점을 옮겨 줍니다
        overlay.querySelector('.login-field.is-error .login-input').focus();
        return;
    }

    const res = login(email, els.password.value);

    if (!res.ok) {
        const input = res.field === 'email' ? els.email : els.password;
        setError(input, res.message);
        input.focus();
        return;
    }

    closeLoginModal();
}

export function openLoginModal(opener = null) {
    buildModal();
    lastFocused = opener || document.activeElement;

    showView('login');
    els.signupForm.reset();

    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // ⚠️ 입력칸에 바로 초점을 주면 폰에서 키보드가 튀어 올라와 모달이
    //    반쯤 가려집니다. 상자에만 초점을 둡니다.
    els.box.setAttribute('tabindex', '-1');
    els.box.focus({ preventScroll: true });
}

export function closeLoginModal() {
    if (!overlay) return;

    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    clearAllErrors();

    if (lastFocused && document.contains(lastFocused)) {
        lastFocused.focus({ preventScroll: true });
    }
    lastFocused = null;
}

/**
 * 네비게이션의 Login 버튼들을 모달에 연결합니다.
 * 버튼이 없는 페이지에서는 조용히 넘어갑니다.
 */
export function initLoginModal() {
    const buttons = [
        ...document.querySelectorAll('.pc-btn'),
    ].filter((el) => el.textContent.trim().toLowerCase() === 'login');

    const mobileLink = document.querySelector('.login-link');
    if (mobileLink) buttons.push(mobileLink);

    if (!buttons.length) return;

    buttons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            // ⚠️ 이미 로그인했으면 같은 버튼이 '로그아웃'이 됩니다.
            //    그 처리는 js/modules/authNav.js 가 맡으므로 여기서는 비켜 줍니다.
            //    (같은 요소에 붙은 리스너는 capture 든 bubble 이든 '붙인 순서'
            //     대로 불립니다. initLoginModal 이 먼저라 authNav 쪽에서
            //     stopImmediatePropagation 을 걸어도 이 모달을 막지 못합니다)
            if (isLoggedIn()) return;

            openLoginModal(btn);
        });
    });
}
