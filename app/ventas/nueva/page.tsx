"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabaseClient";
import { onlyNumberInput } from "@/src/utils/onlyNumberInput";

interface ContainerOption {
  bl_number: string;
  container_number: string;
}

interface FormState {
  bl_number: string;
  container_number: string;
  cliente_final: string;
  acuerdo_precio_usd: string;
  vendido_por: string;
  terminos_pago_dias: string;
  solicitud_cambio_importadora: string;
  prioridad_solicitado: string;
}

const initialForm: FormState = {
  bl_number: "",
  container_number: "",
  cliente_final: "",
  acuerdo_precio_usd: "",
  vendido_por: "",
  terminos_pago_dias: "",
  solicitud_cambio_importadora: "",
  prioridad_solicitado: "",
};

export default function NuevaVentaPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [containers, setContainers] = useState<ContainerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  interface PersonaOption {
    id: string;
    nombre: string;
    apellidos: string | null;
  }

  const [clientes, setClientes] = useState<PersonaOption[]>([]);
  const [vendedores, setVendedores] = useState<PersonaOption[]>([]);


  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Traer BL + contenedores desde containers_new
  const fetchContainers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("containers_new")
        .select("bl_number, container_number")
        .order("bl_number");

      if (error) throw error;
      setContainers(data as ContainerOption[]);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al cargar contenedores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
  }, []);

  const uniqueBLs = useMemo(() => {
    const setBl = new Set<string>();
    containers.forEach((c) => setBl.add(c.bl_number));
    return Array.from(setBl);
  }, [containers]);

  const containersForSelectedBL = useMemo(
    () =>
      containers.filter((c) => c.bl_number === form.bl_number),
    [containers, form.bl_number]
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Cambio de BL → reset contenedor
  const handleBLChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      bl_number: value,
      container_number: "",
    }));
    setErrors((prev) => ({ ...prev, bl_number: "", container_number: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.bl_number.trim()) newErrors.bl_number = "BL es obligatorio";
    if (!form.container_number.trim())
      newErrors.container_number = "Contenedor es obligatorio";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("ventas").insert({
        bl_number: form.bl_number,
        container_number: form.container_number,
        cliente_final: form.cliente_final || null,
        acuerdo_precio_usd: form.acuerdo_precio_usd || null,
        vendido_por: form.vendido_por || null,
        terminos_pago_dias: form.terminos_pago_dias || null,
        solicitud_cambio_importadora:
          form.solicitud_cambio_importadora || null,
        prioridad_solicitado: form.prioridad_solicitado || null,
      });

      if (error) throw error;

      setSuccessMsg("Venta registrada correctamente.");
      showToast("success", "Venta creada correctamente");
      setForm(initialForm);

      // opcional: volver al listado luego de 1s
      setTimeout(() => {
        router.push("/ventas");
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al guardar la venta");
      showToast("error", "No se pudo guardar la venta");
    } finally {
      setLoading(false);
    }
  };


  const fetchClientes = async () => {
    const { data, error } = await supabase
      .from("personas")
      .select("id, nombre, apellidos")
      .eq("tipo", "cliente")
      .eq("activo", true)
      .order("nombre");

    if (error) throw error;
    setClientes(data as PersonaOption[]);
  };

  const fetchVendedores = async () => {
    const { data, error } = await supabase
      .from("personas")
      .select("id, nombre, apellidos")
      .eq("tipo", "vendedor")
      .eq("activo", true)
      .order("nombre");

    if (error) throw error;
    setVendedores(data as PersonaOption[]);
  };

  useEffect(() => {
    setLoading(true);
    setErrorMsg(null);

    (async () => {
      try {
        await Promise.all([
          fetchClientes(),
          fetchVendedores(),
        ]);

      } catch (err: any) {
        setErrorMsg(err.message || "Error al cargar la venta");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  //campo numerico
  const renderInputNumber = (label: string, name: keyof FormState) => {
    const value = form[name] ?? "";

    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>

        <input
          type="text"
          name={name}
          value={value}
          onChange={(e) =>
            setForm((prev: any) => ({
              ...prev,
              [name]: onlyNumberInput(e.target.value),
            }))
          }
          className="w-full rounded-lg border px-3 py-2 text-sm bg-white text-gray-800 shadow-sm 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
        />
      </div>
    );
  };

  const renderInput = (
    label: string,
    name: keyof FormState,
    options?: { textarea?: boolean }
  ) => {
    const { textarea } = options || {};
    const hasError = !!errors[name as string];

    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {textarea ? (
          <textarea
            name={name}
            value={form[name]}
            onChange={handleChange}
            rows={3}
            className={`w-full rounded-lg border px-3 py-2 text-sm bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 ${hasError ? "border-red-400" : "border-gray-300"
              }`}
          />
        ) : (
          <input
            name={name}
            value={form[name]}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 text-sm bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 ${hasError ? "border-red-400" : "border-gray-300"
              }`}
          />
        )}
        {hasError && (
          <p className="text-xs text-red-500">{errors[name as string]}</p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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

      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Nueva venta.
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Registra una venta asociada a un BL y contenedor ya existentes.
        </p>

        {errorMsg && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* BL + Contenedor */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                BL <span className="text-red-500">*</span>
              </label>
              <select
                name="bl_number"
                value={form.bl_number}
                onChange={handleBLChange}
                className={`w-full rounded-lg border px-3 py-2 text-sm bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 ${errors.bl_number ? "border-red-400" : "border-gray-300"
                  }`}
              >
                <option value="">Seleccione un BL</option>
                {uniqueBLs.map((bl) => (
                  <option key={bl} value={bl}>
                    {bl}
                  </option>
                ))}
              </select>
              {errors.bl_number && (
                <p className="text-xs text-red-500">{errors.bl_number}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Contenedor <span className="text-red-500">*</span>
              </label>
              <select
                name="container_number"
                value={form.container_number}
                onChange={handleChange}
                disabled={!form.bl_number}
                className={`w-full rounded-lg border px-3 py-2 text-sm bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 ${errors.container_number ? "border-red-400" : "border-gray-300"
                  } ${!form.bl_number ? "bg-gray-100 cursor-not-allowed" : ""}`}
              >
                <option value="">
                  {form.bl_number
                    ? "Seleccione un contenedor"
                    : "Seleccione primero un BL"}
                </option>
                {containersForSelectedBL.map((c) => (
                  <option key={c.container_number} value={c.container_number}>
                    {c.container_number}
                  </option>
                ))}
              </select>
              {errors.container_number && (
                <p className="text-xs text-red-500">
                  {errors.container_number}
                </p>
              )}
            </div>
          </div>

          {/* Datos de venta */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Cliente final
              </label>
              <select
                name="cliente_final"
                value={form.cliente_final ?? ""}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 text-sm bg-white text-gray-800 shadow-sm 
    focus:ring-2 focus:ring-blue-500"
              >
                {/* Opción fija */}
                <option value="Sin cliente">– Sin cliente –</option>

                {/* Clientes reales */}
                {clientes.map((c) => (
                  <option
                    key={c.id}
                    value={`${c.nombre} ${c.apellidos ?? ""}`.trim()}
                  >
                    {c.nombre} {c.apellidos}
                  </option>
                ))}
              </select>
            </div>

            {renderInputNumber("Acuerdo precio (USD)", "acuerdo_precio_usd")}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Vendido por
              </label>
              <select
                name="vendido_por"
                value={form.vendido_por ?? ""}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 text-sm bg-white text-gray-800 shadow-sm 
    focus:ring-2 focus:ring-blue-500"
              >
                {/* Opción fija */}
                <option value="Sin vendedor">– Sin vendedor –</option>

                {/* Vendedores reales */}
                {vendedores.map((v) => (
                  <option
                    key={v.id}
                    value={`${v.nombre} ${v.apellidos ?? ""}`.trim()}
                  >
                    {v.nombre} {v.apellidos}
                  </option>
                ))}
              </select>
            </div>

            {renderInputNumber("Términos de pago (días)", "terminos_pago_dias")}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {renderInput(
              "Solicitud cambio importadora",
              "solicitud_cambio_importadora",
              { textarea: true }
            )}
            {renderInput("Prioridad solicitado", "prioridad_solicitado", {
              textarea: true,
            })}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-100"
              onClick={() => router.push("/ventas")}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Guardar venta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
