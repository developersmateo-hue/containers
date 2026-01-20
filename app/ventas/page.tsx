"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Venta } from "@/src/types/ventas";
import { supabase } from "@/src/lib/supabaseClient";

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Venta | null>(null);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };
  const fetchVentas = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase
        .from("ventas")
        .select(`
        id,
        bl_number,
        container_number,
        acuerdo_precio_usd,
        terminos_pago_dias,
        prioridad_solicitado,
        solicitud_cambio_importadora,
        created_at,

        cliente:cliente_id (
          id,
          nombre,
          apellidos
        ),

        vendedor:vendedor_id (
          id,
          nombre,
          apellidos
        )
      `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // 🔥 LOG MAESTRO
      console.log("VENTAS RAW FROM SUPABASE 👇");
      console.log(JSON.stringify(data, null, 2));

      const normalized: Venta[] = (data ?? []).map((v: any) => ({
        id: v.id,
        bl_number: v.bl_number,
        container_number: v.container_number,

        acuerdo_precio_usd: v.acuerdo_precio_usd,
        terminos_pago_dias: v.terminos_pago_dias,
        prioridad_solicitado: v.prioridad_solicitado,
        solicitud_cambio_importadora: v.solicitud_cambio_importadora,
        created_at: v.created_at,

        cliente: v.cliente
          ? {
            id: v.cliente.id,
            nombre: v.cliente.nombre,
            apellidos: v.cliente.apellidos,
          }
          : null,

        vendedor: v.vendedor
          ? {
            id: v.vendedor.id,
            nombre: v.vendedor.nombre,
            apellidos: v.vendedor.apellidos,
          }
          : null,
      }));

      setVentas(normalized);

    } catch (err: any) {
      setErrorMsg(err.message || "Error al cargar ventas");
    } finally {
      setLoading(false);
    }
  };




  useEffect(() => {
    fetchVentas();
  }, []);

  const filteredVentas = useMemo(() => {
    if (!search.trim()) return ventas;
    const term = search.toLowerCase();
    return ventas.filter((v) => {
      return (
        v.bl_number.toLowerCase().includes(term) ||
        v.container_number.toLowerCase().includes(term) ||
        (v.cliente
          ? `${v.cliente.nombre} ${v.cliente.apellidos ?? ""}`.toLowerCase()
          : ""
        ).includes(term) ||
        (v.vendedor
          ? `${v.vendedor.nombre} ${v.vendedor.apellidos ?? ""}`.toLowerCase()
          : ""
        ).includes(term)
      );
    });
  }, [ventas, search]);

  const confirmDelete = (venta: Venta) => {
    setDeleteItem(venta);
    setDeleteOpen(true);
  };

  const performDelete = async () => {
    if (!deleteItem) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from("ventas")
        .delete()
        .eq("id", deleteItem.id);

      if (error) throw error;

      setVentas((prev) => prev.filter((v) => v.id !== deleteItem.id));
      showToast("success", "Venta eliminada correctamente");
      setDeleteOpen(false);
      setDeleteItem(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al eliminar venta");
      showToast("error", "No se pudo eliminar la venta");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-lg px-4 py-2 text-sm shadow-md ${toast.type === "success"
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
            }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Ventas</h2>
          <p className="text-sm text-gray-500">
            Registra y gestiona las ventas asociadas a BL y contenedores reales.
          </p>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Buscar por BL, contenedor, cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500"
          />
          <Link
            href="/ventas/nueva"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm"
          >
            Nueva venta
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                {[
                  "ID",
                  "BL",
                  "Contenedor",
                  "Cliente final",
                  "Acuerdo precio (USD)",
                  "Vendido por",
                  "Términos pago (días)",
                  "Prioridad",
                  "Creado",
                  "Acciones",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left font-medium text-gray-700"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && ventas.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-3 py-6 text-center text-gray-500"
                  >
                    Cargando ventas...
                  </td>
                </tr>
              )}

              {!loading && filteredVentas.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-3 py-6 text-center text-gray-500"
                  >
                    No hay ventas registradas.
                  </td>
                </tr>
              )}

              {filteredVentas.map((venta) => (
                <tr
                  key={venta.id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-3 py-2">{venta.id}</td>
                  <td className="px-3 py-2">{venta.bl_number}</td>
                  <td className="px-3 py-2">{venta.container_number}</td>
                  <td className="px-3 py-2">
                    {venta.cliente
                      ? `${venta.cliente.nombre} ${venta.cliente.apellidos ?? ""}`.trim()
                      : "—"}
                  </td>
                  <td className="px-3 py-2">{venta.acuerdo_precio_usd}</td>
                  <td className="px-3 py-2">
                    {venta.vendedor
                      ? `${venta.vendedor.nombre} ${venta.vendedor.apellidos ?? ""}`.trim()
                      : "—"}
                  </td>
                  <td className="px-3 py-2">{venta.terminos_pago_dias}</td>
                  <td className="px-3 py-2">{venta.prioridad_solicitado}</td>
                  <td className="px-3 py-2 text-xs text-gray-500">
                    {venta.created_at &&
                      new Date(venta.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <Link
                        href={`/ventas/${venta.id}`}
                        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => confirmDelete(venta)}
                        className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal eliminar */}
      {deleteOpen && deleteItem && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Eliminar venta
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              ¿Seguro que deseas eliminar la venta #{deleteItem.id} (
              BL {deleteItem.bl_number} / Contenedor{" "}
              {deleteItem.container_number})? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={performDelete}
                disabled={loading}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-60"
              >
                {loading ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
