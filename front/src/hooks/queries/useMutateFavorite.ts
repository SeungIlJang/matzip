import {useMutation} from '@tanstack/react-query';

import {toggleFavorite} from '@/api/favorite';
import queryClient from '@/api/queryClient';
import {queryKeys} from '@/constants';
import type {UseMutationCustomOptions} from '@/types/common';

function useMutateFavorite(mutationOptions?: UseMutationCustomOptions) {
  return useMutation({
    mutationFn: toggleFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: [queryKeys.RESTAURANT]});
      queryClient.invalidateQueries({queryKey: [queryKeys.FAVORITE]});
    },
    ...mutationOptions,
  });
}

export default useMutateFavorite;
