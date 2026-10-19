// 🔑 가짜 로그인 상태 보관소 (포트폴리오 전시용)
//
// 서버가 없으므로 "누가 로그인했는지"만 localStorage 에 적어 두고,
// 페이지를 옮겨 다녀도 그 상태가 이어지게 합니다.
//
// ⚠️ 진짜 인증이 아닙니다.
//    · 비밀번호를 브라우저에서 비교합니다 (누구나 코드를 열어 볼 수 있습니다)
//    · localStorage 값을 고치면 아무나 로그인한 척할 수 있습니다
//    실제 서비스라면 이 비교는 서버에서 하고, 브라우저에는 서버가 발급한
//    토큰만 들고 있어야 합니다. 이 파일은 화면 흐름을 보여 주기 위한 것입니다.
//
// 쓰는 곳: js/modules/loginModal.js, js/modules/authNav.js

import { demoUsers } from '../data/demoUsers.js';

const STORAGE_KEY = 'noteddount:user';    // 지금 로그인한 사람
const USERS_KEY = 'noteddount:users';     // 가입한 사람들

// 비밀번호 최소 길이 — 가입 때만 봅니다
const MIN_PASSWORD = 8;

// 상태가 바뀔 때 알려 줄 곳들 (네비게이션 등)
const listeners = new Set();

// ⚠️ 시크릿 창이나 저장소를 막아 둔 환경에서는 읽기·쓰기가 예외를 던집니다.
//    그래도 화면은 정상으로 보여야 하므로 전부 try 로 감쌉니다.
function readStore() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function writeStore(user) {
    try {
        if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        else localStorage.removeItem(STORAGE_KEY);
    } catch {
        /* 저장을 못 해도 이번 페이지 안에서는 로그인 상태가 유지됩니다 */
    }
}

// ── 가입한 사람 명부 ─────────────────────────────────────────
// ⚠️ 비밀번호를 그대로 저장합니다. 진짜 서비스에서는 절대 이러면 안 되고,
//    서버에서 해시해서 보관해야 합니다. 여기 값은 이 브라우저 밖으로
//    나가지 않는 전시용입니다.
function readUsers() {
    try {
        const raw = localStorage.getItem(USERS_KEY);
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
}

function writeUsers(list) {
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(list));
    } catch {
        /* 저장을 못 해도 이번 페이지 안에서는 가입한 것으로 칩니다 */
    }
}

// 미리 넣어 둔 데모 계정 + 이 브라우저에서 가입한 계정
let registered = readUsers();

function allUsers() {
    return [...demoUsers, ...registered];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let current = readStore();

function notify() {
    listeners.forEach((fn) => fn(current));
}

/** 지금 로그인한 사람 (없으면 null) */
export function getUser() {
    return current;
}

export function isLoggedIn() {
    return current !== null;
}

/**
 * 이메일·비밀번호로 로그인합니다.
 * @returns {{ok: true, user: object} | {ok: false, field: 'email'|'password', message: string}}
 */
export function login(email, password) {
    const found = allUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

    // 어느 쪽이 틀렸는지 알려 주는 편이 데모에서는 친절합니다.
    // (실제 서비스라면 계정이 있는지 노출하지 않도록 한 문장으로 합칩니다)
    if (!found) {
        return { ok: false, field: 'email', message: '등록되지 않은 이메일입니다.' };
    }
    if (found.password !== password) {
        return { ok: false, field: 'password', message: '비밀번호가 맞지 않습니다.' };
    }

    current = { email: found.email, name: found.name, via: 'email' };
    writeStore(current);
    notify();
    return { ok: true, user: current };
}

/**
 * 회원가입. 성공하면 바로 그 계정으로 로그인됩니다.
 * @returns {{ok: true, user: object} | {ok: false, field: string, message: string}}
 */
export function signup({ email = '', password = '', password2 = '', name = '', agree = false } = {}) {
    const mail = email.trim();
    const nick = name.trim();

    if (!nick) {
        return { ok: false, field: 'name', message: '이름을 입력해 주세요.' };
    }
    if (!mail) {
        return { ok: false, field: 'email', message: '이메일을 입력해 주세요.' };
    }
    if (!EMAIL_RE.test(mail)) {
        return { ok: false, field: 'email', message: '이메일 형식이 올바르지 않습니다.' };
    }
    if (allUsers().some((u) => u.email.toLowerCase() === mail.toLowerCase())) {
        return { ok: false, field: 'email', message: '이미 가입된 이메일입니다.' };
    }
    if (password.length < MIN_PASSWORD) {
        return { ok: false, field: 'password', message: `비밀번호는 ${MIN_PASSWORD}자 이상이어야 합니다.` };
    }
    if (password !== password2) {
        return { ok: false, field: 'password2', message: '비밀번호가 서로 다릅니다.' };
    }
    if (!agree) {
        return { ok: false, field: 'agree', message: '약관에 동의해 주세요.' };
    }

    registered = [...registered, { email: mail, password, name: nick }];
    writeUsers(registered);

    current = { email: mail, name: nick, via: 'signup' };
    writeStore(current);
    notify();
    return { ok: true, user: current };
}

/** 이 브라우저에서 가입한 사람 수 (데모 계정은 뺍니다) */
export function registeredCount() {
    return registered.length;
}

export function logout() {
    current = null;
    writeStore(null);
    notify();
}

/**
 * 로그인 상태가 바뀔 때마다 불립니다. 붙이는 즉시 현재 상태로 한 번 불러 줍니다.
 * @returns 떼어낼 때 부르는 함수
 */
export function onAuthChange(fn) {
    listeners.add(fn);
    fn(current);
    return () => listeners.delete(fn);
}
