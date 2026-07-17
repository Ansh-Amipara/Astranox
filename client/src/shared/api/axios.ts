import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
});

export const getSpriteUrl = (id: string | number) => `${process.env.NEXT_PUBLIC_ASSET_URL || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'}${id}.png`;
