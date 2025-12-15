"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabaseClient";
import { Venta } from "@/src/types/ventas";
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

export default function EditVentaPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [form, setForm] = useState<FormState | null>(null);
  const [containers, setContainers] = useState<ContainerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchContainers = async () => {
    const { data, error } = await supabase
      .from("containers_new")
      .select("bl_number, container_number")
      .order("bl_number");
    if (error) throw error;
    setContainers(data as ContainerOption[]);
  };

  const fetchVenta = async () => {
    const { data, error } = await supabase
      .from("ventas")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    const venta = data as Venta;

    setForm({
      bl_number: venta.bl_number,
      container_number: venta.container_number,
      cliente_final: venta.cliente_final || "",
      acuerdo_precio_usd: venta.acuerdo_precio_usd || "",
      vendido_por: venta.vendido_por || "",
      terminos_pago_dias: venta.terminos_pago_dias || "",
      solicitud_cambio_importadora:
        venta.solicitud_cambio_importadora || "",
      prioridad_solicitado: venta.prioridad_solicitado || "",
    });
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setErrorMsg(null);

    (async () => {
      try {
        await Promise.all([fetchContainers(), fetchVenta()]);
      } catch (err: any) {
        setErrorMsg(err.message || "Error al cargar la venta");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const uniqueBLs = useMemo(() => {
    const setBl = new Set<string>();
    containers.forEach((c) => setBl.add(c.bl_number));
    return Array.from(setBl);
  }, [containers]);

  const containersForSelectedBL = useMemo(() => {
    if (!form) return [];
    return containers.filter((c) => c.bl_number === form.bl_number);
  }, [containers, form?.bl_number, form]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!form) return;
    const { name, value } = e.target;
    setForm((prev) => ({ ...(prev as FormState), [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBLChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!form) return;
    const value = e.target.value;
    setForm((prev) => ({
      ...(prev as FormState),
      bl_number: value,
      container_number: "",
    }));
    setErrors((prev) => ({ ...prev, bl_number: "", container_number: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form?.bl_number.trim()) newErrors.bl_number = "BL es obligatorio";
    if (!form?.container_number.trim())
      newErrors.container_number = "Contenedor es obligatorio";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("ventas")
        .update({
          bl_number: form.bl_number,
          container_number: form.container_number,
          cliente_final: form.cliente_final || null,
          acuerdo_precio_usd: form.acuerdo_precio_usd || null,
          vendido_por: form.vendido_por || null,
          terminos_pago_dias: form.terminos_pago_dias || null,
          solicitud_cambio_importadora:
            form.solicitud_cambio_importadora || null,
          prioridad_solicitado: form.prioridad_solicitado || null,
        })
        .eq("id", id);

      if (error) throw error;

      setSuccessMsg("Venta actualizada correctamente.");
      showToast("success", "Venta actualizada correctamente");

      setTimeout(() => {
        router.push("/ventas");
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al actualizar la venta");
      showToast("error", "No se pudo actualizar la venta");
    } finally {
      setLoading(false);
    }
  };

      //campo numerico
      const renderInputNumber = (label: string, name: keyof FormState) => {
      if (!form) return null;
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
    if (!form) return null;
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
            className={`w-full rounded-lg border px-3 py-2 text-sm bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 ${
              hasError ? "border-red-400" : "border-gray-300"
            }`}
          />
        ) : (
          <input
            name={name}
            value={form[name]}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 text-sm bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 ${
              hasError ? "border-red-400" : "border-gray-300"
            }`}
          />
        )}
        {hasError && (
          <p className="text-xs text-red-500">{errors[name as string]}</p>
        )}
      </div>
    );
  };

  if (!form && loading) {
    return <p className="text-gray-500">Cargando venta...</p>;
  }

  if (!form && errorMsg) {
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <p className="text-red-600 text-sm">{errorMsg}</p>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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

      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Editar venta #{id}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Actualiza los datos de la venta asociada al BL y contenedor.
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
                className={`w-full rounded-lg border px-3 py-2 text-sm bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 ${
                  errors.bl_number ? "border-red-400" : "border-gray-300"
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
                className={`w-full rounded-lg border px-3 py-2 text-sm bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 ${
                  errors.container_number
                    ? "border-red-400"
                    : "border-gray-300"
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
            {renderInput("Cliente final", "cliente_final")}
            {renderInputNumber("Acuerdo precio (USD)", "acuerdo_precio_usd")}
            {renderInput("Vendido por", "vendido_por")}
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
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
