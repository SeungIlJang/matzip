import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import {colors, getCountry} from '@/constants';

export type FilterMode = 'all' | 'country';

interface CountryFilterToggleProps {
  mode: FilterMode;
  countryCode?: string | null;
  onChange: (mode: FilterMode) => void;
}

/** "🌍 전체 / 🇺🇸 내 나라" 세그먼트 토글. 국적 미설정이면 내 나라 비활성. */
function CountryFilterToggle({
  mode,
  countryCode,
  onChange,
}: CountryFilterToggleProps) {
  const {t} = useTranslation();
  const country = getCountry(countryCode);
  const countryDisabled = !country;

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.segment, mode === 'all' && styles.segmentActive]}
        onPress={() => onChange('all')}>
        <Text style={[styles.label, mode === 'all' && styles.labelActive]}>
          {t('filter.all')}
        </Text>
      </Pressable>
      <Pressable
        style={[
          styles.segment,
          mode === 'country' && styles.segmentActive,
          countryDisabled && styles.segmentDisabled,
        ]}
        disabled={countryDisabled}
        onPress={() => onChange('country')}>
        <Text style={[styles.label, mode === 'country' && styles.labelActive]}>
          {country
            ? `${country.flag} ${t('filter.myCountry')}`
            : t('filter.myCountry')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.GRAY_200,
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: colors.WHITE,
    shadowColor: colors.BLACK,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentDisabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: 14,
    color: colors.GRAY_700,
    fontWeight: '600',
  },
  labelActive: {
    color: colors.PINK_700,
  },
});

export default CountryFilterToggle;
