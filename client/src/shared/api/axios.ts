import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
});

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'd0baluu2';
const getCloudinaryUrl = (path: string) => `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v1/astranox/${path}`;

export const getSpriteUrl = (id: string | number) => getCloudinaryUrl(`pokemon/${id}.png`);
export const getItemSpriteUrl = (name: string) => getCloudinaryUrl(`items/${name}.png`);
const typeNameToId: Record<string, number> = {
  normal: 1, fighting: 2, flying: 3, poison: 4, ground: 5, rock: 6, bug: 7, ghost: 8, steel: 9,
  fire: 10, water: 11, grass: 12, electric: 13, psychic: 14, ice: 15, dragon: 16, dark: 17, fairy: 18,
  unknown: 10001, shadow: 10002
};

export const getTypeSpriteUrl = (type: string, small: boolean = false) => {
  const id = typeNameToId[type.toLowerCase()];
  if (!id) return '';
  return small ? getCloudinaryUrl(`type/small/${id}.png`) : getCloudinaryUrl(`type/${id}.png`);
};
