# CLAUDE.md

이 파일은 Claude Code가 이 저장소에서 작업할 때 따라야 할 가이드를 제공합니다.

## 프로젝트 개요

"KnottedDonut"라는 도넛 가게 컨셉의 인터랙티브 포트폴리오 웹사이트입니다.
빌드 도구나 프레임워크 없이 순수 HTML/CSS/JavaScript(ES 모듈)로 작성되어 있습니다
(`package.json` 없음, 별도 설치/빌드 과정 없음).

정적 페이지 9개로 이루어져 있습니다.

| 페이지 | 하는 일 |
|---|---|
| `index.html` | 메인 랜딩 (히어로 영상 · 신메뉴/베스트셀러 · 온라인샵 미리보기 · 인스타) |
| `menu.html` | 전체 메뉴 (도넛 · 케이크 · 음료) |
| `onlineShop.html` | 온라인 스토어 (상품 그리드 + 상세 모달) |
| `brand.html` | 브랜드 소개 |
| `support.html` | 고객센터 (FAQ) |
| `cart.html` | 장바구니 |
| `checkout.html` | 주문 / 결제 |
| `orderComplete.html` | 결제 완료 (영수증) |
| `mypage.html` | 마이페이지 (주문조회 · 포인트 · 정보수정 · 탈퇴) |

`test/` 는 실험용 스크래치 HTML 모음입니다. 실제 사이트 어디에서도 링크되지
않는 임시 작업 공간이라, 여기 규칙을 따르지 않아도 됩니다.

## 기술 스택

- HTML / CSS / JavaScript(ES Modules)만 사용. 번들러·프레임워크 없음.
- 외부 라이브러리와 서체는 **모두 CDN** `<script>`/`<link>` 태그로 로드합니다.
  npm 등 패키지 매니저를 새로 들이지 않습니다.

  | | 쓰는 곳 |
  |---|---|
  | GSAP + ScrollTrigger + CustomEase | 스크롤 기반 연출 |
  | Lenis | 스무스 스크롤 |
  | Swiper | 캐러셀 (도넛 카드, 인스타) |
  | Pretendard (dynamic-subset) | 한글 본문 서체 |

- ⚠️ **서체 링크를 지우지 마세요.** `css/base/reset.css` 의 `body` 가
  `'Pretendard Variable'` 를 쓰는데, 그 이름은 CDN 이 들고 옵니다. 링크가 빠지면
  모든 한글이 보는 사람 기기의 기본 고딕으로 나옵니다.
- ⚠️ `<head>` 맨 위의 `<link rel="preconnect" href="https://cdn.jsdelivr.net">`
  도 지우지 마세요. 스와이퍼 CSS 와 서체가 같은 도메인이라, 미리 연결해 두지
  않으면 모바일에서 첫 화면이 눈에 띄게 늦어집니다.

## CSS 구조 및 로드 순서

`css/` 는 역할별로 나뉘어 있고, 각 페이지 `<head>` 에서 반드시 이 순서로 로드합니다.

1. `css/base/` — 모든 페이지 공통, 항상 최상단
   (`reset.css` · `animations.css` · `scrollbar.css`)
2. `css/layout/nav.css` — 공통 네비게이션
3. `css/components/*` — 그 페이지가 **실제로 쓰는 것만** 선택적으로
4. `css/sections/*` — 그 페이지에 **실제로 있는 섹션만** 선택적으로
5. `css/layout/footer.css` — **항상 마지막**. 다른 규칙을 덮어써야 하므로 이 순서가 중요합니다.

새 스타일을 추가할 때도 이 분류를 따르고, 그 페이지에서 쓰지 않는 CSS 는 링크하지 않습니다.

### 자주 밟는 함정

- **`button` 은 `body` 의 서체를 물려받지 않습니다.** 버튼에 글자가 들어가면
  `font-family: inherit` 를 적어 주세요. 빼면 거기만 브라우저 기본 서체로 나옵니다.
- **스크롤바 모양은 `css/base/scrollbar.css` 한 곳에서 정합니다.** 색만 바꾸고
  싶으면 그 요소에 `--sb-thumb` / `--sb-thumb-hover` / `--sb-track` 변수를 다시
  적으세요. 모양을 따로 손대면 사이트 안에서 스크롤바가 제각각이 됩니다.
- **둥근 모서리 + `overflow: auto` 상자에서는 스크롤바가 모서리 밖으로 비어져
  나옵니다.** 스크롤바는 `border-radius` 를 따라 깎이지 않습니다.
  `::-webkit-scrollbar-track { margin: <굴림값>px 0 }` 로 위아래를 비워 주세요
  (예: `css/components/shop-item-modal.css`).
