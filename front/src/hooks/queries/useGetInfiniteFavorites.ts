import {useInfiniteQuery} from '@tanstack/react-query';

import {getFavorites} from '@/api/favorite';
import {queryKeys} from '@/constants';

const PER_PAGE = 10;

function useGetInfiniteFavorites() {
  return useInfiniteQuery({
    queryKey: [queryKeys.FAVORITE, queryKeys.GET_FAVORITES],
    queryFn: ({pageParam}) => getFavorites(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PER_PAGE ? allPages.length + 1 : undefined,
  });
}

export default useGetInfiniteFavorites;
