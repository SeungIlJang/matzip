import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {StyleSheet} from 'react-native';
import {WebView, WebViewMessageEvent} from 'react-native-webview';

import {colors} from '@/constants';
import type {LatLng} from '@/types/map';
import type {NaverPlace, RestaurantMarker} from '@/types/domain';

/** 신형 NCP 키(웹 Dynamic Map)로 네이버 지도 JS API 로드 */
const NAVER_KEY_ID = 'iheghe6d2r';

export interface NaverMapWebViewHandle {
  moveTo: (coordinate: LatLng) => void;
  searchAt: (coordinate: LatLng) => void;
}

interface NaverMapWebViewProps {
  initialCenter: LatLng;
  restaurants: RestaurantMarker[];
  places: NaverPlace[];
  selectedId: number | null;
  onRegionChange: (coordinate: LatLng) => void;
  onSelectRestaurant: (id: number) => void;
  onSelectPlace: (place: NaverPlace) => void;
  onAreaChange: (area: string) => void;
  onMapClick: () => void;
}

function buildHtml(center: LatLng) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>html,body,#map{margin:0;padding:0;width:100%;height:100%;overflow:hidden;}</style>
  <script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_KEY_ID}&submodules=geocoder"></script>
</head>
<body>
  <div id="map"></div>
  <script>
    var map, markers = [], placeMarkers = [], userMarker = null, selectedId = null;
    function post(o){ window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(o)); }
    function markerHtml(r, selected){
      var bg = selected ? '${colors.RED_500}' : '${colors.PINK_700}';
      return '<div style="transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;">'
        + '<div style="background:'+bg+';color:#fff;font-weight:700;font-size:12px;padding:4px 8px;border-radius:14px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.4);">'
        + '👍 ' + r.count + '</div>'
        + '<div style="width:2px;height:8px;background:'+bg+';"></div></div>';
    }
    function renderMarkers(list){
      markers.forEach(function(m){ m.setMap(null); });
      markers = [];
      list.forEach(function(r){
        var m = new naver.maps.Marker({
          position: new naver.maps.LatLng(r.latitude, r.longitude),
          map: map,
          icon: { content: markerHtml(r, r.id === selectedId), anchor: new naver.maps.Point(0,0) }
        });
        naver.maps.Event.addListener(m, 'click', function(){ post({type:'markerClick', id:r.id}); });
        markers.push(m);
      });
    }
    function renderPlaces(list){
      placeMarkers.forEach(function(m){ m.setMap(null); });
      placeMarkers = [];
      list.forEach(function(p, index){
        var m = new naver.maps.Marker({
          position: new naver.maps.LatLng(p.latitude, p.longitude),
          map: map,
          title: p.name,
          icon: { content: '<div style="transform:translate(-50%,-100%);background:#fff;border:2px solid ${colors.PINK_700};border-radius:18px;padding:5px 8px;font-size:12px;font-weight:700;color:#333;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.35);">🍽 '+p.name+'</div>', anchor: new naver.maps.Point(0,0) }
        });
        naver.maps.Event.addListener(m, 'click', function(){ post({type:'placeClick', index:index}); });
        placeMarkers.push(m);
      });
    }
    function findArea(lat,lng){
      if(!naver.maps.Service){ return; }
      naver.maps.Service.reverseGeocode({coords:new naver.maps.LatLng(lat,lng)}, function(status,response){
        if(status !== naver.maps.Service.Status.OK || !response.v2.results.length){ return; }
        var region=response.v2.results[0].region;
        var names=[region.area1.name,region.area2.name,region.area3.name].filter(Boolean);
        post({type:'area', area:names.join(' ')});
      });
    }
    function showUser(lat,lng){
      var position=new naver.maps.LatLng(lat,lng);
      if(userMarker){ userMarker.setPosition(position); return; }
      userMarker=new naver.maps.Marker({position:position,map:map,zIndex:1000,icon:{content:'<div style="width:18px;height:18px;border-radius:50%;background:#4285F4;border:4px solid white;box-shadow:0 1px 5px rgba(0,0,0,.5);"></div>',anchor:new naver.maps.Point(9,9)}});
    }
    window.setData = function(list, places, sel){ selectedId = sel; renderMarkers(list); renderPlaces(places); };
    window.searchAt = function(lat,lng){ findArea(lat,lng); };
    window.moveTo = function(lat,lng){ if(map){ var position=new naver.maps.LatLng(lat,lng); map.setCenter(position); map.setZoom(16); showUser(lat,lng); findArea(lat,lng); } };
    function init(){
      map = new naver.maps.Map('map', { center: new naver.maps.LatLng(${center.latitude}, ${center.longitude}), zoom: 15, logoControl:true, mapDataControl:false, scaleControl:true });
      showUser(${center.latitude}, ${center.longitude});
      findArea(${center.latitude}, ${center.longitude});
      naver.maps.Event.addListener(map, 'idle', function(){ var c = map.getCenter(); post({type:'region', latitude:c.lat(), longitude:c.lng()}); });
      naver.maps.Event.addListener(map, 'click', function(){ post({type:'mapClick'}); });
      post({type:'ready'});
    }
    if (window.naver && window.naver.maps) { init(); }
    else { window.addEventListener('load', init); }
  </script>
