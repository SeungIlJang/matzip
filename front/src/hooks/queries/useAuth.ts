import {useEffect} from 'react';
import {useMutation, useQuery} from '@tanstack/react-query';

import {
  ResponseProfile,
  ResponseToken,
  editProfile,
  getAccessToken,
  getProfile,
  googleLogin,
  kakaoLogin,
  logout,
  postLogin,
  postDeviceLogin,
  postSignup,
} from '@/api/auth';
import {
  removeEncryptStorage,
  removeHeader,
  setEncryptStorage,
  setHeader,
} from '@/utils';
import queryClient from '@/api/queryClient';
import {numbers, queryKeys, storageKeys} from '@/constants';
import type {
  UseMutationCustomOptions,
  UseQueryCustomOptions,
} from '@/types/common';

function useSignup(mutationOptions?: UseMutationCustomOptions) {
  return useMutation({
    mutationFn: postSignup,
    ...mutationOptions,
  });
}

function handleLoginSuccess({accessToken, refreshToken}: ResponseToken) {
  setHeader('Authorization', `Bearer ${accessToken}`);
  setEncryptStorage(storageKeys.REFRESH_TOKEN, refreshToken);
}

function handleLoginSettled() {
  queryClient.refetchQueries({
    queryKey: [queryKeys.AUTH, queryKeys.GET_ACCESS_TOKEN],
  });
  queryClient.invalidateQueries({
    queryKey: [queryKeys.AUTH, queryKeys.GET_PROFILE],
  });
}

function useLogin(mutationOptions?: UseMutationCustomOptions) {
  return useMutation({
    mutationFn: postLogin,
    onSuccess: handleLoginSuccess,
    onSettled: handleLoginSettled,
    ...mutationOptions,
  });
}

function useDeviceLogin(mutationOptions?: UseMutationCustomOptions) {
  return useMutation({
    mutationFn: postDeviceLogin,
    onSuccess: handleLoginSuccess,
    onSettled: handleLoginSettled,
    ...mutationOptions,
  });
}

function useKakaoLogin(mutationOptions?: UseMutationCustomOptions) {
  return useMutation({
    mutationFn: kakaoLogin,
    onSuccess: handleLoginSuccess,
    onSettled: handleLoginSettled,
    ...mutationOptions,
  });
}

function useGoogleLogin(mutationOptions?: UseMutationCustomOptions) {
  return useMutation({
    mutationFn: googleLogin,
    onSuccess: handleLoginSuccess,
    onSettled: handleLoginSettled,
    ...mutationOptions,
  });
}

function useEditProfile(mutationOptions?: UseMutationCustomOptions) {
  return useMutation({
    mutationFn: editProfile,
    onSuccess: profile => {
      queryClient.setQueryData(
        [queryKeys.AUTH, queryKeys.GET_PROFILE],
        profile,
      );
    },
    ...mutationOptions,
  });
}

function useGetRefreshToken() {
  const {data, isSuccess, isError} = useQuery({
    queryKey: [queryKeys.AUTH, queryKeys.GET_ACCESS_TOKEN],
    queryFn: getAccessToken,
    staleTime: numbers.ACCESS_TOKEN_REFRESH_TIME,
    refetchInterval: numbers.ACCESS_TOKEN_REFRESH_TIME,
    refetchOnReconnect: true,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (isSuccess) {
      setHeader('Authorization', `Bearer ${data.accessToken}`);
      setEncryptStorage(storageKeys.REFRESH_TOKEN, data.refreshToken);
    }
  }, [data?.accessToken, data?.refreshToken, isSuccess]);

  useEffect(() => {
    if (isError) {
      removeHeader('Authorization');
      removeEncryptStorage(storageKeys.REFRESH_TOKEN);
    }
  }, [isError]);

  return {isSuccess, isError};
}

function useGetProfile(queryOptions?: UseQueryCustomOptions<ResponseProfile>) {
  return useQuery({
    queryFn: getProfile,
    queryKey: [queryKeys.AUTH, queryKeys.GET_PROFILE],
    ...queryOptions,
  });
}

function useLogout(mutationOptions?: UseMutationCustomOptions) {
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      removeHeader('Authorization');
      removeEncryptStorage(storageKeys.REFRESH_TOKEN);
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: [queryKeys.AUTH]});
    },
    ...mutationOptions,
  });
}

function useAuth() {
  const signupMutation = useSignup();
  const refreshTokenQuery = useGetRefreshToken();
  const getProfileQuery = useGetProfile({
    enabled: refreshTokenQuery.isSuccess,
  });
  const isLogin = getProfileQuery.isSuccess;
  const loginMutation = useLogin();
  const deviceLoginMutation = useDeviceLogin();
  const kakaoLoginMutation = useKakaoLogin();
  const googleLoginMutation = useGoogleLogin();
  const editProfileMutation = useEditProfile();
  const logoutMutation = useLogout();

  return {
    signupMutation,
    loginMutation,
    deviceLoginMutation,
    kakaoLoginMutation,
    googleLoginMutation,
    editProfileMutation,
    getProfileQuery,
    isLogin,
    logoutMutation,
  };
}

export default useAuth;
