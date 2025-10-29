import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AlertController, IonicModule, NavController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonicModule, FormsModule, CommonModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginPage implements OnInit {

  loginForm = new FormGroup({
    usuario: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  })
  isLoginSuccess: boolean = false;
  verificationCode: string = '';
  informacionLogin: any = '';
  errorMsg: string = '';
  showPassword = false;
  isSubmitting = false;
  isVerifying = false;

  constructor(private alertController: AlertController, private toastController: ToastController, private auth: AuthService, private router: Router, private navCtrl: NavController) { }

  ngOnInit(): void {
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  
  logearse(form: any) {
    this.auth.verificarUsuario(form).subscribe(
      (data: any) => {
        this.isSubmitting = false;
        this.auth.loginSuccess(data.token);
        this.alertaExito();
      },
      (error) => {
        this.isSubmitting = false;
        this.errorMsg = error.error.message;
        this.mostrarmensajeError();
      }
    );
  }

async alertaExito() {
  const alert = await this.alertController.create({
    header: 'LABMARINE SAS',
    message: 'Inicio de sesión exitoso!',
    backdropDismiss: false,
    buttons: []
  });

  await alert.present();

  setTimeout(async () => {
    await alert.dismiss();
    this.navCtrl.navigateRoot('/main/home');
  }, 1000);
}



  mostrarmensajeError() {
    const mensajeError = document.getElementById("mensajeError") as HTMLElement;

    mensajeError.style.display = "block";

    setTimeout(function () {
      mensajeError.style.display = "none";
    }, 3000);
  }
}