export interface Piscina {
  id?: number;
  nombre: string;
  hectareas: number;
  categoria: 'Precria' | 'Madre' | 'Piscina' | null;
}