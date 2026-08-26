import axiosInstance from './axios';
import {getEncryptStorage} from '@/utils';
import type {Profile} from '@/types/domain';

type RequestUser = {
  email: string;
  password: string;
};

type RequestSignup = RequestUser & {
  country?: string;
};

const postSignup = async ({
  email,
  password,
  country,
}: RequestSignup): Promise<void> => {
  const {data} = await axiosInstance.post('/auth/signup', {
    email,
    password,
    country,
  });

  return data;
};

type ResponseToken = {
  accessToken: string;
  refreshToken: string;
};

const postLogin = async ({
  email,
  password,
}: RequestUser): Promise<ResponseToken> => {
  const {data} = await axiosInstance.post('/auth/signin', {email, password});

  return data;
};

type RequestDeviceLogin = {
  deviceId: string;
  country: string;
};

const postDeviceLogin = async (
  body: RequestDeviceLogin,
): Promise<ResponseToken> => {
  const {data} = await axiosInstance.post('/auth/device', body);

  return data;
};

type ResponseProfile = Profile;

const getProfile = async (): Promise<ResponseProfile> => {
  const {data} = await axiosInstance.get('/auth/me');

  return data;
};

const getAccessToken = async (): Promise<ResponseToken> => {
  const refreshToken = await getEncryptStorage('refreshToken');

  const {data} = await axiosInstance.get('/auth/refresh', {
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  return data;
};

const logout = async () => {
  await axiosInstance.post('/auth/logout');
};

type RequestEditProfile = {
  nickname: string;
  imageUri?: string;
  country?: string;
  language?: string;
};

const editProfile = async (
  body: RequestEditProfile,
): Promise<ResponseProfile> => {
  const {data} = await axiosInstance.patch('/auth/me', body);

  return data;
};

const kakaoLogin = async (token: string): Promise<ResponseToken> => {
  const {data} = await axiosInstance.post('/auth/oauth/kakao', {token});

  return data;
};

type RequestAppleLogin = {
  identityToken: string;
  appId: string;
  nickname: string | null;
};

const appleLogin = async (body: RequestAppleLogin): Promise<ResponseToken> => {
  const {data} = await axiosInstance.post('/auth/oauth/apple', body);

  return data;
};

const googleLogin = async (idToken: string): Promise<ResponseToken> => {
  const {data} = await axiosInstance.post('/auth/oauth/google', {idToken});

  return data;
};

export {
  postSignup,
  postLogin,
  postDeviceLogin,
  getProfile,
  getAccessToken,
  logout,
  editProfile,
  kakaoLogin,
  appleLogin,
  googleLogin,
};
export type {
  RequestUser,
  RequestSignup,
  RequestDeviceLogin,
  RequestEditProfile,
  RequestAppleLogin,
  ResponseToken,
  ResponseProfile,
};
