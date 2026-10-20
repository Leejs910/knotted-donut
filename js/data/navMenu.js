// 네비게이션에 딸린 하위 메뉴
// 값만 둡니다. 펼치고 접는 일은 js/modules/navDropdown.js 가 맡습니다.
//
// label : 상단 네비에 적힌 글자와 똑같이 적습니다 (이걸로 짝을 찾습니다)
// items : 하위 항목. cat 은 그 페이지 탭의 data-category 와 같은 말이어야
//         링크를 눌렀을 때 그 분류가 바로 열립니다.
//         (주소의 ?cat=... 을 js/modules/tabFromUrl.js 가 읽습니다)

export const navMenu = [
    {
        label: 'SHOP',
        href: './onlineShop.html',
        items: [
            { text: '푸드', href: './onlineShop.html?cat=food' },
            { text: '리빙', href: './onlineShop.html?cat=living' },
            { text: '대량주문', href: './onlineShop.html?cat=bulk' },
        ],
    },
    {
        label: 'MENU',
        href: './menu.html',
        items: [
            { text: '도넛', href: './menu.html?cat=donut' },
            { text: '케이크', href: './menu.html?cat=cake' },
            { text: '음료', href: './menu.html?cat=drink' },
        ],
    },
    {
        label: 'BRAND',
        href: './brand.html',
        items: [
            { text: '브랜드 이야기', href: './brand.html' },
        ],
    },
    {
        label: 'SUPPORT',
        href: './support.html',
        items: [
            { text: '제품문의', href: './support.html?cat=product' },
            { text: '예약문의', href: './support.html?cat=reserve' },
            { text: '기타문의', href: './support.html?cat=etc' },
        ],
    },
];
