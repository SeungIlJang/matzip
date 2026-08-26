import React, {useState} from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';

import InputField from '@/components/InputField';
import CustomButton from '@/components/CustomButton';
import CountryPicker from '@/components/CountryPicker';
import useAuth from '@/hooks/queries/useAuth';
import i18n, {languages} from '@/i18n';
import {colors, getCountry} from '@/constants';
import type {Country} from '@/types/domain';

function ProfileScreen() {
  const {t} = useTranslation();
  const {getProfileQuery, editProfileMutation} = useAuth();
  const profile = getProfileQuery.data;

  const [nickname, setNickname] = useState(profile?.nickname ?? '');
  const [country, setCountry] = useState<Country | null>(
    getCountry(profile?.country) ?? null,
  );
  const [language, setLanguage] = useState(profile?.language ?? i18n.language);
  const [pickerVisible, setPickerVisible] = useState(false);

  const handleSave = () => {
    editProfileMutation.mutate({
      nickname: nickname.trim() || (profile?.nickname ?? ''),
      country: country?.code,
      language,
    });
    i18n.changeLanguage(language);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Text style={styles.label}>{t('profile.nickname')}</Text>
          <InputField
            placeholder={t('profile.nickname')}
            value={nickname}
            onChangeText={setNickname}
          />
        </View>

        <View>
          <Text style={styles.label}>{t('profile.country')}</Text>
          <Pressable
            style={styles.selector}
            onPress={() => setPickerVisible(true)}>
            <Text style={styles.selectorText}>
              {country
                ? `${country.flag} ${country.name}`
                : t('auth.selectCountry')}
            </Text>
          </Pressable>
        </View>

        <View>
          <Text style={styles.label}>{t('profile.language')}</Text>
          <View style={styles.languageRow}>
            {languages.map(lang => {
              const active = language === lang.code;
              return (
                <Pressable
                  key={lang.code}
                  style={[styles.langButton, active && styles.langButtonActive]}
                  onPress={() => setLanguage(lang.code)}>
                  <Text
                    style={[styles.langText, active && styles.langTextActive]}>
                    {lang.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton label={t('common.save')} onPress={handleSave} />
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
    backgroundColor: colors.WHITE,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  label: {
    marginBottom: 8,
    color: colors.GRAY_700,
    fontSize: 13,
  },
  selector: {
    borderWidth: 1,
    borderColor: colors.GRAY_200,
    borderRadius: 5,
    padding: 14,
  },
  selectorText: {
    fontSize: 16,
    color: colors.BLACK,
  },
  languageRow: {
    flexDirection: 'row',
    gap: 10,
  },
  langButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.GRAY_200,
    alignItems: 'center',
  },
  langButtonActive: {
    borderColor: colors.PINK_700,
    backgroundColor: colors.RED_300,
  },
  langText: {
    fontSize: 15,
    color: colors.GRAY_700,
  },
  langTextActive: {
    color: colors.PINK_700,
    fontWeight: '700',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.GRAY_200,
  },
});

export default ProfileScreen;
