import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {getImageUri} from '@/api/image';
import {colors} from '@/constants';

interface PreviewImageListProps {
  imageUris: {uri: string}[];
  onDelete?: (uri: string) => void;
  isUploading?: boolean;
}

/** 첨부된 이미지 썸네일 가로 리스트. 삭제 버튼 포함. */
function PreviewImageList({
  imageUris,
  onDelete,
  isUploading = false,
}: PreviewImageListProps) {
  if (imageUris.length === 0 && !isUploading) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {imageUris.map(({uri}) => (
        <View key={uri} style={styles.imageBox}>
          <Image source={{uri: getImageUri(uri)}} style={styles.image} />
          {onDelete && (
            <Pressable
              style={styles.deleteButton}
              hitSlop={6}
              onPress={() => onDelete(uri)}>
              <Text style={styles.deleteText}>✕</Text>
            </Pressable>
          )}
        </View>
      ))}
      {isUploading && (
        <View style={[styles.imageBox, styles.loadingBox]}>
          <ActivityIndicator color={colors.PINK_700} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingVertical: 4,
  },
  imageBox: {
    width: 72,
    height: 72,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.GRAY_200,
  },
  deleteButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: colors.WHITE,
    fontSize: 11,
    fontWeight: '700',
  },
});

export default PreviewImageList;
