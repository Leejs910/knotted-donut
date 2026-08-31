// 푸터 배경으로 흘러가는 건물 SVG 랜덤 스폰
// 필요 요소: .footer-store-building

const buildingAssets = [
    './img/building0.svg',
    './img/building1.svg',
    './img/building2.svg',
    './img/building3.svg'
];

export function initBuildingSpawner({ assets = buildingAssets } = {}) {
    const container = document.querySelector('.footer-store-building');
    if (!container) return;

    // 무작위 건물을 생성하여 흘려보내는 함수
    function spawnBuilding(isFirst = false) {
        const selected = assets[Math.floor(Math.random() * assets.length)];

        const newBuilding = document.createElement('img');
        newBuilding.src = selected;
        newBuilding.className = 'spawned-building';
        newBuilding.alt = '스토어 건물';

        // 첫 번째 건물은 애니메이션 시간을 당겨서, 이미 화면 중앙(곰돌이 뒤)에
        // 도착한 상태로 렌더링되게 합니다.
        if (isFirst) {
            newBuilding.style.animationDelay = '-10.5s';
        }

        // 애니메이션이 끝나면 자동으로 DOM에서 삭제 (최적화)
        newBuilding.addEventListener('animationend', () => newBuilding.remove());

        container.appendChild(newBuilding);
    }

    // 화면 크기에 따라 스폰 간격을 다르게 잡습니다
    function randomDelay() {
        const isMobile = window.innerWidth <= 768;
        const minDelay = isMobile ? 15000 : 8000;
        const maxDelay = isMobile ? 25000 : 15000;
        return Math.random() * (maxDelay - minDelay) + minDelay;
    }

    spawnBuilding(true);

    function randomSpawn() {
        spawnBuilding();
        setTimeout(randomSpawn, randomDelay());
    }
    setTimeout(randomSpawn, randomDelay());
}
