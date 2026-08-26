import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {QueryClientProvider} from '@tanstack/react-query';

import './src/i18n';
import RootNavigator from './src/navigations/root/RootNavigator';
import GlobalLoading from './src/components/GlobalLoading';
import queryClient from './src/api/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      <GlobalLoading />
    </QueryClientProvider>
  );
}

export default App;
