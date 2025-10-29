import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BodegaMovimiento } from 'src/app/interfaces/bodega';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BodegaService } from 'src/app/services/global/bodega.service';
import { ModalController } from '@ionic/angular';
import { CantidadDevueltaModalComponent } from './cantidad-devuelta-modal/cantidad-devuelta-modal.component';
@Component({
  selector: 'app-bodega',
  templateUrl: './bodega.page.html',
  styleUrls: ['./bodega.page.scss'],
  imports: [IonicModule, FormsModule, CommonModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BodegaPage implements OnInit {

  movimientos: BodegaMovimiento[] = [];
  // Guarda la selección previa de "devuelve" para poder revertir si no es editable
  private devuelvePrevio = new Map<number, '' | 'Si' | 'No'>();

  usuarioId: number = 0;
  tipoUsuario: string = '';
  usuario: any = {};

  nuevoMovimiento: BodegaMovimiento = {
    id: 0,
    fecha: new Date(),
    descripcion: '',
    kilos: 0,
    sacos: 0,
    lleva: '',
    devuelve: '',
    responsable: '',
    usuarioId: 0,
    cant_devuelta: null
  };

  constructor(private bodegaService: BodegaService, private authService: AuthService, private modalController: ModalController) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.usuario = user;
      this.usuarioId = this.usuario?.id ?? 0;
      this.tipoUsuario = this.usuario?.tipoUsuario ?? '';
      this.cargarMovimientos();
    });
  }

  cargarMovimientos() {
    this.bodegaService.obtenerMovimientos().subscribe(data => {
      // Asegura que venga el campo cantidadDevuelta, si no, lo setea como null
      this.movimientos = (data || []).map(m => ({
        ...m,
        cantidadDevuelta: (m as any).cantidadDevuelta ?? (m as any).cantidad_devuelta ?? null
      }));
      // guardar selección previa de devuelve
      this.devuelvePrevio.clear();
      for (const m of this.movimientos) this.devuelvePrevio.set(m.id, (m.devuelve as any) ?? '');
    });
  }

  /** Ajusta la hora al huso horario de Ecuador (GMT-5) */
  private getEcuadorTime(): string {
    const localTime = new Date();  // Hora local del navegador
    const ecuadorOffset = -5 * 60; // Ecuador (GMT-5) en minutos
    const utcTime = localTime.getTime(); // Hora UTC
    const ecuadorTime = utcTime + (ecuadorOffset * 60000); // Ajuste a Ecuador

    const ecuadorDate = new Date(ecuadorTime); // Nueva fecha ajustada a Ecuador
    return ecuadorDate.toISOString(); // Convertimos a formato ISO string (incluye la zona horaria de Ecuador)
  }


  agregarMovimiento() {
    this.nuevoMovimiento.usuarioId = this.usuarioId;
    // Asignar la hora exacta de Ecuador al campo 'fecha'
    this.nuevoMovimiento.fecha = this.getEcuadorTime();

    console.log(this.nuevoMovimiento.fecha);
    // la devolución por defecto puede ir vacía
    if (this.nuevoMovimiento.devuelve == null) this.nuevoMovimiento.devuelve = '';
    if (this.nuevoMovimiento.lleva == null || this.nuevoMovimiento.lleva === '') {
      // fuerza que Lleva sea "Si" o "No"
      this.nuevoMovimiento.lleva = 'Si';
    }

    this.bodegaService.agregarMovimiento(this.nuevoMovimiento).subscribe(() => {
      this.cargarMovimientos();
      this.nuevoMovimiento = {
        id: 0,
        fecha: new Date(),
        descripcion: '',
        kilos: 0,
        sacos: 0,
        lleva: '',
        devuelve: '',
        responsable: '',
        usuarioId: this.usuarioId,
        cant_devuelta: null
      };
    });
  }

  /** Devuelve true si el movimiento se puede editar (mismo día). */
  isEditable(mov: BodegaMovimiento): boolean {
    const f = new Date(mov.fecha);  // Fecha del movimiento
    const hoy = new Date();          // Fecha actual
    return f.getFullYear() === hoy.getFullYear() &&
      f.getMonth() === hoy.getMonth() &&
      f.getDate() === hoy.getDate();  // Verifica si las fechas son del mismo día
  }

  /** Cambia color de fila cuando Devuelve = '' (Ninguno) – si la usas en HTML */
  getDevuelveCellClass(mov: BodegaMovimiento) {
    return mov.devuelve === '' ? 'warn-cell' : '';
  }

  /** Se llama cuando cambia el select de "Devuelve" en la tabla */
  onDevuelveChange(mov: BodegaMovimiento) {
    if (mov.devuelve === 'Si') {
      this.openModal(mov); // Abre el modal si selecciona "Sí"
    } else if (mov.devuelve === 'No' || mov.devuelve === '') {
      mov.cant_devuelta = null;  // Limpiamos la cantidad devuelta si se selecciona "No" o "Ninguno"
    }

    if (this.tipoUsuario == "Administrador" || this.tipoUsuario == "Secretaria" || this.tipoUsuario == "Ingeniero") {
      const payload = {
        devuelve: mov.devuelve === null ? "" : mov.devuelve,
        cantidadDevuelta: mov.cant_devuelta
      };

      // Llamamos al servicio para guardar la actualización en la base de datos
      this.bodegaService.actualizarDevolucion(mov.id, payload).subscribe({
        next: (response) => {
          console.log('Devolución actualizada', response);
          this.cargarMovimientos();  // Recargamos los movimientos después de la actualización
        },
        error: (error) => {
          console.error('Error al actualizar la devolución', error);
        }
      });
    }
  }


  async openModal(mov: BodegaMovimiento) {
    const modal = await this.modalController.create({
      component: CantidadDevueltaModalComponent,
      componentProps: {
        movimiento: mov
      }
    });

    modal.onDidDismiss().then((data) => {
      // Si se ha guardado la cantidad devuelta en el modal, la persistimos
      if (data.data !== undefined) {
        mov.cant_devuelta = data.data;
        this.guardarDevolucion(mov);
      }
    });

    await modal.present();
  }

  /** Botón Guardar visible cuando Devuelve = "Si" */
  guardarDevolucion(mov: BodegaMovimiento) {
    if (!this.isEditable(mov)) {
      alert('Solo puedes modificar la devolución el mismo día del movimiento.');
      return;
    }
    const cantidad = Number(mov.cant_devuelta ?? 0);
    if (isNaN(cantidad) || cantidad < 0) {
      alert('Ingrese una cantidad devuelta válida (>= 0).');
      return;
    }

    if (cantidad > mov.sacos) {
      alert('La cantidad ingresada es mayor a la que se llevo.');
      this.cargarMovimientos();
      return;
    } else {
      const payload = { devuelve: 'Si' as const, cantidadDevuelta: cantidad };
      this.bodegaService.actualizarDevolucion(mov.id, payload).subscribe({
        next: () => {
          this.devuelvePrevio.set(mov.id, 'Si');
          this.cargarMovimientos();
        },
        error: () => alert('No se pudo guardar la devolución')
      });
    }

  }
}
