import type {TranslationResource} from './en';

const ko: TranslationResource = {
  common: {
    save: '저장',
    cancel: '취소',
    delete: '삭제',
    edit: '편집',
    logout: '로그아웃',
    error: '문제가 발생했어요',
  },
  auth: {
    login: '로그인',
    signup: '회원가입',
    email: '이메일',
    password: '비밀번호',
    passwordConfirm: '비밀번호 확인',
    myCountry: '내 나라 (입맛 기준)',
    selectCountry: '나라를 선택하세요',
    orContinueWith: '또는',
  },
  map: {
    myLocation: '내 위치',
    drawer: '메뉴',
    longPressHint: '지도를 길게 눌러 음식점을 등록하세요',
  },
  search: {
    placeholder: '맛집 검색',
    noResults: '검색 결과가 없어요',
    hint: '맛집 이름이나 주소로 검색하세요',
    sectionRegistered: 'MATZIP 등록',
    sectionNaver: '네이버 검색',
    addFromPlace: '이 장소 등록',
    recent: '최근 검색',
    clearRecent: '전체삭제',
  },
  filter: {
    all: '🌍 전체',
    myCountry: '내 나라',
  },
  restaurant: {
    addTitle: '음식점 등록',
    name: '음식점 이름',
    address: '주소 (선택)',
    register: '음식점 등록',
    menuRanking: '메뉴 추천 랭킹',
    addMenu: '＋ 메뉴 추가',
    noMenus:
      '아직 등록된 메뉴가 없어요.\n메뉴를 추가하고 첫 추천을 남겨보세요!',
    countryPick: '우리 나라 픽',
  },
  menu: {
    addTitle: '메뉴 등록',
    name: '메뉴 이름',
    price: '가격 (선택)',
    photo: '메뉴 사진 (선택)',
    register: '메뉴 등록',
    recommend: '이 메뉴 추천하기',
    noRecommendations: '아직 추천이 없어요. 첫 추천을 남겨보세요!',
    noCountryRecommendations: '우리 나라 사람의 추천이 아직 없어요.',
    noStat: '추천이 아직 없어요',
    noCountryStat: '우리 나라 추천이 아직 없어요',
  },
  recommendation: {
    title: '메뉴 추천하기',
    scoreQuestion: '이 메뉴, 당신의 입맛에 몇 점?',
    comment: '코멘트 (선택)',
    commentPlaceholder: '예: 안 맵고 담백해서 우리 나라 사람 입맛에 잘 맞아요',
    photo: '사진 (선택)',
    submit: '추천 등록',
    anonymous: '익명',
  },
  feed: {
    title: '{{flag}} {{country}} 사람들이\n요즘 추천하는 메뉴',
    titleGeneric: '요즘 뜨는 메뉴',
    empty: '아직 추천이 없어요.\n지도에서 음식점을 찾아 첫 추천을 남겨보세요!',
    favorites: '즐겨찾기',
    recommendCount: '추천 {{count}}',
  },
  favorite: {
    title: '즐겨찾기',
    empty: '아직 저장한 음식점이 없어요.\n가고 싶은 곳을 즐겨찾기 해보세요!',
  },
  profile: {
    title: '프로필',
    edit: '프로필 편집',
    nickname: '닉네임',
    country: '나라',
    language: '언어',
  },
  drawer: {
    home: '지도',
    feed: '피드',
    calendar: '캘린더',
  },
  social: {
    kakao: '카카오로 계속하기',
    google: 'Google로 계속하기',
    needNative:
      '소셜 로그인은 네이티브 SDK 설정 후 사용할 수 있어요. 연동 안내를 참고하세요.',
  },
  photo: {
    count: '사진 {{current}}/{{max}}',
    maxTitle: '사진 개수 초과',
    maxMessage: '사진은 최대 {{max}}장까지 첨부할 수 있어요.',
    uploadFailed: '사진 업로드에 실패했어요.',
  },
};

export default ko;
