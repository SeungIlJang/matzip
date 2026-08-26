import {useMutation} from '@tanstack/react-query';

import {createRecommendation, deleteRecommendation} from '@/api/recommendation';
import queryClient from '@/api/queryClient';
import {queryKeys} from '@/constants';
import type {UseMutationCustomOptions} from '@/types/common';

function invalidateRecommendationQueries() {
  queryClient.invalidateQueries({queryKey: [queryKeys.RECOMMENDATION]});
  queryClient.invalidateQueries({queryKey: [queryKeys.RESTAURANT]});
  queryClient.invalidateQueries({queryKey: [queryKeys.FEED]});
}

function useCreateRecommendation(mutationOptions?: UseMutationCustomOptions) {
  return useMutation({
    mutationFn: createRecommendation,
    onSuccess: () => invalidateRecommendationQueries(),
    ...mutationOptions,
  });
}

function useDeleteRecommendation(mutationOptions?: UseMutationCustomOptions) {
  return useMutation({
    mutationFn: deleteRecommendation,
    onSuccess: () => invalidateRecommendationQueries(),
    ...mutationOptions,
  });
}

function useMutateRecommendation() {
  const createRecommendationMutation = useCreateRecommendation();
  const deleteRecommendationMutation = useDeleteRecommendation();

  return {createRecommendationMutation, deleteRecommendationMutation};
}

export default useMutateRecommendation;
