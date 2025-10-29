import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router, RouterModule } from '@angular/router';
import { AlertController, IonicModule, MenuController } from '@ionic/angular';
import { filter, map, Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [CommonModule, IonicModule, RouterModule],
})
export class DashboardComponent  implements OnInit {

  usuario: any = {};
  pageTitle = '';
  private subscriptions: Subscription[] = [];

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private menu: MenuController, private auth: AuthService, private alert: AlertController,) {
  }

ngOnInit() {
    this.cargarDatosUsuario();

    this.router.events.pipe(
      filter(event => event instanceof ActivationEnd),
      map((event: ActivationEnd) => {
        let route = event.snapshot;
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route.data['title'] as string | undefined;
      })
    ).subscribe(title => {
      this.pageTitle = title ?? 'HDR UTMACH';
    });
  }

    cargarDatosUsuario() {
    const userSub = this.auth.currentUser$.subscribe(user => {
      if (user) {
        this.usuario = {
          name: user.nombre || 'Nombre Completo',
          role: user.tipoUsuario || 'Rol',
          user: user.usuario || 'Usuario',
          id: user.id || '0',
        };
      } else {
        this.usuario = {};
      }
    });
    this.subscriptions.push(userSub);

  }

    ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleMenu() {
    this.menu.toggle();
  }


  async alertaLogout() {
    const exito = await this.alert.create({
      header: 'LABMARINE SAS',
      message: 'Estas seguro de querer cerrar sesión?',
      buttons: [
        {
          text: 'Aceptar',
          handler: () => {
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
          }
        },
        {
          text: 'Cancelar',
          handler: () => {

          }
        }
      ]
    });

    await exito.present();
  }

}
