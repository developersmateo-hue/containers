"use client";

import { supabase } from "@/src/lib/supabaseClient";
import { ContainerRecord } from "@/src/types/containers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface EditState extends Omit<ContainerRecord, "id" | "created_at"> {}

export default function RegistrosPage() {
  const [data, setData] = useState<ContainerRecord[]>([]);
  const [filtered, setFiltered] = useState<ContainerRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<ContainerRecord | null>(null);
  const [editForm, setEditForm] = useState<Partial<EditState>>({});

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<ContainerRecord | null>(null);
  const router = useRouter();

  // ============================
  // FETCH DATA
  // ============================
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("containers_new")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setData(data as ContainerRecord[]);
      setFiltered(data as ContainerRecord[]);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

    // ============================
  // SEARCH / FILTER
  // ============================
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(data);
      return;
    }

    const term = search.toLowerCase();

    const result = data.filter((item) =>
      [
        item.bl_number,
        item.container_number,
        item.batch,
        item.brand,
        item.quality,
        item.departure_port,
        item.port_of_arrival,
      ]
        .filter(Boolean)
        .some((field) =>
          String(field).toLowerCase().includes(term)
        )
    );

    setFiltered(result);
  }, [search, data]);


  // ============================
  // OPEN EDIT MODAL
  // ============================
  const openEdit = (item: ContainerRecord) => {
    setEditItem(item);
    setEditForm({ ...item });
    setEditOpen(true);
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    if (!editItem) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("containers_new")
        .update({ ...editForm })
        .eq("id", editItem.id);

      if (error) throw error;

      setEditOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // DELETE
  // ============================
  const confirmDelete = (item: ContainerRecord) => {
    setDeleteItem(item);
    setDeleteOpen(true);
  };

  const performDelete = async () => {
    if (!deleteItem) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("containers_new")
        .delete()
        .eq("id", deleteItem.id);

      if (error) throw error;

      setDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // RENDER INPUT
  // ============================
  const renderEditInput = (
    label: string,
    name: keyof EditState,
    options?: { type?: string; textarea?: boolean }
  ) => {
    const { type, textarea } = options || {};
    const value = (editForm as any)[name] ?? "";

    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-700">{label}</label>
        {textarea ? (
          <textarea
            name={name}
            value={value}
            onChange={handleEditChange}
            rows={3}
            className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <input
            type={type || "text"}
            name={name}
            value={value}
            onChange={handleEditChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500"
          />
        )}
      </div>
    );
  };

  // ============================
  // UI
  // ============================
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Registros</h2>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Buscar BL, contenedor, batch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm shadow-sm focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm shadow-sm"
          >
            Agregar nuevo
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Tabla */}
    <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
  <div className="overflow-x-auto">
    <table className="min-w-[1600px] text-sm">
      <thead className="bg-gray-100 border-b border-gray-300">
        <tr>
          {[
            "ID",
            "BL",
            "CONTENEDOR",
            "BATCH",
            "NUMBER OF PACKAGES",
            "WEIGHT PACKAGES (KG)",
            "TOTAL WEIGHT (KG)",
            "QUALITY",
            "BRAND",
            "DEPARTURE PORT",
            "DEPARTURE DATE",
            "PORT OF ARRIVAL",
            "POSSIBLE DATE ARRIVAL",
            "IMPORTER CUBA",
            "INCOTERMS",
            "TOTAL PRICE USD",
            "PRICE PER T FOB USD",
            "PRICE PER T FWDR USD",
            "FORWARDING COMPANY",
            "NUMBER CONTRACT",
            "SPECIFICATIONS",
            "BL DRAFT",
            "SWB",
            "INVOICE FWDR",
            "CONTRACT",
            "INVOICE SUPPLIER",
            "ESPECIFICATION SUPPLIER",
            "CREATED",
            "ACCIONES",
          ].map((h) => (
            <th key={h} className="px-3 py-2 text-left font-medium text-gray-700 whitespace-nowrap">
              {h}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {loading && (
          <tr>
            <td colSpan={30} className="px-3 py-6 text-center text-gray-500">
              Cargando registros...
            </td>
          </tr>
        )}

        {!loading && data.length === 0 && (
          <tr>
            <td colSpan={30} className="px-3 py-6 text-center text-gray-500">
              No hay registros disponibles.
            </td>
          </tr>
        )}

        {filtered.map((item) => (
  <tr key={item.id} className="border-t border-gray-200 hover:bg-gray-50">
            <td className="px-3 py-2">{item.id}</td>
            <td className="px-3 py-2">{item.bl_number}</td>
            <td className="px-3 py-2">{item.container_number}</td>
            <td className="px-3 py-2">{item.batch}</td>
            <td className="px-3 py-2">{item.number_of_packages}</td>
            <td className="px-3 py-2">{item.weight_packages_kg}</td>
            <td className="px-3 py-2">{item.total_weight_kg}</td>
            <td className="px-3 py-2">{item.quality}</td>
            <td className="px-3 py-2">{item.brand}</td>
            <td className="px-3 py-2">{item.departure_port}</td>
            <td className="px-3 py-2">{item.departure_date}</td>
            <td className="px-3 py-2">{item.port_of_arrival}</td>
            <td className="px-3 py-2">{item.possible_date_of_arrival}</td>
            <td className="px-3 py-2">{item.importer_cuba}</td>
            <td className="px-3 py-2">{item.incoterms}</td>
            <td className="px-3 py-2">{item.total_price_usd}</td>
            <td className="px-3 py-2">{item.price_per_t_fob_usd}</td>
            <td className="px-3 py-2">{item.price_per_t_forwarder_usd}</td>
            <td className="px-3 py-2">{item.forwarding_company}</td>
            <td className="px-3 py-2">{item.number_contract}</td>
            <td className="px-3 py-2 max-w-[250px] truncate">{item.specifications}</td>

            {/* LINKS A DOCUMENTOS */}
            <td className="px-3 py-2">
              {item.bl_draft_url ? (
                <a href={item.bl_draft_url} target="_blank" className="text-blue-600 underline text-xs">
                  Ver
                </a>
              ) : "—"}
            </td>

            <td className="px-3 py-2">
              {item.swb_url ? (
                <a href={item.swb_url} target="_blank" className="text-blue-600 underline text-xs">
                  Ver
                </a>
              ) : "—"}
            </td>

            <td className="px-3 py-2">
              {item.invoice_forwarder_url ? (
                <a href={item.invoice_forwarder_url} target="_blank" className="text-blue-600 underline text-xs">
                  Ver
                </a>
              ) : "—"}
            </td>

            <td className="px-3 py-2">
              {item.contract_url ? (
                <a href={item.contract_url} target="_blank" className="text-blue-600 underline text-xs">
                  Ver
                </a>
              ) : "—"}
            </td>

            <td className="px-3 py-2">
              {item.invoice_supplier_url ? (
                <a href={item.invoice_supplier_url} target="_blank" className="text-blue-600 underline text-xs">
                  Ver
                </a>
              ) : "—"}
            </td>

            <td className="px-3 py-2">
              {item.especification_supplier ? (
                <a href={item.especification_supplier} target="_blank" className="text-blue-600 underline text-xs">
                  Ver
                </a>
              ) : "—"}
            </td>

            <td className="px-3 py-2 text-xs text-gray-500">
              {new Date(item.created_at).toLocaleString()}
            </td>

            <td className="px-3 py-2 whitespace-nowrap">
              <div className="flex gap-2">
               <button
  onClick={() => router.push(`/registros/${item.id}`)}
  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs"
>
  Editar
</button>

                <button
                  onClick={() => confirmDelete(item)}
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


      {/* ===================== MODAL EDIT ===================== */}
      {editOpen && editItem && (
        <div className="fixed inset-0 z-40 bg-black/40 flex justify-center items-center">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Editar #{editItem.id}
              </h3>

              <button
                onClick={() => setEditOpen(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              {renderEditInput("BL", "bl_number")}
              {renderEditInput("CONTENEDOR", "container_number")}
              {renderEditInput("BATCH", "batch")}
              {renderEditInput("TOTAL WEIGHT", "total_weight_kg")}
              {renderEditInput("QUALITY", "quality")}
              {renderEditInput("BRAND", "brand")}
              {renderEditInput("DEPARTURE PORT", "departure_port")}
              {renderEditInput("POSSIBLE DATE", "possible_date_of_arrival")}
              {renderEditInput("PORT OF ARRIVAL", "port_of_arrival")}
              {renderEditInput("SPECIFICATIONS", "specifications", {
                textarea: true,
              })}
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100"
              >
                Cancelar
              </button>

              <button
                onClick={saveEdit}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL DELETE ===================== */}
      {deleteOpen && deleteItem && (
        <div className="fixed inset-0 z-40 bg-black/40 flex justify-center items-center">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Eliminar registro
            </h3>

            <p className="text-sm text-gray-700 mb-4">
              ¿Eliminar el registro #{deleteItem.id}? Esta acción no se puede
              deshacer.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100"
              >
                Cancelar
              </button>

              <button
                onClick={performDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
