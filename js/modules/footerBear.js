// 푸터 곰돌이 — 스프라이트 시트 걷기 애니메이션 (Canvas)
// 필요 요소: #footer-canvas

const BASE_WIDTH = 1440;
const TOTAL_FRAMES = 5;
const walkSequence = [0, 1, 2, 3, 4, 3, 2, 1]; // 핑퐁 재생 순서

export function initFooterBear({ spriteUrl = './img/spriteBear.png' } = {}) {
    const canvas = document.getElementById('footer-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let scaleRatio = 1;

    // 보이는 크기(CSS 픽셀). 위치·크기 계산은 전부 이 값을 씁니다.
    // ⚠️ canvas.width/height 는 아래에서 DPR 이 곱해진 '칸 수'가 되므로
    //    레이아웃 계산에 쓰면 안 됩니다. (특히 1280 / 768 구간 비교가 어긋납니다)
    let viewW = 0;
    let viewH = 0;

    function resizeCanvas() {
        viewW = canvas.parentElement.clientWidth;
        viewH = canvas.parentElement.clientHeight;

        // 🔍 고해상도(레티나) 대응 — 담는 칸 수만 DPR 배로 늘리고,
        //    보이는 넓이는 그대로 둔 뒤 좌표계를 되돌립니다.
        //    ⚠️ scale 이 아니라 setTransform 이어야 합니다. resize 때마다 불리는데
        //       scale 을 쓰면 배율이 곱해져 쌓입니다.
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(viewW * dpr);
        canvas.height = Math.round(viewH * dpr);
        canvas.style.width = `${viewW}px`;
        canvas.style.height = `${viewH}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        scaleRatio = viewW / BASE_WIDTH;

        if (viewW >= 1280) {
            // 넓은 화면에서는 비율을 100%로 고정
            scaleRatio = 1;
        } else if (viewW >= 768) {
            // 태블릿 구간: 곰돌이가 너무 작아지지 않게 방어
            scaleRatio = 0.95;
        } else {
            // 모바일 구간: 기준점을 768로 잡아 갑자기 확 작아지지 않게 함
            scaleRatio = viewW / 768;
        }

        // 최소 크기 방어막
        if (scaleRatio < 0.5) scaleRatio = 0.5;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const spriteSheet = new Image();
    spriteSheet.src = spriteUrl;

    // 캐릭터 상태 (위치는 고정, 걷는 모션만 재생)
    const char = {
        width: 330,
        height: 396,
        seqIndex: 0,
        frameTimer: 0,
        frameDelay: 10 // 걸음 속도 (작을수록 발을 빨리 구름)
    };

    function gameLoop() {
        ctx.clearRect(0, 0, viewW, viewH);

        char.frameTimer++;
        if (char.frameTimer >= char.frameDelay) {
            char.seqIndex = (char.seqIndex + 1) % walkSequence.length;
            char.frameTimer = 0;
        }

        // 곰돌이의 고정 위치 (항상 화면 정중앙, 바닥 기준)
        const fixedX = viewW / 2;
        const isMobile = window.innerWidth <= 768;
        const yOffset = isMobile ? 400 : 250;
        const fixedY = viewH - (yOffset * scaleRatio);

        ctx.save();
        ctx.translate(fixedX, fixedY);

        if (spriteSheet.complete) {
            const frameWidth = spriteSheet.width / TOTAL_FRAMES;
            const frameHeight = spriteSheet.height;
            const currentFrame = walkSequence[char.seqIndex];
            const sourceX = currentFrame * frameWidth;

            // 모바일이면 크기를 1.5배로 계산
            const currentWidth = isMobile ? 495 : char.width;
            const currentHeight = isMobile ? 594 : char.height;

            const scaledWidth = currentWidth * scaleRatio;
            const scaledHeight = currentHeight * scaleRatio;

            ctx.drawImage(
                spriteSheet,
                sourceX, 0,
                frameWidth, frameHeight,
                -scaledWidth / 2, -scaledHeight / 2,
                scaledWidth, scaledHeight
            );
        }

        ctx.restore();
        requestAnimationFrame(gameLoop);
    }

    spriteSheet.onload = () => requestAnimationFrame(gameLoop);
}
