import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { Larva } from 'src/app/interfaces/larva';
import { LarvasService } from 'src/app/services/global/larvas.service';

@Component({
  selector: 'app-larva-modal',
  templateUrl: './larva-modal.component.html',
  styleUrls: ['./larva-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LarvaModalComponent implements OnInit {
  @Input() larva: Larva | null = null;
  
  form!: FormGroup;
  isEditMode = false;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private larvasService: LarvasService,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.isEditMode = !!this.larva;

    this.form = this.fb.group({
      lote_laboratorio: ['', Validators.required],
      laboratorio_origen: ['', Validators.required],
      fecha_recepcion: [new Date().toISOString(), Validators.required],
      cantidad_inicial: [null, [Validators.required, Validators.min(1)]],
      analisis_sanitario: [null],
      observaciones: ['']
    });

    if (this.isEditMode && this.larva) {
      const larvaData = {
        ...this.larva,
        fecha_recepcion: new Date(this.larva.fecha_recepcion).toISOString()
      };
      this.form.patchValue(larvaData);
    }
  }

  cerrarModal(recargar = false) {
    this.modalCtrl.dismiss({ recargar });
  }

  guardarCambios() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const formData = this.form.value;

    if (this.isEditMode) {
      if (!this.larva?.id) return;
      this.larvasService.actualizarLarva(this.larva.id, formData).subscribe({
        next: () => this.handleSuccess('Lote actualizado correctamente'),
        error: (err) => this.handleError('Error al actualizar el lote')
      });
    } else {
      this.larvasService.agregarLarva(formData).subscribe({
        next: () => this.handleSuccess('Lote registrado correctamente'),
        error: (err) => this.handleError('Error al registrar el lote')
      });
    }
  }

  private handleSuccess(message: string) {
    this.mostrarToast(message, 'success');
    this.cerrarModal(true);
  }

  private handleError(message: string) {
    this.mostrarToast(message, 'danger');
  }

  async mostrarToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ 
      message,
      duration: 2000, 
      color, 
      position: 'top' 
    });
    toast.present();
  }
}