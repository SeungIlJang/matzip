import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import MapHomeScreen from '@/screens/map/MapHomeScreen';
import RestaurantDetailScreen from '@/screens/restaurant/RestaurantDetailScreen';
import AddMenuScreen from '@/screens/menu/AddMenuScreen';
import MenuDetailScreen from '@/screens/menu/MenuDetailScreen';
import AddRecommendationScreen from '@/screens/recommendation/AddRecommendationScreen';
import {mapNavigations} from '@/constants';

export type MapStackParamList = {
  [mapNavigations.MAP_HOME]: undefined;
  [mapNavigations.RESTAURANT_DETAIL]: {
    restaurantId: number;
    restaurantName?: string;
  };
  [mapNavigations.ADD_MENU]: {restaurantId: number};
  [mapNavigations.MENU_DETAIL]: {menuId: number; menuName: string};
  [mapNavigations.ADD_RECOMMENDATION]: {menuId: number; menuName: string};
};

const Stack = createStackNavigator<MapStackParamList>();

function MapStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        cardStyle: {
          backgroundColor: 'white',
        },
        headerStyle: {
          shadowColor: 'gray',
          backgroundColor: 'white',
        },
        headerTitleStyle: {
          fontSize: 15,
        },
        headerTintColor: 'black',
      }}>
      <Stack.Screen
        name={mapNavigations.MAP_HOME}
        component={MapHomeScreen}
        options={{
          headerTitle: ' ',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={mapNavigations.RESTAURANT_DETAIL}
        component={RestaurantDetailScreen}
        options={({route}) => ({
          headerTitle: route.params.restaurantName ?? '음식점',
        })}
      />
      <Stack.Screen
        name={mapNavigations.ADD_MENU}
        component={AddMenuScreen}
        options={{
          headerTitle: '메뉴 등록',
        }}
      />
      <Stack.Screen
        name={mapNavigations.MENU_DETAIL}
        component={MenuDetailScreen}
        options={({route}) => ({
          headerTitle: route.params.menuName,
        })}
      />
      <Stack.Screen
        name={mapNavigations.ADD_RECOMMENDATION}
        component={AddRecommendationScreen}
        options={{
          headerTitle: '메뉴 추천하기',
        }}
      />
    </Stack.Navigator>
  );
}

export default MapStackNavigator;
