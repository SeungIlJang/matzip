import axios from 'axios';
import { ConfigService } from '@nestjs/config';

import { Restaurant } from 'src/restaurant/restaurant.entity';
import { GoodPriceProvider } from './good-price.provider';

jest.mock('axios');

describe('GoodPriceProvider', () => {
  const provider = new GoodPriceProvider({
    get: (key: string) =>
      key === 'TOUR_API_SERVICE_KEY' ? 'shared-service-key' : undefined,
  } as ConfigService);

  it('imports menu names and numeric prices from the matched store', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        data: [
          {
            업소명: '돈까스보라',
            주소: '서울특별시 종로구 대학로5길 5 (연건동)',
            메뉴1: '수제 돈까스',
            가격1: '7,000원',
            메뉴2: '돈까스 정식',
            가격2: 8000,
          },
        ],
      },
    });

    const menus = await provider.findMenus({
      name: '돈까스보라',
      address: '서울특별시 종로구 대학로5길 5',
    } as Restaurant);

    expect(menus).toEqual([
      expect.objectContaining({
        name: '수제 돈까스',
        price: 7000,
        source: 'good-price',
      }),
      expect.objectContaining({
        name: '돈까스 정식',
        price: 8000,
        source: 'good-price',
      }),
    ]);
  });

  it('does not choose an ambiguous store without an address match', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        data: [
          { 업소명: '한식당', 주소: '서울특별시 종로구', 메뉴1: '백반' },
          { 업소명: '한식당', 주소: '부산광역시 중구', 메뉴1: '국밥' },
        ],
      },
    });

    const menus = await provider.findMenus({
      name: '한식당',
      address: '대전광역시 서구 둔산동',
    } as Restaurant);

    expect(menus).toEqual([]);
  });
});
