import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs'; 
import { BodegaMovimiento } from 'src/app/interfaces/bodega';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BodegaService } from 'src/app/services/global/bodega.service';
import { CantidadDevueltaModalComponent } from './cantidad-devuelta-modal/cantidad-devuelta-modal.component';

@Component({
  selector: 'app-bodega',
  templateUrl: './bodega.page.html',
  styleUrls: ['./bodega.page.scss'],
  imports: [IonicModule, FormsModule, CommonModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BodegaPage implements OnInit, OnDestroy { 

  movimientos: BodegaMovimiento[] = [];
  private userSubscription: Subscription | undefined; 
  
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
    cant_devuelta: null 
  };

  constructor(
    private bodegaService: BodegaService, 
    private authService: AuthService, 
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.usuario = user;
      this.usuarioId = this.usuario?.id ?? 0;
      this.tipoUsuario = this.usuario?.tipoUsuario ?? '';
      this.nuevoMovimiento.responsable = this.usuario?.nombre ?? ''; 
      this.cargarMovimientos();
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  cargarMovimientos() {
    this.bodegaService.obtenerMovimientos().subscribe(data => {
      this.movimientos = (data || []).map(m => ({
        ...m,
        kilos: Number(m.kilos) || 0,
        sacos: Number(m.sacos) || 0,
        // Aseguramos que 'cant_devuelta' se lea correctamente desde cualquiera de los posibles nombres de campo
        cant_devuelta: Number((m as any).cant_devuelta) || Number((m as any).cantidadDevuelta) || Number((m as any).cantidad_devuelta) || null,
        devuelve: m.devuelve || ''
      }));

      this.calcularTotales();
    });
  }

  calcularTotales() {
    this.totalKilos = this.movimientos.reduce((sum, mov) => sum + (mov.kilos || 0), 0);
    this.totalSacos = this.movimientos.reduce((sum, mov) => sum + (mov.sacos || 0), 0);
    
    // Solo sumamos la cantidad devuelta si 'devuelve' es 'Si'
    this.totalDevuelto = this.movimientos
      .filter(mov => mov.devuelve === 'Si')
      .reduce((sum, mov) => sum + (mov.cant_devuelta || 0), 0);

    this.totalRestante = this.totalSacos - this.totalDevuelto; 
  }

  private getEcuadorTime(): string {
    const localTime = new Date(); 
    const ecuadorOffset = -5 * 60; 
    const utcTime = localTime.getTime(); 
    const ecuadorTime = utcTime + (ecuadorOffset * 60000) + (localTime.getTimezoneOffset() * 60000); 
    const ecuadorDate = new Date(ecuadorTime); 
    return ecuadorDate.toISOString(); 
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
        this.cargarMovimientos();
        this.nuevoMovimiento = {
          id: 0, fecha: new Date(), descripcion: '', kilos: 0, sacos: 0,
          lleva: 'Si', devuelve: '', responsable: this.usuario?.nombre || 'Desconocido',
          usuarioId: this.usuarioId, cant_devuelta: null
        };
      },
      error: (err) => console.error('Error al agregar movimiento', err)
    });
  }

// Nuevo método para determinar si el select de 'Devuelve' debe estar deshabilitado
isDevuelveDisabled(mov: BodegaMovimiento): boolean {
    const rolesAutorizados = ['Administrador', 'Secretaria', 'Ingeniero'];
    const esRolAutorizado = rolesAutorizados.includes(this.tipoUsuario);
    
    if (!esRolAutorizado) {
        const nombreUsuarioActual = this.usuario?.nombre ?? '';
        
        const esResponsable = nombreUsuarioActual === mov.responsable;
        const estaPendiente = mov.devuelve === '' || mov.devuelve === null;

        return !(esResponsable && estaPendiente);
    }

    return false;
}


  /** Se llama cuando cambia el select de "Devuelve" en la tabla */
async onDevuelveChange(mov: BodegaMovimiento) {
    // Caso 1: Se selecciona 'Si' -> Abrir modal para ingresar cantidad
    if (mov.devuelve === 'Si') {
        
        const modal = await this.modalController.create({ 
            component: CantidadDevueltaModalComponent, 
            componentProps: {
                movimiento: mov, // Pasamos el movimiento actual
            },
        });

        await modal.present();

        // Utilizamos onWillDismiss para capturar el rol y los datos.
        const { data, role } = await modal.onWillDismiss(); 

        // 1. Verificar si el modal se cerró con la acción de guardar
        if (role === 'guardar' && data && data.cantidadDevuelta !== undefined && data.cantidadDevuelta !== null) {
            
            const cantidadAEnviar = data.cantidadDevuelta;

            // 2. Actualizamos el modelo local ANTES de la llamada a la API
            mov.cant_devuelta = cantidadAEnviar;
            
            // ENVIAMOS LA CANTIDAD DEVUELTA DE VUELTA A LA API
            this.guardarDevolucion(mov.id, { 
                devuelve: 'Si', 
                cantidadDevuelta: cantidadAEnviar // <-- ENVIAMOS EL DATO
            }, false); // <-- Pasamos 'false' para no recargar inmediatamente
            
        } else {
            // 3. Si el usuario cancela o cierra (role !== 'guardar')
            // Revertimos el estado del select a '' (Pendiente) en la vista
            mov.devuelve = ''; 
            
            // GUARDAMOS LA REVERSIÓN en la API para persistir el estado "Pendiente" y limpiar la cantidad devuelta
            this.guardarDevolucion(mov.id, { 
                devuelve: '', // Pendiente
                cantidadDevuelta: null // <-- LIMPIAMOS EL DATO EN LA API
            });
        }
    } 
    // Caso 2: Se selecciona 'No' o '' (Pendiente) -> Guardar directamente en la API
    else {
        // Limpiar la cantidad devuelta si se selecciona 'No' o 'Pendiente'
        mov.cant_devuelta = null;
        
        this.guardarDevolucion(mov.id, { 
            devuelve: mov.devuelve as ('' | 'Si' | 'No'), 
            cantidadDevuelta: null // <-- LIMPIAMOS EL DATO EN LA API
        });
    }
}

// Función que maneja la llamada a la API para guardar
// Agregamos el parámetro opcional 'reload'
guardarDevolucion(id: number, data: { devuelve: '' | 'Si' | 'No'; cantidadDevuelta?: number | null }, reload: boolean = true) {
    // El servicio debe estar configurado para aceptar tanto 'devuelve' como 'cantidadDevuelta'
    this.bodegaService.actualizarDevolucion(id, data).subscribe({
        next: (response) => {
            console.log('Devolución actualizada', response);
            
            // Solo recargamos si no hay un error conocido del backend (como devolver 0)
            if (reload) {
              this.cargarMovimientos();
            } else {
              // Si no recargamos, la vista se actualizará con el valor local (data.cantidadDevuelta)
              this.calcularTotales(); // Recalculamos totales basados en la data local
            }
        },
        error: (err) => {
            console.error('Error al actualizar devolución', err);
            // Si hay error, sí forzamos una recarga para ver el estado real
            this.cargarMovimientos(); 
        }
    });
}
}
