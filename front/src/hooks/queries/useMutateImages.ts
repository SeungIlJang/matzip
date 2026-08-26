import {useMutation} from '@tanstack/react-query';

import {uploadImages} from '@/api/image';
import type {UseMutationCustomOptions} from '@/types/common';

function useMutateImages(
  mutationOptions?: UseMutationCustomOptions<string[], FormData>,
) {
  return useMutation({
    mutationFn: uploadImages,
    ...mutationOptions,
  });
}

export default useMutateImages;
