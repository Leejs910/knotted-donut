// ✨ 메뉴 섹션에 뿌리는 반짝이들 — 값만 둡니다.
// 그리는 일은 js/modules/menuDeco.js 가 맡습니다.
//
// 피그마(363-1058) 의 자리를 1920 폭 기준으로 읽어 vw 로 바꿔 둔 값입니다.
// 그래서 창을 줄이면 반짝이도 같은 비율로 따라 움직입니다.
//
//   src   : img/menu/ 안의 파일 이름
//   left  : 섹션 왼쪽에서의 거리 (vw)
//   top   : 섹션 위쪽에서의 거리 (vw)
//   size  : 가로 크기 (vw, 세로는 비율대로 따라옵니다)
//   spin  : 기울기 (도). 없으면 0
//
// 🎚️ 더 넣거나 빼려면 이 배열만 고치면 됩니다.

export const menuStars = [
    { src: 'star2.svg', left: 10.65, top: 14.11, size: 3.90, spin: 45 },
    { src: 'star4.svg', left: 88.73, top: 26.04, size: 1.51 },
    { src: 'star4.svg', left: 7.26, top: 32.10, size: 1.51 },
    { src: 'star5.svg', left: 66.82, top: 35.04, size: 5.02 },
    { src: 'star2.svg', left: 28.28, top: 35.48, size: 2.76 },
    { src: 'star4.svg', left: 93.35, top: 39.95, size: 1.51 },
    { src: 'star5.svg', left: 85.22, top: 46.45, size: 5.02 },
    { src: 'star2.svg', left: 7.26, top: 55.44, size: 2.76 },
    { src: 'star2.svg', left: 90.60, top: 59.30, size: 2.75 },
    { src: 'star1.svg', left: 22.68, top: 62.97, size: 5.60 },
    { src: 'star2.svg', left: 49.85, top: 62.97, size: 2.75 },
    { src: 'star4.svg', left: 69.33, top: 64.26, size: 1.50 },
];
