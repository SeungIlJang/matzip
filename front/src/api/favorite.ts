import axiosInstance from './axios';
import type {Restaurant} from '@/types/domain';

const getFavorites = async (page = 1): Promise<Restaurant[]> => {
  const {data} = await axiosInstance.get('/favorites/my', {params: {page}});

  return data;
};

/** 즐겨찾기 토글. 반환값은 대상 restaurantId. */
const toggleFavorite = async (restaurantId: number): Promise<number> => {
  const {data} = await axiosInstance.post(`/favorites/${restaurantId}`);

  return data;
};

export {getFavorites, toggleFavorite};
