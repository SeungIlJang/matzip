import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import StarRating from './StarRating';
import {colors} from '@/constants';
import type {MenuWithStats} from '@/types/domain';
import type {FilterMode} from './CountryFilterToggle';

interface MenuRankItemProps {
  menu: MenuWithStats;
  mode: FilterMode;
  rank: number;
  onPress?: () => void;
  onVote?: (vote: 'like' | 'dislike') => void;
  voting?: boolean;
}

/** 메뉴 랭킹 아이템. 활성 기준(전체/내 나라)의 평점·추천수 표시. */
function MenuRankItem({
  menu,
  mode,
  rank,
  onPress,
  onVote,
  voting = false,
}: MenuRankItemProps) {
  const {t} = useTranslation();
  const avgScore =
    mode === 'country' ? menu.countryAvgScore : menu.totalAvgScore;
  const count = mode === 'country' ? menu.countryCount : menu.totalCount;
  const isCountryPick = mode === 'country' && menu.countryCount > 0;

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{rank}</Text>
      </View>

      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {menu.name}
          </Text>
          {isCountryPick && (
            <View style={styles.pickBadge}>
              <Text style={styles.pickBadgeText}>
                {t('restaurant.countryPick')}
              </Text>
            </View>
          )}
        </View>

        {menu.price != null && (
          <Text style={styles.price}>{menu.price.toLocaleString()}원</Text>
        )}
        {menu.source !== 'user' && (
          <Text style={styles.source}>
            {menu.source === 'tour-api'
              ? '관광공사 메뉴'
              : menu.source === 'seoul-good-price'
              ? '서울시 착한가격 메뉴'
              : menu.source === 'good-price'
              ? '착한가격 메뉴'
              : '연동 메뉴'}
          </Text>
        )}

        <View style={styles.statRow}>
          {count > 0 ? (
            <>
              <StarRating score={avgScore} size={14} />
              <Text style={styles.stat}>
                {avgScore.toFixed(1)} · 추천 {count}
              </Text>
            </>
          ) : (
            <Text style={styles.noStat}>
              {mode === 'country' ? t('menu.noCountryStat') : t('menu.noStat')}
            </Text>
          )}
        </View>
        <View style={styles.voteRow}>
          <Pressable
            disabled={voting}
            style={[
              styles.voteButton,
              menu.myVote === 'like' && styles.voteButtonActive,
            ]}
            onPress={event => {
              event.stopPropagation();
              onVote?.('like');
            }}>
            <Text style={styles.voteText}>👍 {menu.likeCount}</Text>
          </Pressable>
          <Pressable
            disabled={voting}
            style={[
              styles.voteButton,
              menu.myVote === 'dislike' && styles.voteButtonActive,
            ]}
            onPress={event => {
              event.stopPropagation();
              onVote?.('dislike');
            }}>
            <Text style={styles.voteText}>👎 {menu.dislikeCount}</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 12,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.PINK_700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: colors.WHITE,
    fontWeight: '700',
    fontSize: 14,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BLACK,
    flexShrink: 1,
  },
  pickBadge: {
    backgroundColor: colors.RED_300,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pickBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.PINK_700,
  },
  price: {
    fontSize: 13,
    color: colors.GRAY_700,
  },
  source: {
    fontSize: 11,
    color: colors.GRAY_500,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stat: {
    fontSize: 13,
    color: colors.GRAY_700,
  },
  noStat: {
    fontSize: 13,
    color: colors.GRAY_500,
  },
  voteRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  voteButton: {
    borderWidth: 1,
    borderColor: colors.GRAY_200,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  voteButtonActive: {
    borderColor: colors.PINK_700,
    backgroundColor: colors.RED_300,
  },
  voteText: {
    color: colors.GRAY_700,
    fontSize: 13,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 22,
    color: colors.GRAY_500,
  },
});

export default MenuRankItem;
