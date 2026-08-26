const mainNavigations = {
  HOME: 'Home',
  FEED: 'Feed',
  CALENDAR: 'Calendar',
  PROFILE: 'Profile',
} as const;

const feedNavigations = {
  FEED_HOME: 'FeedHome',
  FEED_FAVORITE: 'FeedFavorite',
} as const;

const authNavigations = {
  AUTH_HOME: 'AuthHome',
  LOGIN: 'Login',
  SIGNUP: 'Signup',
} as const;

const mapNavigations = {
  MAP_HOME: 'MapHome',
  RESTAURANT_DETAIL: 'RestaurantDetail',
  ADD_MENU: 'AddMenu',
  MENU_DETAIL: 'MenuDetail',
  ADD_RECOMMENDATION: 'AddRecommendation',
} as const;

export {mainNavigations, feedNavigations, authNavigations, mapNavigations};
