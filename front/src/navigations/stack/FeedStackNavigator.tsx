import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import FeedHomeScreen from '@/screens/feed/FeedHomeScreen';
import FeedFavoriteScreen from '@/screens/feed/FeedFavoriteScreen';
import {feedNavigations} from '@/constants';

export type FeedStackParamList = {
  [feedNavigations.FEED_HOME]: undefined;
  [feedNavigations.FEED_FAVORITE]: undefined;
};

const Stack = createStackNavigator<FeedStackParamList>();

function FeedStackNavigator() {
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
        name={feedNavigations.FEED_HOME}
        component={FeedHomeScreen}
        options={{
          headerTitle: '피드',
        }}
      />
      <Stack.Screen
        name={feedNavigations.FEED_FAVORITE}
        component={FeedFavoriteScreen}
        options={{
          headerTitle: '즐겨찾기',
        }}
      />
    </Stack.Navigator>
  );
}

export default FeedStackNavigator;
