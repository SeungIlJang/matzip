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
import type {RestaurantMarker} from '@/types/domain';

/** 신형 NCP 키(웹 Dynamic Map)로 네이버 지도 JS API 로드 */
const NAVER_KEY_ID = 'iheghe6d2r';

export interface NaverMapWebViewHandle {
  moveTo: (coordinate: LatLng) => void;
}

interface NaverMapWebViewProps {
  initialCenter: LatLng;
  restaurants: RestaurantMarker[];
  selectedId: number | null;
  onRegionChange: (coordinate: LatLng) => void;
  onSelectRestaurant: (id: number) => void;
  onMapClick: () => void;
}

function buildHtml(center: LatLng) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>html,body,#map{margin:0;padding:0;width:100%;height:100%;overflow:hidden;}</style>
  <script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_KEY_ID}"></script>
</head>
<body>
  <div id="map"></div>
  <script>
    var map, markers = [], selectedId = null;
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
    window.setData = function(list, sel){ selectedId = sel; renderMarkers(list); };
    window.moveTo = function(lat,lng){ if(map){ map.morph(new naver.maps.LatLng(lat,lng), 15); } };
    function init(){
      map = new naver.maps.Map('map', { center: new naver.maps.LatLng(${center.latitude}, ${center.longitude}), zoom: 15, logoControl:true, mapDataControl:false, scaleControl:true });
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
      selectedId,
      onRegionChange,
      onSelectRestaurant,
      onMapClick,
    },
    ref,
  ) => {
    const webRef = useRef<WebView | null>(null);
    const [ready, setReady] = useState(false);
    const htmlRef = useRef(buildHtml(initialCenter));

    useImperativeHandle(ref, () => ({
      moveTo: ({latitude, longitude}: LatLng) => {
        webRef.current?.injectJavaScript(
          `window.moveTo(${latitude}, ${longitude}); true;`,
        );
      },
    }));

    const syncData = useCallback(() => {
      const list = restaurants.map(r => ({
        id: r.id,
        latitude: r.latitude,
        longitude: r.longitude,
        count: r.recommendationCount,
      }));
      webRef.current?.injectJavaScript(
        `window.setData(${JSON.stringify(list)}, ${
          selectedId ?? 'null'
        }); true;`,
      );
    }, [restaurants, selectedId]);

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
      };
      try {
        msg = JSON.parse(event.nativeEvent.data);
      } catch {
        return;
      }
      switch (msg.type) {
        case 'ready':
          setReady(true);
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
