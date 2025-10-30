import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CorridaModalComponent } from 'src/app/components/dashboard/control/corridas/corrida-modal/corrida-modal.component';
import { Corrida } from 'src/app/interfaces/corrida';
import { CorridasService } from 'src/app/services/global/corridas.service';

@Component({
  selector: 'app-corridas',
  templateUrl: './corridas.page.html',
  styleUrls: ['./corridas.page.scss'],
  imports: [IonicModule, FormsModule, CommonModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class CorridasPage implements OnInit {

  corridas: Corrida[] = [];

  constructor(
    private corridasService: CorridasService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.cargarCorridas();
  }

  cargarCorridas(event?: any) {
    this.corridasService.getCorridas().subscribe({
      next: (data) => {
        this.corridas = data;
        if (event) event.target.complete();
      },
      error: (err) => {
        this.mostrarToast('Error al cargar la lista de corridas', 'danger');
        if (event) event.target.complete();
      }
    });
  }

  async abrirModal() {
    const modal = await this.modalCtrl.create({
      component: CorridaModalComponent,
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data && data.recargar) {
      this.cargarCorridas();
    }
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