import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LostPet } from 'src/core/db/entities/lost-pet.entity';
import { CreateLostPetDTO } from 'src/core/interfaces/lost-pet.interface';
import { CacheService } from 'src/cache/cache.service';
import { logger } from 'src/config/logger';

const CACHE_KEY_ACTIVE_LOST_PETS = 'lost-pets:active';

@Injectable()
export class LostPetsService {
  constructor(
    @InjectRepository(LostPet)
    private readonly lostPetRepository: Repository<LostPet>,
    private readonly cacheService: CacheService,
  ) {}

  async createLostPet(dto: CreateLostPetDTO): Promise<LostPet> {
    const newLostPet = this.lostPetRepository.create({
      name: dto.name,
      species: dto.species,
      breed: dto.breed,
      color: dto.color,
      size: dto.size,
      description: dto.description,
      photo_url: dto.photo_url,
      owner_name: dto.owner_name,
      owner_email: dto.owner_email,
      owner_phone: dto.owner_phone,
      address: dto.address,
      lost_date: new Date(dto.lost_date),
      is_active: true,
      location: {
        type: 'Point',
        coordinates: [dto.lon, dto.lat],
      },
    });

    logger.info('[LostPetsService] Creando mascota perdida');
    const saved = await this.lostPetRepository.save(newLostPet);

    await this.cacheService.delete(CACHE_KEY_ACTIVE_LOST_PETS);

    return saved;
  }

  async getActiveLostPets(): Promise<LostPet[]> {
    try {
      logger.info('[LostPetsService] Consultando mascotas perdidas activas en caché');
      const cached = await this.cacheService.get<LostPet[]>(CACHE_KEY_ACTIVE_LOST_PETS);
      if (cached && cached.length > 0) {
        logger.info(`[LostPetsService] ${cached.length} mascotas perdidas encontradas en caché`);
        return cached;
      }

      const lostPets = await this.lostPetRepository.find({
        where: { is_active: true },
        order: { created_at: 'DESC' },
      });

      logger.info(`[LostPetsService] Se obtuvieron ${lostPets.length} mascotas perdidas activas de la BD`);
      await this.cacheService.set(CACHE_KEY_ACTIVE_LOST_PETS, JSON.stringify(lostPets));
      return lostPets;
    } catch (error) {
      logger.error('[LostPetsService] Error al obtener mascotas perdidas');
      logger.error(error);
      return [];
    }
  }

  async findActiveLostPetsNearby(lat: number, lon: number, radiusInMeters: number): Promise<
    (LostPet & { distance: number })[]
  > {
    const rows = await this.lostPetRepository
      .createQueryBuilder('lost_pet')
      .addSelect(
        `ST_Distance(
          lost_pet.location::geography,
          ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography
        )`,
        'distance',
      )
      .where('lost_pet.is_active = true')
      .andWhere(
        `ST_DWithin(
          lost_pet.location::geography,
          ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
          :radius
        )`,
        { lon, lat, radius: radiusInMeters },
      )
      .orderBy('distance', 'ASC')
      .setParameters({ lon, lat, radius: radiusInMeters })
      .getRawAndEntities();

    return rows.entities.map((entity, index) => ({
      ...entity,
      distance: parseFloat(rows.raw[index].distance),
    }));
  }
}
