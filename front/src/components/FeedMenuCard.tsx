import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import StarRating from './StarRating';
import {getImageUri} from '@/api/image';
import {colors} from '@/constants';
import type {FeedItem} from '@/types/domain';

interface FeedMenuCardProps {
  item: FeedItem;
  rank?: number;
  onPress?: () => void;
}

/** 피드의 트렌딩 메뉴 카드. */
function FeedMenuCard({item, rank, onPress}: FeedMenuCardProps) {
  const {t} = useTranslation();
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.thumbnail}>
        {item.menuImageUri ? (
          <Image
            source={{uri: getImageUri(item.menuImageUri)}}
            style={styles.image}
          />
        ) : (
          <Text style={styles.thumbnailPlaceholder}>🍽️</Text>
        )}
        {rank != null && (
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>{rank}</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.menuName} numberOfLines={1}>
          {item.menuName}
        </Text>
        <Text style={styles.restaurantName} numberOfLines={1}>
          {item.restaurantName}
        </Text>
        <View style={styles.statRow}>
          <StarRating score={item.avgScore} size={13} />
          <Text style={styles.stat}>
            {item.avgScore.toFixed(1)} ·{' '}
            {t('feed.recommendCount', {count: item.count})}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: colors.GRAY_200,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    fontSize: 28,
  },
  rankBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: colors.PINK_700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: colors.WHITE,
    fontSize: 12,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  menuName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.BLACK,
  },
  restaurantName: {
    fontSize: 13,
    color: colors.GRAY_700,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stat: {
    fontSize: 12,
    color: colors.GRAY_700,
  },
});

export default FeedMenuCard;
