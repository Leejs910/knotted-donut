// 🍩 도넛 상세 3D 카드 모달
//
// 이 모듈은 HTML까지 스스로 만들어 넣습니다.
// 그래서 index.html에는 아무것도 추가할 필요가 없고,
// 다른 페이지에서도 import 한 줄이면 그대로 재사용됩니다.
//
// 필요 CSS: css/components/donut-modal.css
//
// 사용법:
//   import { openDonutModal } from './donutModal.js';
//   openDonutModal(도넛데이터, { themeColor: '#A6C8FF', bgImg: './img/cardBlue.png' });

const MODAL_HTML = `
<!-- data-lenis-prevent 를 빼면 폰·태블릿에서 손가락으로 밀어도 안 움직입니다.
     이유는 js/modules/shopItemModal.js 의 같은 자리에 적어 두었습니다. -->
<div id="donut-modal" class="modal-overlay" data-lenis-prevent role="dialog" aria-modal="true" aria-hidden="true" tabindex="-1">
    <div class="modal-container">

        <!-- 1. SVG 원형 배경 및 둥근 텍스트 -->
        <svg class="modal-circle-bg" viewBox="0 0 800 800" aria-hidden="true">
            <!-- 배경 원과 하얀 링은 고정 (회전 안 함) -->
            <circle cx="400" cy="400" r="380" class="circle-fill" />
            <circle cx="400" cy="400" r="280" fill="transparent" stroke="#FFFFFF" stroke-width="110" />

            <!-- ✨ 이 안의 요소들만 통째로 반시계 방향으로 회전합니다 -->
            <g class="rotating-text">
                <path id="modal-top-curve" d="M 120 400 A 280 280 0 0 1 680 400" fill="transparent" />
                <path id="modal-bottom-curve" d="M 110 400 A 290 290 0 0 0 690 400" fill="transparent" />

                <text class="modal-text-eng" dy="20">
                    <textPath href="#modal-top-curve" startOffset="50%" text-anchor="middle"></textPath>
                </text>
                <text class="modal-text-kor">
                    <textPath href="#modal-bottom-curve" startOffset="50%" text-anchor="middle"></textPath>
                </text>
            </g>
        </svg>

        <!-- 2. 3D 카드 씬 -->
        <div class="modal-card-scene">
            <!-- 📱 폰에서만 보이는 메뉴 이름.
                 좁은 화면에서는 뒤쪽 원형 배경을 숨기는데, 그 원에 적혀 있던
                 이름까지 함께 사라지므로 카드 위에 따로 띄워 줍니다. -->
            <div class="modal-card-title" id="modal-card-title"></div>
            <div class="modal-card-flipper">
                <!-- 카드 뒷면 (배경색과 동일) -->
                <div class="modal-card-face modal-card-back">
                    <div class="back-logo">Knotted</div>
                </div>
                <!-- 카드 앞면 (상세 정보) -->
                <div class="modal-card-face modal-card-front">
                    <img id="modal-donut-img" src="" alt="">
                    <div class="modal-desc-box">
                        <!-- 1. 메인 설명 (중앙 정렬) -->
                        <p id="modal-desc" class="desc-main"></p>

                        <!-- 2. 하단 정보 그룹 (좌측 정렬) -->
                        <div class="desc-info-group">
                            <div class="info-item" id="modal-allergy-item">
                                <span class="info-label">알레르기 유발 요인</span>
                                <span id="modal-allergy" class="info-value"></span>
                            </div>
                            <div class="info-item" id="modal-origin-item">
                                <span class="info-label">원산지 정보</span>
                                <span id="modal-origin" class="info-value"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 닫기 버튼 -->
        <button id="modal-close-btn" class="modal-close" aria-label="닫기">&times;</button>
    </div>
</div>
`;

let overlay = null;   // 모달 최상위 요소
let els = null;       // 자주 쓰는 자식 요소 모음
let onCloseHook = null; // 닫힐 때 실행할 콜백 (스와이퍼 재생 등)

