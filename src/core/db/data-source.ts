import { envs } from 'src/config/envs';
import { DataSource, DataSourceOptions } from 'typeorm';
import { LostPet } from './entities/lost-pet.entity';
import { FoundPet } from './entities/found-pet.entity';

export const dataSourceOptions: DataSourceOptions = {
  host: envs.DB_HOST,
  type: 'postgres',
  port: envs.DB_PORT,
  database: envs.DB_NAME,
  username: envs.DB_USER,
  password: envs.DB_PASSWORD,
  entities: [LostPet, FoundPet],
  synchronize: false,
  migrations: ['dist/core/db/migrations/*'],
};

export const dataSource = new DataSource(dataSourceOptions);
