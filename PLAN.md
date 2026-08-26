# 각자의입맛 완성 계획 — 국가별 한국 음식·메뉴 추천 앱

## 제품 정의

> **타이틀:** 각자의입맛
>
> **한 문장:** 한국 음식을 먼저 먹어본 외국인이 자기 입맛에 맞은 메뉴를 추천하고,
> 같은 나라 사람이 그 추천을 보고 무엇을 주문할지 결정하도록 돕는 앱.

이 앱의 메인 기능은 음식점 리뷰가 아니라 **메뉴 추천**이다. 음식점은 메뉴 추천을
찾기 위한 장소 단위이며, 핵심 순위는 추천자의 국가별로 계산한다.

### 확정 요구사항

1. 지도·검색 결과는 네이버에 등록된 음식점을 기준으로 한다.
2. 음식점을 선택하면 기존 추천 메뉴와 국가별 순위를 보고, 로그인한 사용자는 직접 추천할 수 있다.
3. 추천 열람·검색·길찾기는 비회원도 가능하게 하고, 추천 작성·즐겨찾기·프로필은 로그인을 요구한다.
4. 외국인 사용 비중을 고려해 Google·Apple 로그인을 우선 지원하고 Facebook은 후속 검토한다.
5. 네이버지도·Google Maps 등 설치된 지도 앱으로 음식점 길안내를 연결한다.
6. 음식점 도착 감지는 사용자가 허용한 위치 권한과 저장된 방문 대상에만 적용한다. 운영체제가 앱을
   임의로 전면 실행하는 방식 대신 **도착 알림을 누르면 해당 음식점의 추천 메뉴 화면이 열리는 방식**을
   기본 UX로 한다.

### 권한 원칙

| 기능 | 비회원 | 로그인 사용자 |
|---|---:|---:|
| 지도·음식점 검색 | 가능 | 가능 |
| 메뉴·국가별 추천 열람 | 가능 | 가능 |
| 외부 지도 길안내 | 가능 | 가능 |
| 추천 작성·수정·삭제 | 불가 | 가능 |
| 즐겨찾기·방문 저장·도착 알림 | 불가 | 가능 |

### 구현상 주의

- 네이버 기본 지도에 보이는 모든 POI를 앱 데이터처럼 직접 가져오는 기능과 네이버 지역검색 API는
  별개다. 앱에서는 네이버 지역검색으로 음식점을 선택하고 내부 Restaurant와 연결하는 흐름을 사용한다.
- iOS·Android는 백그라운드 앱의 강제 전면 실행을 제한한다. 지오펜스 도착 이벤트는 로컬 알림과
  딥링크로 구현한다.
- iOS에서 Google/Facebook 같은 제3자 로그인을 제공할 경우 Apple 로그인도 함께 제공하는 정책을
  릴리스 전에 확인한다.

> **컨셉:** 한국을 방문한 외국인들이 서로 공유하는 **메뉴 추천 커뮤니티**.
> 나라마다 입맛이 다르므로, "이 식당에서 **우리 나라 사람들은 이 메뉴를 추천**하더라"를
> 보여줘 **뭘 시켜야 할지**를 해결한다.
>
> **핵심 데이터 단위:** 메뉴(Menu) 단위 추천, 추천한 사람의 **국적(country)** 태그.
> **핵심 소비 흐름:** 식당 앞 → 식당 상세 → "🌍 전체 / 🇺🇸 내 나라" 토글 → 메뉴 랭킹 → 주문.

---

## 이 컨셉이 요구하는 데이터 모델 (백엔드 재설계)

기존 코드는 "개인용 맛집 지도"(Post = 개인 소유·비공개)를 상정했으나,
컨셉은 "공유 메뉴 추천 SNS"이므로 엔티티를 아래처럼 바꾼다.

```
User ──< Recommendation >── Menu >── Restaurant
  │            │
country    (score, comment, country[denormalized], images)
```

| 엔티티 | 역할 | 비고 |
|---|---|---|
| **User** | 사용자 + **국적(country)** | 기존 User에 `country`(ISO 국가코드), `language` 추가. 마커색상 카테고리 필드는 제거/보류 |
| **Restaurant** | 공유 음식점(장소) | 기존 `Post`를 대체. lat/lng·name·address·createdBy. **공개 엔티티** |
| **Menu** | 음식점의 개별 메뉴 | name·price·imageUri·restaurant(FK). 추천의 대상 |
| **Recommendation** | **핵심 단위** — 누가·어느 나라·어떤 메뉴를 추천 | user·menu FK, `score`, `comment`, `country`(작성 시점 국적 비정규화 → 국가별 집계 빠르게), images. `unique(user, menu)` |
| **Favorite** | 즐겨찾기 | Restaurant 또는 Menu 대상으로 재정의 |
| **Image** | 이미지 | Recommendation/Menu에 연결로 일반화 |

