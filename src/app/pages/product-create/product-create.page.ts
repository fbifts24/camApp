import { Component } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { CameraService } from '../../services/camera.service';
import { IonicModule, NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-create',
  standalone: true, // Esta es una página standalone (sin módulo)
  imports: [IonicModule, CommonModule, FormsModule], // Importa módulos necesarios
  templateUrl: './product-create.page.html', // Template HTML asociado
})
export class ProductCreatePage {
  // Variables para el formulario de creación de producto
  titulo = '';
  descripcion = '';
  precio: number | null = null;
  rutaFoto: string | null = null;
  rutaFotoBase64: string | null = null;

  // Inyección de servicios
  constructor(
    private _cameraService: CameraService,   // Para usar la cámara
    private _productService: ProductService, // Para manejar productos (guardar, etc)
    private _navCtrl: NavController           // Controlador de navegación de Ionic
  ) { }

  /**
   * Método para tomar una foto usando el servicio de cámara
   * Luego actualiza la rutaFoto para mostrar la imagen
   */
  async tomarFoto() {
    await this._cameraService.tomarFoto();
    this.rutaFoto = this._cameraService.rutaFoto;
    if (this.rutaFoto) {
      this.rutaFotoBase64 = await this._cameraService.crearRutaALaFotoBase64(this.rutaFoto);
    }
  }

  /**
   * Método para guardar el producto usando el servicio de productos.
   * Valida que los campos requeridos estén completos.
   * Luego, navega hacia atrás (a la página anterior) usando NavController.
   */
  async guardarProducto() {
    // Validar campos obligatorios
    if (!this.titulo || !this.precio || !this.rutaFoto) return;

    // Crear y guardar el producto
    await this._productService.agregarProducto({
      titulo: this.titulo,
      descripcion: this.descripcion,
      precio: this.precio,
      rutaFoto: this.rutaFoto,
    });

    // Navegar hacia atrás (a la página anterior) en el stack de navegación
    this._navCtrl.navigateBack('/');
  }
}

/* 
¿Qué es NavController y para qué sirve?
Es un servicio propio de Ionic que controla la navegación entre páginas o vistas en tu app móvil.

Funciona gestionando un stack de páginas, similar a una pila: cuando abres una página nueva, se apila encima; cuando vas "atrás", se desapila.

En este caso, usás el método navigateBack('/') para ir a la raíz (homepage), que sería la lista de productos.

Ventajas de NavController:
Te permite navegar programáticamente con métodos fáciles, sin tener que usar rutas manualmente.

Maneja automáticamente la animación de transición entre páginas (como el efecto deslizante).

Facilita volver a la página anterior, en vez de hacer un simple redirect.

Otras opciones que tiene:
navigateForward(url): Para ir a una página nueva (push).

navigateRoot(url): Para ir a una página y limpiar el historial (reset).

pop(): Para hacer "back" simple (volver a la página anterior).
*/
