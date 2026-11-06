import { useCallback, useRef, useState } from 'react';
import * as Location from 'expo-location';
import type { CurrentLocationError, CurrentLocationResult, MapCoordinate } from './types';

function locationError(code: CurrentLocationError['code']): CurrentLocationError {
  switch (code) {
    case 'permission-denied':
      return { code, message: '请允许应用访问位置信息后重试' };
    case 'services-disabled':
      return { code, message: '请打开设备定位服务后重试' };
    default:
      return { code: 'unavailable', message: '暂时无法获取当前位置，请稍后重试' };
  }
}

/** Gets one foreground location only after the host user invokes `locate`. */
export function useCurrentLocation() {
  const [location, setLocation] = useState<MapCoordinate | null>(null);
  const [error, setError] = useState<CurrentLocationError | null>(null);
  const [loading, setLoading] = useState(false);
  const requestRef = useRef<Promise<CurrentLocationResult> | null>(null);

  const locate = useCallback((): Promise<CurrentLocationResult> => {
    if (requestRef.current) return requestRef.current;
    setLoading(true);
    setError(null);
    const request = (async (): Promise<CurrentLocationResult> => {
      try {
        let permission = await Location.getForegroundPermissionsAsync();
        if (!permission.granted && permission.canAskAgain) {
          permission = await Location.requestForegroundPermissionsAsync();
        }
        if (!permission.granted) {
          const denied = locationError('permission-denied');
          setError(denied);
          return { location: null, error: denied };
        }

        if (!(await Location.hasServicesEnabledAsync())) {
          const disabled = locationError('services-disabled');
          setError(disabled);
          return { location: null, error: disabled };
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const nextLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        if (!Number.isFinite(nextLocation.latitude) || !Number.isFinite(nextLocation.longitude)) {
          throw new Error('Invalid coordinates');
        }

        setLocation(nextLocation);
        return { location: nextLocation, error: null };
      } catch {
        const unavailable = locationError('unavailable');
        setError(unavailable);
        return { location: null, error: unavailable };
      } finally {
        requestRef.current = null;
        setLoading(false);
      }
    })();
    requestRef.current = request;
    return request;
  }, []);

  return { location, error, loading, locate };
}
