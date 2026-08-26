import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigatorScreenParams} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';

import CalendarHomeScreen from '@/screens/calendar/CalendarHomeScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import MapStackNavigator, {MapStackParamList} from '../stack/MapStackNavigator';
import FeedStackNavigator, {
  FeedStackParamList,
} from '../stack/FeedStackNavigator';
import CustomDrawerContent from './CustomDrawerContent';
import {colors, mainNavigations} from '@/constants';

export type MainDrawerParamList = {
  [mainNavigations.HOME]: NavigatorScreenParams<MapStackParamList>;
  [mainNavigations.FEED]: NavigatorScreenParams<FeedStackParamList>;
  [mainNavigations.CALENDAR]: undefined;
  [mainNavigations.PROFILE]: undefined;
};

const Drawer = createDrawerNavigator<MainDrawerParamList>();

function MainDrawerNavigator() {
  const {t} = useTranslation();

  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerActiveTintColor: colors.PINK_700,
      }}>
      <Drawer.Screen
        name={mainNavigations.HOME}
        component={MapStackNavigator}
        options={{
          title: t('drawer.home'),
        }}
      />
      <Drawer.Screen
        name={mainNavigations.FEED}
        component={FeedStackNavigator}
        options={{
          title: t('drawer.feed'),
        }}
      />
      <Drawer.Screen
        name={mainNavigations.CALENDAR}
        component={CalendarHomeScreen}
        options={{
          title: t('drawer.calendar'),
        }}
      />
      <Drawer.Screen
        name={mainNavigations.PROFILE}
        component={ProfileScreen}
        options={{
          title: t('profile.title'),
          headerShown: true,
          drawerItemStyle: {display: 'none'},
        }}
      />
    </Drawer.Navigator>
  );
}

export default MainDrawerNavigator;
