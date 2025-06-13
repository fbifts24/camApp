export interface Product {
    id: number;
    titulo: string;
    descripcion: string;
    precio: number;
    rutaFoto: string;
    rutaFotoBase64?: string;
}