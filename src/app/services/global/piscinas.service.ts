import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Piscina } from 'src/app/interfaces/piscina';

@Injectable({
  providedIn: 'root'
})
export class PiscinasService {

  private apiUrl = `${environment.server}/api/piscinas`;

  constructor(private http: HttpClient) { }

  // OBTENER todas las piscinas
  getPiscinas(): Observable<Piscina[]> {
    return this.http.get<Piscina[]>(`${this.apiUrl}/`);
  }

  // AGREGAR una nueva piscina
  agregarPiscina(piscina: Piscina): Observable<any> {
    return this.http.post(`${this.apiUrl}/piscina`, piscina);
  }

  // ACTUALIZAR una piscina existente
  actualizarPiscina(id: number, piscina: Piscina): Observable<any> {
    return this.http.put(`${this.apiUrl}/piscina/${id}`, piscina);
  }

  // ELIMINAR una piscina
  eliminarPiscina(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/piscina/${id}`);
  }
}