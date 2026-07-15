import { envs } from 'src/config/envs';

/**
 * Genera la URL de un mapa estático de Mapbox mostrando dos ubicaciones:
 * la ubicación donde se perdió la mascota (rojo) y la ubicación donde fue
 * encontrada (verde). Usa bbox "auto" para que ambos pines queden visibles.
 */
export const generateMapBoxImage = (
  lostLat: number,
  lostLon: number,
  foundLat: number,
  foundLon: number,
): string => {
  const accessToken = envs.MAPBOX_TOKEN;
  const w = 800;
  const h = 400;

  const lostPin = `pin-s-l+e74c3c(${lostLon},${lostLat})`;
  const foundPin = `pin-s-f+27ae60(${foundLon},${foundLat})`;

  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${lostPin},${foundPin}/auto/${w}x${h}?padding=60&access_token=${accessToken}`;
};

/**
 * Mapa estático con un solo punto (por si se necesita en otros contextos).
 */
export const generateSinglePointMapBoxImage = (lat: number, lon: number): string => {
  const accessToken = envs.MAPBOX_TOKEN;
  const zoom = 14;
  const w = 800;
  const h = 400;
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+e74c3c(${lon},${lat})/${lon},${lat},${zoom}/${w}x${h}?access_token=${accessToken}`;
};
