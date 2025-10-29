import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Definición de Interfaz simple (asumiendo que viene de tu app)
interface BodegaMovimiento {
  id: number;
  descripcion: string;
  sacos: number;
  responsable: string;
  cant_devuelta: number | null; // El valor que se va a editar
}

@Component({
  selector: 'app-cantidad-devuelta-modal',
  templateUrl: './cantidad-devuelta-modal.component.html',
  styleUrls: ['./cantidad-devuelta-modal.component.scss'],
  standalone: true, // Si usas componentes standalone en Ionic/Angular >= 16
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CantidadDevueltaModalComponent implements OnInit {

  // @Input recibe los datos desde el componente padre (bodega.page.ts)
  @Input() movimiento!: BodegaMovimiento;
  // Propiedad local para el two-way binding en el input
  cantidadDevuelta: number = 0;

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    // Inicializa con el valor actual o 0
    this.cantidadDevuelta = this.movimiento.cant_devuelta ?? 0;
  }

  // Cierra el modal con el payload y el role
  dismiss(data: any, role: string) {
    this.modalController.dismiss(data, role);
  }

  // Cierra el modal con rol 'cancel'
  cancelar() {
    this.dismiss(null, 'cancel');
  }

  guardar() {
    const cantidad = Number(this.cantidadDevuelta); // Usamos la propiedad local

    // Validación básica:
    if (cantidad < 0 || isNaN(cantidad)) {
      console.error('La cantidad debe ser un número positivo.');
      return;
    }

    if (cantidad > this.movimiento.sacos) {
      console.error(`La cantidad devuelta (${cantidad}) no puede ser mayor a la llevada (${this.movimiento.sacos}).`);
      return;
    }

    // Devolvemos un OBJETO con el valor y el rol 'guardar'
    this.dismiss({ cantidadDevuelta: cantidad }, 'guardar');
  }
}