</body>
</html>`;
}

const NaverMapWebView = forwardRef<NaverMapWebViewHandle, NaverMapWebViewProps>(
  (
    {
      initialCenter,
      restaurants,
      places,
      selectedId,
      onRegionChange,
      onSelectRestaurant,
      onSelectPlace,
      onAreaChange,
      onMapClick,
    },
    ref,
  ) => {
    const webRef = useRef<WebView | null>(null);
    const pendingMoveRef = useRef<LatLng | null>(null);
    const pendingSearchRef = useRef<LatLng | null>(null);
    const [ready, setReady] = useState(false);
    const htmlRef = useRef(buildHtml(initialCenter));

    const injectMove = useCallback(({latitude, longitude}: LatLng) => {
      webRef.current?.injectJavaScript(
        `window.moveTo(${latitude}, ${longitude}); true;`,
      );
    }, []);

    useImperativeHandle(ref, () => ({
      moveTo: (coordinate: LatLng) => {
        pendingMoveRef.current = coordinate;
        if (ready) {
          injectMove(coordinate);
        }
      },
      searchAt: (coordinate: LatLng) => {
        pendingSearchRef.current = coordinate;
        if (ready) {
          webRef.current?.injectJavaScript(
            `window.searchAt(${coordinate.latitude}, ${coordinate.longitude}); true;`,
          );
        }
      },
    }));

    const syncData = useCallback(() => {
      const list = restaurants.map(r => ({
        id: r.id,
        latitude: r.latitude,
        longitude: r.longitude,
        count: r.recommendationCount,
      }));
      const placeList = places.map(place => ({
        name: place.name,
        latitude: place.latitude,
        longitude: place.longitude,
      }));
      webRef.current?.injectJavaScript(
        `window.setData(${JSON.stringify(list)}, ${JSON.stringify(
          placeList,
        )}, ${selectedId ?? 'null'}); true;`,
      );
    }, [places, restaurants, selectedId]);

    React.useEffect(() => {
      if (ready) {
        syncData();
      }
    }, [ready, syncData]);

    const handleMessage = (event: WebViewMessageEvent) => {
      let msg: {
        type: string;
        id?: number;
        latitude?: number;
        longitude?: number;
        index?: number;
        area?: string;
      };
      try {
        msg = JSON.parse(event.nativeEvent.data);
      } catch {
        return;
      }
      switch (msg.type) {
        case 'ready':
          setReady(true);
          injectMove(pendingMoveRef.current ?? initialCenter);
          if (pendingSearchRef.current) {
            const {latitude, longitude} = pendingSearchRef.current;
            webRef.current?.injectJavaScript(
              `window.searchAt(${latitude}, ${longitude}); true;`,
            );
          }
          break;
        case 'region':
          if (msg.latitude != null && msg.longitude != null) {
            onRegionChange({latitude: msg.latitude, longitude: msg.longitude});
          }
          break;
        case 'markerClick':
          if (msg.id != null) {
            onSelectRestaurant(msg.id);
          }
          break;
        case 'placeClick':
          if (msg.index != null && places[msg.index]) {
            onSelectPlace(places[msg.index]);
          }
          break;
        case 'area':
          if (msg.area) {
            onAreaChange(msg.area);
          }
          break;
        case 'mapClick':
          onMapClick();
          break;
      }
    };

    return (
      <WebView
        ref={webRef}
        style={styles.container}
        originWhitelist={['*']}
        source={{html: htmlRef.current, baseUrl: 'http://localhost'}}
        onLoadStart={() => setReady(false)}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        geolocationEnabled
      />
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default NaverMapWebView;
