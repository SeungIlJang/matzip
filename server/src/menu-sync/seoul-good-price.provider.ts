import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { Restaurant } from 'src/restaurant/restaurant.entity';
import { ImportedMenu, MenuProvider } from './menu-provider.interface';

interface SeoulMenuItem {
  SH_ID?: string;
  SH_NAME?: string;
  SH_ADDR?: string;
  INDUTY_CODE_SE_NAME?: string;
  IM_NAME?: string;
  IM_PRICE?: number | string;
}

@Injectable()
export class SeoulGoodPriceProvider implements MenuProvider {
  readonly name = 'seoul-good-price';
  private cachedRows?: { expiresAt: number; rows: SeoulMenuItem[] };

  constructor(private readonly config: ConfigService) {}

  isConfigured() {
    return Boolean(this.serviceKey);
  }

  async findMenus(restaurant: Restaurant): Promise<ImportedMenu[]> {
    if (!this.serviceKey || !this.isSeoul(restaurant.address)) return [];

    const rows = await this.fetchAllRows();
    const matches = rows.filter(
      (row) =>
        this.normalizeName(row.SH_NAME ?? '') ===
          this.normalizeName(restaurant.name) &&
        this.addressScore(row.SH_ADDR ?? '', restaurant.address) >= 2,
    );

    return matches
      .filter((row) => typeof row.IM_NAME === 'string' && row.IM_NAME.trim())
      .map((row) => ({
        name: row.IM_NAME!.trim(),
        price: this.parsePrice(row.IM_PRICE),
        source: this.name,
        sourceId: `${row.SH_ID ?? this.normalizeName(row.SH_NAME ?? '')}:${
          row.IM_NAME
        }`,
      }));
  }

  private async fetchAllRows() {
    if (this.cachedRows && this.cachedRows.expiresAt > Date.now()) {
      return this.cachedRows.rows;
    }
    const first = await this.fetchRows(1, 1000);
    const rows: SeoulMenuItem[] = [...first.rows];
    for (let start = 1001; start <= first.total; start += 1000) {
      const page = await this.fetchRows(start, Math.min(start + 999, first.total));
      rows.push(...page.rows);
    }
    this.cachedRows = {
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      rows,
    };
    return rows;
  }

  private async fetchRows(start: number, end: number) {
    const response = await axios.get(
      `http://openapi.seoul.go.kr:8088/${encodeURIComponent(
        this.serviceKey!,
      )}/json/ListPriceModelStoreProductService/${start}/${end}/`,
      { timeout: 10000 },
    );
    const payload = response.data?.ListPriceModelStoreProductService;
    return {
      total: Number(payload?.list_total_count ?? 0),
      rows: (Array.isArray(payload?.row) ? payload.row : []) as SeoulMenuItem[],
    };
  }

  private get serviceKey() {
    return this.config.get<string>('SEOUL_OPEN_DATA_API_KEY');
  }

  private isSeoul(address: string) {
    return /(^|\s)서울(특별시)?(\s|$)/.test(address);
  }

  private addressScore(left: string, right: string) {
    const target = this.addressTokens(right);
    return [...this.addressTokens(left)].filter((token) => target.has(token))
      .length;
  }

  private addressTokens(value: string) {
    return new Set(
      this.normalize(value)
        .split(' ')
        .filter((token) => token.length > 1 && token !== '서울특별시'),
    );
  }

  private normalizeName(value: string) {
    return this.normalize(value).replace(/\s/g, '');
  }

  private normalize(value: string) {
    return value
      .replace(/\([^)]*\)/g, ' ')
      .replace(/[^0-9a-zA-Z가-힣-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  private parsePrice(value: SeoulMenuItem['IM_PRICE']) {
    if (value == null) return null;
    const price = Number(String(value).replace(/[^0-9]/g, ''));
    return Number.isSafeInteger(price) && price > 0 ? price : null;
  }
}
