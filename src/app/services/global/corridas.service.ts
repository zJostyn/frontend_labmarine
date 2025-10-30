import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Corrida, CorridaDTO } from 'src/app/interfaces/corrida';

@Injectable({
  providedIn: 'root'
})
export class CorridasService {

  private apiUrl = `${environment.server}/api/corridas`;

  constructor(private http: HttpClient) { }

  // OBTENER todas las corridas
  getCorridas(): Observable<Corrida[]> {
    return this.http.get<Corrida[]>(`${this.apiUrl}/`);
  }

  // AGREGAR una nueva corrida
  agregarCorrida(corrida: CorridaDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/corrida`, corrida);
  }
}