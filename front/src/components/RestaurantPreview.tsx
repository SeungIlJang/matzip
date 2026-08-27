import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import {colors} from '@/constants';
import type {RestaurantMarker} from '@/types/domain';
import formatLocalizedName from '@/utils/localizedName';

interface RestaurantPreviewProps {
  restaurant: RestaurantMarker;
  country?: string | null;
  onPressDetail?: (restaurant: RestaurantMarker) => void;
}

/** 지도에서 마커를 탭하면 뜨는 하단 미리보기 카드. */
function RestaurantPreview({
  restaurant,
  country,
  onPressDetail,
}: RestaurantPreviewProps) {
  const {t} = useTranslation();
  return (
    <Pressable
      style={styles.container}
      onPress={() => onPressDetail?.(restaurant)}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {formatLocalizedName(restaurant, country)}
        </Text>
        <Text style={styles.meta}>
          {t('feed.recommendCount', {count: restaurant.recommendationCount})}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: colors.BLACK,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.BLACK,
  },
  meta: {
    fontSize: 13,
    color: colors.GRAY_700,
  },
  chevron: {
    fontSize: 24,
    color: colors.GRAY_500,
    marginLeft: 8,
  },
});

export default RestaurantPreview;
