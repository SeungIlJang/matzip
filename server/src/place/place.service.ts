import axios from 'axios';
import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PlaceResult {
  name: string;
  category: string;
  address: string;
  roadAddress: string;
  latitude: number;
  longitude: number;
}

@Injectable()
export class PlaceService {
  constructor(private configService: ConfigService) {}

  /**
   * 네이버 개발자센터 지역검색(Local) API 프록시.
   * Client ID/Secret 은 서버 .env 에만 보관하고, 앱엔 결과만 내려준다.
   * mapx(경도)/mapy(위도)는 WGS84 좌표를 10^7 배로 준 정수 → 1e7 로 나눠 환산.
   */
  async search(query: string): Promise<PlaceResult[]> {
    const trimmed = (query ?? '').trim();
    if (!trimmed) {
      return [];
    }

    const clientId = this.configService.get<string>('NAVER_SEARCH_CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'NAVER_SEARCH_CLIENT_SECRET',
    );

    if (!clientId || !clientSecret) {
      throw new ServiceUnavailableException(
        '네이버 검색 API 자격증명(NAVER_SEARCH_CLIENT_ID/SECRET)이 설정되지 않았습니다.',
      );
    }

    try {
      const { data } = await axios.get(
        'https://openapi.naver.com/v1/search/local.json',
        {
          params: { query: trimmed, display: 20, sort: 'random' },
          headers: {
            'X-Naver-Client-Id': clientId,
            'X-Naver-Client-Secret': clientSecret,
          },
        },
      );

      const items: any[] = data.items ?? [];
      return items.map((item) => ({
        name: this.stripTags(item.title),
        category: item.category ?? '',
        address: item.address ?? '',
        roadAddress: item.roadAddress ?? '',
        longitude: Number(item.mapx) / 1e7,
        latitude: Number(item.mapy) / 1e7,
      }));
    } catch (error) {
      console.log(error?.response?.data ?? error?.message ?? error);
      throw new InternalServerErrorException(
        '네이버 장소 검색에 실패했습니다.',
      );
    }
  }

  private stripTags(text: string): string {
    return (text ?? '').replace(/<[^>]+>/g, '');
  }
}
