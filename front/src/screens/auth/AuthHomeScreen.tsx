import React from 'react';
import {StackScreenProps} from '@react-navigation/stack';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import {AuthStackParamList} from '@/navigations/stack/AuthStackNavigator';
import CustomButton from '@/components/CustomButton';
import useAuth from '@/hooks/queries/useAuth';
import {kakaoLoginFlow, googleLoginFlow} from '@/utils/socialLogin';
import {authNavigations, colors} from '@/constants';

type AuthHomeScreenProps = StackScreenProps<
  AuthStackParamList,
  typeof authNavigations.AUTH_HOME
>;

function AuthHomeScreen({navigation}: AuthHomeScreenProps) {
  const {t} = useTranslation();
  const {kakaoLoginMutation, googleLoginMutation} = useAuth();

  const handleKakao = () =>
    kakaoLoginFlow(token => kakaoLoginMutation.mutate(token));
  const handleGoogle = () =>
    googleLoginFlow(idToken => googleLoginMutation.mutate(idToken));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.imageContainer}>
        <Text style={styles.brand}>각자의입맛</Text>
        <Text style={styles.tagline}>
          Korean food picks from people like you
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <CustomButton
          label={t('auth.login')}
          onPress={() => navigation.navigate(authNavigations.LOGIN)}
        />
        <CustomButton
          label={t('auth.signup')}
          variant="outlined"
          onPress={() => navigation.navigate(authNavigations.SIGNUP)}
        />
        <Text style={styles.divider}>{t('auth.orContinueWith')}</Text>
        <CustomButton label={t('social.kakao')} onPress={handleKakao} />
        <CustomButton
          label={t('social.google')}
          variant="outlined"
          onPress={handleGoogle}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 30,
    marginVertical: 30,
  },
  imageContainer: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    color: colors.PINK_700,
    fontSize: 38,
    fontWeight: '800',
  },
  tagline: {
    color: colors.GRAY_700,
    fontSize: 14,
    marginTop: 10,
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  divider: {
    color: colors.GRAY_500,
    fontSize: 13,
    marginVertical: 4,
  },
});

export default AuthHomeScreen;
