import { Component } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CameraService } from '../services/camera.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonicModule, CommonModule],
})
export class HomePage {
  // Arreglo que almacena los productos cargados desde el almacenamiento local
  productos: Product[] = [];

  /**
   * Inyección del servicio de productos y del Router para navegar entre páginas.
   */
  constructor(
    private _productService: ProductService,
    private _router: Router,
    private _cameraService: CameraService
  ) { }

  /**
   * Método del ciclo de vida propio de Ionic.
   * Se ejecuta automáticamente cada vez que el usuario entra a esta vista.
   * Aquí se cargan los productos desde el almacenamiento interno.
   */
  async ionViewWillEnter() {
    // Cargar productos desde el servicio (desde el almacenamiento local)
    await this._productService.cargarProductos();

    // Obtener los productos ya cargados (puede devolver un arreglo vacío si no hay productos)
    this.productos = await this._productService.obtenerProductos();

    // Cargar las fotos base64 para mostrar en el template
    for (const producto of this.productos) {
      producto.rutaFotoBase64 = await this._cameraService.crearRutaALaFotoBase64(producto.rutaFoto);
    }
  }

  async eliminarProducto(id: number) {
    // Llamar al servicio para eliminar el producto por id
    await this._productService.eliminarProducto(id);

    // Recargar la lista actualizada después de eliminar
    this.productos = await this._productService.obtenerProductos();
  }

  /**
   * Navega a la pantalla donde se puede crear un nuevo producto.
   * Utiliza el Router de Angular para cambiar de ruta a '/product-create'.
   */
  irAProductCreate() {
    this._router.navigate(['/product-create']);
  }
}
