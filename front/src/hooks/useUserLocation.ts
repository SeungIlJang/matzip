import {useEffect, useState} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import GeoLocation from '@react-native-community/geolocation';

import type {LatLng} from '@/types/map';

function useUserLocation() {
  const [userLocation, setUserLocation] = useState<LatLng>({
    latitude: 37.5516032365118,
    longitude: 126.98989626020192,
  });
  const [isUserLocationError, setIsUserLocationError] = useState(false);

  useEffect(() => {
    const locate = async () => {
      if (Platform.OS === 'android') {
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
        if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
          setIsUserLocationError(true);
          return;
        }
      }

      GeoLocation.getCurrentPosition(
        info => {
          const {latitude, longitude} = info.coords;
          setUserLocation({latitude, longitude});
          setIsUserLocationError(false);
        },
        () => setIsUserLocationError(true),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    };

    locate();
  }, []);

  return {userLocation, isUserLocationError};
}

export default useUserLocation;
