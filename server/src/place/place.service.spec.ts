import axios from 'axios';
import { ConfigService } from '@nestjs/config';

import { PlaceService } from './place.service';

jest.mock('axios');

describe('PlaceService', () => {
  const service = new PlaceService({
    get: (key: string) => (key.startsWith('NAVER_SEARCH_') ? 'key' : undefined),
  } as ConfigService);

  beforeEach(() => jest.clearAllMocks());

  it('merges categorized area searches and removes duplicate stores', async () => {
    (axios.get as jest.Mock).mockImplementation((_url, config) => {
      const keyword = String(config.params.query).split(' ').pop();
      return Promise.resolve({
        data: {
          items: [
            {
              title: '<b>공통식당</b>',
              category: '한식',
              address: '서울 마포구 망원동 1',
              roadAddress: '서울 마포구 망원로 1',
              mapx: 1269000000,
              mapy: 375500000,
            },
            {
              title: `${keyword}식당`,
              category: keyword,
              address: `서울 마포구 망원동 ${keyword}`,
              roadAddress: '',
              mapx: 1269000000,
              mapy: 375500000,
            },
          ],
        },
      });
    });

    const places = await service.search('서울특별시 마포구 망원동 맛집');

    expect(axios.get).toHaveBeenCalledTimes(10);
    expect(places.filter((place) => place.name === '공통식당')).toHaveLength(1);
    expect(places).toHaveLength(11);
  });
});
