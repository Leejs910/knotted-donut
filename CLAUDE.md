# CLAUDE.md

이 파일은 Claude Code가 이 저장소에서 작업할 때 따라야 할 가이드를 제공합니다.

## 프로젝트 개요

"NotedDount"라는 도넛 가게 컨셉의 인터랙티브 포트폴리오 웹사이트입니다. `index.html`(메인 랜딩), `onlineShop.html`(온라인 스토어) 두 개의 정적 페이지로 구성되며, 빌드 도구나 프레임워크 없이 순수 HTML/CSS/JavaScript(ES 모듈)로 작성되어 있습니다 (`package.json` 없음, 별도 설치/빌드 과정 없음).

## 기술 스택

- HTML / CSS / JavaScript(ES Modules)만 사용. 번들러·프레임워크 없음.
- 외부 라이브러리는 모두 CDN `<script>`/`<link>` 태그로 로드:
  - GSAP + ScrollTrigger + CustomEase — 스크롤 기반 애니메이션
  - Lenis — 스무스 스크롤
  - Swiper — 캐러셀(인스타 섹션 등)

## CSS 구조 및 로드 순서

`css/` 폴더는 역할별로 나뉘어 있고, 각 페이지 `<head>`에서 반드시 이 순서로 로드합니다.

1. `css/base/` (`reset.css`, `animations.css`) — 모든 페이지 공통, 항상 최상단.
2. `css/layout/nav.css` — 공통 네비게이션.
3. `css/components/*` — 그 페이지가 실제로 쓰는 컴포넌트만 선택적으로 로드 (예: `donut-card.css`, `product-card.css`).
4. `css/sections/*` — 그 페이지에 실제로 존재하는 섹션만 선택적으로 로드.
5. `css/layout/footer.css` — 항상 마지막. 다른 규칙을 덮어써야 하므로 이 순서가 중요합니다.

새 컴포넌트/섹션 스타일을 추가할 때도 이 분류를 따르고, 해당 페이지에서 실제로 쓰는 CSS만 링크합니다.

## JS 구조

- `js/data/` — 정적 콘텐츠 데이터 (예: `donutData.js`의 메뉴/카드 데이터). 로직 없이 값만 export.
- `js/modules/` — 기능 단위 모듈. 각 모듈은 `initXxx()` 형태의 함수 하나를 export하고, 필요한 DOM 요소가 없으면 조용히 종료합니다 (`if (!el) return;`). 파일 상단에 이 모듈이 하는 일과 필요 요소를 한두 줄 주석으로 남깁니다.
- `js/pages/` — 페이지별 엔트리 포인트 (예: `index.js`). 그 페이지에 필요한 모듈만 import해서 호출합니다. 새 페이지를 만들 때는 기존 엔트리 파일을 복사한 뒤, 필요 없는 import/호출 줄을 지우는 방식으로 작업합니다.
- 페이지 HTML은 외부 CDN 스크립트를 `defer`로 먼저 로드하고, 마지막에 `<script type="module" src="./js/pages/{page}.js"></script>`로 엔트리 모듈을 로드합니다.

## 페이지

- `index.html` — 메인 랜딩 페이지.
- `onlineShop.html` — 온라인 스토어 페이지.
- `test/` — 실험용 스크래치 HTML 모음 (`rubixcube.html`, `truckAnime.html` 등). 실제 사이트 어디에서도 링크되지 않는 임시 작업 공간입니다.

## 컨벤션

- 새 기능은 `js/modules/`에 독립된 `initXxx()` 모듈로 만들고, 필요한 페이지의 엔트리 파일에서만 import합니다.
- CSS/JS 모두 "공통 → 컴포넌트/모듈 → 섹션/페이지" 분리 원칙을 유지해, 한 페이지에 필요 없는 스타일·스크립트가 함께 로드되지 않게 합니다.
- 외부 라이브러리는 CDN으로만 추가하고, npm 등 별도 패키지 매니저를 새로 도입하지 않습니다.
