import {useQuery} from '@tanstack/react-query';

import {getRecommendations} from '@/api/recommendation';
import {queryKeys} from '@/constants';
import type {Recommendation} from '@/types/domain';
import type {UseQueryCustomOptions} from '@/types/common';

/** country 전달 시 해당 국가 추천만, 없으면 전체 */
function useGetRecommendations(
  menuId: number,
  country?: string,
  queryOptions?: UseQueryCustomOptions<Recommendation[]>,
) {
  return useQuery({
    queryKey: [
      queryKeys.RECOMMENDATION,
      queryKeys.GET_RECOMMENDATIONS,
      menuId,
      country ?? 'all',
    ],
    queryFn: () => getRecommendations(menuId, country),
    enabled: Boolean(menuId),
    ...queryOptions,
  });
}

export default useGetRecommendations;
