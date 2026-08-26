import {useQuery} from '@tanstack/react-query';

import {getNearbyRestaurants} from '@/api/restaurant';
import {queryKeys} from '@/constants';
import type {RestaurantMarker} from '@/types/domain';
import type {MapRegion} from '@/types/map';
import type {UseQueryCustomOptions} from '@/types/common';

/** 좌표를 쿼리 키 안정화를 위해 소수 3자리로 반올림 */
function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

function useGetNearbyRestaurants(
  region: MapRegion,
  queryOptions?: UseQueryCustomOptions<RestaurantMarker[]>,
) {
  const {latitude, longitude, latitudeDelta, longitudeDelta} = region;

  return useQuery({
    queryKey: [
      queryKeys.RESTAURANT,
      queryKeys.GET_NEARBY_RESTAURANTS,
      round(latitude),
      round(longitude),
      round(latitudeDelta),
      round(longitudeDelta),
    ],
    queryFn: () =>
      getNearbyRestaurants({
        lat: latitude,
        lng: longitude,
        latDelta: latitudeDelta,
        lngDelta: longitudeDelta,
      }),
    ...queryOptions,
  });
}

export default useGetNearbyRestaurants;
