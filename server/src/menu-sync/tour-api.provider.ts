import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { Restaurant } from 'src/restaurant/restaurant.entity';
import { ImportedMenu, MenuProvider } from './menu-provider.interface';

interface TourItem {
  contentid?: string;
  title?: string;
  addr1?: string;
}

@Injectable()
export class TourApiProvider implements MenuProvider {
  readonly name = 'tour-api';
  private readonly baseUrl = 'https://apis.data.go.kr/B551011/KorService2';

  constructor(private readonly config: ConfigService) {}

  isConfigured() {
    return Boolean(this.config.get<string>('TOUR_API_SERVICE_KEY'));
  }

  async findMenus(restaurant: Restaurant): Promise<ImportedMenu[]> {
    const serviceKey = this.config.get<string>('TOUR_API_SERVICE_KEY');
    if (!serviceKey) return [];

    const common = {
      serviceKey,
      MobileOS: 'ETC',
      MobileApp: 'Matzip',
      _type: 'json',
    };

    const search = await axios.get(`${this.baseUrl}/searchKeyword2`, {
      params: {
        ...common,
        keyword: restaurant.name,
        contentTypeId: 39,
        numOfRows: 10,
        pageNo: 1,
      },
      timeout: 6000,
    });

    const raw = search.data?.response?.body?.items?.item;
    const items: TourItem[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
    const normalizedAddress = restaurant.address.replace(/\s+/g, ' ').trim();
    const match = items.find((item) => {
      if (!item.contentid || item.title?.trim() !== restaurant.name.trim()) {
        return false;
      }
      if (!normalizedAddress || !item.addr1) return true;
      const left = normalizedAddress.split(' ').slice(0, 3).join(' ');
      return (
        item.addr1.includes(left) || normalizedAddress.includes(item.addr1)
      );
    });
    if (!match?.contentid) return [];

    const detail = await axios.get(`${this.baseUrl}/detailIntro2`, {
      params: {
        ...common,
        contentId: match.contentid,
        contentTypeId: 39,
      },
      timeout: 6000,
    });
    const detailRaw = detail.data?.response?.body?.items?.item;
    const info = Array.isArray(detailRaw) ? detailRaw[0] : detailRaw;
    const text = [info?.firstmenu, info?.treatmenu]
      .filter(Boolean)
      .join(', ')
      .replace(/<[^>]*>/g, '');

    return this.splitMenuNames(text).map((name, index) => ({
      name,
      source: this.name,
      sourceId: `${match.contentid}:${index}`,
    }));
  }

  private splitMenuNames(text: string): string[] {
    return Array.from(
      new Set(
        text
          .split(/[,/|·\n]+/)
          .map((name) => name.replace(/\([^)]*\)/g, '').trim())
          .filter((name) => name.length > 1 && name.length <= 60),
      ),
    );
  }
}
