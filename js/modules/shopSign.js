// 온라인 샵 간판 SVG를 인라인으로 불러오기
// (인라인으로 넣어야 CSS에서 SVG 내부의 #head 같은 요소를 조종할 수 있습니다)
// 필요 요소: #shopTitleBox

export function initShopSign({ svgUrl = './img/bear-sign.svg' } = {}) {
    const box = document.querySelector('#shopTitleBox');
    if (!box) return;

    fetch(svgUrl)
        .then(response => response.text()) // 파일 내용을 '글자(텍스트)'로 변환
        .then(svgCode => { box.innerHTML = svgCode; })
        .catch(error => console.error('SVG를 불러오는데 실패했습니다:', error));
}
