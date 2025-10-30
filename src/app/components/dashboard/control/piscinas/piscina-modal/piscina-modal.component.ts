import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { Piscina } from 'src/app/interfaces/piscina';
import { PiscinasService } from 'src/app/services/global/piscinas.service';

@Component({
  selector: 'app-piscina-modal',
  templateUrl: './piscina-modal.component.html',
  styleUrls: ['./piscina-modal.component.scss'],
  imports: [IonicModule, FormsModule, CommonModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PiscinaModalComponent implements OnInit {
  @Input() piscina: Piscina | null = null;
  
  form!: FormGroup;
  isEditMode = false;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private piscinasService: PiscinasService,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.isEditMode = !!this.piscina;

    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(200)]],
      hectareas: [null, [Validators.required, Validators.min(0.01)]],
      categoria: [null]
    });

    // FIX 2: Comprobamos que 'piscina' no sea nulo antes de usarlo.
    if (this.isEditMode && this.piscina) {
      this.form.patchValue(this.piscina);
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
      // FIX 3: Verificamos de forma segura que 'piscina' y 'piscina.id' existen.
      if (!this.piscina?.id) {
        this.mostrarToast('Error: No se encontró el ID de la piscina para actualizar.', 'danger');
        return;
      }
      
      this.piscinasService.actualizarPiscina(this.piscina.id, formData).subscribe({
        next: () => {
          this.mostrarToast('Piscina actualizada correctamente', 'success');
          this.cerrarModal(true);
        },
        error: (err) => this.mostrarToast('Error al actualizar la piscina', 'danger')
      });
    } else {
      this.piscinasService.agregarPiscina(formData).subscribe({
        next: () => {
          this.mostrarToast('Piscina creada correctamente', 'success');
          this.cerrarModal(true);
        },
        error: (err) => this.mostrarToast('Error al crear la piscina', 'danger')
      });
    }
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'top'
    });
    toast.present();
  }
}