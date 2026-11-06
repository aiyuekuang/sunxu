import { useCallback } from 'react';
import { MapControlButton, type MapControlButtonProps } from './MapControlButton';
import { useCurrentLocation } from '../useCurrentLocation';
import type { CurrentLocationError, MapCoordinate } from '../types';

export interface MapLocationButtonProps extends Omit<MapControlButtonProps, 'icon' | 'onPress' | 'accessibilityLabel' | 'loading'> {
  onLocation: (location: MapCoordinate) => void;
  onLocationError?: (error: CurrentLocationError) => void;
  accessibilityLabel?: string;
}

/** Standard current-location control; camera movement is handled by the map provider adapter. */
export function MapLocationButton({
  onLocation,
  onLocationError,
  accessibilityLabel = '定位当前位置',
  ...buttonProps
}: MapLocationButtonProps) {
  const { loading, locate } = useCurrentLocation();
  const handlePress = useCallback(async () => {
    const result = await locate();
    if (result.location) onLocation(result.location);
    else onLocationError?.(result.error);
  }, [locate, onLocation, onLocationError]);

  return (
    <MapControlButton
      {...buttonProps}
      icon="locate-outline"
      accessibilityLabel={accessibilityLabel}
      onPress={handlePress}
      loading={loading}
    />
  );
}
