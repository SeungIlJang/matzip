import React, {useRef} from 'react';
import {SafeAreaView, StyleSheet, TextInput, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import InputField from '@/components/InputField';
import CustomButton from '@/components/CustomButton';
import useForm from '@/hooks/useForm';
import useAuth from '@/hooks/queries/useAuth';
import {validateLogin} from '@/utils';

function LoginScreen() {
  const {t} = useTranslation();
  const {loginMutation} = useAuth();
  const passwordRef = useRef<TextInput | null>(null);
  const login = useForm({
    initialValue: {email: '', password: ''},
    validate: validateLogin,
  });

  const handleSubmit = () => {
    loginMutation.mutate(login.values);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputContainer}>
        <InputField
          autoFocus
          placeholder={t('auth.email')}
          error={login.errors.email}
          touched={login.touched.email}
          inputMode="email"
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => passwordRef.current?.focus()}
          {...login.getTextInputProps('email')}
        />
        <InputField
          ref={passwordRef}
          placeholder={t('auth.password')}
          error={login.errors.password}
          touched={login.touched.password}
          secureTextEntry
          returnKeyType="join"
          onSubmitEditing={handleSubmit}
          {...login.getTextInputProps('password')}
        />
      </View>
      <CustomButton
        label={t('auth.login')}
        variant="filled"
        size="large"
        onPress={handleSubmit}
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
});

export default LoginScreen;
