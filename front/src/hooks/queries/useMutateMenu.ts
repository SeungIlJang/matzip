import {useMutation} from '@tanstack/react-query';

import {createMenu} from '@/api/menu';
import queryClient from '@/api/queryClient';
import {queryKeys} from '@/constants';
import type {UseMutationCustomOptions} from '@/types/common';

function useMutateMenu(mutationOptions?: UseMutationCustomOptions) {
  return useMutation({
    mutationFn: createMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: [queryKeys.RESTAURANT]});
      queryClient.invalidateQueries({queryKey: [queryKeys.MENU]});
    },
    ...mutationOptions,
  });
}

export default useMutateMenu;
