import axiosInstance from './axios';
import type {Recommendation} from '@/types/domain';

const getRecommendations = async (
  menuId: number,
  country?: string,
): Promise<Recommendation[]> => {
  const {data} = await axiosInstance.get(
    `/menus/${menuId}/recommendations`,
    country ? {params: {country}} : undefined,
  );

  return data;
};

type RequestCreateRecommendation = {
  menuId: number;
  score: number;
  comment?: string;
  imageUris?: {uri: string}[];
};

const createRecommendation = async ({
  menuId,
  ...body
}: RequestCreateRecommendation): Promise<Recommendation> => {
  const {data} = await axiosInstance.post(
    `/menus/${menuId}/recommendations`,
    body,
  );

  return data;
};

const deleteRecommendation = async (id: number): Promise<number> => {
  const {data} = await axiosInstance.delete(`/recommendations/${id}`);

  return data;
};

export {getRecommendations, createRecommendation, deleteRecommendation};
export type {RequestCreateRecommendation};
