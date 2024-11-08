import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { CurrentUserService } from './services/current_user/current-user.service';

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
    private http: HttpClient,
    private router: Router,
    public currentUser: CurrentUserService,
    private alertController: AlertController
  ) {
    this.setCurrentUser(); // Carga los datos del usuario en el servicio al inicializar
  }

  ngOnInit() {
    // Verifica si el usuario ya está autenticado
    this.isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
  }

  async onLogin() {
    // Llama a la API de login
    this.http
      .post<any>('http://localhost:4000/api/user/login', {
        email: this.email,
        password: this.password,
      })
      .subscribe(
        async (response) => {
          if (response.status == 'success') {
            // Guarda el estado de autenticación y los datos del usuario en sessionStorage
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('id', response.user.id);
            sessionStorage.setItem('name', response.user.name);
            sessionStorage.setItem('nick', response.user.nick);
            sessionStorage.setItem('email', response.user.email);
            sessionStorage.setItem('descripcion', response.user.descripcion);
            sessionStorage.setItem('token', response.token);

            // Llama a setCurrentUser para actualizar el servicio CurrentUserService
            this.setCurrentUser();

            this.isLoggedIn = true;
            this.router.navigate(['/tabs/tab1']); // Redirige a la pestaña principal

            // Mostrar alerta de éxito
            await this.showAlert('Inicio de sesión exitoso', 'Bienvenido a la aplicación');
          } else {
            // Mostrar alerta de error
            await this.showAlert('Error de inicio de sesión', 'Verifique sus credenciales');
          }
        },
        async (error) => {
          console.error('Error en el inicio de sesión:', error);
          await this.showAlert('Error', 'Error al intentar iniciar sesión');
        }
      );
  }

  onLogout() {
    // Limpia el estado de autenticación y los datos del usuario
    sessionStorage.clear();
    this.isLoggedIn = false;
    this.email = '';
    this.password = '';

    // Actualiza el servicio CurrentUserService
    this.currentUser.current_user = {
      id: null,
      name: null,
      nick: null,
      email: null,
    };

    this.router.navigate(['/login']); // Opcional: redirigir a la página de login
  }

  setCurrentUser() {
    // Actualiza el CurrentUserService con los datos del sessionStorage
    this.currentUser.current_user = {
      id: sessionStorage.getItem('id'),
      name: sessionStorage.getItem('name'),
      nick: sessionStorage.getItem('nick'),
      email: sessionStorage.getItem('email'),
      descripcion: sessionStorage.getItem('descripcion'),
      token: sessionStorage.getItem('token')
    };
  }

  // Método para mostrar las alertas de Ionic
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });

    await alert.present();
  }
}
