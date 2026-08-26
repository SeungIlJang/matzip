import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {CompositeNavigationProp, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {useTranslation} from 'react-i18next';

import useGetInfiniteFavorites from '@/hooks/queries/useGetInfiniteFavorites';
import {colors, mainNavigations, mapNavigations} from '@/constants';
import type {FeedStackParamList} from '@/navigations/stack/FeedStackNavigator';
import type {MainDrawerParamList} from '@/navigations/drawer/MainDrawerNavigator';

type Navigation = CompositeNavigationProp<
  StackNavigationProp<FeedStackParamList>,
  DrawerNavigationProp<MainDrawerParamList>
>;

function FeedFavoriteScreen() {
  const {t} = useTranslation();
  const navigation = useNavigation<Navigation>();
  const {data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending} =
    useGetInfiniteFavorites();
  const favorites = data?.pages.flat() ?? [];

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.PINK_700} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={favorites}
      keyExtractor={item => String(item.id)}
      renderItem={({item}) => (
        <Pressable
          style={styles.item}
          onPress={() =>
            navigation.navigate(mainNavigations.HOME, {
              screen: mapNavigations.RESTAURANT_DETAIL,
              params: {restaurantId: item.id, restaurantName: item.name},
            })
          }>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            {Boolean(item.address) && (
              <Text style={styles.address} numberOfLines={1}>
                {item.address}
              </Text>
            )}
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator style={styles.loading} color={colors.PINK_700} />
        ) : null
      }
      ListEmptyComponent={
        <Text style={styles.empty}>{t('favorite.empty')}</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  content: {
    padding: 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.WHITE,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BLACK,
  },
  address: {
    fontSize: 13,
    color: colors.GRAY_700,
  },
  chevron: {
    fontSize: 22,
    color: colors.GRAY_500,
  },
  separator: {
    height: 1,
    backgroundColor: colors.GRAY_200,
  },
  loading: {
    marginVertical: 16,
  },
  empty: {
    marginTop: 60,
    textAlign: 'center',
    color: colors.GRAY_500,
    lineHeight: 22,
  },
});

export default FeedFavoriteScreen;
