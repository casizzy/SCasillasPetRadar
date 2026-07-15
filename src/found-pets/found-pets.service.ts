import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoundPet } from 'src/core/db/entities/found-pet.entity';
import { CreateFoundPetDTO } from 'src/core/interfaces/found-pet.interface';
import { CacheService } from 'src/cache/cache.service';
import { EmailService } from 'src/email/email.service';
import { LostPetsService } from 'src/lost-pets/lost-pets.service';
import { generateMatchEmailTemplate } from './templates/match-email.template';
import { logger } from 'src/config/logger';
import { EmailOptions } from 'src/core/interfaces/mail-option.interface';
const CACHE_KEY_ALL_FOUND_PETS = 'found-pets:all';
const SEARCH_RADIUS_METERS = 500;
const NOTIFICATION_EMAIL = 'stellycr@gmail.com';

@Injectable()
export class FoundPetsService {
  constructor(
    @InjectRepository(FoundPet)
    private readonly foundPetRepository: Repository<FoundPet>,
    private readonly cacheService: CacheService,
    private readonly emailService: EmailService,
    private readonly lostPetsService: LostPetsService,
  ) {}

  async createFoundPet(dto: CreateFoundPetDTO): Promise<FoundPet> {
    const newFoundPet = this.foundPetRepository.create({
      species: dto.species,
      breed: dto.breed,
      color: dto.color,
      size: dto.size,
      description: dto.description,
      photo_url: dto.photo_url,
      finder_name: dto.finder_name,
      finder_email: dto.finder_email,
      finder_phone: dto.finder_phone,
      address: dto.address,
      found_date: new Date(dto.found_date),
      location: {
        type: 'Point',
        coordinates: [dto.lon, dto.lat],
      },
    });

    logger.info('[FoundPetsService] Registrando mascota encontrada');
    const saved = await this.foundPetRepository.save(newFoundPet);

    await this.cacheService.delete(CACHE_KEY_ALL_FOUND_PETS);

    await this.searchNearbyAndNotify(saved);

    return saved;
  }

  async getFoundPets(): Promise<FoundPet[]> {
    try {
      logger.info('[FoundPetsService] Consultando mascotas encontradas en caché');
      const cached = await this.cacheService.get<FoundPet[]>(CACHE_KEY_ALL_FOUND_PETS);
      if (cached && cached.length > 0) {
        logger.info(`[FoundPetsService] ${cached.length} mascotas encontradas en caché`);
        return cached;
      }

      const foundPets = await this.foundPetRepository.find({
        order: { created_at: 'DESC' },
      });

      logger.info(`[FoundPetsService] Se obtuvieron ${foundPets.length} mascotas encontradas de la BD`);
      await this.cacheService.set(CACHE_KEY_ALL_FOUND_PETS, JSON.stringify(foundPets));
      return foundPets;
    } catch (error) {
      logger.error('[FoundPetsService] Error al obtener mascotas encontradas');
      logger.error(error);
      return [];
    }
  }

  private async searchNearbyAndNotify(foundPet: FoundPet): Promise<void> {
    const [lon, lat] = foundPet.location.coordinates;

    const matches = await this.lostPetsService.findActiveLostPetsNearby(
      lat,
      lon,
      SEARCH_RADIUS_METERS,
    );

    logger.info(
      `[FoundPetsService] ${matches.length} mascota(s) perdida(s) encontradas en un radio de ${SEARCH_RADIUS_METERS}m`,
    );

    if (matches.length === 0) {
      return;
    }

    for (const match of matches) {
      const html = generateMatchEmailTemplate(foundPet, match);
      const options: EmailOptions = {
        to: NOTIFICATION_EMAIL,
        subject: `🐾 PetRadar: Posible avistamiento de ${match.name} cerca de ti`,
        html,
      };

      const sent = await this.emailService.sendEmail(options);
      logger.info(
        `[FoundPetsService] Correo de coincidencia con lost_pet #${match.id} enviado a ${match.owner_email}: ${sent}`,
      );
    }
  }
}