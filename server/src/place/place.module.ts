import { Module } from '@nestjs/common';

import { PlaceController } from './place.controller';
import { PlaceService } from './place.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PlaceController],
  providers: [PlaceService],
})
export class PlaceModule {}
