export type PersonaTipo = "cliente" | "vendedor";

export interface Persona {
  id: string;
  tipo: PersonaTipo;

  nombre: string;
  apellidos?: string | null;
  identificacion?: string | null;
  telefono?: string | null;
  correo?: string | null;

  activo: boolean;

  created_at?: string;
  updated_at?: string;
}
