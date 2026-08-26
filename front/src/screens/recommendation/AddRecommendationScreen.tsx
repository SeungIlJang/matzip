import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {useTranslation} from 'react-i18next';

import CustomButton from '@/components/CustomButton';
import StarRating from '@/components/StarRating';
import ImageInput from '@/components/ImageInput';
import PreviewImageList from '@/components/PreviewImageList';
import useMutateRecommendation from '@/hooks/queries/useMutateRecommendation';
import useImagePicker from '@/hooks/useImagePicker';
import {colors, mapNavigations} from '@/constants';
import type {MapStackParamList} from '@/navigations/stack/MapStackNavigator';

type Props = StackScreenProps<
  MapStackParamList,
  typeof mapNavigations.ADD_RECOMMENDATION
>;

function AddRecommendationScreen({route, navigation}: Props) {
  const {t} = useTranslation();
  const {menuId, menuName} = route.params;
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const imagePicker = useImagePicker();
  const {createRecommendationMutation} = useMutateRecommendation();

  const handleSubmit = () => {
    createRecommendationMutation.mutate(
      {menuId, score, comment, imageUris: imagePicker.imageUris},
      {onSuccess: () => navigation.goBack()},
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.menuName}>{menuName}</Text>

        <View style={styles.section}>
          <Text style={styles.label}>{t('recommendation.scoreQuestion')}</Text>
          <StarRating score={score} size={36} editable onChange={setScore} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t('recommendation.comment')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('recommendation.commentPlaceholder')}
            placeholderTextColor={colors.GRAY_500}
            value={comment}
            onChangeText={setComment}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t('recommendation.photo')}</Text>
          <View style={styles.imageRow}>
            <ImageInput
              count={imagePicker.imageUris.length}
              onChange={imagePicker.handleChange}
            />
            <PreviewImageList
              imageUris={imagePicker.imageUris}
              onDelete={imagePicker.deleteImage}
              isUploading={imagePicker.isUploading}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          label={t('recommendation.submit')}
          inValid={score < 1}
          onPress={handleSubmit}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  content: {
    padding: 20,
    gap: 28,
  },
  menuName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.BLACK,
  },
  section: {
    gap: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.GRAY_700,
  },
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.GRAY_200,
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: colors.BLACK,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.GRAY_200,
  },
});

export default AddRecommendationScreen;
