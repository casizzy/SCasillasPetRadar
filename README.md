# PetRadar

API REST para registrar mascotas perdidas y encontradas. Cuando se registra una
mascota encontrada, el sistema busca automáticamente mascotas perdidas activas
en un radio de 500 metros (PostGIS `ST_DWithin` sobre `::geography`) y, si hay
coincidencias, envía un correo con los datos de la mascota encontrada, el
contacto de quien la encontró y un mapa estático de Mapbox con ambas
ubicaciones.

## Stack

- NestJS + TypeORM
- PostgreSQL + PostGIS
- Redis (caché de `GET /lost-pets` y `GET /found-pets`)
- Nodemailer (correo de notificación)
- Mapbox Static Images API (mapa en el correo)
- Winston + Azure Application Insights (logs, requests, excepciones, dependencias)
- Docker / GitHub Actions → GHCR

## Endpoints

| Método | Ruta          | Descripción                                              |
|--------|---------------|-----------------------------------------------------------|
| POST   | /lost-pets    | Registrar una mascota perdida                              |
| GET    | /lost-pets    | Listar mascotas perdidas **activas** (cacheado en Redis)   |
| POST   | /found-pets   | Registrar una mascota encontrada + búsqueda por radio + email |
| GET    | /found-pets   | Listar mascotas encontradas (cacheado en Redis)            |

Todas las rutas quedan bajo el prefijo global `/api` (ver `main.ts`), por
ejemplo: `POST /api/lost-pets`.

### Body de ejemplo — `POST /lost-pets`

```json
{
  "name": "Firulais",
  "species": "Perro",
  "breed": "Labrador",
  "color": "Café",
  "size": "Grande",
  "description": "Collar rojo, muy amigable",
  "owner_name": "Juan Pérez",
  "owner_email": "juan@example.com",
  "owner_phone": "5512345678",
  "address": "Av. Siempre Viva 123",
  "lost_date": "2026-07-10T10:00:00Z",
  "lat": 19.432608,
  "lon": -99.133209
}
```

### Body de ejemplo — `POST /found-pets`

```json
{
  "species": "Perro",
  "breed": "Labrador",
  "color": "Café",
  "size": "Grande",
  "description": "Encontrado cerca del parque",
  "finder_name": "Ana López",
  "finder_email": "ana@example.com",
  "finder_phone": "5598765432",
  "address": "Parque Central",
  "found_date": "2026-07-13T09:00:00Z",
  "lat": 19.432700,
  "lon": -99.133100
}
```

## Levantar en local con Docker

```bash
docker compose up --build
```

Esto levanta la API (puerto 3000), Postgres+PostGIS (5432) y Redis (6379).

## Migraciones

```bash
npm run migration:run
```

La primera migración crea la extensión `postgis` y las tablas `lost_pets` y
`found_pets`, con índices `GIST` sobre `location` para acelerar las consultas
espaciales.

## Variables de entorno

Ver `.env` para la lista completa (`DB_*`, `REDIS_*`, `MAILER_*`,
`MAPBOX_TOKEN`, `APPINSIGHTS_CONNECTION_STRING`, `PORT`).

⚠️ **Importante**: el `.env` de este repo trae credenciales heredadas del
proyecto base (`incident-api-612`). Antes de desplegar o subir el repo a
GitHub, reemplaza `MAILER_PASSWORD`, `APPINSIGHTS_CONNECTION_STRING` y
`MAPBOX_TOKEN` por credenciales propias, y agrega `.env` a `.gitignore` para
no publicarlas.

## Despliegue

El workflow de GitHub Actions (`.github/workflows/build.yaml`) compila,
construye la imagen Docker y la publica en GHCR (`ghcr.io`) en cada push a
`main`. Requiere los secrets `DOCKER_USER`, `DOCKER_PASSWORD` y
`DOCKER_IMAGE_NAME` configurados en el repositorio.
