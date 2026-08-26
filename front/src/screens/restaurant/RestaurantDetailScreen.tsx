import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {useTranslation} from 'react-i18next';

import CountryFilterToggle, {
  FilterMode,
} from '@/components/CountryFilterToggle';
import MenuRankItem from '@/components/MenuRankItem';
import CustomButton from '@/components/CustomButton';
import useGetRestaurant from '@/hooks/queries/useGetRestaurant';
import useMutateFavorite from '@/hooks/queries/useMutateFavorite';
import useAuth from '@/hooks/queries/useAuth';
import {colors, mapNavigations} from '@/constants';
import type {MapStackParamList} from '@/navigations/stack/MapStackNavigator';
import type {MenuWithStats} from '@/types/domain';

type Props = StackScreenProps<
  MapStackParamList,
  typeof mapNavigations.RESTAURANT_DETAIL
>;

function sortMenus(menus: MenuWithStats[], mode: FilterMode) {
  return [...menus].sort((a, b) => {
    if (mode === 'country') {
      return (
        b.countryAvgScore - a.countryAvgScore || b.countryCount - a.countryCount
      );
    }
    return b.totalAvgScore - a.totalAvgScore || b.totalCount - a.totalCount;
  });
}

function RestaurantDetailScreen({route, navigation}: Props) {
  const {t} = useTranslation();
  const {restaurantId} = route.params;
  const {getProfileQuery} = useAuth();
  const country = getProfileQuery.data?.country ?? null;
  const [mode, setMode] = useState<FilterMode>(country ? 'country' : 'all');

  const {data: restaurant, isPending} = useGetRestaurant(restaurantId);
  const favoriteMutation = useMutateFavorite();

  const menus = useMemo(
    () => sortMenus(restaurant?.menus ?? [], mode),
    [restaurant?.menus, mode],
  );

  if (isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.PINK_700} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={menus}
        keyExtractor={item => String(item.id)}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.name}>{restaurant?.name}</Text>
              <Pressable
                hitSlop={8}
                onPress={() => favoriteMutation.mutate(restaurantId)}>
                <Text
                  style={[
                    styles.heart,
                    restaurant?.isFavorite && styles.heartActive,
                  ]}>
                  {restaurant?.isFavorite ? '♥' : '♡'}
                </Text>
              </Pressable>
            </View>
            {Boolean(restaurant?.address) && (
              <Text style={styles.address}>{restaurant?.address}</Text>
            )}
            <Text style={styles.sectionTitle}>
              {t('restaurant.menuRanking')}
            </Text>
            <CountryFilterToggle
              mode={mode}
              countryCode={country}
              onChange={setMode}
            />
          </View>
        }
        renderItem={({item, index}) => (
          <MenuRankItem
            menu={item}
            mode={mode}
            rank={index + 1}
            onPress={() =>
              navigation.navigate(mapNavigations.MENU_DETAIL, {
                menuId: item.id,
                menuName: item.name,
              })
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={styles.empty}>{t('restaurant.noMenus')}</Text>
        }
      />

      <View style={styles.footer}>
        <CustomButton
          label={t('restaurant.addMenu')}
          variant="outlined"
          onPress={() =>
            navigation.navigate(mapNavigations.ADD_MENU, {restaurantId})
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.WHITE,
  },
  header: {
    gap: 8,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  name: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: colors.BLACK,
  },
  heart: {
    fontSize: 26,
    color: colors.GRAY_500,
  },
  heartActive: {
    color: colors.PINK_700,
  },
  address: {
    fontSize: 14,
    color: colors.GRAY_700,
  },
  sectionTitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '700',
    color: colors.BLACK,
  },
  separator: {
    height: 1,
    backgroundColor: colors.GRAY_200,
  },
  empty: {
    marginTop: 40,
    textAlign: 'center',
    color: colors.GRAY_500,
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.GRAY_200,
  },
});

export default RestaurantDetailScreen;
