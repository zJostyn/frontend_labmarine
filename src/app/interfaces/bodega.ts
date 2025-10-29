export interface BodegaMovimiento {
  id: number;
  fecha: Date | string;
  descripcion: string;
  kilos: number;
  sacos: number;
  lleva: '' | 'Si' | 'No';
  devuelve: '' | 'Si' | 'No' | null;
  responsable: string;
  usuarioId: number;
  cant_devuelta: number | null;
}
