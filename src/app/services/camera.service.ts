import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';

@Injectable({ providedIn: 'root' })
export class CameraService {
  // Ruta (nombre) del archivo guardado en el sistema de archivos interno de la app
  public rutaFoto: string | null = null;

  /**
   * Método principal para tomar una foto, guardarla internamente
   * y también opcionalmente en la galería del dispositivo.
   */
  async tomarFoto(): Promise<string> {
    // Tomar la foto usando la cámara del dispositivo
    const foto: Photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri, // Queremos la URI para luego obtener el archivo con fetch()
      source: CameraSource.Camera,      // Usamos la cámara (no la galería)
      quality: 90,                      // Calidad de la imagen
      saveToGallery: true               // También guardar en la galería del teléfono
    });

    // Guardar la foto internamente en el almacenamiento privado de la app
    this.rutaFoto = await this.guardarFoto(foto);

    // Devolver el nombre del archivo interno (por ejemplo "1718144830001.jpeg")
    return this.rutaFoto;
  }

  /**
   * Convierte un archivo Blob (binario) a una cadena en base64 usando async/await.
   * Esto es necesario para almacenar archivos con el Filesystem de Capacitor.
   */
  private async convertirBlobABase64(blob: Blob): Promise<string> {
    // Creamos un nuevo FileReader
    const lector = new FileReader();

    // Retornamos una promesa que se resuelve cuando la lectura termina correctamente
    return await new Promise<string>((resolve, reject) => {
      // Si hay error, rechazamos la promesa
      lector.onerror = () => reject(new Error('Error al convertir blob a base64'));

      // Si se carga correctamente, resolvemos con el resultado
      lector.onload = () => {
        // El resultado es una cadena en base64 con prefijo MIME (ej: "data:image/jpeg;base64,...")
        resolve(lector.result as string);
      };

      // Iniciar la conversión del blob a base64
      lector.readAsDataURL(blob);
    });
  }

  /**
   * Guarda la foto en el almacenamiento privado de la app.
   * Convierte la imagen a base64 antes de guardarla.
   * @param foto - El objeto Photo devuelto por la cámara.
   * @returns El nombre del archivo guardado internamente.
   */
  private async guardarFoto(foto: Photo): Promise<string> {
    // Usamos fetch para obtener la imagen como recurso binario desde la URI
    const respuesta = await fetch(foto.webPath!);

    // Extraemos el blob (contenido binario) de la respuesta
    const blob = await respuesta.blob();

    // Convertimos el blob a una cadena en base64
    const enBase64 = await this.convertirBlobABase64(blob);

    // Generamos un nombre único para el archivo usando timestamp
    const nombreArchivo = new Date().getTime() + '.jpeg';

    // Guardamos el archivo con ese nombre en el directorio interno de la app
    await Filesystem.writeFile({
      path: nombreArchivo,    // Nombre del archivo
      data: enBase64,         // Contenido en base64
      directory: Directory.Data // Directorio privado de la app
    });

    // Devolvemos el nombre del archivo guardado para mostrarlo luego
    return nombreArchivo;
  }

  async crearRutaALaFotoBase64(nombreArchivo: string): Promise<string> {
    try {
      // 1. Leer el archivo desde el almacenamiento privado de la app usando Capacitor Filesystem
      //    Se indica la ruta (nombreArchivo) y el directorio (Directory.Data)
      const archivo = await Filesystem.readFile({
        path: nombreArchivo,
        directory: Directory.Data,
      });

      // 2. El resultado 'archivo.data' contiene el contenido del archivo en base64 (sin prefijo MIME)
      // 3. Se concatena el prefijo 'data:image/jpeg;base64,' para formar una URL base64 válida para <img>
      // 4. Esta URL base64 permite mostrar la imagen directamente en el navegador como una imagen embebida
      return `data:image/jpeg;base64,${archivo.data}`;
    } catch (error) {
      // 5. Captura y muestra en consola cualquier error que ocurra al leer el archivo
      console.error('Error leyendo archivo:', error);

      // 6. Retorna cadena vacía para evitar errores en la aplicación si no se pudo leer la imagen
      return '';
    }
  }
}
