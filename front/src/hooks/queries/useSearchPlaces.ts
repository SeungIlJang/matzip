import {useQuery} from '@tanstack/react-query';

import {searchPlaces} from '@/api/place';
import type {NaverPlace} from '@/types/domain';
import type {UseQueryCustomOptions} from '@/types/common';

/** 네이버 지역검색으로 실제 장소 검색 (query 비어있으면 비활성) */
function useSearchPlaces(
  query: string,
  queryOptions?: UseQueryCustomOptions<NaverPlace[]>,
) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ['place', 'search', trimmed],
    queryFn: () => searchPlaces(trimmed),
    enabled: trimmed.length > 0,
    ...queryOptions,
  });
}

export default useSearchPlaces;
