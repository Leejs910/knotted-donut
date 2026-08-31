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
            // 처음 렌더링될 때 구름들이 뭉쳐서 나오지 않도록 0~20초 랜덤 딜레이
            cloudElement.style.animationDelay = `${Math.random() * 20}s`;
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
