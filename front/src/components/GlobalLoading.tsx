import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {useIsMutating} from '@tanstack/react-query';

import {colors} from '@/constants';

/** 사용자 액션(뮤테이션) 진행 중 전역 로딩 오버레이. */
function GlobalLoading() {
  const isMutating = useIsMutating();

  if (isMutating === 0) {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <ActivityIndicator size="large" color={colors.WHITE} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
});

export default GlobalLoading;
