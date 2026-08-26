import React, {useRef, useState} from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {useTranslation} from 'react-i18next';

import InputField from '@/components/InputField';
import CustomButton from '@/components/CustomButton';
import CountryPicker from '@/components/CountryPicker';
import useForm from '@/hooks/useForm';
import useAuth from '@/hooks/queries/useAuth';
import {validateSignup} from '@/utils';
import {colors} from '@/constants';
import type {Country} from '@/types/domain';

function SignupScreen() {
  const {t} = useTranslation();
  const {signupMutation, loginMutation} = useAuth();
  const passwordRef = useRef<TextInput | null>(null);
  const passwordConfirmRef = useRef<TextInput | null>(null);
  const [country, setCountry] = useState<Country | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const signup = useForm({
    initialValue: {email: '', password: '', passwordConfirm: ''},
    validate: validateSignup,
  });

  const handleSubmit = () => {
    const {email, password} = signup.values;
    signupMutation.mutate(
      {email, password, country: country?.code},
      {
        onSuccess: () => loginMutation.mutate({email, password}),
      },
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputContainer}>
        <InputField
          autoFocus
          placeholder={t('auth.email')}
          error={signup.errors.email}
          touched={signup.touched.email}
          inputMode="email"
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => passwordRef.current?.focus()}
          {...signup.getTextInputProps('email')}
        />
        <InputField
          ref={passwordRef}
          placeholder={t('auth.password')}
          textContentType="oneTimeCode"
          error={signup.errors.password}
          touched={signup.touched.password}
          secureTextEntry
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => passwordConfirmRef.current?.focus()}
          {...signup.getTextInputProps('password')}
        />
        <InputField
          ref={passwordConfirmRef}
          placeholder={t('auth.passwordConfirm')}
          error={signup.errors.passwordConfirm}
          touched={signup.touched.passwordConfirm}
          secureTextEntry
          returnKeyType="join"
          onSubmitEditing={handleSubmit}
          {...signup.getTextInputProps('passwordConfirm')}
        />

        <View>
          <Text style={styles.label}>{t('auth.myCountry')}</Text>
          <Pressable
            style={styles.countrySelector}
            onPress={() => setPickerVisible(true)}>
            {country ? (
              <Text style={styles.countryText}>
                {country.flag} {country.name}
              </Text>
            ) : (
              <Text style={styles.countryPlaceholder}>
                {t('auth.selectCountry')}
              </Text>
            )}
          </Pressable>
        </View>
      </View>

      <CustomButton
        label={t('auth.signup')}
        onPress={handleSubmit}
        inValid={!country}
      />

      <CountryPicker
        visible={pickerVisible}
        selectedCode={country?.code}
        onSelect={setCountry}
        onClose={() => setPickerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 30,
  },
  inputContainer: {
    gap: 20,
    marginBottom: 30,
  },
  label: {
    marginBottom: 8,
    color: colors.GRAY_700,
    fontSize: 13,
  },
  countrySelector: {
    borderWidth: 1,
    borderColor: colors.GRAY_200,
    borderRadius: 5,
    padding: 14,
  },
  countryText: {
    fontSize: 16,
    color: colors.BLACK,
  },
  countryPlaceholder: {
    fontSize: 16,
    color: colors.GRAY_500,
  },
});

export default SignupScreen;