> `country`를 Recommendation에 **비정규화**로 복제하는 이유: "이 식당에서 국가별 메뉴 순위"를
> 매 조회마다 join 없이 `GROUP BY country`로 빠르게 집계하기 위함.

---

## 0단계 — 사전 점검 & 정렬

- [x] 초기 저장소는 별도 서버가 필요 없는 **SQLite 파일 DB**(`server/data/matzip.sqlite`) 사용
- [ ] 배포 전 SQLite 백업 정책과 TypeORM 마이그레이션 전략 확정
- [ ] 국가 목록/코드 소스 확정 (ISO 3166-1 alpha-2 + 국기 이모지)
- [ ] `react-native-maps` Google API 키, 프론트 실행 환경(Android/iOS) 점검
- [ ] 컨셉상 **영어 우선(i18n)** 여부 확정 (foreigners 대상 → 6단계에서 i18n)

---

## 1단계 — 백엔드 재설계 (서버부터)

프론트가 붙을 API 표면을 먼저 컨셉에 맞게 바꾼다.

### 엔티티 · 스키마
- [ ] `auth/user.entity.ts` — `country`(string, ISO), `language`(nullable) 추가, 마커색상 필드 제거/보류
- [ ] `restaurant/restaurant.entity.ts` 신규 (기존 `post/` 대체) — id·name·latitude·longitude·address·createdBy·타임스탬프
- [ ] `menu/menu.entity.ts` 신규 — id·name·price·imageUri·restaurant(FK)·createdBy
- [ ] `recommendation/recommendation.entity.ts` 신규 — user·menu(FK)·score·comment·country·images, `@Unique(['user','menu'])`
- [ ] `favorite/favorite.entity.ts` — Restaurant/Menu 대상으로 수정
- [ ] `image/image.entity.ts` — recommendation/menu 연결로 일반화
- [ ] 기존 `post/` 모듈 정리(삭제 또는 restaurant로 이관)

### DTO · 모듈 · 컨트롤러
- [ ] `auth/dto/*` — signup/edit에 `country` 반영, `AuthCredentialsDto`·`EditProfileDto` 수정
- [ ] `restaurant` 모듈: `POST /restaurants`, `GET /restaurants?lat&lng&radius`(주변), `GET /restaurants/:id`(메뉴+집계 포함), `GET /restaurants/search?query`
- [ ] `menu` 모듈: `POST /restaurants/:id/menus`, `GET /restaurants/:id/menus`(국가별 집계 포함)
- [ ] `recommendation` 모듈: `POST /menus/:id/recommendations`(생성/수정), `GET /menus/:id/recommendations?country=`, `DELETE /recommendations/:id`
- [ ] 집계 쿼리: 식당 상세 시 메뉴별 `avgScore`·`count`를 **전체 / 내 국가** 두 기준으로 반환
- [ ] `GET /feed?country=` — 내 국가에서 인기 있는 메뉴(트렌딩)
- [ ] 각 모듈 서비스 + `*.spec.ts` (기존 테스트 컨벤션 유지)

**완료 기준:** Postman/curl로 회원가입(국적) → 식당 등록 → 메뉴 등록 → 메뉴 추천 →
"식당 상세에서 국가별 메뉴 순위" 조회까지 왕복.

---

## 2단계 — 프론트 기반 (온보딩 · 인증 · 지도)

### 국적 온보딩 & 인증 확장
- [ ] `types/domain.ts` — `Country`, `User(+country)`, `Restaurant`, `Menu`, `Recommendation` 타입 정의
- [ ] `constants/countries.ts` — 국가 코드·이름·국기 이모지 목록
- [ ] `api/auth.ts` + `hooks/queries/useAuth.ts` — signup/profile에 `country` 반영
- [ ] `screens/auth/SelectCountryScreen.tsx` — 가입/최초 진입 시 국적 선택
- [ ] `components/CountryPicker.tsx`

### 지도 = 주변 공개 음식점
- [ ] `api/restaurant.ts` — `getNearbyRestaurants(region)`, `getRestaurant(id)`, `createRestaurant`, `searchRestaurants`
- [ ] `hooks/queries/useGetNearbyRestaurants.ts`
- [ ] `MapHomeScreen.tsx` — **공유 음식점 마커** 렌더링, 롱프레스로 새 식당 등록, 마커 탭 → 식당 미리보기 카드
- [ ] `components/RestaurantMarker.tsx`, `components/RestaurantPreview.tsx`

---

## 3단계 — 핵심 루프: 식당 상세 · 메뉴 랭킹 · 추천 (앱의 심장)

- [ ] `MapStackNavigator`에 `RestaurantDetailScreen` 등록
- [ ] `screens/restaurant/RestaurantDetailScreen.tsx`
  - [ ] 상단 **"🌍 전체 / 🇺🇸 내 나라" 토글** (핵심 인터랙션)
  - [ ] 메뉴 리스트 — 선택 기준별 `avgScore`·추천수 랭킹, "우리 나라 사람 픽" 배지
  - [ ] 각 메뉴 → 추천 코멘트 목록(국기 표시)
