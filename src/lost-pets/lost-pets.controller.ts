import { Body, Controller, Get, Post } from '@nestjs/common';
import { LostPetsService } from './lost-pets.service';
import type { CreateLostPetDTO } from 'src/core/interfaces/lost-pet.interface';

@Controller('lost-pets')
export class LostPetsController {
  constructor(private readonly lostPetsService: LostPetsService) {}

  @Post()
  async createLostPet(@Body() dto: CreateLostPetDTO) {
    return this.lostPetsService.createLostPet(dto);
  }

  @Get()
  async getLostPets() {
    return this.lostPetsService.getActiveLostPets();
  }
}
