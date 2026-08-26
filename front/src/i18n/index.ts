import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

import en from './locales/en';
import ko from './locales/ko';

export const languages = [
  {code: 'en', label: 'English'},
  {code: 'ko', label: '한국어'},
] as const;

i18n.use(initReactI18next).init({
  resources: {
    en: {translation: en},
    ko: {translation: ko},
  },
  lng: 'en', // 외국인 대상 → 영어 기본
  fallbackLng: 'en',
  // RN 엔진에 Intl.PluralRules 가 없어 v4 복수형 경고가 뜨므로 v3 포맷 사용
  compatibilityJSON: 'v3',
  interpolation: {escapeValue: false},
  returnNull: false,
});

export default i18n;
