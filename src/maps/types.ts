export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

export type CurrentLocationErrorCode = 'permission-denied' | 'services-disabled' | 'unavailable';

export interface CurrentLocationError {
  code: CurrentLocationErrorCode;
  message: string;
}

export type CurrentLocationResult =
  | { location: MapCoordinate; error: null }
  | { location: null; error: CurrentLocationError };
