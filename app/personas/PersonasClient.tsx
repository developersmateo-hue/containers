"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/src/lib/supabaseClient";
import type { Persona, PersonaTipo } from "@/src/types/persona";

export default function PersonasClient() {
  const searchParams = useSearchParams();

  const tipo = (searchParams.get("tipo") ?? "cliente") as PersonaTipo;
  const tipoLabel = tipo === "cliente" ? "Clientes" : "Vendedores";

  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Persona | null>(null);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPersonas = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase
        .from("personas")
        .select("*")
        .eq("tipo", tipo)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPersonas((data ?? []) as Persona[]);
    } catch (err: any) {
      setErrorMsg(err?.message || "Error al cargar personas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo]);

  const filteredPersonas = useMemo(() => {
    if (!search.trim()) return personas;
    const term = search.toLowerCase();

    return personas.filter((p) => {
      const fullName = `${p.nombre ?? ""} ${p.apellidos ?? ""}`.trim();
      return (
        fullName.toLowerCase().includes(term) ||
        (p.identificacion ?? "").toLowerCase().includes(term) ||
        (p.correo ?? "").toLowerCase().includes(term) ||
        (p.telefono ?? "").toLowerCase().includes(term)
      );
    });
  }, [personas, search]);

  const confirmDelete = (persona: Persona) => {
    setDeleteItem(persona);
    setDeleteOpen(true);
  };

  const performDelete = async () => {
    if (!deleteItem) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from("personas")
        .delete()
        .eq("id", deleteItem.id);

      if (error) throw error;

      setPersonas((prev) => prev.filter((p) => p.id !== deleteItem.id));
      showToast("success", "Registro eliminado correctamente");
      setDeleteOpen(false);
      setDeleteItem(null);
    } catch (err: any) {
      setErrorMsg(err?.message || "Error al eliminar");
      showToast("error", "No se pudo eliminar el registro");
    } finally {
      setLoading(false);
    }
  };

  const makeTipoHref = (t: PersonaTipo) => `/personas?tipo=${t}`;

  return (
      <div className="space-y-6">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 rounded-lg px-4 py-2 text-sm shadow-md ${
              toast.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {toast.message}
          </div>
        )}
  
        {/* Header + Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{tipoLabel}</h2>
            <p className="text-sm text-gray-500">
              Gestiona {tipo === "cliente" ? "clientes" : "vendedores"} en una sola
              tabla.
            </p>
          </div>
  
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {/* Switch tipo */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden bg-white shadow-sm">
              <Link
                href={makeTipoHref("cliente")}
                className={`px-3 py-2 text-sm ${
                  tipo === "cliente"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Clientes
              </Link>
              <Link
                href={makeTipoHref("vendedor")}
                className={`px-3 py-2 text-sm ${
                  tipo === "vendedor"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Vendedores
              </Link>
            </div>
  
            {/* Search */}
            <input
              type="text"
              placeholder="Buscar por nombre, correo, teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500"
            />
  
            {/* New */}
            <Link
              href={`/personas/nueva?tipo=${tipo}`}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm text-center"
            >
              Nuevo {tipo === "cliente" ? "cliente" : "vendedor"}
            </Link>
          </div>
        </div>
  
        {/* Error */}
        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {errorMsg}
          </div>
        )}
  
        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  {[
                    "Nombre",
                    "Identificación",
                    "Teléfono",
                    "Correo",
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
                {loading && personas.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-6 text-center text-gray-500"
                    >
                      Cargando...
                    </td>
                  </tr>
                )}
  
                {!loading && filteredPersonas.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-6 text-center text-gray-500"
                    >
                      No hay registros.
                    </td>
                  </tr>
                )}
  
                {filteredPersonas.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-800">
                        {p.nombre} {p.apellidos}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {p.tipo}
                      </div>
                    </td>
  
                    <td className="px-3 py-2">{p.identificacion || "-"}</td>
                    <td className="px-3 py-2">{p.telefono || "-"}</td>
                    <td className="px-3 py-2">{p.correo || "-"}</td>
  
                    <td className="px-3 py-2 text-xs text-gray-500">
                      {p.created_at ? new Date(p.created_at).toLocaleString() : "-"}
                    </td>
  
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <Link
                          href={`/personas/${p.id}?tipo=${tipo}`}
                          className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => confirmDelete(p)}
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
                Eliminar {tipo === "cliente" ? "cliente" : "vendedor"}
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                ¿Seguro que deseas eliminar a{" "}
                <strong>
                  {deleteItem.nombre} {deleteItem.apellidos}
                </strong>
                ? Esta acción no se puede deshacer.
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
