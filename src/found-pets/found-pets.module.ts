import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoundPet } from 'src/core/db/entities/found-pet.entity';
import { CacheModule } from 'src/cache/cache.module';
import { EmailModule } from 'src/email/email.module';
import { LostPetsModule } from 'src/lost-pets/lost-pets.module';
import { FoundPetsService } from './found-pets.service';
import { FoundPetsController } from './found-pets.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([FoundPet]),
    CacheModule,
    EmailModule,
    LostPetsModule,
  ],
  providers: [FoundPetsService],
  controllers: [FoundPetsController],
})
export class FoundPetsModule {}
