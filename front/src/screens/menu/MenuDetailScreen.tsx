import React, {useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';

import CustomButton from '@/components/CustomButton';
import CountryFilterToggle, {
  FilterMode,
} from '@/components/CountryFilterToggle';
import RecommendationCard from '@/components/RecommendationCard';
import useGetRecommendations from '@/hooks/queries/useGetRecommendations';
import useAuth from '@/hooks/queries/useAuth';
import {colors, mapNavigations} from '@/constants';
import type {MapStackParamList} from '@/navigations/stack/MapStackNavigator';

type Props = StackScreenProps<
  MapStackParamList,
  typeof mapNavigations.MENU_DETAIL
>;

function MenuDetailScreen({route, navigation}: Props) {
  const {t} = useTranslation();
  const {menuId, menuName} = route.params;
  const {getProfileQuery} = useAuth();
  const country = getProfileQuery.data?.country ?? null;
  const [mode, setMode] = useState<FilterMode>(country ? 'country' : 'all');

  const {data: recommendations = [], isPending} = useGetRecommendations(
    menuId,
    mode === 'country' && country ? country : undefined,
  );

  const inset = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={recommendations}
        keyExtractor={item => String(item.id)}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.name}>{menuName}</Text>
            <CountryFilterToggle
              mode={mode}
              countryCode={country}
              onChange={setMode}
            />
          </View>
        }
        renderItem={({item}) => <RecommendationCard recommendation={item} />}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        ListEmptyComponent={
          isPending ? (
            <ActivityIndicator style={styles.loading} color={colors.PINK_700} />
          ) : (
            <Text style={styles.empty}>
              {mode === 'country'
                ? t('menu.noCountryRecommendations')
                : t('menu.noRecommendations')}
            </Text>
          )
        }
      />

      <View style={[styles.footer, {paddingBottom: inset.bottom || 16}]}>
        <CustomButton
          label={t('menu.recommend')}
          onPress={() =>
            navigation.navigate(mapNavigations.ADD_RECOMMENDATION, {
              menuId,
              menuName,
            })
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    gap: 12,
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.BLACK,
  },
  gap: {
    height: 12,
  },
  loading: {
    marginTop: 40,
  },
  empty: {
    marginTop: 40,
    textAlign: 'center',
    color: colors.GRAY_500,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.GRAY_200,
    backgroundColor: colors.WHITE,
  },
});

export default MenuDetailScreen;
