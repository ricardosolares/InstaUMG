import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  url: string = "http://localhost:4000";
  url_posts: string = "http://localhost:3000";
  url_posts_media: string = `${this.url_posts}/`;
  url_avatars: string = `${this.url}/uploads/avatars/`;

  posts = [
    { image: 'https://via.placeholder.com/100' },
    { image: 'https://via.placeholder.com/100' },
    { image: 'https://via.placeholder.com/100' },
    { image: 'https://via.placeholder.com/100' },
    { image: 'https://via.placeholder.com/100' },
    { image: 'https://via.placeholder.com/100' }
  ];

  myPosts: any = [];
  currentUserInfo: any = {}; // Información del usuario
  editProfileData: any = {}; // Datos para el formulario de edición
  isEditProfileModalOpen: boolean = false; // Estado para controlar la visibilidad del modal
  selectedImage: string | ArrayBuffer | null = null; // Para almacenar la previsualización de la imagen seleccionada
  isImageSelectorModalOpen: boolean = false; // Controla la visibilidad del modal de selección de imagen

  constructor(
    private http: HttpClient,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadUserProfile();
    this.loadUserPosts();
  }

  ionViewWillEnter() {
    this.loadUserProfile();
    this.loadUserPosts();
  }

  // Método para cargar el perfil del usuario
  loadUserProfile() {
    const userId = sessionStorage.getItem('id'); // Obtén el id del usuario de sessionStorage
    const token = sessionStorage.getItem('token'); // Obtén el token de sessionStorage

    if (userId && token) {
      const url = `${this.url}/api/user/profile/${userId}`;
      const headers = new HttpHeaders().set('Authorization', token);

      // Realiza la solicitud HTTP para obtener la información del perfil
      this.http.get(url, { headers }).subscribe(
        async (response: any) => {
          console.log(response)
          if (response.status === 'error') {
            // Si el API devuelve un error, muestra el alert
            await this.showSessionExpiredAlert();
          } else {
            // Si todo está bien, asigna la información del usuario
            this.currentUserInfo = response.user;
          }
        },
        (error) => {
          console.error("Error al cargar el perfil del usuario:", error);
        }
      );
    } else {
      console.error("No se encontró el id o token en sessionStorage");
    }
  }

  loadUserPosts() {
    const userId = sessionStorage.getItem('id'); // Obtén el id del usuario de sessionStorage
    const token = sessionStorage.getItem('token'); // Obtén el token de sessionStorage

    if (userId && token) {
      const url = `${this.url_posts}/api/images/publications/user/${userId}`;
      const headers = new HttpHeaders().set('Authorization', token);

      this.http.get(url, { headers }).subscribe(
        (response: any) => {
          this.myPosts = response;
          console.log(response)
        },
        async (error) => {
          const alert = await this.alertController.create({
            header: 'Error',
            message: 'Ocurrió un error al cargar las publicaciones del usuario.',
            buttons: ['Aceptar']
          });
          await alert.present();
        }
      );
    } else {
      console.error("No se encontró el id o token en sessionStorage");
    }
  }

  // Método para mostrar el alert de sesión expirada
  async showSessionExpiredAlert() {
    const alert = await this.alertController.create({
      header: 'Sesión Expirada',
      message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      buttons: [
        {
          text: 'Aceptar',
          handler: () => {
            // Limpiar sessionStorage y recargar la página
            sessionStorage.clear();
            window.location.reload();
          }
        }
      ]
    });

    await alert.present();
  }

  // Abrir el modal de edición de perfil
  openEditProfileModal() {
    this.editProfileData = { ...this.currentUserInfo }; // Copia los datos actuales del perfil
    this.isEditProfileModalOpen = true; // Abre el modal
  }

  // Cerrar el modal de edición de perfil
  closeEditProfileModal() {
    this.isEditProfileModalOpen = false; // Cierra el modal
  }

  // Guardar cambios del perfil
  async saveProfile() {
    if (!this.editProfileData.name || !this.editProfileData.nick) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Todos los campos son obligatorios.',
        buttons: ['Aceptar']
      });
      await alert.present();
      return;
    }

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', token || '');

    this.http.put(`${this.url}/api/user/update`, this.editProfileData, { headers }).subscribe(
      async (response: any) => {
        if (response.status === "success") {
          const alert = await this.alertController.create({
            header: 'Actualización exitosa',
            message: 'Se actualizó el perfil con éxito.',
            buttons: ['Aceptar']
          });
          await alert.present();
        } else {
          const alert = await this.alertController.create({
            header: 'Error',
            message: 'Ocurrió un error al actualizar el perfil.',
            buttons: ['Aceptar']
          });
          await alert.present();
        }

        this.currentUserInfo = response.user; // Actualiza la información del perfil
        this.closeEditProfileModal(); // Cierra el modal
      },
      async (error) => {
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Ocurrió un error al actualizar el perfil.',
          buttons: ['Aceptar']
        });
        await alert.present();
      }
    );
  }

  // Método de cierre de sesión (logout)
  logout() {
    const token = sessionStorage.getItem("token");

    if (token) {
      const headers = new HttpHeaders().set('Authorization', token);

      // Usa HttpClient para enviar la solicitud de logout
      this.http.post(`${this.url}/api/user/logout`, {}, { headers }).subscribe(
        async (data: any) => {
          if (data.status === "success") {
            sessionStorage.clear();
            const alert = await this.alertController.create({
              header: 'Logout',
              message: 'Se cerró sesión con éxito',
              buttons: [{
                text: 'Aceptar',
                handler: () => {
                  sessionStorage.removeItem("token");
                  window.location.reload();
                }
              }]
            });
            await alert.present();
          } else {
            const alert = await this.alertController.create({
              header: 'Error',
              message: 'Error al cerrar sesión',
              buttons: ['Aceptar']
            });
            await alert.present();
          }
        },
        async (error) => {
          console.error("Error al intentar cerrar sesión:", error);
          const alert = await this.alertController.create({
            header: 'Error',
            message: 'Ocurrió un error al cerrar sesión.',
            buttons: ['Aceptar']
          });
          await alert.present();
        }
      );
    } else {
      console.error("No token found in sessionStorage.");
    }
  }

  openImageSelectorModal() {
    this.selectedImage = `${this.url_avatars}${this.currentUserInfo.image}`; // Imagen actual del perfil
    this.isImageSelectorModalOpen = true;
  }

  closeImageSelectorModal() {
    this.isImageSelectorModalOpen = false;
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result; // Asigna la nueva imagen seleccionada para previsualización
      };
      reader.readAsDataURL(file);
    }
  }

  async updateProfileImage() {
    if (!this.selectedImage) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Por favor selecciona una imagen para actualizar.',
        buttons: ['Aceptar']
      });
      await alert.present();
      return;
    }

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', token || '');

    const formData = new FormData();
    formData.append('file0', (document.querySelector('input[type="file"]') as HTMLInputElement).files![0]);

    this.http.post(`${this.url}/api/user/upload`, formData, { headers }).subscribe(
      async (response: any) => {
        if (response.status === "success") {
          const alert = await this.alertController.create({
            header: 'Actualización exitosa',
            message: 'La foto de perfil se actualizó con éxito.',
            buttons: ['Aceptar']
          });
          await alert.present();
        } else {
          const alert = await this.alertController.create({
            header: 'Error',
            message: 'Ocurrió un error al actualizar la foto de perfil.',
            buttons: ['Aceptar']
          });
          await alert.present();
        }
        this.closeImageSelectorModal();
      },
      async (error) => {
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Ocurrió un error al actualizar la foto de perfil.',
          buttons: ['Aceptar']
        });
        await alert.present();
      }
    );
  }

}
