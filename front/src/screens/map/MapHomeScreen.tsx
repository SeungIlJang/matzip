import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {CompositeNavigationProp, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {DrawerNavigationProp} from '@react-navigation/drawer';

import NaverMapWebView, {
  NaverMapWebViewHandle,
} from '@/components/NaverMapWebView';
import RestaurantSearchBar from '@/components/RestaurantSearchBar';
import RestaurantPreview from '@/components/RestaurantPreview';
import useUserLocation from '@/hooks/useUserLocation';
import useGetNearbyRestaurants from '@/hooks/queries/useGetNearbyRestaurants';
import useResolveRestaurant from '@/hooks/queries/useResolveRestaurant';
import useSearchPlaces from '@/hooks/queries/useSearchPlaces';
import {colors, mapNavigations} from '@/constants';
import {MapStackParamList} from '@/navigations/stack/MapStackNavigator';
import {MainDrawerParamList} from '@/navigations/drawer/MainDrawerNavigator';
import type {LatLng} from '@/types/map';
import type {NaverPlace, Restaurant} from '@/types/domain';
import useAuth from '@/hooks/queries/useAuth';

type Navigation = CompositeNavigationProp<
  StackNavigationProp<MapStackParamList>,
  DrawerNavigationProp<MainDrawerParamList>
>;

const QUERY_DELTA = 0.15;

function MapHomeScreen() {
  const {t} = useTranslation();
  const inset = useSafeAreaInsets();
  const navigation = useNavigation<Navigation>();
  const {userLocation, isLocating, requestUserLocation} = useUserLocation();
  const mapRef = useRef<NaverMapWebViewHandle | null>(null);
  const initialCenterRef = useRef<LatLng>(userLocation);
  const [center, setCenter] = useState<LatLng>(userLocation);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [currentArea, setCurrentArea] = useState('');
  const resolveRestaurant = useResolveRestaurant();
  const {getProfileQuery} = useAuth();
  const country = getProfileQuery.data?.country ?? null;

  useEffect(() => {
    setCenter(userLocation);
    mapRef.current?.moveTo(userLocation);
  }, [userLocation]);

  const region = useMemo(
    () => ({
      latitude: center.latitude,
      longitude: center.longitude,
      latitudeDelta: QUERY_DELTA,
      longitudeDelta: QUERY_DELTA,
    }),
    [center.latitude, center.longitude],
  );

  const {data: restaurants = []} = useGetNearbyRestaurants(region);
  const {
    data: nearbyPlaces = [],
    isFetching: isSearchingArea,
    refetch: refetchNearbyPlaces,
  } = useSearchPlaces(currentArea ? `${currentArea} 맛집` : '');
  const selectedRestaurant =
    restaurants.find(restaurant => restaurant.id === selectedId) ?? null;

  const openDetail = (restaurantId: number, restaurantName: string) => {
    navigation.navigate(mapNavigations.RESTAURANT_DETAIL, {
      restaurantId,
      restaurantName,
    });
  };

  const handlePressUserLocation = () => {
    requestUserLocation();
  };

  const handleSearchThisArea = () => {
    mapRef.current?.searchAt(center);
    if (currentArea) {
      refetchNearbyPlaces();
    }
  };

  const handleMarkerPress = (restaurantId: number) => {
    const restaurant = restaurants.find(item => item.id === restaurantId);
    setSelectedId(restaurantId);
    if (restaurant) {
      openDetail(restaurant.id, restaurant.name);
    }
  };

  // 등록된 맛집 선택 → 지도 이동 + 바로 상세(메뉴)로
  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setCenter({latitude: restaurant.latitude, longitude: restaurant.longitude});
    mapRef.current?.moveTo(restaurant);
    openDetail(restaurant.id, restaurant.name);
  };

  // 네이버 검색 장소 선택 → 식당 확정(get-or-create) → 바로 상세(메뉴)로
  const handleSelectPlace = (place: NaverPlace) => {
    setCenter({latitude: place.latitude, longitude: place.longitude});
    mapRef.current?.moveTo(place);
    resolveRestaurant.mutate(
      {
        name: place.name,
        latitude: place.latitude,
        longitude: place.longitude,
        address: place.roadAddress || place.address,
      },
      {
        onSuccess: restaurant => openDetail(restaurant.id, restaurant.name),
      },
    );
  };

  return (
    <>
      <NaverMapWebView
        ref={mapRef}
        initialCenter={initialCenterRef.current}
        restaurants={restaurants}
        places={nearbyPlaces}
        selectedId={selectedId}
        onRegionChange={setCenter}
        onSelectRestaurant={handleMarkerPress}
        onSelectPlace={handleSelectPlace}
        onAreaChange={setCurrentArea}
        onMapClick={() => setSelectedId(null)}
      />

      <RestaurantSearchBar
        origin={center}
        onOpenDrawer={() => navigation.openDrawer()}
        onSelectRestaurant={handleSelectRestaurant}
        onSelectPlace={handleSelectPlace}
        country={country}
      />

      <Pressable
        accessibilityRole="button"
        style={[styles.areaSearchButton, {top: (inset.top || 12) + 68}]}
        disabled={isSearchingArea}
        onPress={handleSearchThisArea}>
        {isSearchingArea ? (
          <ActivityIndicator size="small" color={colors.PINK_700} />
        ) : (
          <Text style={styles.areaSearchIcon}>↻</Text>
        )}
        <Text style={styles.areaSearchText}>
          {isSearchingArea ? t('map.searchingArea') : t('map.searchThisArea')}
        </Text>
      </Pressable>

      {isLocating && (
        <View style={styles.locatingBanner}>
          <ActivityIndicator size="small" color={colors.WHITE} />
          <Text style={styles.locatingText}>{t('map.findingLocation')}</Text>
        </View>
      )}

      <View style={styles.buttonList}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('map.myLocation')}
          hitSlop={8}
          style={styles.mapButton}
          onPress={handlePressUserLocation}>
          <Text style={styles.locationIcon}>⌖</Text>
        </Pressable>
      </View>

      {selectedRestaurant && (
        <View style={[styles.previewContainer, {paddingBottom: inset.bottom}]}>
          <RestaurantPreview
            restaurant={selectedRestaurant}
            country={country}
            onPressDetail={restaurant =>
              openDetail(restaurant.id, restaurant.name)
            }
          />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  buttonList: {
    position: 'absolute',
    bottom: 30,
    right: 15,
    gap: 10,
  },
  mapButton: {
    backgroundColor: colors.PINK_700,
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    shadowColor: colors.BLACK,
    shadowOffset: {width: 1, height: 2},
    shadowOpacity: 0.5,
    elevation: 2,
  },
  locationIcon: {
    color: colors.WHITE,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 34,
  },
  areaSearchButton: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: colors.WHITE,
    shadowColor: colors.BLACK,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    elevation: 3,
  },
  areaSearchIcon: {
    color: colors.PINK_700,
    fontSize: 20,
    fontWeight: '700',
  },
  areaSearchText: {
    color: colors.GRAY_700,
    fontSize: 14,
    fontWeight: '700',
  },
  locatingBanner: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.PINK_700,
  },
  locatingText: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  previewContainer: {
    position: 'absolute',
    left: 15,
    right: 15,
    bottom: 90,
  },
});

export default MapHomeScreen;
