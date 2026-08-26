import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import {useTranslation} from 'react-i18next';

import useAuth from '@/hooks/queries/useAuth';
import {colors, getCountry, mainNavigations} from '@/constants';

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const {t} = useTranslation();
  const {getProfileQuery, logoutMutation} = useAuth();
  const profile = getProfileQuery.data;
  const country = getCountry(profile?.country);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scroll}>
        <Pressable
          style={styles.profile}
          onPress={() => props.navigation.navigate(mainNavigations.PROFILE)}>
          <Text style={styles.flag}>{country?.flag ?? '🌐'}</Text>
          <View style={styles.profileInfo}>
            <Text style={styles.nickname} numberOfLines={1}>
              {profile?.nickname || profile?.email || 'Guest'}
            </Text>
            {Boolean(country) && (
              <Text style={styles.countryName}>{country?.name}</Text>
            )}
          </View>
        </Pressable>

        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.footerButton}
          onPress={() => props.navigation.navigate(mainNavigations.PROFILE)}>
          <Text style={styles.footerText}>{t('profile.edit')}</Text>
        </Pressable>
        <Pressable
          style={styles.footerButton}
          onPress={() => logoutMutation.mutate(null)}>
          <Text style={[styles.footerText, styles.logout]}>
            {t('common.logout')}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  scroll: {
    backgroundColor: colors.WHITE,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.GRAY_200,
    marginBottom: 8,
  },
  flag: {
    fontSize: 36,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  nickname: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.BLACK,
  },
  countryName: {
    fontSize: 13,
    color: colors.GRAY_700,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.GRAY_200,
    paddingVertical: 8,
  },
  footerButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 15,
    color: colors.GRAY_700,
  },
  logout: {
    color: colors.PINK_700,
    fontWeight: '600',
  },
});

export default CustomDrawerContent;
