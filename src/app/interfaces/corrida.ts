import { Larva } from "./larva";
import { Piscina } from "./piscina";

export interface CorridaDTO {
  fecha_inicio: string;
  larva_id: number;
  densidad: number;
  piscinaIds: number[]; // Enviamos un array de IDs
}

export interface Corrida {
  id: number;
  fecha_inicio: string;
  densidad: number;
  larva: Larva;         // Recibimos el objeto completo de la larva
  piscinas: Piscina[];  // Recibimos un array de objetos de piscina
}