// 모달 HTML을 페이지에 한 번만 심고, 닫기 이벤트를 연결합니다.
function ensureModal() {
    if (overlay) return overlay;

    const holder = document.createElement('div');
    holder.innerHTML = MODAL_HTML.trim();
    overlay = holder.firstElementChild;
    document.body.appendChild(overlay);

    els = {
        eng: overlay.querySelector('.modal-text-eng textPath'),
        kor: overlay.querySelector('.modal-text-kor textPath'),
        img: overlay.querySelector('#modal-donut-img'),
        desc: overlay.querySelector('#modal-desc'),
        allergy: overlay.querySelector('#modal-allergy'),
        allergyItem: overlay.querySelector('#modal-allergy-item'),
        origin: overlay.querySelector('#modal-origin'),
        originItem: overlay.querySelector('#modal-origin-item'),
        closeBtn: overlay.querySelector('#modal-close-btn'),
        cardTitle: overlay.querySelector('#modal-card-title'),
    };

    // 어두운 배경을 눌렀을 때만 닫힘 (카드 위를 눌렀을 때는 안 닫힘)
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.classList.contains('modal-container')) {
            closeDonutModal();
        }
    });
    els.closeBtn.addEventListener('click', closeDonutModal);

    // ESC 키로도 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeDonutModal();
        }
    });

    return overlay;
}

// 값이 비어있으면 라벨까지 통째로 숨깁니다.
// (데이터에 desc/allergy/origin이 빈 항목이 있어서 빈 제목만 덩그러니 남는 걸 방지)
function fill(valueEl, wrapEl, text) {
    const value = (text || '').trim();
    valueEl.textContent = value;
    wrapEl.hidden = !value;
}

/**
 * 모달을 엽니다.
 * @param {object} data  - { title, engTitle, imgUrl, desc, allergy, origin }
 * @param {object} theme - { themeColor, bgImg }  클릭한 카드의 테마
 * @param {object} opts  - { onClose } 닫힐 때 실행할 함수
 */
export function openDonutModal(data, theme = {}, opts = {}) {
    if (!data) return;
    ensureModal();

    onCloseHook = opts.onClose || null;

    // 1. 클릭한 카드의 색상과 이미지를 CSS 변수로 넘겨 모달 전체를 물들입니다.
    if (theme.themeColor) overlay.style.setProperty('--modal-color', theme.themeColor);
    if (theme.bgImg) {
        // ⚠️ CSS 변수 안의 url()은 '문서'가 아니라 '그 변수를 쓰는 CSS 파일' 기준으로 경로를 찾습니다.
        //    './img/...'를 그대로 넣으면 css/components/img/... 를 찾다가 404가 납니다.
        //    그래서 여기서 미리 절대 경로로 바꿔서 넘깁니다.
        const absUrl = new URL(theme.bgImg, document.baseURI).href;
        overlay.style.setProperty('--modal-card-img', `url('${absUrl}')`);
    }

    // 2. 데이터 뿌려주기
    els.eng.textContent = data.engTitle || '';
    els.kor.textContent = data.title || '';
    els.cardTitle.textContent = data.title || ''; // 폰에서 카드 위에 뜨는 이름

    els.img.src = data.imgUrl || '';
    els.img.alt = data.title || '';

    els.desc.textContent = data.desc || '';
    els.desc.hidden = !(data.desc || '').trim();

    fill(els.allergy, els.allergyItem, data.allergy);
    fill(els.origin, els.originItem, data.origin);

    // 3. 뒤쪽 페이지가 같이 스크롤되지 않도록 잠금
    document.body.style.overflow = 'hidden';
    window.lenis?.stop(); // Lenis 스무스 스크롤도 함께 정지

    // 브라우저가 애니메이션 시작점을 인식할 수 있도록 한 프레임 뒤에 켭니다.
    requestAnimationFrame(() => {
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');

        // ⚠️ 닫기 버튼에 포커스를 주면 크롬이 기본 포커스 링(검은 사각 테두리)을
        //    그려서 X 둘레에 상자가 생깁니다. 대화상자 자체에 포커스를 옮기면
        //    키보드 Tab / ESC 는 그대로 쓰면서 링만 사라집니다.
        overlay.focus({ preventScroll: true });
    });
}

export function closeDonutModal() {
    if (!overlay) return;

    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');

    document.body.style.overflow = '';
    window.lenis?.start();

    if (onCloseHook) {
        onCloseHook();
        onCloseHook = null;
    }
}
