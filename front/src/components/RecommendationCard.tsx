import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import StarRating from './StarRating';
import {colors, getCountry} from '@/constants';
import type {Recommendation} from '@/types/domain';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

/** 추천 코멘트 카드. 작성자 국기 + 별점 + 코멘트. */
function RecommendationCard({recommendation}: RecommendationCardProps) {
  const {t} = useTranslation();
  const country = getCountry(recommendation.country);
  const nickname =
    recommendation.user?.nickname ?? t('recommendation.anonymous');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.author}>
          {country ? `${country.flag} ` : ''}
          {nickname}
        </Text>
        <StarRating score={recommendation.score} size={14} />
      </View>
      {Boolean(recommendation.comment) && (
        <Text style={styles.comment}>{recommendation.comment}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.WHITE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.GRAY_200,
    padding: 14,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  author: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.BLACK,
  },
  comment: {
    fontSize: 14,
    color: colors.GRAY_700,
    lineHeight: 20,
  },
});

export default RecommendationCard;
