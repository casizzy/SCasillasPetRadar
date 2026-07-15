export interface CreateLostPetDTO {
  name: string;
  species: string;
  breed: string;
  color: string;
  size: string;
  description: string;
  photo_url?: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  lat: number;
  lon: number;
  address: string;
  lost_date: string;
}
