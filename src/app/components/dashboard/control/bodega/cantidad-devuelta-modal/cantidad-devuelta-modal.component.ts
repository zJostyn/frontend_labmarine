import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { BodegaMovimiento } from 'src/app/interfaces/bodega';

@Component({
  selector: 'app-cantidad-devuelta-modal',
  templateUrl: './cantidad-devuelta-modal.component.html',
  styleUrls: ['./cantidad-devuelta-modal.component.scss'],
  imports: [IonicModule, FormsModule, CommonModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CantidadDevueltaModalComponent {
  @Input() movimiento!: BodegaMovimiento;

  constructor(private modalController: ModalController) { }

  // Cerrar el modal sin hacer cambios
  dismiss() {
    this.modalController.dismiss();
  }

  // Guardar la cantidad devuelta y cerrar el modal
  guardar() {
    this.modalController.dismiss(this.movimiento.cant_devuelta);
  }
}
