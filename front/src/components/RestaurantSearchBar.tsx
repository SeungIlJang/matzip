import React, {useEffect, useMemo, useState} from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';

import useSearchRestaurants from '@/hooks/queries/useSearchRestaurants';
import useSearchPlaces from '@/hooks/queries/useSearchPlaces';
import useRecentSearches from '@/hooks/useRecentSearches';
import {colors} from '@/constants';
import type {LatLng} from '@/types/map';
import type {NaverPlace, Restaurant} from '@/types/domain';
import formatLocalizedName from '@/utils/localizedName';

interface RestaurantSearchBarProps {
  origin?: LatLng;
  onOpenDrawer: () => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onSelectPlace: (place: NaverPlace) => void;
  country?: string | null;
}

function haversineKm(a: LatLng, b: LatLng) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) *
      Math.cos(toRad(b.latitude)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function formatDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

function formatCategory(category: string) {
  return category.replace(/>/g, ' · ');
}

function RestaurantSearchBar({
  origin,
  onOpenDrawer,
  onSelectRestaurant,
  onSelectPlace,
  country,
}: RestaurantSearchBarProps) {
  const {t} = useTranslation();
  const inset = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [focused, setFocused] = useState(false);
  const {recent, addRecent, removeRecent, clearRecent} = useRecentSearches();

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(id);
  }, [query]);

  const {data: registeredRaw = []} = useSearchRestaurants(debounced);
  const {data: placesRaw = [], isFetching: placesFetching} =
    useSearchPlaces(debounced);

  const registered = useMemo(() => {
    if (!origin) {
      return registeredRaw;
    }
    return [...registeredRaw].sort(
      (a, b) => haversineKm(origin, a) - haversineKm(origin, b),
    );
  }, [registeredRaw, origin]);

  const places = useMemo(() => {
    if (!origin) {
      return placesRaw;
    }
    return [...placesRaw].sort(
      (a, b) => haversineKm(origin, a) - haversineKm(origin, b),
    );
  }, [placesRaw, origin]);

  const hasQuery = debounced.trim().length > 0;
  const showResults = focused && hasQuery;
  const showRecent = focused && !hasQuery && recent.length > 0;
  const isEmpty = registered.length === 0 && places.length === 0;

  const collapse = () => {
    Keyboard.dismiss();
    setFocused(false);
  };

  const handleSelectRegistered = (restaurant: Restaurant) => {
    addRecent(debounced);
    collapse();
    setQuery(formatLocalizedName(restaurant, country));
    onSelectRestaurant(restaurant);
  };

  const handleSelectPlace = (place: NaverPlace) => {
    addRecent(debounced);
    collapse();
    setQuery(place.name);
    onSelectPlace(place);
  };

  const handlePressRecent = (item: string) => {
    setQuery(item);
    setDebounced(item);
  };

  return (
    <View style={[styles.container, {top: (inset.top || 12) + 4}]}>
      <View style={styles.bar}>
        <Pressable
          hitSlop={8}
          style={styles.drawerButton}
          onPress={onOpenDrawer}>
          <Text style={styles.drawerIcon}>☰</Text>
        </Pressable>

        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder={t('search.placeholder')}
          placeholderTextColor={colors.GRAY_500}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <Pressable
            hitSlop={8}
            onPress={() => {
              setQuery('');
              setDebounced('');
            }}>
            <Text style={styles.clearIcon}>✕</Text>
          </Pressable>
        )}
      </View>

      {showRecent && (
        <View style={styles.results}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>{t('search.recent')}</Text>
            <Pressable hitSlop={8} onPress={clearRecent}>
              <Text style={styles.clearRecent}>{t('search.clearRecent')}</Text>
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">
            {recent.map(item => (
              <View key={item} style={styles.recentRow}>
                <Pressable
                  style={styles.recentText}
                  onPress={() => handlePressRecent(item)}>
                  <Text style={styles.recentIcon}>🕘</Text>
                  <Text style={styles.resultName} numberOfLines={1}>
                    {item}
                  </Text>
                </Pressable>
                <Pressable hitSlop={8} onPress={() => removeRecent(item)}>
                  <Text style={styles.clearIcon}>✕</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {showResults && (
        <View style={styles.results}>
          {isEmpty && !placesFetching ? (
            <Text style={styles.empty}>{t('search.noResults')}</Text>
          ) : (
            <ScrollView keyboardShouldPersistTaps="handled">
              {registered.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>
                    {t('search.sectionRegistered')}
                  </Text>
                  {registered.map(restaurant => (
                    <Pressable
                      key={`r-${restaurant.id}`}
                      style={styles.resultItem}
                      onPress={() => handleSelectRegistered(restaurant)}>
                      <View style={styles.resultRow}>
                        <Text style={styles.resultName} numberOfLines={1}>
                          {formatLocalizedName(restaurant, country)}
                        </Text>
                        {origin && (
                          <Text style={styles.distance}>
                            {formatDistance(haversineKm(origin, restaurant))}
                          </Text>
                        )}
                      </View>
                      {Boolean(restaurant.address) && (
                        <Text style={styles.resultSub} numberOfLines={1}>
                          {restaurant.address}
                        </Text>
                      )}
                    </Pressable>
                  ))}
                </>
              )}

              {places.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>
                    {t('search.sectionNaver')}
                  </Text>
                  {places.map((place, index) => (
                    <Pressable
                      key={`p-${index}`}
                      style={styles.resultItem}
                      onPress={() => handleSelectPlace(place)}>
                      <View style={styles.resultRow}>
                        <Text style={styles.resultName} numberOfLines={1}>
                          {place.name}
                        </Text>
                        {origin && (
                          <Text style={styles.distance}>
                            {formatDistance(haversineKm(origin, place))}
                          </Text>
                        )}
                      </View>
                      <Text style={styles.resultSub} numberOfLines={1}>
                        {place.roadAddress || place.address}
                      </Text>
                      {Boolean(place.category) && (
                        <Text style={styles.category} numberOfLines={1}>
                          {formatCategory(place.category)}
                        </Text>
                      )}
                    </Pressable>
                  ))}
                </>
              )}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
    shadowColor: colors.BLACK,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  drawerButton: {
    paddingRight: 4,
  },
  drawerIcon: {
    fontSize: 20,
    color: colors.BLACK,
  },
  searchIcon: {
    fontSize: 15,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.BLACK,
    padding: 0,
  },
  clearIcon: {
    fontSize: 15,
    color: colors.GRAY_500,
  },
  results: {
    marginTop: 8,
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    maxHeight: 380,
    paddingVertical: 4,
    shadowColor: colors.BLACK,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
    fontSize: 12,
    fontWeight: '700',
    color: colors.PINK_700,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  clearRecent: {
    fontSize: 12,
    color: colors.GRAY_500,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 11,
    gap: 8,
  },
  recentText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recentIcon: {
    fontSize: 13,
  },
  resultItem: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    gap: 3,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.BLACK,
  },
  resultSub: {
    fontSize: 13,
    color: colors.GRAY_700,
  },
  category: {
    fontSize: 12,
    color: colors.GRAY_500,
  },
  distance: {
    fontSize: 12,
    color: colors.GRAY_500,
  },
  addBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.PINK_700,
    backgroundColor: colors.RED_300,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  empty: {
    padding: 16,
    textAlign: 'center',
    color: colors.GRAY_500,
  },
});

export default RestaurantSearchBar;
