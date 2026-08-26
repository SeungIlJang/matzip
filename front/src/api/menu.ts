import axiosInstance from './axios';

type RequestCreateMenu = {
  restaurantId: number;
  name: string;
  price?: number;
  imageUri?: string;
};

const createMenu = async ({
  restaurantId,
  ...body
}: RequestCreateMenu): Promise<{id: number; name: string}> => {
  const {data} = await axiosInstance.post(
    `/restaurants/${restaurantId}/menus`,
    body,
  );

  return data;
};

export {createMenu};
export type {RequestCreateMenu};
