// 퍼즐(루빅스 큐브) 타일 배너 — 행/열이 한 칸씩 번갈아 밀리는 캔버스 애니메이션
// 필요 요소: #puzzle-canvas (크기를 가진 부모 안에 있어야 합니다)
// 필요 라이브러리: 없음
//
// 캔버스 크기는 부모 요소를 그대로 따라갑니다.
// 세로는 항상 VISIBLE_ROWS 줄로 딱 나누어 떨어지게 잘라서,
// 배너 높이가 바뀌어도 아래쪽 타일이 어중간하게 잘리지 않습니다.

const IMAGE_COUNT = 18;      // img/puzzle/1.png ~ 18.png
const BG_COLOR = '#F3CFC7';  // 타일 사이로 비치는 배경(선) 색
const TILE_COLOR = '#F0F1E3';// 둥근 타일 바탕색
const GAP = 3;               // 타일 사이 간격(px)
const RADIUS = 16;           // 타일 모서리 둥근 정도(px)
const VISIBLE_ROWS = 3;      // 화면에 꽉 차게 보여줄 줄 수
const ANIM_FRAMES = 25;      // 한 칸 미는 데 쓰는 프레임 수 (클수록 느림)

export function initPuzzleBanner() {
    const canvas = document.getElementById('puzzle-canvas');
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');

    // 타일 위에 올릴 도넛 이미지들을 미리 불러둡니다.
    const images = [];
    for (let i = 1; i <= IMAGE_COUNT; i++) {
        const img = new Image();
        img.src = `./img/puzzle/${i}.png`;
        images.push(img);
    }

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
    function init() {
        const parent = canvas.parentElement;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        if (!canvas.width || !canvas.height) return;

        // 배너 높이를 VISIBLE_ROWS로 정확히 나눠 셀 크기를 정합니다.
        cellSize = canvas.height / VISIBLE_ROWS;

        // 좌우/상하로 한 칸씩 여유를 둬서 미는 동안 빈틈이 보이지 않게 합니다.
        cols = Math.ceil(canvas.width / cellSize) + 2;
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
        ctx.fillRect(0, 0, canvas.width, canvas.height);

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

                if (cell.img && cell.img.complete) {
                    ctx.drawImage(cell.img, tileX, tileY, tileSize, tileSize);
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
