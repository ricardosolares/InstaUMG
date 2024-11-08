import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Post {
  userAvatar: string;
  username: string;
  caption: string;
  image: string;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  posts: Post[] = [
    {
      userAvatar: 'https://randomuser.me/api/portraits/women/12.jpg',
      username: 'usuario1',
      caption: '¡Amo este lugar!',
      image: 'https://images.unsplash.com/5/unsplash-kitsune-4.jpg?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjEyMDd9&s=fb86e2e09fceac9b363af536b93a1275'
    },
    {
      userAvatar: 'https://randomuser.me/api/portraits/men/34.jpg',
      username: 'usuario2',
      caption: 'Día de playa',
      image: 'https://images.unsplash.com/5/unsplash-kitsune-4.jpg?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjEyMDd9&s=fb86e2e09fceac9b363af536b93a1275'
    },
    {
      userAvatar: 'https://randomuser.me/api/portraits/women/56.jpg',
      username: 'usuario3',
      caption: 'Deliciosa comida',
      image: 'https://images.unsplash.com/5/unsplash-kitsune-4.jpg?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjEyMDd9&s=fb86e2e09fceac9b363af536b93a1275'
    }
  ];

  publications: any[] = []; // Array para almacenar las publicaciones del API
  url: string = 'http://localhost:3000/';
  url_posts: string = `${this.url}api/images/publications`;
  currentSlide: number = 0; // Índice del slider

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPublications(); // Cargar las publicaciones al inicializar el componente
  }

  ionViewWillEnter() {
    this.loadPublications(); // Cargar las publicaciones cada vez que se entra a la vista
  }

  loadPublications() {
    this.http.get<any[]>(this.url_posts)
      .subscribe(
        (data) => {
          this.publications = data.map(post => ({
            ...post,
            currentSlide: 0 // Inicializa currentSlide para cada post
          }));
          // console.log('Publicaciones obtenidas:', this.publications);
        },
        (error) => {
          console.error('Error al obtener las publicaciones:', error);
        }
      );
  }  

  prevSlide(post: any) {
    post.currentSlide = post.currentSlide > 0 ? post.currentSlide - 1 : 3;
  }
  
  nextSlide(post: any) {
    post.currentSlide = post.currentSlide < 3 ? post.currentSlide + 1 : 0;
  }
  
}
