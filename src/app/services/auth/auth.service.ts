import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DecodejwtService } from './decodejwt.service';
import { UserData } from 'src/app/interfaces/user';
import { Auth } from 'src/app/interfaces/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private servidor = `${environment.server}/api/auth/`;
  private _currentUser = new BehaviorSubject<UserData | null>(null);
  public currentUser$: Observable<UserData | null> = this._currentUser.asObservable();

  constructor(private servicio: HttpClient, private decodejwt: DecodejwtService) {
    this.loadCurrentUser();
  }

  verificarUsuario(usuario: Auth): Observable<any> {
    return this.servicio.post(`${this.servidor}login`, usuario);
  }
  loadCurrentUser() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = this.decodejwt.desencriptar(token);
        const userData: UserData = {
          id: decoded.id,
          tipoUsuario: decoded.role,
          nombre: `${decoded.nombres} ${decoded.apellidos}`,
          nombres: decoded.nombres,
          apellidos: decoded.apellidos,
          usuario: decoded.usuario
        };
        this._currentUser.next(userData);
      } catch (error) {
        console.error('Error decodificando token en AuthService:', error);
        this.logout();
      }
    } else {
      this._currentUser.next(null);
    }
  }

  loginSuccess(token: string) {
    localStorage.setItem('token', token);
    this.loadCurrentUser();
  }

  logout() {
    localStorage.removeItem('token');
    this._currentUser.next(null);
  }

}
