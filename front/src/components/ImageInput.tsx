import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import {useTranslation} from 'react-i18next';

import {colors, numbers} from '@/constants';

interface ImageInputProps {
  count: number;
  onChange: () => void;
}

/** 사진 추가 버튼. 현재/최대 개수 표시. */
function ImageInput({count, onChange}: ImageInputProps) {
  const {t} = useTranslation();
  const disabled = count >= numbers.MAX_IMAGE_COUNT;

  return (
    <Pressable
      style={[styles.container, disabled && styles.disabled]}
      disabled={disabled}
      onPress={onChange}>
      <Text style={styles.icon}>＋</Text>
      <Text style={styles.label}>
        {t('photo.count', {current: count, max: numbers.MAX_IMAGE_COUNT})}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 72,
    height: 72,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.GRAY_200,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  disabled: {
    opacity: 0.4,
  },
  icon: {
    fontSize: 22,
    color: colors.GRAY_500,
  },
  label: {
    fontSize: 11,
    color: colors.GRAY_500,
  },
});

export default ImageInput;
