// src/types/ventas.ts
export interface Venta {
  id: number;
  bl_number: string;
  container_number: string;
  cliente_final: string | null;
  acuerdo_precio_usd: string | null;
  vendido_por: string | null;
  terminos_pago_dias: string | null;
  solicitud_cambio_importadora: string | null;
  prioridad_solicitado: string | null;
  created_at: string;
}
