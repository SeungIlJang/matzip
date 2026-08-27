import React, {useLayoutEffect} from 'react';
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

import FeedMenuCard from '@/components/FeedMenuCard';
import useGetInfiniteFeed from '@/hooks/queries/useGetInfiniteFeed';
import useAuth from '@/hooks/queries/useAuth';
import {
  colors,
  feedNavigations,
  getCountry,
  mainNavigations,
  mapNavigations,
} from '@/constants';
import type {FeedStackParamList} from '@/navigations/stack/FeedStackNavigator';
import type {MainDrawerParamList} from '@/navigations/drawer/MainDrawerNavigator';

type Navigation = CompositeNavigationProp<
  StackNavigationProp<FeedStackParamList>,
  DrawerNavigationProp<MainDrawerParamList>
>;

function FeedHomeScreen() {
  const {t} = useTranslation();
  const navigation = useNavigation<Navigation>();
  const {getProfileQuery} = useAuth();
  const country = getCountry(getProfileQuery.data?.country);

  const {data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending} =
    useGetInfiniteFeed();
  const feed = data?.pages.flat() ?? [];

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          style={styles.headerButton}
          onPress={() => navigation.openDrawer()}>
          <Text style={styles.headerButtonText}>☰</Text>
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          style={styles.headerButton}
          onPress={() => navigation.navigate(feedNavigations.FEED_FAVORITE)}>
          <Text style={styles.headerButtonText}>♡</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

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
      data={feed}
      keyExtractor={item => String(item.menuId)}
      ListHeaderComponent={
        <Text style={styles.title}>
          {country
            ? t('feed.title', {flag: country.flag, country: country.name})
            : t('feed.titleGeneric')}
        </Text>
      }
      renderItem={({item, index}) => (
        <FeedMenuCard
          item={item}
          rank={index + 1}
          country={country?.code}
          onPress={() =>
            navigation.navigate(mainNavigations.HOME, {
              screen: mapNavigations.RESTAURANT_DETAIL,
              params: {
                restaurantId: item.restaurantId,
                restaurantName: item.restaurantName,
              },
            })
          }
        />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator style={styles.footer} color={colors.PINK_700} />
        ) : null
      }
      ListEmptyComponent={<Text style={styles.empty}>{t('feed.empty')}</Text>}
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
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.WHITE,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.BLACK,
    marginBottom: 12,
    lineHeight: 30,
  },
  separator: {
    height: 1,
    backgroundColor: colors.GRAY_200,
  },
  footer: {
    marginVertical: 16,
  },
  empty: {
    marginTop: 60,
    textAlign: 'center',
    color: colors.GRAY_500,
    lineHeight: 22,
  },
  headerButton: {
    paddingHorizontal: 16,
  },
  headerButtonText: {
    fontSize: 20,
    color: colors.BLACK,
  },
});

export default FeedHomeScreen;
