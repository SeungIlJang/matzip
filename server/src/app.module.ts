import { dirname, join, resolve } from 'path';
import { mkdirSync } from 'fs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { ImageModule } from './image/image.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { MenuModule } from './menu/menu.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { FavoriteModule } from './favorite/favorite.module';
import { PlaceModule } from './place/place.module';
import { LoggerMiddleware } from './@common/middlewares/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const configuredPath = configService.get<string>('DB_PATH');
        const database = configuredPath
          ? resolve(configuredPath)
          : resolve(__dirname, '..', 'data', 'matzip.sqlite');

        mkdirSync(dirname(database), { recursive: true });

        return {
          type: 'sqlite' as const,
          database,
          entities: [__dirname + '/**/*.entity.{js,ts}'],
          // 현재는 로컬 파일 DB를 사용하므로 개발 중 스키마를 자동 동기화한다.
          // 운영 배포 단계에서는 마이그레이션 방식으로 전환한다.
          synchronize:
            process.env.NODE_ENV !== 'production' &&
            configService.get<string>('DB_SYNCHRONIZE') !== 'false',
        };
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/',
    }),
    AuthModule,
    ImageModule,
    RestaurantModule,
    MenuModule,
    RecommendationModule,
    FavoriteModule,
    PlaceModule,
  ],
  providers: [ConfigService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
