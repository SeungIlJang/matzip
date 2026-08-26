import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {colors} from '@/constants';

interface StarRatingProps {
  score: number;
  size?: number;
  editable?: boolean;
  onChange?: (score: number) => void;
}

const STARS = [1, 2, 3, 4, 5];

/** 별점 표시/입력. editable=true면 탭하여 점수 선택. */
function StarRating({
  score,
  size = 18,
  editable = false,
  onChange,
}: StarRatingProps) {
  return (
    <View style={styles.row}>
      {STARS.map(value => {
        const filled = value <= Math.round(score);
        const star = (
          <Text
            style={[
              styles.star,
              {fontSize: size},
              filled ? styles.filled : styles.empty,
            ]}>
            ★
          </Text>
        );

        if (!editable) {
          return <View key={value}>{star}</View>;
        }

        return (
          <Pressable key={value} hitSlop={4} onPress={() => onChange?.(value)}>
            {star}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  star: {
    lineHeight: undefined,
  },
  filled: {
    color: colors.PINK_700,
  },
  empty: {
    color: colors.GRAY_200,
  },
});

export default StarRating;
