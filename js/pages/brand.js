// ============================================================
//  brand.html 전용 엔트리
//  이 페이지에서 쓸 기능만 골라서 조립합니다.
// ============================================================

import { brandPanels } from '../data/brandData.js';

// --- 모든 페이지 공통 ---
import { initPageFade } from '../modules/pageFade.js';
import { initSmoothScroll } from '../modules/smoothScroll.js';
import { initNavScroll } from '../modules/navScroll.js';
import { initMobileMenu } from '../modules/mobileMenu.js';
import { initLoginModal } from '../modules/loginModal.js';
import { initAuthNav } from '../modules/authNav.js';
import { initCartBadge } from '../modules/cartBadge.js';
import { initAuthGuard } from '../modules/authGuard.js';
import { initFooterBear } from '../modules/footerBear.js';

// --- 이 페이지에만 있는 섹션 ---
import { initBrandHero } from '../modules/brandHero.js';
import { initBrandHeroScroll } from '../modules/brandHeroScroll.js';
import { initBrandDolls } from '../modules/brandDolls.js';
import { initBrandStory } from '../modules/brandStory.js';
import { initBrandCity } from '../modules/brandCity.js';

// 공통
initPageFade();
initSmoothScroll();
initNavScroll();
initMobileMenu();
initLoginModal();
initAuthNav();
initCartBadge();
initAuthGuard();

// 맨 위 로고가 조립되듯 나타납니다
initBrandHero();

// 접시·도넛이 통통 튀어오르고, 뒤에서 친구들이 고개를 내밉니다
initBrandDolls();

// 스크롤을 내리면 반짝이가 하나씩 떨어집니다 (index 의 장식과 같은 연출)
initBrandHeroScroll();

// 액자 다섯 개 + 스크롤에 맞춰 떠오르는 효과
initBrandStory({ panels: brandPanels });

// 맨 아래 도시 — 구름이 한 번 왼쪽으로 흘러가 사라집니다
initBrandCity();

// 푸터
initFooterBear();
