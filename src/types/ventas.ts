export interface PersonaMini {
  id: string;
  nombre: string;
  apellidos: string | null;
}

export interface Venta {
  id: number;
  bl_number: string;
  container_number: string;

  acuerdo_precio_usd: string | null;
  terminos_pago_dias: string | null;
  prioridad_solicitado: string | null;
  solicitud_cambio_importadora: string | null;

  created_at: string | null;

  cliente: PersonaMini | null;
  vendedor: PersonaMini | null;
}
