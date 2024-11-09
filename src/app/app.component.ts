import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

declare var google: any; // Declara google para que TypeScript lo reconozca

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  email: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private alertController: AlertController,
    private http: HttpClient // Agrega HttpClient aquí
  ) {}

  ngOnInit() {
    console.log("Inicializando Google Identity Services...");
    if (google && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({
        client_id: '132521837146-uv6ango6u8mic3dpbrnasv0g7hbbdre7.apps.googleusercontent.com',  // Reemplaza con tu Client ID de Google
        callback: (response: any) => this.handleGoogleLogin(response),
      });

      // Usa un breve retraso para asegurar que el contenedor esté listo
      setTimeout(() => {
        console.log("Renderizando botón de Google...");
        google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          { theme: "outline", size: "large" }  // Configura el tema y el tamaño del botón
        );
      }, 300); // Retraso de 300 ms para asegurar que el contenedor esté listo

      google.accounts.id.prompt();
    } else {
      console.error("Google API no se ha cargado correctamente.");
    }
  }

  handleGoogleLogin(response: any) {
    console.log("Google Login Response:", response);
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('token', response.credential);
    this.isLoggedIn = true;
    this.router.navigate(['/tabs/tab1']);
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async onLogin() {
    // Método de inicio de sesión tradicional
    this.http.post<any>('http://localhost:4000/api/user/login', {
      email: this.email,
      password: this.password,
    }).subscribe(
      async (response) => {
        if (response.status === 'success') {
          sessionStorage.setItem('isLoggedIn', 'true');
          sessionStorage.setItem('id', response.user.id);
          sessionStorage.setItem('token', response.token);
          console.log("Token guardado en sessionStorage:", sessionStorage.getItem('token')); // Verificación
          this.isLoggedIn = true;
          this.router.navigate(['/tabs/tab1']);
        } else {
          await this.showAlert('Error de inicio de sesión', 'Verifique sus credenciales');
        }
      },
      async (error) => {
        console.error('Error en el inicio de sesión:', error);
        await this.showAlert('Error', 'Error al intentar iniciar sesión');
      }
    );
  }
}
