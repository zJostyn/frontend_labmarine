import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { Larva } from 'src/app/interfaces/larva';
import { Piscina } from 'src/app/interfaces/piscina';
import { CorridasService } from 'src/app/services/global/corridas.service';
import { LarvasService } from 'src/app/services/global/larvas.service';
import { PiscinasService } from 'src/app/services/global/piscinas.service';

@Component({
  selector: 'app-corrida-modal',
  templateUrl: './corrida-modal.component.html',
  styleUrls: ['./corrida-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CorridaModalComponent implements OnInit {
  form!: FormGroup;

  // Arrays para poblar los <ion-select>
  lotesDeLarvas: Larva[] = [];
  piscinasDisponibles: Piscina[] = [];

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private corridasService: CorridasService,
    private larvasService: LarvasService,
    private piscinasService: PiscinasService,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      larva_id: [null, Validators.required],
      piscinaIds: [null, Validators.required],
      fecha_inicio: [new Date().toISOString(), Validators.required],
      densidad: [null, [Validators.required, Validators.min(1)]]
    });

    // Cargar datos para los selectores
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales() {
    this.larvasService.getLarvas().subscribe(data => this.lotesDeLarvas = data);
    this.piscinasService.getPiscinas().subscribe(data => this.piscinasDisponibles = data);
  }

  cerrarModal(recargar = false) {
    this.modalCtrl.dismiss({ recargar });
  }

  guardarCorrida() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = this.form.value;
    this.corridasService.agregarCorrida(formData).subscribe({
      next: () => {
        this.mostrarToast('Corrida registrada exitosamente', 'success');
        this.cerrarModal(true);
      },
      error: (err) => this.mostrarToast('Error al registrar la corrida', 'danger')
    });
  }

  async mostrarToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color, position: 'top' });
    toast.present();
  }
}