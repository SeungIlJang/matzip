import {Alert} from 'react-native';

import i18n from '@/i18n';

/**
 * 소셜 로그인 진입점.
 *
 * ⚠️ 실제 토큰 획득에는 네이티브 SDK 설치/설정이 필요합니다.
 * 서버 엔드포인트(`/auth/oauth/kakao`, `/auth/oauth/google`)와 useAuth 뮤테이션은 이미 준비돼 있으니,
 * 아래 라이브러리를 설치하고 주석 코드를 활성화하면 바로 연결됩니다.
 *
 * - Kakao:  @react-native-seoul/kakao-login
 *     import {login} from '@react-native-seoul/kakao-login';
 *     const {accessToken} = await login();
 *     onToken(accessToken);
 *
 * - Google: @react-native-google-signin/google-signin
 *     import {GoogleSignin} from '@react-native-google-signin/google-signin';
 *     GoogleSignin.configure({ webClientId: '<GOOGLE_WEB_CLIENT_ID>' });
 *     await GoogleSignin.hasPlayServices();
 *     const {idToken} = await GoogleSignin.signIn();
 *     onIdToken(idToken!);
 */
export function kakaoLoginFlow(onToken: (token: string) => void) {
  // TODO: 네이티브 SDK 설치 후 위 주석 코드로 교체하고 onToken 호출
  void onToken;
  Alert.alert('', i18n.t('social.needNative'));
}

export function googleLoginFlow(onIdToken: (idToken: string) => void) {
  // TODO: 네이티브 SDK 설치 후 위 주석 코드로 교체하고 onIdToken 호출
  void onIdToken;
  Alert.alert('', i18n.t('social.needNative'));
}
