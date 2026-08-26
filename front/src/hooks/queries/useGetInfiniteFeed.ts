import {useInfiniteQuery} from '@tanstack/react-query';

import {getFeed} from '@/api/feed';
import {queryKeys} from '@/constants';

const PER_PAGE = 10;

function useGetInfiniteFeed(country?: string) {
  return useInfiniteQuery({
    queryKey: [queryKeys.FEED, queryKeys.GET_FEED, country ?? 'me'],
    queryFn: ({pageParam}) => getFeed(pageParam, country),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PER_PAGE ? allPages.length + 1 : undefined,
  });
}

export default useGetInfiniteFeed;
