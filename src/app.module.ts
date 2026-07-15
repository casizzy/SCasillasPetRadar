import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from './email/email.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './core/db/data-source';
import { CacheModule } from './cache/cache.module';
import { LostPetsModule } from './lost-pets/lost-pets.module';
import { FoundPetsModule } from './found-pets/found-pets.module';

@Module({
  imports: [
    EmailModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    CacheModule,
    LostPetsModule,
    FoundPetsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
