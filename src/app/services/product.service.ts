import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  // Array privado donde se almacenan los productos en memoria durante la ejecución de la app
  private productos: Product[] = [];

  // Clave que usamos para guardar y recuperar los productos en el almacenamiento local del dispositivo
  private STORAGE_KEY = 'productos';

  constructor() {
    // Al crear la instancia del servicio, cargamos los productos desde el almacenamiento local
    this.cargarProductos();
  }

  /**
   * Cargar los productos guardados en el almacenamiento local (Preferences).
   * Si no hay productos guardados, inicializamos con un array vacío.
   */
  async cargarProductos() {
    // Intentar obtener la cadena JSON guardada bajo la clave STORAGE_KEY
    const respuesta = await Preferences.get({ key: this.STORAGE_KEY });

    // Si la respuesta tiene valor, parsearlo a objeto; sino, iniciar con array vacío
    this.productos = respuesta.value ? JSON.parse(respuesta.value) : [];
  }

  /**
   * Obtener el listado actual de productos.
   * Si aún no hemos cargado productos en memoria, los cargamos primero desde almacenamiento local.
   * @returns Promise con el array de productos cargados
   */
  async obtenerProductos(): Promise<Product[]> {
    // Si el array está vacío, intentamos cargar desde Preferences
    if (this.productos.length === 0) {
      await this.cargarProductos();
    }
    // Devolver el array actual de productos
    return this.productos;
  }

  /**
   * Agregar un nuevo producto al listado.
   * Se genera un ID único usando timestamp para identificarlo.
   * Luego, se guarda el nuevo listado actualizado en el almacenamiento local.
   * @param producto - Un objeto Producto sin el ID (porque se asigna automáticamente)
   */
  async agregarProducto(producto: Omit<Product, 'id'>) {
    // Crear un nuevo producto con un ID generado automáticamente
    const productoNuevo: Product = { id: Date.now(), ...producto };

    // Agregarlo al array en memoria
    this.productos.push(productoNuevo);

    // Guardar el array actualizado (con el nuevo producto) en almacenamiento local como JSON
    await Preferences.set({
      key: this.STORAGE_KEY,
      value: JSON.stringify(this.productos),
    });
  }

  // Método para eliminar un producto por id
  async eliminarProducto(id: number): Promise<void> {
    // Filtrar el arreglo para sacar el producto con ese id
    this.productos = this.productos.filter(producto => producto.id !== id);

    // Guardar el arreglo actualizado en almacenamiento
    await Preferences.set({ key: this.STORAGE_KEY, value: JSON.stringify(this.productos) });
  }
}
