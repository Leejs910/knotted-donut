// 랜덤 구름 생성기 (Object Pooling — 정해진 개수를 재활용)
// 필요 요소: #cloud-container

export function initClouds({ maxClouds = 6 } = {}) {
    const container = document.getElementById('cloud-container');
    if (!container) return;

    // 구름에 랜덤 속성을 부여하고 출발시키는 함수
    function respawnCloud(cloudElement, isFirstSpawn = false) {
        const randomImgNum = Math.floor(Math.random() * 6) + 1;       // 1 ~ 6번 이미지
        const randomTop = Math.random() * 50;                          // 0% ~ 50% (하늘 윗부분에서만 스폰)
        const randomWidth = Math.random() * 100 + 400;                 // 랜덤 크기
        const randomDuration = Math.random() * 30 + 20;                // 20초 ~ 50초 랜덤 이동 속도

        cloudElement.src = `./img/cloud_${randomImgNum}.png`;
        cloudElement.style.top = `${randomTop}%`;
        cloudElement.style.width = `${randomWidth}px`;
        cloudElement.style.animationDuration = `${randomDuration}s`;

        if (isFirstSpawn) {
            // 🌥️ 처음 그려질 때는 '음수' 딜레이를 줍니다.
            //    양수 딜레이를 주면 화면 오른쪽 밖에서 한참 기다렸다가 들어오기 때문에,
            //    페이지를 열자마자 하늘이 한동안 텅 비어 있었습니다.
            //    음수로 주면 애니메이션이 이미 그만큼 진행된 상태에서 시작해서
            //    구름들이 처음부터 화면 곳곳(가운데 포함)에 흩어져 보입니다.
            //
            //    0.05~0.75 구간만 쓰는 이유: 0 에 가까우면 아직 화면 밖이고,
            //    1 에 가까우면 이미 왼쪽으로 빠져나가는 중이라 잘 안 보입니다.
            const progress = 0.05 + Math.random() * 0.7;
            cloudElement.style.animationDelay = `${-(randomDuration * progress).toFixed(2)}s`;
        } else {
            // 끝까지 갔다가 다시 스폰될 때는 딜레이 없이 바로 출발
            cloudElement.style.animationDelay = '0s';
        }

        // 애니메이션 초기화 및 재시작 (Reflow Trick)
        cloudElement.classList.remove('cloud-moving');
        void cloudElement.offsetWidth; // 브라우저에게 변경사항을 즉시 계산하도록 강제함
        cloudElement.classList.add('cloud-moving');
    }

    for (let i = 0; i < maxClouds; i++) {
        const cloud = document.createElement('img');
        cloud.classList.add('random-cloud');
        container.appendChild(cloud);

        // 구름의 애니메이션이 끝나는(화면 밖으로 나가는) 순간을 감지해 다시 출발시킴
        cloud.addEventListener('animationend', () => respawnCloud(cloud, false));

        respawnCloud(cloud, true); // 최초 1회 스폰
    }
}
