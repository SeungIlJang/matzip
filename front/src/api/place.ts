import axiosInstance from './axios';
import type {NaverPlace} from '@/types/domain';

/** 네이버 지역검색(서버 프록시)으로 실제 장소 검색 */
const searchPlaces = async (query: string): Promise<NaverPlace[]> => {
  const {data} = await axiosInstance.get('/places/search', {
    params: {query},
  });

  return data;
};

export {searchPlaces};
