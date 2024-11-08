import { Component, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavController, ToastController } from '@ionic/angular';
import { CurrentUserService } from '../services/current_user/current-user.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  postDescription: string = '';
  imagePreview: string | ArrayBuffer | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private http: HttpClient,
    private navCtrl: NavController,
    private toastController: ToastController,
    public currentUser: CurrentUserService
  ) {}

  ionViewWillEnter() {
    console.log(this.currentUser.current_user);
    this.resetForm();
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  // Maneja la selección de archivos
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Lógica para enviar la nueva publicación
  async onSubmit() {
    const file = (this.fileInput.nativeElement as HTMLInputElement).files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('description', this.postDescription);
    formData.append('id_user', this.currentUser.current_user.id);

    try {
      // Llamada a la API
      const response = await this.http.post('http://localhost:3000/api/images/upload', formData).toPromise();
      
      // Imprimir en consola la respuesta exitosa
      console.log('Respuesta del servidor:', response);

      // Muestra el mensaje de éxito en el toast
      await this.showToast('Imagen subida exitosamente');
      this.resetForm();
      
    } catch (error) {
      // Imprimir en consola el error
      console.error('Error al subir la imagen:', error);
      await this.showToast('Ocurrió un error al subir la imagen.');
      
    } finally {
      // Redirige al tab1 independientemente del resultado
      this.navCtrl.navigateRoot('/tabs/tab1');
    }
  }

  // Función para mostrar un tooltip de éxito o error
  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }

  resetForm() {
    this.postDescription = '';
    this.imagePreview = null;
    this.fileInput.nativeElement.value = '';
  }
}