- **`overflow-y: auto` 는 `overflow-x` 까지 `auto` 로 만듭니다.** 한 축만
  `visible` 로 둘 수 없다는 CSS 규칙 때문입니다. 바깥으로 삐져나오는 자식이
  있으면 가로 스크롤바가 생기므로, 세로로만 굴릴 상자에는 `overflow-x: hidden`
  을 같이 적습니다.

## JS 구조

- **`js/data/`** — 정적 콘텐츠 데이터. 로직 없이 값만 export 합니다.
  (`donutData.js` 메뉴·상품·인스타, `brandData.js`, `faqData.js`,
  `menuDecoData.js`, `demoUsers.js`)
- **`js/modules/`** — 기능 단위 모듈. 각 모듈은 `initXxx()` 형태의 함수 하나를
  export 하고, 필요한 DOM 요소가 없으면 **조용히 끝냅니다** (`if (!el) return;`).
  파일 맨 위에 이 모듈이 하는 일과 필요한 요소·CSS 를 주석으로 남깁니다.
- **`js/pages/`** — 페이지별 엔트리. 그 페이지에 필요한 모듈만 import 해서
  호출합니다. 새 페이지는 기존 엔트리를 복사한 뒤 필요 없는 줄을 지우는 방식으로
  만듭니다.
- 페이지 HTML 은 CDN 스크립트를 `defer` 로 먼저 로드하고, 마지막에
  `<script type="module" src="./js/pages/{page}.js"></script>` 로 엔트리를 부릅니다.

### 상태는 localStorage 에 둡니다

서버가 없어서 회원·장바구니·주문을 브라우저에 적어 둡니다. 계정마다 칸이 나뉩니다.

```
noteddount:user              지금 로그인한 사람
noteddount:users             가입한 사람들
noteddount:cart:<이메일>      장바구니
noteddount:checkout:<이메일>  주문하기로 넘긴 목록
noteddount:ship:<이메일>      배송지
noteddount:orders:<이메일>    지난 주문 (최근 20건만 보관)
noteddount:points:<이메일>    포인트 잔액
```

⚠️ **진짜가 아닙니다.** 저장소 값을 고치면 포인트도 주문 내역도 마음대로 만들 수
있습니다. 전시용이라 이대로 두되, 실제 서비스처럼 설명하지 마세요.

칸마다 주인이 정해져 있습니다. 다른 모듈에서 `localStorage` 를 직접 건드리지 말고,
주인 모듈이 내주는 함수를 쓰세요.

| 주인 | 맡은 칸 |
|---|---|
| `js/modules/auth.js` | `user` · `users` |
| `js/modules/cartStore.js` | `cart:` · `checkout:` |
| `js/modules/memberStore.js` | `orders:` · `points:` |
| `js/modules/checkoutPrefill.js` | `ship:` |

장바구니가 바뀌면 `cartStore.js` 의 `onCartChange()` 로 알림을 받을 수 있습니다
(네비게이션의 개수 동그라미가 이걸 씁니다). 로그인 상태는 `auth.js` 의
`onAuthChange()` 입니다.

## 컨벤션

- 새 기능은 `js/modules/` 에 독립된 `initXxx()` 모듈로 만들고, 필요한 페이지의
  엔트리에서만 import 합니다.
- CSS·JS 모두 "공통 → 컴포넌트/모듈 → 섹션/페이지" 분리 원칙을 지켜, 한 페이지에
  필요 없는 스타일·스크립트가 함께 로드되지 않게 합니다.
- 외부 라이브러리는 CDN 으로만 추가합니다.
- **주석은 한국어로**, "무엇을" 보다 "왜" 를 적습니다. 특히 지우면 깨지는 줄에는
  `⚠️` 를, 값을 바꿔 조절하는 자리에는 `🎚️` 를 붙여 두는 것이 이 저장소의 관례입니다.
- **같은 마크업이 9개 페이지에 흩어져 있습니다** (네비게이션 · 모바일 메뉴 · 푸터).
  한 곳만 고치면 반드시 어긋납니다 — 전부 같이 고치거나, 아예 JS 가 처리하게
  하세요. 실제로 네비게이션 링크를 손으로 적다가 마이페이지에서 고객센터로 가는
  길이 막힌 적이 있습니다 (지금은 `js/modules/navCurrent.js` 가 주소를 비교해
  판단합니다).

## 확인

`.claude/launch.json` 에 `portfolio` 라는 미리보기 서버가 등록돼 있습니다.
화면에 보이는 것을 고쳤다면 눈으로만 보지 말고 값을 재서 확인하세요 — 이 저장소의
버그는 대개 "보기엔 멀쩡한데 수치가 어긋난" 종류였습니다
(색 대비, 스크롤바 넘침, 애니메이션 진행률, 이미지 실제 크기 등).
