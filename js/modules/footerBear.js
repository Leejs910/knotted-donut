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

    function resizeCanvas() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        scaleRatio = canvas.width / BASE_WIDTH;

        if (canvas.width >= 1280) {
            // 넓은 화면에서는 비율을 100%로 고정
            scaleRatio = 1;
        } else if (canvas.width >= 768) {
            // 태블릿 구간: 곰돌이가 너무 작아지지 않게 방어
            scaleRatio = 0.95;
        } else {
            // 모바일 구간: 기준점을 768로 잡아 갑자기 확 작아지지 않게 함
            scaleRatio = canvas.width / 768;
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        char.frameTimer++;
        if (char.frameTimer >= char.frameDelay) {
            char.seqIndex = (char.seqIndex + 1) % walkSequence.length;
            char.frameTimer = 0;
        }

        // 곰돌이의 고정 위치 (항상 화면 정중앙, 바닥 기준)
        const fixedX = canvas.width / 2;
        const isMobile = window.innerWidth <= 768;
        const yOffset = isMobile ? 400 : 250;
        const fixedY = canvas.height - (yOffset * scaleRatio);

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
