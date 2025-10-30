import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalController, AlertController, ToastController, IonicModule } from '@ionic/angular';
import { LarvaModalComponent } from 'src/app/components/dashboard/control/larvas/larva-modal/larva-modal.component';
import { Larva } from 'src/app/interfaces/larva';
import { LarvasService } from 'src/app/services/global/larvas.service';

@Component({
  selector: 'app-larvas',
  templateUrl: './larvas.page.html',
  styleUrls: ['./larvas.page.scss'],
  imports: [IonicModule, FormsModule, CommonModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LarvasPage implements OnInit {

  larvas: Larva[] = [];

  constructor(
    private larvasService: LarvasService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.cargarLarvas();
  }

  cargarLarvas(event?: any) {
    this.larvasService.getLarvas().subscribe({
      next: (data) => {
        this.larvas = data;
        if (event) event.target.complete();
      },
      error: (err) => {
        this.mostrarToast('Error al cargar la lista de lotes', 'danger');
        if (event) event.target.complete();
      }
    });
  }

  async abrirModal(larva?: Larva) {
    const modal = await this.modalCtrl.create({
      component: LarvaModalComponent,
      componentProps: {
        larva: larva ? { ...larva } : null
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data && data.recargar) {
      this.cargarLarvas();
    }
  }

  async confirmarEliminar(id: number) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que quieres eliminar este lote de larvas?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', handler: () => this.eliminarLarva(id) }
      ]
    });
    await alert.present();
  }

  private eliminarLarva(id: number) {
    this.larvasService.eliminarLarva(id).subscribe({
      next: () => {
        this.mostrarToast('Lote eliminado correctamente', 'success');
        this.cargarLarvas();
      },
      error: (err) => this.mostrarToast('Error al eliminar el lote. Puede que esté en uso.', 'danger')
    });
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