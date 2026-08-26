import axiosInstance from './axios';
import type {
  Restaurant,
  RestaurantDetail,
  RestaurantMarker,
} from '@/types/domain';

type RequestNearby = {
  lat: number;
  lng: number;
  latDelta: number;
  lngDelta: number;
};

const getNearbyRestaurants = async ({
  lat,
  lng,
  latDelta,
  lngDelta,
}: RequestNearby): Promise<RestaurantMarker[]> => {
  const {data} = await axiosInstance.get('/restaurants', {
    params: {lat, lng, latDelta, lngDelta},
  });

  return data;
};

const getRestaurant = async (id: number): Promise<RestaurantDetail> => {
  const {data} = await axiosInstance.get(`/restaurants/${id}`);

  return data;
};

type RequestCreateRestaurant = {
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
};

const createRestaurant = async (
  body: RequestCreateRestaurant,
): Promise<Restaurant> => {
  const {data} = await axiosInstance.post('/restaurants', body);

  return data;
};

/** 네이버 검색 장소를 식당으로 확정(get-or-create) → 식당 정보 반환 */
const resolveRestaurantFromPlace = async (
  body: RequestCreateRestaurant,
): Promise<Restaurant> => {
  const {data} = await axiosInstance.post('/restaurants/from-place', body);

  return data;
};

const searchRestaurants = async (
  query: string,
  page = 1,
): Promise<Restaurant[]> => {
  const {data} = await axiosInstance.get('/restaurants/search', {
    params: {query, page},
  });

  return data;
};

export {
  getNearbyRestaurants,
  getRestaurant,
  createRestaurant,
  resolveRestaurantFromPlace,
  searchRestaurants,
};
export type {RequestNearby, RequestCreateRestaurant};
