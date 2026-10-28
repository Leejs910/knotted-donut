// 퍼즐(루빅스 큐브) 타일 배너 — 행/열이 한 칸씩 번갈아 밀리는 캔버스 애니메이션
// 필요 요소: #puzzle-canvas (크기를 가진 부모 안에 있어야 합니다)
// 필요 라이브러리: 없음
//
// 캔버스 크기는 부모 요소를 그대로 따라갑니다.
// 세로는 항상 VISIBLE_ROWS 줄로 딱 나누어 떨어지게 잘라서,
// 배너 높이가 바뀌어도 아래쪽 타일이 어중간하게 잘리지 않습니다.

// 🎚️ 타일에 올릴 그림 — img/puzzle/1.webp ~ {IMAGE_COUNT}.webp
//    파일을 더 넣거나 빼면 이 숫자만 맞춰 주면 됩니다.
//    (512px WebP. 실제로 그려지는 크기는 배너 높이의 절반이라 184px 정도이고,
//     고해상도 화면까지 감안해 512px 로 두었습니다)
//
//    🍩 1~15 는 도넛 그림, 16~23 은 완전히 투명한 빈 타일(각 52바이트)입니다.
//    칸마다 23장 중 하나를 고르므로 8/23 ≈ 35% 가 크림색 타일만 남습니다.
//    👉 더 비우려면 빈 파일을 늘리고, 더 채우려면 줄인 뒤
//       이 숫자를 폴더의 파일 개수에 맞춰 주세요. (비는 비율 = 빈 파일 / 전체)
const IMAGE_COUNT = 23;
const IMAGE_EXT = 'webp';
const BG_COLOR = '#F3CFC7';  // 타일 사이로 비치는 배경(선) 색
const TILE_COLOR = '#F0F1E3';// 둥근 타일 바탕색
const GAP = 3;               // 타일 사이 간격(px)
const RADIUS = 16;           // 타일 모서리 둥근 정도(px)

// 🎚️ 타일 대비 그림 크기. 1 이면 타일을 꽉 채우고, 0.96 이면 4% 작아집니다.
//    타일 바탕(크림색 둥근 사각형)은 그대로 두고 그림만 가운데에서 줄어듭니다.
const IMAGE_SCALE = 0.96;

// 🎚️ 도넛 그림의 진하기. 1 이면 그대로, 0.5 면 절반만 보입니다.
//    타일 바탕은 이 값의 영향을 받지 않습니다 — 그림을 올릴 때만 적용하고
//    바로 되돌리므로, 크림색 타일은 늘 또렷합니다.
const IMAGE_OPACITY = 0.5;
const VISIBLE_ROWS = 2;      // 화면에 꽉 차게 보여줄 줄 수 (타일 크기 = 배너높이 / 이 값)
const ANIM_FRAMES = 25;      // 한 칸 미는 데 쓰는 프레임 수 (클수록 느림)

