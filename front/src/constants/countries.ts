import type {Country} from '@/types/domain';

/**
 * 국적(입맛 그룹) 목록. 한국 방문객이 많은 국가 위주.
 * code: ISO 3166-1 alpha-2, flag: 유니코드 국기 이모지.
 */
const countries: Country[] = [
  {code: 'US', name: 'United States', flag: '🇺🇸'},
  {code: 'JP', name: 'Japan', flag: '🇯🇵'},
  {code: 'CN', name: 'China', flag: '🇨🇳'},
  {code: 'TW', name: 'Taiwan', flag: '🇹🇼'},
  {code: 'HK', name: 'Hong Kong', flag: '🇭🇰'},
  {code: 'VN', name: 'Vietnam', flag: '🇻🇳'},
  {code: 'TH', name: 'Thailand', flag: '🇹🇭'},
  {code: 'PH', name: 'Philippines', flag: '🇵🇭'},
  {code: 'ID', name: 'Indonesia', flag: '🇮🇩'},
  {code: 'MY', name: 'Malaysia', flag: '🇲🇾'},
  {code: 'SG', name: 'Singapore', flag: '🇸🇬'},
  {code: 'IN', name: 'India', flag: '🇮🇳'},
  {code: 'GB', name: 'United Kingdom', flag: '🇬🇧'},
  {code: 'FR', name: 'France', flag: '🇫🇷'},
  {code: 'DE', name: 'Germany', flag: '🇩🇪'},
  {code: 'IT', name: 'Italy', flag: '🇮🇹'},
  {code: 'ES', name: 'Spain', flag: '🇪🇸'},
  {code: 'RU', name: 'Russia', flag: '🇷🇺'},
  {code: 'CA', name: 'Canada', flag: '🇨🇦'},
  {code: 'AU', name: 'Australia', flag: '🇦🇺'},
  {code: 'BR', name: 'Brazil', flag: '🇧🇷'},
  {code: 'MX', name: 'Mexico', flag: '🇲🇽'},
  {code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦'},
  {code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪'},
  {code: 'TR', name: 'Türkiye', flag: '🇹🇷'},
  {code: 'KR', name: 'South Korea', flag: '🇰🇷'},
];

const countryMap: Record<string, Country> = countries.reduce(
  (acc, country) => ({...acc, [country.code]: country}),
  {},
);

/** 국가 코드로 국가 정보 조회 (없으면 undefined) */
function getCountry(code?: string | null): Country | undefined {
  if (!code) {
    return undefined;
  }
  return countryMap[code];
}

export {countries, countryMap, getCountry};