- [ ] `components/MenuRankItem.tsx`, `components/CountryFilterToggle.tsx`, `components/RecommendationCard.tsx`
- [ ] `hooks/queries/useGetMenus.ts` (country 파라미터), `useGetRecommendations.ts`
- [ ] **추천 작성** — `screens/recommendation/AddRecommendationScreen.tsx` (score 별점 + comment + 사진)
- [ ] `api/recommendation.ts` + `hooks/queries/useMutateRecommendation.ts` (성공 시 식당/메뉴 쿼리 invalidate)

**완료 기준:** 식당 상세 → 내 나라 토글 → 추천 메뉴 확인 → 내가 메뉴 추천 작성 → 랭킹 반영.

---

## 4단계 — 등록 & 이미지

- [ ] `screens/restaurant/AddRestaurantScreen.tsx` — 좌표(지도 롱프레스)·이름·주소
- [ ] `screens/menu/AddMenuScreen.tsx` — 식당에 메뉴 추가(이름·가격·사진)
- [ ] 이미지: `react-native-image-crop-picker` 설치·권한, `api/image.ts`(`POST /images`), `useMutateImages`
- [ ] `components/ImageInput.tsx`, `components/PreviewImageList.tsx`

---

## 5단계 — 피드(국가별 트렌딩) & 즐겨찾기

- [ ] `api/feed.ts` — `getFeed(country)` (`GET /feed?country=`)
- [ ] `hooks/queries/useGetInfiniteFeed.ts` (`useInfiniteQuery`)
- [ ] `FeedHomeScreen.tsx`(빈 화면→완성) — "🇺🇸 미국 사람들이 요즘 추천하는 메뉴" 카드 리스트
- [ ] `components/FeedMenuCard.tsx`
- [ ] 즐겨찾기: `api/favorite.ts`, `useMutateFavorite`, `FeedFavoriteScreen.tsx` (가고 싶은 식당/먹고 싶은 메뉴 저장)
- [ ] `FeedStackNavigator` 신규(피드·검색·즐겨찾기)

---

## 6단계 — i18n · 프로필 · 마무리

- [ ] **i18n(영어 우선)** — `i18next`+`react-i18next`, 언어 선택, 국가/언어 연동
- [ ] 프로필: `EditProfileScreen`(국적·닉네임·언어 수정, `PATCH /auth/me`), 내 추천 목록
- [ ] 소셜 로그인: 카카오·애플 (서버 `POST /auth/oauth/*` 존재) + 가입 후 국적 선택 유도
- [ ] 커스텀 Drawer(프로필 헤더 + 국기), 공통 로딩/에러 처리(axios 인터셉터·Toast)
- [ ] 앱 아이콘/스플래시, 릴리즈 빌드 점검

---

## 컨셉 차별화 아이디어 (선택, 우선순위 낮음)

1. **입맛 매칭도(%)** — 추천 코멘트에 "덜 맵게/양 많음" 같은 태그를 붙여 "내 나라 기준 매움 지수" 표시
2. **번역** — 메뉴 이름/코멘트 자동 번역(한↔영), 메뉴판 사진 OCR
3. **"이거 주문하세요" 원탭 카드** — 식당에서 내 국가 1위 메뉴를 크게 보여주는 홈 위젯
4. **국가 간 비교** — "일본인 vs 미국인이 다르게 고르는 메뉴" 인사이트
5. **외부 장소 API**(카카오/구글 Places)로 식당 데이터 자동완성 → 중복 등록 방지

---

## 진행 순서

### 메뉴 자동 연동 우선순위

- [x] 공급자 공통 구조 및 메뉴 출처·확인일 저장
- [x] 한국관광공사 TourAPI 대표/취급 메뉴 자동 수집기
- [ ] TourAPI 서비스키 발급 후 실제 음식점 매칭 검증
- [ ] 착한가격업소 및 지역별 공공 메뉴 API 어댑터
- [ ] 메뉴판 촬영 → OCR → 중복 제거 → 일괄 확인/저장
- [ ] 매장주 인증 및 POS(OKPOS/푸드테크) 제휴 연동

신뢰도는 `POS/매장주 > 공공·제휴 데이터 > 확인된 OCR > 사용자 추가` 순으로
관리한다. 배달앱 화면의 비공식 크롤링은 약관·저작권·운영 안정성 문제로 사용하지
않는다.

**1단계(백엔드 재설계)** 부터. 컨셉이 데이터 모델을 바꾸므로 서버 API 표면을 먼저 확정해야
프론트가 안정적으로 붙는다. 이후 2(온보딩·지도) → 3(핵심 루프) → 4~6 순차 진행.
1~3단계까지면 앱의 핵심 가치("뭘 시킬지 나라별로 추천")가 실제로 동작한다.
각 단계 독립 커밋(`feat(x-y)` 컨벤션 유지).
