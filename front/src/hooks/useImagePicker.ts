import {useState} from 'react';
import {Alert} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import i18n from '@/i18n';

import useMutateImages from './queries/useMutateImages';
import {numbers} from '@/constants';

interface UseImagePickerProps {
  initialImages?: {uri: string}[];
}

/**
 * 갤러리에서 사진을 골라 서버에 업로드하고, 반환된 파일명을 상태로 관리.
 * imageUris: 업로드된 서버 파일명 목록 (추천/메뉴 저장 시 그대로 전송).
 */
function useImagePicker({initialImages = []}: UseImagePickerProps = {}) {
  const [imageUris, setImageUris] = useState<{uri: string}[]>(initialImages);
  const uploadImages = useMutateImages();

  const handleChange = () => {
    const remaining = numbers.MAX_IMAGE_COUNT - imageUris.length;
    if (remaining <= 0) {
      Alert.alert(
        i18n.t('photo.maxTitle'),
        i18n.t('photo.maxMessage', {max: numbers.MAX_IMAGE_COUNT}),
      );
      return;
    }

    ImagePicker.openPicker({
      mediaType: 'photo',
      multiple: true,
      includeExif: true,
      maxFiles: remaining,
      cropperChooseText: '완료',
      cropperCancelText: '취소',
    })
      .then(images => {
        const formData = new FormData();
        images.forEach(image => {
          formData.append('images', {
            uri: image.path,
            type: image.mime,
            name: image.path.split('/').pop() ?? 'image.jpg',
          } as unknown as Blob);
        });

        uploadImages.mutate(formData, {
          onSuccess: filenames =>
            setImageUris(prev => [...prev, ...filenames.map(uri => ({uri}))]),
          // 실패 안내는 전역 mutationCache onError 에서 처리
        });
      })
      .catch(() => {
        // 사용자가 선택을 취소한 경우 무시
      });
  };

  const deleteImage = (uri: string) => {
    setImageUris(prev => prev.filter(image => image.uri !== uri));
  };

  return {
    imageUris,
    handleChange,
    deleteImage,
    isUploading: uploadImages.isPending,
  };
}

export default useImagePicker;
