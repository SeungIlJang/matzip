import {useQuery} from '@tanstack/react-query';

import {getRestaurant} from '@/api/restaurant';
import {queryKeys} from '@/constants';
import type {RestaurantDetail} from '@/types/domain';
import type {UseQueryCustomOptions} from '@/types/common';

function useGetRestaurant(
  id: number,
  queryOptions?: UseQueryCustomOptions<RestaurantDetail>,
) {
  return useQuery({
    queryKey: [queryKeys.RESTAURANT, queryKeys.GET_RESTAURANT, id],
    queryFn: () => getRestaurant(id),
    enabled: Boolean(id),
    ...queryOptions,
  });
}

export default useGetRestaurant;
