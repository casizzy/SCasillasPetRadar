import { Body, Controller, Get, Post } from '@nestjs/common';
import { FoundPetsService } from './found-pets.service';
import type { CreateFoundPetDTO } from 'src/core/interfaces/found-pet.interface';

@Controller('found-pets')
export class FoundPetsController {
  constructor(private readonly foundPetsService: FoundPetsService) {}

  @Post()
  async createFoundPet(@Body() dto: CreateFoundPetDTO) {
    return this.foundPetsService.createFoundPet(dto);
  }

  @Get()
  async getFoundPets() {
    return this.foundPetsService.getFoundPets();
  }
}
