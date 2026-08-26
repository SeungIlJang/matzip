import axiosInstance from './axios';
import type {FeedItem} from '@/types/domain';

/** 국가별 트렌딩 피드. country 미지정 시 서버가 요청자 국적 기준으로 반환. */
const getFeed = async (page = 1, country?: string): Promise<FeedItem[]> => {
  const {data} = await axiosInstance.get('/feed', {
    params: {page, ...(country ? {country} : {})},
  });

  return data;
};

export {getFeed};
