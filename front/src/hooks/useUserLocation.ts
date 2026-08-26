import {useEffect, useRef, useState} from 'react';
import {
  Alert,
  AppState,
  Linking,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import GeoLocation from '@react-native-community/geolocation';

import type {LatLng} from '@/types/map';

function useUserLocation() {
  const [userLocation, setUserLocation] = useState<LatLng>({
    latitude: 37.5516032365118,
    longitude: 126.98989626020192,
  });
  const [isUserLocationError, setIsUserLocationError] = useState(false);
  const settingsAlertVisible = useRef(false);

  useEffect(() => {
    const guideToSettings = () => {
      if (settingsAlertVisible.current) {
        return;
      }
      settingsAlertVisible.current = true;
      Alert.alert(
        'Location permission required',
        'To show nearby restaurants, allow location access in Settings → Apps → 각자의입맛 → Permissions → Location.',
        [
          {
            text: 'Not now',
            style: 'cancel',
            onPress: () => {
              settingsAlertVisible.current = false;
            },
          },
          {
            text: 'Open settings',
            onPress: async () => {
              settingsAlertVisible.current = false;
              await Linking.openSettings();
            },
          },
        ],
      );
    };

    const getPosition = () => {
      GeoLocation.getCurrentPosition(
        info => {
          const {latitude, longitude} = info.coords;
          setUserLocation({latitude, longitude});
          setIsUserLocationError(false);
          settingsAlertVisible.current = false;
        },
        error => {
          setIsUserLocationError(true);
          if (error.code === 1) {
            guideToSettings();
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    };

    const locate = async (requestPermission = true) => {
      if (Platform.OS === 'android') {
        let granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (!granted && requestPermission) {
          const permission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location permission',
              message:
                'Your location is used to show nearby restaurants on the map.',
              buttonPositive: 'Allow',
              buttonNegative: 'Not now',
            },
          );
          granted = permission === PermissionsAndroid.RESULTS.GRANTED;
        }
        if (!granted) {
          setIsUserLocationError(true);
          if (requestPermission) {
            guideToSettings();
          }
          return;
        }
      }

      getPosition();
    };

    locate();

    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        locate(false);
      }
    });

    return () => subscription.remove();
  }, []);

  return {userLocation, isUserLocationError};
}

export default useUserLocation;
