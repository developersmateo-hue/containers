// src/types/containers.ts
export interface ContainerRecord {
  id: number;
  container_business_code?: string | null;
  raw_timestamp: string | null;
  bl_number: string;
  container_number: string;
  batch: string;
  number_of_packages: string | null;
  weight_packages_kg: string | null;
  total_weight_kg: string | null;
  quality: string | null;
  brand: string | null;
  departure_port: string | null;
  departure_date: string | null; // guardamos como texto, aunque el input sea "date"
  port_of_arrival: string | null;
  possible_date_of_arrival: string | null; // date
  importer_cuba: string | null;
  incoterms: string | null;
  total_price_usd: string | null;
  price_per_t_fob_usd: string | null;
  price_per_t_forwarder_usd: string | null;
  forwarding_company: string | null;
  number_contract: string | null;
  specifications: string | null;
  bl_draft_url: string | null;
  swb_url: string | null;
  invoice_forwarder_url: string | null;
  contract_url: string | null;
  invoice_supplier_url: string | null;
  especification_supplier: string | null;
  created_at: string; // timestamp
}
