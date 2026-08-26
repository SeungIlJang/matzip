type LoginType = 'email' | 'kakao' | 'apple' | 'google';

/** 국가(입맛 그룹). code=ISO 3166-1 alpha-2 */
interface Country {
  code: string;
  name: string;
  flag: string;
}

interface Profile {
  id: number;
  email: string;
  nickname: string | null;
  imageUri: string | null;
  kakaoImageUri: string | null;
  country: string | null;
  language: string | null;
  loginType: LoginType;
}

/** 지도에 찍히는 공개 음식점 마커 (경량) */
interface RestaurantMarker {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  recommendationCount: number;
}

interface Restaurant {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  createdAt: string;
  updatedAt: string;
}

/** 메뉴 + 추천 통계 (전체 기준 / 내 국가 기준) */
interface MenuWithStats {
  id: number;
  name: string;
  price: number | null;
  imageUri: string | null;
  totalCount: number;
  totalAvgScore: number;
  countryCount: number;
  countryAvgScore: number;
}

interface RestaurantDetail extends Restaurant {
  menus: MenuWithStats[];
  isFavorite: boolean;
}

interface RecommendationAuthor {
  id: number;
  nickname: string | null;
  country: string | null;
  imageUri: string | null;
}

interface Recommendation {
  id: number;
  userId: number;
  menuId: number;
  country: string | null;
  score: number;
  comment: string;
  images: {id: number; uri: string}[];
  user?: RecommendationAuthor;
  createdAt: string;
}

/** 네이버 지역검색 결과 (아직 등록 안 된 실제 장소) */
interface NaverPlace {
  name: string;
  category: string;
  address: string;
  roadAddress: string;
  latitude: number;
  longitude: number;
}

/** 국가별 트렌딩 피드 항목 */
interface FeedItem {
  menuId: number;
  menuName: string;
  menuImageUri: string | null;
  restaurantId: number;
  restaurantName: string;
  count: number;
  avgScore: number;
}

export type {
  LoginType,
  Country,
  Profile,
  RestaurantMarker,
  Restaurant,
  MenuWithStats,
  RestaurantDetail,
  RecommendationAuthor,
  Recommendation,
  NaverPlace,
  FeedItem,
};
