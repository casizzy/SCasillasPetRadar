import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LostPet } from 'src/core/db/entities/lost-pet.entity';
import { CacheModule } from 'src/cache/cache.module';
import { LostPetsService } from './lost-pets.service';
import { LostPetsController } from './lost-pets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LostPet]), CacheModule],
  providers: [LostPetsService],
  controllers: [LostPetsController],
  exports: [LostPetsService],
})
export class LostPetsModule {}
