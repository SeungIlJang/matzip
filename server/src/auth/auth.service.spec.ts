import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

import { AuthService } from './auth.service';
import { User } from './user.entity';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(
      {} as Repository<User>,
      {} as JwtService,
      {} as ConfigService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
