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

GeoLocation.setRNConfiguration({
  skipPermissionRequests: true,
  authorizationLevel: 'whenInUse',
  locationProvider: 'auto',
});

function useUserLocation() {
  const [userLocation, setUserLocation] = useState<LatLng>({
    latitude: 37.5516032365118,
    longitude: 126.98989626020192,
  });
  const [isUserLocationError, setIsUserLocationError] = useState(false);
  const [locationRequestKey, setLocationRequestKey] = useState(0);
  const settingsAlertVisible = useRef(false);

  useEffect(() => {
    let watchId: number | null = null;
    let cancelled = false;

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

    const guideToLocationService = () => {
      if (settingsAlertVisible.current) {
        return;
      }
      settingsAlertVisible.current = true;
      Alert.alert(
        'Unable to find your location',
        'Turn on Location/GPS and Precise location, then try again.',
        [
          {
            text: 'Not now',
            style: 'cancel',
            onPress: () => {
              settingsAlertVisible.current = false;
            },
          },
          {
            text: 'Location settings',
            onPress: async () => {
              settingsAlertVisible.current = false;
              if (Platform.OS === 'android') {
                await Linking.sendIntent(
                  'android.settings.LOCATION_SOURCE_SETTINGS',
                );
              } else {
                await Linking.openSettings();
              }
            },
          },
        ],
      );
    };

    const handlePosition = (info: {
      coords: {latitude: number; longitude: number};
    }) => {
      if (cancelled) {
        return;
      }
      const {latitude, longitude} = info.coords;
      setUserLocation({latitude, longitude});
      setIsUserLocationError(false);
      settingsAlertVisible.current = false;
    };

    const handleFinalError = (error: {code: number}) => {
      if (cancelled) {
        return;
      }
      setIsUserLocationError(true);
      if (error.code === 1) {
        guideToSettings();
      } else {
        guideToLocationService();
      }
    };

    const getPosition = () => {
      GeoLocation.getCurrentPosition(
        handlePosition,
        error => {
          if (error.code === 1) {
            handleFinalError(error);
            return;
          }
          // 실내에서 고정밀 GPS가 시간 초과되면 네트워크 위치로 재시도한다.
          GeoLocation.getCurrentPosition(handlePosition, handleFinalError, {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 60000,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 10000,
        },
      );
    };

    const startWatching = () => {
      if (watchId !== null) {
        return;
      }
      watchId = GeoLocation.watchPosition(handlePosition, () => undefined, {
        enableHighAccuracy: false,
        distanceFilter: 10,
        interval: 5000,
        fastestInterval: 2000,
      });
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

      startWatching();
      getPosition();
    };

    locate();

    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        locate(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.remove();
      if (watchId !== null) {
        GeoLocation.clearWatch(watchId);
      }
    };
  }, [locationRequestKey]);

  const requestUserLocation = () => {
    setLocationRequestKey(key => key + 1);
  };

  return {userLocation, isUserLocationError, requestUserLocation};
}

export default useUserLocation;
