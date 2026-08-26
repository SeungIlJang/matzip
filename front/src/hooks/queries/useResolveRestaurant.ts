import {useMutation} from '@tanstack/react-query';

import {resolveRestaurantFromPlace} from '@/api/restaurant';
import type {Restaurant} from '@/types/domain';
import type {UseMutationCustomOptions} from '@/types/common';

/** 네이버 장소 → 식당 확정(get-or-create). 성공 시 식당 정보 반환. */
function useResolveRestaurant(
  mutationOptions?: UseMutationCustomOptions<
    Restaurant,
    Parameters<typeof resolveRestaurantFromPlace>[0]
  >,
) {
  return useMutation({
    mutationFn: resolveRestaurantFromPlace,
    ...mutationOptions,
  });
}

export default useResolveRestaurant;
