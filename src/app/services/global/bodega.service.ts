import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BodegaMovimiento } from 'src/app/interfaces/bodega';

@Injectable({
  providedIn: 'root'
})
export class BodegaService {

  private apiUrl = `${environment.server}/api/bodega`;

  constructor(private http: HttpClient) { }

  // Obtener los movimientos de bodega
  obtenerMovimientos(): Observable<BodegaMovimiento[]> {
    return this.http.get<BodegaMovimiento[]>(`${this.apiUrl}/movimientos`);
  }

  // Agregar un nuevo movimiento
  agregarMovimiento(movimiento: BodegaMovimiento): Observable<any> {
    return this.http.post(`${this.apiUrl}/movimiento`, movimiento);
  }

  // Actualizar la devolución de un movimiento
  actualizarDevolucion(id: number, data: { devuelve: '' | 'Si' | 'No'; cantidadDevuelta?: number | null }) {
    return this.http.put(`${this.apiUrl}/movimiento/devolucion`, { id, ...data });
  }

}
