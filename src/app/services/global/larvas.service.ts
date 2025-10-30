import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Larva } from 'src/app/interfaces/larva';

@Injectable({
  providedIn: 'root'
})
export class LarvasService {

  private apiUrl = `${environment.server}/api/larvas`;

  constructor(private http: HttpClient) { }

  // OBTENER todos los lotes de larvas
  getLarvas(): Observable<Larva[]> {
    return this.http.get<Larva[]>(`${this.apiUrl}/`);
  }

  // AGREGAR un nuevo lote de larvas
  agregarLarva(larva: Larva): Observable<any> {
    return this.http.post(`${this.apiUrl}/larva`, larva);
  }

  // ACTUALIZAR un lote de larvas
  actualizarLarva(id: number, larva: Larva): Observable<any> {
    return this.http.put(`${this.apiUrl}/larva/${id}`, larva);
  }

  // ELIMINAR un lote de larvas
  eliminarLarva(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/larva/${id}`);
  }
}