export function initPuzzleBanner() {
    const canvas = document.getElementById('puzzle-canvas');
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');

    // 타일 위에 올릴 도넛 이미지들을 미리 불러둡니다.
    const images = [];
    for (let i = 1; i <= IMAGE_COUNT; i++) {
        const img = new Image();
        img.src = `./img/puzzle/${i}.${IMAGE_EXT}`;
        images.push(img);
    }

    // 보이는 크기(CSS 픽셀). 그리기 계산은 전부 이 값을 씁니다.
    // canvas.width/height 는 DPR 이 곱해진 '칸 수'라 여기에 쓰면 안 됩니다.
    let viewW = 0;
    let viewH = 0;

    let cellSize = 0;
    let grid = [];
    let cols = 0;
    let rows = 0;

    // 애니메이션 상태
    let animState = 'idle'; // 'idle' | 'row' | 'col'
    let nextAnim = 'row';   // 행 → 열 → 행 … 번갈아
    let targetIndex = 0;    // 움직일 행/열 번호
    let direction = 1;      // 1 정방향, -1 역방향
    let offset = 0;         // 지금까지 밀린 픽셀
    let rafId = null;

    // 📏 캔버스 크기와 격자 데이터를 다시 계산합니다.
    //
    // 🔍 고해상도(레티나) 화면 대응
    //    캔버스는 '담는 칸 수'(canvas.width)와 '보이는 넓이'(CSS width)가 따로입니다.
    //    둘을 같게 두면 DPR 2 화면에서 칸 하나를 점 두 개로 늘려 그려서 뿌옇게 보입니다.
    //    그래서 칸 수는 DPR 배만큼 늘리고, 보이는 넓이는 그대로 고정한 뒤,
    //    ctx.scale 로 좌표계를 되돌립니다. 덕분에 아래 그리기 코드는 손대지 않아도
    //    예전처럼 CSS 픽셀 기준으로 계산하면 됩니다.
    function init() {
        const parent = canvas.parentElement;
        viewW = parent.clientWidth;
        viewH = parent.clientHeight;
        if (!viewW || !viewH) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(viewW * dpr);
        canvas.height = Math.round(viewH * dpr);
        canvas.style.width = `${viewW}px`;
        canvas.style.height = `${viewH}px`;

        // setTransform 이라 init 이 여러 번 불려도 배율이 겹쳐 쌓이지 않습니다.
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // 배너 높이를 VISIBLE_ROWS로 정확히 나눠 셀 크기를 정합니다.
        cellSize = viewH / VISIBLE_ROWS;

        // 좌우/상하로 한 칸씩 여유를 둬서 미는 동안 빈틈이 보이지 않게 합니다.
        cols = Math.ceil(viewW / cellSize) + 2;
        rows = VISIBLE_ROWS + 2;

        grid = [];
        for (let r = 0; r < rows; r++) {
            const row = [];
            for (let c = 0; c < cols; c++) {
                row.push({
                    color: TILE_COLOR,
                    img: images[Math.floor(Math.random() * images.length)]
                });
            }
            grid.push(row);
        }
    }

    // 🔄 한 칸 다 밀렸을 때 실제 배열을 회전시킵니다.
    function shiftGridData() {
        if (animState === 'row') {
            if (direction === 1) {
                grid[targetIndex].unshift(grid[targetIndex].pop());
            } else {
                grid[targetIndex].push(grid[targetIndex].shift());
            }
        } else if (animState === 'col') {
            if (direction === 1) {
                const last = grid[rows - 1][targetIndex];
                for (let r = rows - 1; r > 0; r--) grid[r][targetIndex] = grid[r - 1][targetIndex];
                grid[0][targetIndex] = last;
            } else {
                const first = grid[0][targetIndex];
                for (let r = 0; r < rows - 1; r++) grid[r][targetIndex] = grid[r + 1][targetIndex];
                grid[rows - 1][targetIndex] = first;
            }
        }
    }

    // 🎬 한 프레임 그리기
    function draw() {
        if (!cellSize) {
            rafId = requestAnimationFrame(draw);
            return;
        }

        // 타일 사이 간격으로 비칠 배경색을 먼저 깔아줍니다.
        ctx.fillStyle = BG_COLOR;
        ctx.fillRect(0, 0, viewW, viewH);

        if (animState !== 'idle') {
            offset += cellSize / ANIM_FRAMES;
            if (offset >= cellSize) {
                shiftGridData();
                offset = 0;
                animState = 'idle';
            }
        }

        // 쉬는 중이면 다음에 밀 행/열을 새로 뽑습니다.
        if (animState === 'idle') {
            animState = nextAnim;
            nextAnim = (nextAnim === 'row') ? 'col' : 'row';

            targetIndex = (animState === 'row')
                ? Math.floor(Math.random() * rows)
                : Math.floor(Math.random() * cols);
            direction = Math.random() > 0.5 ? 1 : -1;
        }

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let x = (c - 1) * cellSize;
                let y = (r - 1) * cellSize;

                if (animState === 'row' && r === targetIndex) {
                    x += offset * direction;
                } else if (animState === 'col' && c === targetIndex) {
                    y += offset * direction;
                }

                const cell = grid[r][c];

                const tileX = x + GAP;
                const tileY = y + GAP;
                const tileSize = cellSize - (GAP * 2);

                ctx.fillStyle = cell.color;
                ctx.beginPath();
                ctx.roundRect(tileX, tileY, tileSize, tileSize, RADIUS);
                ctx.fill();

                // 그림만 타일보다 조금 작게, 가운데 맞춰 올립니다.
                // (크림색 타일 바탕은 그대로 두고 도넛만 줄어듭니다)
                if (cell.img && cell.img.complete) {
                    const imgSize = tileSize * IMAGE_SCALE;
                    const inset = (tileSize - imgSize) / 2;

                    // ⚠️ globalAlpha 는 캔버스 전체에 남는 설정입니다. 여기서
                    //    되돌려 놓지 않으면 다음 칸의 타일 바탕까지 연해집니다.
                    ctx.globalAlpha = IMAGE_OPACITY;
                    ctx.drawImage(cell.img, tileX + inset, tileY + inset, imgSize, imgSize);
                    ctx.globalAlpha = 1;
                }
            }
        }

        rafId = requestAnimationFrame(draw);
    }

    // 창 크기가 바뀌면 격자를 다시 짭니다. (연속 호출은 마지막 것만 실행)
    let resizeTimer = null;
    function onResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(init, 150);
    }
    window.addEventListener('resize', onResize);

    init();
    draw();

    return {
        stop() {
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener('resize', onResize);
        }
    };
}
