/**
 * @format
 */

import 'react-native';
import React from 'react';
import {it, jest} from '@jest/globals';

jest.mock('../src/navigations/root/RootNavigator', () => () => null);
jest.mock('../src/components/GlobalLoading', () => () => null);
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}: {children: React.ReactNode}) => children,
}));

import App from '../App';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  renderer.create(<App />);
});
