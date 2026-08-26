import {useQuery} from '@tanstack/react-query';

import {searchRestaurants} from '@/api/restaurant';
import {queryKeys} from '@/constants';
import type {Restaurant} from '@/types/domain';
import type {UseQueryCustomOptions} from '@/types/common';

/** 등록된 맛집 이름/주소 검색 (query 비어있으면 비활성) */
function useSearchRestaurants(
  query: string,
  queryOptions?: UseQueryCustomOptions<Restaurant[]>,
) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: [queryKeys.RESTAURANT, 'search', trimmed],
    queryFn: () => searchRestaurants(trimmed),
    enabled: trimmed.length > 0,
    ...queryOptions,
  });
}

export default useSearchRestaurants;
