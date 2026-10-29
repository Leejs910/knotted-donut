// 🎬 히어로 배경 영상을 '첫 화면이 그려진 뒤에' 불러옵니다.
//
// 하는 일
//   · 처음에는 poster(72KB webp)만 보여 줍니다
//   · 페이지가 다 뜬 뒤(window load) 영상을 받아 와 재생합니다
//
// 왜 이렇게 하나
//   마크업에 autoplay 를 적어 두면 브라우저가 첫 화면을 그리기 전에
//   영상부터 받습니다. 이 영상은 1.7MB 라, 폰에서는 그것 때문에 첫 화면이
//   몇 초씩 늦어집니다(LCP 요소가 이 <video> 였습니다).
//   ⚠️ preload="metadata" 로는 안 됩니다. autoplay 가 있으면 브라우저가
//      preload 를 무시하고 그대로 다 받습니다 — 재 보니 1,659KB 를
//      똑같이 받았습니다. 그래서 autoplay 자체를 걷어내고, 시작 시점을
//      여기서 잡습니다.
//
// 필요 요소: .bg-video (없으면 조용히 끝냅니다)
//   그 <video> 에는 autoplay 를 적지 않고 preload="none" 으로 둡니다.
//   muted / loop / playsinline / poster 는 마크업 그대로 씁니다.

// 🎚️ 화면이 뜬 뒤 얼마나 뜸을 들였다가 영상을 받을지(ms).
//    0 으로 두면 load 직후 바로 받습니다. 조금 주면 그만큼 첫 화면이
//    더 가벼워지지만, 영상이 늦게 시작합니다.
const START_DELAY = 200;

export function initHeroVideo() {
    const video = document.querySelector('.bg-video');
    if (!video) return;

    let started = false;

    function start() {
        if (started) return;
        started = true;

        // preload="none" 이라 직접 불러오라고 시켜야 합니다.
        video.preload = 'auto';
        video.load();

        // 소리가 없고 playsinline 이라 브라우저가 막지 않습니다.
        // 그래도 막히는 경우가 있어(자동재생 정책) 조용히 넘깁니다 —
        // 그때는 poster 가 그대로 남아 화면이 비지는 않습니다.
        const played = video.play();
        if (played && typeof played.catch === 'function') played.catch(() => {});
    }

    // 첫 화면이 다 그려진 뒤에 시작합니다.
    if (document.readyState === 'complete') {
        setTimeout(start, START_DELAY);
    } else {
        window.addEventListener('load', () => setTimeout(start, START_DELAY), { once: true });
    }

    // ⚠️ 최후의 보루. load 이벤트가 영영 오지 않는 경우(받다 만 리소스가
    //    있으면 그렇습니다)에도 영상은 떠야 합니다.
    setTimeout(start, 4000);
}
