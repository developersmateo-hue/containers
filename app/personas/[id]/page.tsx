"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/src/lib/supabaseClient";
import type { Persona, PersonaTipo } from "@/src/types/persona";

export default function EditarPersonaPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params.id as string;
  const tipo = (searchParams.get("tipo") ?? "cliente") as PersonaTipo;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState<{
    nombre: string;
    apellidos: string;
    identificacion: string;
    telefono: string;
    correo: string;
    activo: boolean;
  }>({
    nombre: "",
    apellidos: "",
    identificacion: "",
    telefono: "",
    correo: "",
    activo: true,
  });

  // ============================
  // 🔹 Cargar persona
  // ============================
  useEffect(() => {
    const fetchPersona = async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const { data, error } = await supabase
          .from("personas")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Registro no encontrado");

        const persona = data as Persona;

        setForm({
          nombre: persona.nombre ?? "",
          apellidos: persona.apellidos ?? "",
          identificacion: persona.identificacion ?? "",
          telefono: persona.telefono ?? "",
          correo: persona.correo ?? "",
          activo: persona.activo ?? true,
        });
      } catch (err: any) {
        setErrorMsg(err?.message || "Error al cargar registro");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPersona();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ============================
  // 🔹 Guardar cambios
  // ============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from("personas")
        .update({
          nombre: form.nombre.trim(),
          apellidos: form.apellidos || null,
          identificacion: form.identificacion || null,
          telefono: form.telefono || null,
          correo: form.correo || null,
          activo: form.activo,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      router.push(`/personas?tipo=${tipo}`);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err?.message || "Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-gray-500">
        Cargando información...
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 capitalize">
          Editar {tipo}
        </h2>
        <p className="text-sm text-gray-500">
          Actualiza la información del {tipo}.
        </p>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-xl shadow-md p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Apellidos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellidos
            </label>
            <input
              name="apellidos"
              value={form.apellidos}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Identificación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Identificación
            </label>
            <input
              name="identificacion"
              value={form.identificacion}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Correo */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Activo */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="activo"
            checked={form.activo}
            onChange={handleChange}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Activo</span>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link
            href={`/personas?tipo=${tipo}`}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-100"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
