import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { Restaurant } from 'src/restaurant/restaurant.entity';
import { ImportedMenu, MenuProvider } from './menu-provider.interface';

interface GoodPriceItem {
  가격1?: string | number | null;
  가격2?: string | number | null;
  가격3?: string | number | null;
  가격4?: string | number | null;
  메뉴1?: string | null;
  메뉴2?: string | null;
  메뉴3?: string | null;
  메뉴4?: string | null;
  업소명?: string | null;
  주소?: string | null;
}

@Injectable()
export class GoodPriceProvider implements MenuProvider {
  readonly name = 'good-price';
  private readonly defaultUrl =
    'https://api.odcloud.kr/api/3045247/v1/uddi:12a36b40-6230-4401-b647-b8456a789c7f';

  constructor(private readonly config: ConfigService) {}

  isConfigured() {
    return Boolean(this.serviceKey);
  }

  async findMenus(restaurant: Restaurant): Promise<ImportedMenu[]> {
    if (!this.serviceKey) return [];

    const response = await axios.get(
      this.config.get<string>('GOOD_PRICE_API_URL') ?? this.defaultUrl,
      {
        params: {
          page: 1,
          perPage: 100,
          serviceKey: this.serviceKey,
          'cond[업소명::EQ]': restaurant.name.trim(),
        },
        timeout: 10000,
      },
    );

    const candidates: GoodPriceItem[] = Array.isArray(response.data?.data)
      ? response.data.data
      : [];
    const match = this.findAddressMatch(candidates, restaurant.address);
    if (!match) return [];

    const sourceId = `${this.normalize(match.업소명 ?? '')}:${this.normalize(
      match.주소 ?? '',
    )}`;
    return [1, 2, 3, 4]
      .map((index) => {
        const name = match[`메뉴${index}` as keyof GoodPriceItem];
        const price = match[`가격${index}` as keyof GoodPriceItem];
        if (typeof name !== 'string' || !name.trim()) return null;
        return {
          name: name.trim(),
          price: this.parsePrice(price),
          source: this.name,
          sourceId: `${sourceId}:${index}`,
        } as ImportedMenu;
      })
      .filter((menu): menu is ImportedMenu => menu !== null);
  }

  private get serviceKey() {
    return (
      this.config.get<string>('GOOD_PRICE_API_SERVICE_KEY') ??
      this.config.get<string>('TOUR_API_SERVICE_KEY')
    );
  }

  private findAddressMatch(items: GoodPriceItem[], address: string) {
    if (items.length === 1) return items[0];
    const target = this.addressTokens(address);
    if (!target.size) return undefined;
    return items
      .map((item) => ({
        item,
        score: [...this.addressTokens(item.주소 ?? '')].filter((token) =>
          target.has(token),
        ).length,
      }))
      .filter(({ score }) => score >= 2)
      .sort((left, right) => right.score - left.score)[0]?.item;
  }

  private addressTokens(value: string) {
    return new Set(
      this.normalize(value)
        .split(' ')
        .filter((token) => token.length > 1),
    );
  }

  private normalize(value: string) {
    return value
      .replace(/\([^)]*\)/g, ' ')
      .replace(/[^0-9a-zA-Z가-힣-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  private parsePrice(value: GoodPriceItem[keyof GoodPriceItem]) {
    if (value == null) return null;
    const digits = String(value).replace(/[^0-9]/g, '');
    if (!digits) return null;
    const price = Number(digits);
    return Number.isSafeInteger(price) ? price : null;
  }
}
