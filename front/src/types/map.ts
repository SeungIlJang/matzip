/** 지도 라이브러리에 독립적인 좌표/영역 타입 */
export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface MapRegion extends LatLng {
  latitudeDelta: number;
  longitudeDelta: number;
}
