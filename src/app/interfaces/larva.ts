export interface Larva {
  id?: number;
  lote_laboratorio: string;
  laboratorio_origen: string;
  fecha_recepcion: string; // Se maneja como string para simplicidad en el date-picker
  cantidad_inicial: number;
  analisis_sanitario?: any; // JSONB puede ser cualquier objeto
  observaciones?: string;
}