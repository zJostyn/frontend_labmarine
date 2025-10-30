import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { BodegaMovimiento } from 'src/app/interfaces/bodega';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BodegaService } from 'src/app/services/global/bodega.service';
import { CantidadDevueltaModalComponent } from './cantidad-devuelta-modal/cantidad-devuelta-modal.component';
import { CorridasService } from 'src/app/services/global/corridas.service';
import { Corrida } from 'src/app/interfaces/corrida';

@Component({
  selector: 'app-bodega',
  templateUrl: './bodega.page.html',
  styleUrls: ['./bodega.page.scss'],
  imports: [IonicModule, FormsModule, CommonModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BodegaPage implements OnInit, OnDestroy {

  // 1. Dos listas: una maestra y una para mostrar (filtrada)
  private todosLosMovimientos: BodegaMovimiento[] = [];
  movimientosFiltrados: BodegaMovimiento[] = [];
  
  corridasDisponibles: Corrida[] = [];
  private userSubscription: Subscription | undefined;

  // 2. Propiedad para el filtro
  corridaSeleccionadaId: number | 'todos' = 'todos';

  totalKilos: number = 0;
  totalSacos: number = 0;
  totalDevuelto: number = 0;
  totalRestante: number = 0;

  usuarioId: number = 0;
  tipoUsuario: string = '';
  usuario: any = {};

  nuevoMovimiento: BodegaMovimiento = {
    id: 0,
    fecha: new Date(),
    descripcion: '',
    kilos: 0,
    sacos: 0,
    lleva: 'Si',
    devuelve: '',
    responsable: '',
    usuarioId: 0,
    cant_devuelta: null,
    corrida_id: null
  };

  constructor(
    private bodegaService: BodegaService,
    private authService: AuthService,
    private modalController: ModalController,
    private corridasService: CorridasService
  ) { }

  ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.usuario = user;
      this.usuarioId = this.usuario?.id ?? 0;
      this.tipoUsuario = this.usuario?.tipoUsuario ?? '';
      this.nuevoMovimiento.responsable = this.usuario?.nombre ?? '';
      this.cargarDatosIniciales();
    });
  }

  cargarDatosIniciales() {
    this.cargarMovimientos();
    this.cargarCorridas();
  }

  cargarCorridas() {
    this.corridasService.getCorridas().subscribe(data => {
      this.corridasDisponibles = data;
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  cargarMovimientos() {
    this.bodegaService.obtenerMovimientos().subscribe(data => {
      // 3. La data de la API siempre se guarda en la lista maestra
      this.todosLosMovimientos = (data || []).map(m => ({
        ...m,
        kilos: Number(m.kilos) || 0,
        sacos: Number(m.sacos) || 0,
        cant_devuelta: Number((m as any).cant_devuelta) || Number((m as any).cantidadDevuelta) || Number((m as any).cantidad_devuelta) || null,
        devuelve: m.devuelve || '',
        corrida_id: m.corrida_id || null
      }));

      // 4. Se llama al filtro para mostrar la vista inicial
      this.filtrarMovimientos();
    });
  }

  // 5. NUEVA FUNCIÓN: Se encarga de filtrar la lista y luego calcular los totales
  filtrarMovimientos() {
    if (this.corridaSeleccionadaId === 'todos') {
      this.movimientosFiltrados = [...this.todosLosMovimientos];
    } else {
      this.movimientosFiltrados = this.todosLosMovimientos.filter(
        mov => mov.corrida_id == this.corridaSeleccionadaId
      );
    }
    // Después de filtrar, siempre recalculamos los totales
    this.calcularTotales();
  }

  // 6. FUNCIÓN ACTUALIZADA: Ahora trabaja sobre la lista ya filtrada
  calcularTotales() {
    this.totalKilos = this.movimientosFiltrados.reduce((sum, mov) => sum + (mov.kilos || 0), 0);
    this.totalSacos = this.movimientosFiltrados.reduce((sum, mov) => sum + (mov.sacos || 0), 0);
    this.totalDevuelto = this.movimientosFiltrados
      .filter(mov => mov.devuelve === 'Si')
      .reduce((sum, mov) => sum + (mov.cant_devuelta || 0), 0);
    this.totalRestante = this.totalSacos - this.totalDevuelto;
  }
  
  // ... (El resto de tus funciones no cambian)
  // ... (getEcuadorTime, agregarMovimiento, etc.)
  private getEcuadorTime(): string {
    return new Date().toISOString();
  }


  agregarMovimiento() {
    this.nuevoMovimiento.usuarioId = this.usuarioId;
    this.nuevoMovimiento.fecha = this.getEcuadorTime();
    this.nuevoMovimiento.kilos = Number(this.nuevoMovimiento.kilos);
    this.nuevoMovimiento.sacos = Number(this.nuevoMovimiento.sacos);
    this.nuevoMovimiento.lleva = 'Si';
    this.nuevoMovimiento.devuelve = '';
    this.nuevoMovimiento.responsable = this.usuario?.nombre || 'Desconocido';

    this.bodegaService.agregarMovimiento(this.nuevoMovimiento).subscribe({
      next: () => {
        this.cargarDatosIniciales();
        this.nuevoMovimiento = {
          id: 0, fecha: new Date(), descripcion: '', kilos: 0, sacos: 0,
          lleva: 'Si', devuelve: '', responsable: this.usuario?.nombre || 'Desconocido',
          usuarioId: this.usuarioId, cant_devuelta: null, corrida_id: null
        };
      },
      error: (err) => console.error('Error al agregar movimiento', err)
    });
  }

  isDevuelveDisabled(mov: BodegaMovimiento): boolean {
    const rolesAutorizados = ['Administrador', 'Secretaria', 'Ingeniero', 'Trabajador'];
    const esRolAutorizado = rolesAutorizados.includes(this.tipoUsuario);

    if (!esRolAutorizado) {
      const nombreUsuarioActual = this.usuario?.nombre ?? '';
      const esResponsable = nombreUsuarioActual === mov.responsable;
      const estaPendiente = mov.devuelve === '' || mov.devuelve === null;
      return !(esResponsable && estaPendiente);
    }
    return false;
  }

  async onDevuelveChange(mov: BodegaMovimiento) {
    if (mov.devuelve === 'Si') {
      const modal = await this.modalController.create({
        component: CantidadDevueltaModalComponent,
        componentProps: { movimiento: mov },
      });
      await modal.present();
      const { data, role } = await modal.onWillDismiss();
      if (role === 'guardar' && data && data.cantidadDevuelta !== undefined && data.cantidadDevuelta !== null) {
        const cantidadAEnviar = data.cantidadDevuelta;
        mov.cant_devuelta = cantidadAEnviar;
        this.guardarDevolucion(mov.id, {
          devuelve: 'Si',
          cantidadDevuelta: cantidadAEnviar
        }, false);
      } else {
        mov.devuelve = '';
        this.guardarDevolucion(mov.id, {
          devuelve: '',
          cantidadDevuelta: null
        });
      }
    }
    else {
      mov.cant_devuelta = null;
      this.guardarDevolucion(mov.id, {
        devuelve: mov.devuelve as ('' | 'Si' | 'No'),
        cantidadDevuelta: null
      });
    }
  }

  guardarDevolucion(id: number, data: { devuelve: '' | 'Si' | 'No'; cantidadDevuelta?: number | null }, reload: boolean = true) {
    this.bodegaService.actualizarDevolucion(id, data).subscribe({
      next: (response) => {
        if (reload) {
          this.cargarMovimientos();
        } else {
          this.calcularTotales();
        }
      },
      error: (err) => {
        console.error('Error al actualizar devolución', err);
        this.cargarMovimientos();
      }
    });
  }

}