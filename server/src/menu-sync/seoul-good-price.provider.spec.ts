import axios from 'axios';
import { ConfigService } from '@nestjs/config';

import { Restaurant } from 'src/restaurant/restaurant.entity';
import { SeoulGoodPriceProvider } from './seoul-good-price.provider';

jest.mock('axios');

describe('SeoulGoodPriceProvider', () => {
  const provider = new SeoulGoodPriceProvider({
    get: (key: string) =>
      key === 'SEOUL_OPEN_DATA_API_KEY' ? 'seoul-key' : undefined,
  } as ConfigService);

  beforeEach(() => jest.clearAllMocks());

  it('imports every menu row for the matching Seoul store', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        ListPriceModelStoreProductService: {
          list_total_count: 2,
          row: [
            {
              SH_ID: '42',
              SH_NAME: '서울식당',
              SH_ADDR: '서울특별시 종로구 대학로5길 5',
              IM_NAME: '김치찌개',
              IM_PRICE: 7000,
            },
            {
              SH_ID: '42',
              SH_NAME: '서울 식당',
              SH_ADDR: '서울 종로구 대학로5길 5 (연건동)',
              IM_NAME: '된장찌개',
              IM_PRICE: '6,000원',
            },
          ],
        },
      },
    });

    const menus = await provider.findMenus({
      name: '서울식당',
      address: '서울특별시 종로구 대학로5길 5',
    } as Restaurant);

    expect(menus).toEqual([
      expect.objectContaining({
        name: '김치찌개',
        price: 7000,
        source: 'seoul-good-price',
      }),
      expect.objectContaining({
        name: '된장찌개',
        price: 6000,
        source: 'seoul-good-price',
      }),
    ]);
  });

  it('does not call the Seoul API for a non-Seoul restaurant', async () => {
    const menus = await provider.findMenus({
      name: '부산식당',
      address: '부산광역시 중구 중앙동',
    } as Restaurant);

    expect(menus).toEqual([]);
    expect(axios.get).not.toHaveBeenCalled();
  });
});
