// 배경음악 ON/OFF 토글
// 필요 요소: #sound-toggle-btn
// 옵션: { src, volume } — 페이지마다 다른 BGM을 쓰고 싶으면 넘겨주세요

export function initSoundToggle({ src = './music/Morning.mp3', volume = 0.2 } = {}) {
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (!soundBtn) return;

    const bgm = new Audio(src);
    bgm.loop = true;
    bgm.volume = volume;
    // 사용자가 재생하기 전까지는 음원 데이터를 미리 다운로드하지 않음 (로딩 속도 향상)
    bgm.preload = 'none';

    // 기본 상태를 켜짐(true)으로 설정
    let isSoundOn = true;

    // [보안 대책] 브라우저 자동재생 금지 정책을 우회하기 위해,
    // 사용자가 첫 클릭을 하는 순간 사운드가 ON 상태라면 음악을 틀어줍니다.
    const playInitialBGM = () => {
        if (isSoundOn) {
            bgm.play().catch(() => console.log('자동재생 제한 우회 대기 중...'));
        }
        document.removeEventListener('click', playInitialBGM);
    };
    document.addEventListener('click', playInitialBGM);

    soundBtn.addEventListener('click', (e) => {
        e.preventDefault();   // 페이지 위로 튕김 방지
        e.stopPropagation();  // 위의 playInitialBGM과 이벤트가 꼬이지 않도록 방지

        isSoundOn = !isSoundOn;

        if (isSoundOn) {
            soundBtn.classList.add('is-on');
            bgm.play().catch(err => console.log('재생 오류:', err));
        } else {
            soundBtn.classList.remove('is-on');
            bgm.pause();
            bgm.currentTime = 0;
        }
    });
}
