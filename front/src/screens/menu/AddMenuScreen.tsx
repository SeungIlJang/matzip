import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {useTranslation} from 'react-i18next';

import InputField from '@/components/InputField';
import CustomButton from '@/components/CustomButton';
import ImageInput from '@/components/ImageInput';
import PreviewImageList from '@/components/PreviewImageList';
import useMutateMenu from '@/hooks/queries/useMutateMenu';
import useImagePicker from '@/hooks/useImagePicker';
import {colors, mapNavigations} from '@/constants';
import type {MapStackParamList} from '@/navigations/stack/MapStackNavigator';

type Props = StackScreenProps<
  MapStackParamList,
  typeof mapNavigations.ADD_MENU
>;

function AddMenuScreen({route, navigation}: Props) {
  const {t} = useTranslation();
  const {restaurantId} = route.params;
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const imagePicker = useImagePicker();
  const menuMutation = useMutateMenu();

  const handleSubmit = () => {
    const parsedPrice = Number(price.replace(/[^0-9]/g, ''));
    menuMutation.mutate(
      {
        restaurantId,
        name,
        price: parsedPrice > 0 ? parsedPrice : undefined,
        imageUri: imagePicker.imageUris[0]?.uri,
      },
      {onSuccess: () => navigation.goBack()},
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <InputField
          placeholder={t('menu.name')}
          value={name}
          onChangeText={setName}
          autoFocus
        />
        <InputField
          placeholder={t('menu.price')}
          value={price}
          onChangeText={setPrice}
          inputMode="numeric"
        />

        <View style={styles.section}>
          <Text style={styles.label}>{t('menu.photo')}</Text>
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
          label={t('menu.register')}
          inValid={name.trim().length === 0}
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
    gap: 20,
  },
  section: {
    gap: 10,
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
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.GRAY_200,
  },
});

export default AddMenuScreen;
