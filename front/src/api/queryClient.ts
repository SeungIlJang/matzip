import {Alert} from 'react-native';
import {MutationCache, QueryClient} from '@tanstack/react-query';
import type {AxiosError} from 'axios';

import i18n from '@/i18n';

function getErrorMessage(error: unknown) {
  const axiosError = error as AxiosError<{message?: string}>;
  return axiosError?.response?.data?.message ?? i18n.t('common.error');
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
  // 사용자 액션(뮤테이션) 실패는 전역에서 안내. 쿼리 실패는 화면별 빈 상태로 처리(무음).
  mutationCache: new MutationCache({
    onError: error => {
      Alert.alert('', getErrorMessage(error));
    },
  }),
});

export default queryClient;
