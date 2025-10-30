import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertController, IonicModule, ModalController, ToastController } from '@ionic/angular';
import { Piscina } from 'src/app/interfaces/piscina';
import { PiscinasService } from 'src/app/services/global/piscinas.service';
import { PiscinaModalComponent } from './piscina-modal/piscina-modal.component';

@Component({
  selector: 'app-piscinas',
  templateUrl: './piscinas.page.html',
  styleUrls: ['./piscinas.page.scss'],
  imports: [IonicModule, FormsModule, CommonModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PiscinasPage implements OnInit {

piscinas: Piscina[] = [];

  constructor(
    private piscinasService: PiscinasService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.cargarPiscinas();
  }

  // Cargar o recargar la lista de piscinas
  cargarPiscinas(event?: any) {
    this.piscinasService.getPiscinas().subscribe(
      (data) => {
        this.piscinas = data;
        if (event) {
          event.target.complete();
        }
      },
      (error) => {
        console.error('Error cargando piscinas', error);
        this.mostrarToast('Error al cargar la lista de piscinas', 'danger');
      }
    );
  }

  // Abrir el modal para AGREGAR o EDITAR
  async abrirModal(piscina?: Piscina) {
    const modal = await this.modalCtrl.create({
      component: PiscinaModalComponent,
      componentProps: {
        piscina: piscina ? { ...piscina } : null
      }
    });

    await modal.present();

    // Esperar a que el modal se cierre
    const { data } = await modal.onDidDismiss();
    if (data && data.recargar) {
      this.cargarPiscinas();
    }
  }

  // Confirmación antes de ELIMINAR
  async confirmarEliminar(id: number) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que quieres eliminar esta piscina?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.eliminarPiscina(id);
          }
        }
      ]
    });

    await alert.present();
  }

  private eliminarPiscina(id: number) {
    this.piscinasService.eliminarPiscina(id).subscribe(
      () => {
        this.mostrarToast('Piscina eliminada correctamente', 'success');
        this.cargarPiscinas(); // Recargar la lista
      },
      (error) => {
        console.error('Error eliminando piscina', error);
        this.mostrarToast('Error al eliminar la piscina', 'danger');
      }
    );
  }

  // Helper para mostrar mensajes toast
  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      color: color
    });
    toast.present();
  }
}
