// 랜덤 별똥별(유성우) 생성기
// 필요 요소: .decorations (별똥별이 담길 부모)

export function initShootingStars() {
    const decorations = document.querySelector('.decorations');
    if (!decorations) return;

    function createShootingStar() {
        const star = document.createElement('div');
        star.classList.add('shooting-star');

        // 시작 위치를 화면 윗부분의 랜덤한 곳으로 설정
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * (window.innerHeight * 0.4);

        star.style.left = `${startX}px`;
        star.style.top = `${startY}px`;

        decorations.appendChild(star);

        // 애니메이션이 끝난 후(1.5초) HTML에서 완전히 삭제하여 메모리 관리
        setTimeout(() => star.remove(), 1500);
    }

    // 랜덤 무리(Burst) 생성 로직
    function loop() {
        // 이번 턴에 떨어뜨릴 별의 개수를 1개 ~ 3개 중에서 랜덤으로 뽑기
        const starCount = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < starCount; i++) {
            // 여러 개가 한 번에 떨어질 때 약간의 시차를 주어 자연스럽게 연출
            setTimeout(createShootingStar, Math.random() * 500);
        }

        // 다음 유성우가 내릴 때까지의 대기 시간 (2초 ~ 5초)
        setTimeout(loop, Math.random() * 3000 + 2000);
    }

    loop();
}
