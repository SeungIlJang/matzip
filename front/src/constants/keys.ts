const queryKeys = {
  AUTH: 'auth',
  GET_ACCESS_TOKEN: 'getAccessToken',
  GET_PROFILE: 'getProfile',
  RESTAURANT: 'restaurant',
  GET_NEARBY_RESTAURANTS: 'getNearbyRestaurants',
  GET_RESTAURANT: 'getRestaurant',
  MENU: 'menu',
  GET_MENUS: 'getMenus',
  RECOMMENDATION: 'recommendation',
  GET_RECOMMENDATIONS: 'getRecommendations',
  FEED: 'feed',
  GET_FEED: 'getFeed',
  FAVORITE: 'favorite',
  GET_FAVORITES: 'getFavorites',
} as const;

const storageKeys = {
  REFRESH_TOKEN: 'refreshToken',
} as const;

export {queryKeys, storageKeys};
