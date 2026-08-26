import React, {useState} from 'react';
import {StackScreenProps} from '@react-navigation/stack';
import {Alert, Pressable, SafeAreaView, StyleSheet, Text, View} from 'react-native';

import {AuthStackParamList} from '@/navigations/stack/AuthStackNavigator';
import CustomButton from '@/components/CustomButton';
import CountryPicker from '@/components/CountryPicker';
import useAuth from '@/hooks/queries/useAuth';
import {authNavigations, colors, storageKeys} from '@/constants';
import {getEncryptStorage, setEncryptStorage} from '@/utils';
import type {Country} from '@/types/domain';

type AuthHomeScreenProps = StackScreenProps<
  AuthStackParamList,
  typeof authNavigations.AUTH_HOME
>;

function createDeviceId() {
  const random = () => Math.floor(Math.random() * 0xffffffff)
    .toString(16)
    .padStart(8, '0');
  return `${Date.now().toString(16)}-${random()}-${random()}-${random()}`;
}

function AuthHomeScreen(_: AuthHomeScreenProps) {
  const {deviceLoginMutation} = useAuth();
  const [country, setCountry] = useState<Country | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const handleStart = async () => {
    if (!country) {
      return;
    }

    let deviceId = await getEncryptStorage(storageKeys.DEVICE_ID);
    if (!deviceId) {
      deviceId = createDeviceId();
      await setEncryptStorage(storageKeys.DEVICE_ID, deviceId);
    }

    deviceLoginMutation.mutate(
      {deviceId, country: country.code},
      {
        onError: () =>
          Alert.alert(
            'Connection failed',
            'Check that Tailscale is connected and try again.',
          ),
      },
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.imageContainer}>
        <Text style={styles.brand}>각자의입맛</Text>
        <Text style={styles.tagline}>
          Korean food picks from people like you
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <Text style={styles.guide}>Choose your country to see tastes from people like you.</Text>
        <Pressable
          style={styles.countrySelector}
          onPress={() => setPickerVisible(true)}>
          <Text style={country ? styles.countryText : styles.countryPlaceholder}>
            {country ? `${country.flag} ${country.name}` : 'Select your country'}
          </Text>
        </Pressable>
        <CustomButton
          label={deviceLoginMutation.isPending ? 'Starting…' : 'Start'}
          inValid={!country || deviceLoginMutation.isPending}
          onPress={handleStart}
        />
      </View>
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
    flex: 1.2,
    alignSelf: 'stretch',
    gap: 10,
  },
  guide: {
    color: colors.GRAY_700,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  countrySelector: {
    borderColor: colors.GRAY_500,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 4,
  },
  countryText: {
    color: colors.BLACK,
    fontSize: 16,
  },
  countryPlaceholder: {
    color: colors.GRAY_500,
    fontSize: 16,
  },
});

export default AuthHomeScreen;
