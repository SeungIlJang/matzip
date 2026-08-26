import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
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

type Navigation = CompositeNavigationProp<
  StackNavigationProp<MapStackParamList>,
  DrawerNavigationProp<MainDrawerParamList>
>;

const QUERY_DELTA = 0.15;

function MapHomeScreen() {
  const {t} = useTranslation();
  const inset = useSafeAreaInsets();
  const navigation = useNavigation<Navigation>();
  const {userLocation} = useUserLocation();
  const mapRef = useRef<NaverMapWebViewHandle | null>(null);
  const initialCenterRef = useRef<LatLng>(userLocation);
  const [center, setCenter] = useState<LatLng>(userLocation);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [currentArea, setCurrentArea] = useState('');
  const resolveRestaurant = useResolveRestaurant();

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
  const {data: nearbyPlaces = []} = useSearchPlaces(
    currentArea ? `${currentArea} 맛집` : '',
  );
  const selectedRestaurant =
    restaurants.find(restaurant => restaurant.id === selectedId) ?? null;

  const openDetail = (restaurantId: number, restaurantName: string) => {
    navigation.navigate(mapNavigations.RESTAURANT_DETAIL, {
      restaurantId,
      restaurantName,
    });
  };

  const handlePressUserLocation = () => {
    setCenter(userLocation);
    mapRef.current?.moveTo(userLocation);
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
      />

      <View style={styles.buttonList}>
        <Pressable style={styles.mapButton} onPress={handlePressUserLocation}>
          <Text style={styles.mapButtonText}>{t('map.myLocation')}</Text>
        </Pressable>
      </View>

      {selectedRestaurant && (
        <View style={[styles.previewContainer, {paddingBottom: inset.bottom}]}>
          <RestaurantPreview
            restaurant={selectedRestaurant}
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
  mapButtonText: {
    color: colors.WHITE,
    fontSize: 11,
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
