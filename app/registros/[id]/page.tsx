"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/src/lib/supabaseClient";
import { uploadDocument } from "@/src/lib/uploadDocument";

export default function EditContainerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [form, setForm] = useState<any>({});

  // PRODUCTO
  const [productSelect, setProductSelect] = useState("");
  const [productOther, setProductOther] = useState("");

  useEffect(() => {
    if (form.product) {
      if (["ACEITE", "HARINA"].includes(form.product)) {
        setProductSelect(form.product);
      } else {
        setProductSelect("OTRO");
        setProductOther(form.product);
      }
    }
  }, [form.product]);

  // FILES
  const [files, setFiles] = useState<any>({
    bl_draft_file: null,
    swb_file: null,
    invoice_forwarder_file: null,
    contract_file: null,
    invoice_supplier_file: null,
    especification_supplier_file: null,
  });

  const handleChange = (name: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (key: string, file: File | null) => {
    setFiles((prev: any) => ({
      ...prev,
      [key]: file,
    }));
  };

  // ================================
  // FETCH RECORD
  // ================================
  useEffect(() => {
    async function fetchRecord() {
      try {
        const { data, error } = await supabase
          .from("containers_new")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setForm(data);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoadingFetch(false);
      }
    }

    fetchRecord();
  }, [id]);


  // ================================
  //  VALIDACIÓN NUMÉRICA
  // ================================
  const onlyNumberInput = (value: string) => {
    return value.replace(/[^0-9]/g, "");
  };

  // ================================
  // SELECT + OTRO
  // ================================
 const renderSelectWithOther = (
  label: string,
  name: string,
  options: string[]
) => {
  const value = form[name] ?? "";

  // Detectar si el valor guardado NO está en las opciones → es un OTRO real
  const isCustomValue = value && !options.includes(value) && value !== "OTRO";

  const selectValue = isCustomValue ? "OTRO" : value;
  const customValue = isCustomValue ? value : form[`${name}_other`] ?? "";

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      {/* SELECT */}
      <select
        value={selectValue}
        onChange={(e) => {
          const val = e.target.value;

          if (val === "OTRO") {
            // No cambiar el valor original hasta que escriba en el input
            setForm((prev: any) => ({
              ...prev,
              [name]: "",         // aún no sabemos el valor real
              [`${name}_other`]: customValue, // mantener si existía
            }));
          } else {
            // Valor normal → guardar directamente
            setForm((prev: any) => ({
              ...prev,
              [name]: val,
              [`${name}_other`]: "",
            }));
          }
        }}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Seleccione…</option>
        {options.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
        <option value="OTRO">OTRO</option>
      </select>

      {/* INPUT CUANDO ES OTRO */}
      {selectValue === "OTRO" && (
        <input
          type="text"
          placeholder={`Especifique otro ${label.toLowerCase()}`}
          value={customValue}
          onChange={(e) =>
            setForm((prev: any) => ({
              ...prev,
              [name]: e.target.value,            // valor REAL a guardar
              [`${name}_other`]: e.target.value, // mantener sincronizado
            }))
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 mt-1"
        />
      )}
    </div>
  );
};



  // ================================
  // INPUT NUMÉRICO
  // ================================
  const renderInputNumber = (label: string, name: string) => {
    const value = form[name] ?? "";

    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <input
          type="text"
          value={value}
          onChange={(e) =>
            handleChange(name, onlyNumberInput(e.target.value))
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  };


  // ================================
  // SUBMIT UPDATE
  // ================================
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      let updatedUrls: any = {};

      // UPLOADS (igual que antes)
      for (const key of Object.keys(files)) {
        if (files[key]) {
          const folder = key.replace("_file", "").toUpperCase();
          updatedUrls[`${folder.toLowerCase()}_url`] = await uploadDocument(
            files[key],
            folder,
            form.bl_number,
            form.container_number,
            form.batch,
            form[`${folder.toLowerCase()}_url`]
          );
        }
      }

      // PRODUCT
      let finalProduct = productSelect === "OTRO" ? productOther : productSelect;

      const { error } = await supabase
        .from("containers_new")
        .update({
          ...form,
          ...updatedUrls,
          product: finalProduct,
        })
        .eq("id", id);

      if (error) throw error;

      setSuccessMsg("Registro actualizado correctamente.");
      setTimeout(() => router.push("/registros"), 1000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };


  // ================================
  // RENDER NORMAL INPUT
  // ================================
  const renderInput = (label: string, name: string, options?: any) => {
    const { type, textarea } = options || {};
    const value = form[name] ?? "";

    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>

        {textarea ? (
          <textarea
            value={value}
            onChange={(e) => handleChange(name, e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <input
            type={type || "text"}
            value={value}
            onChange={(e) => handleChange(name, e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500"
          />
        )}
      </div>
    );
  };

  if (loadingFetch) {
    return (
      <div className="text-center text-gray-600 mt-20 text-lg">
        Cargando datos…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Editar contenedor #{id}
        </h2>

        {successMsg && (
          <div className="bg-green-50 border border-green-300 text-green-700 rounded-lg px-4 py-2 mb-4">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-2 mb-4">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ==== CAMPOS ==== */}
          <div className="grid md:grid-cols-3 gap-4">
            {renderInput("BL", "bl_number")}
            {renderInput("CONTENEDOR", "container_number")}
            {renderInput("BATCH", "batch")}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {renderInputNumber("NUMBER OF PACKAGES", "number_of_packages")}

            {renderSelectWithOther("WEIGHT PACKAGES (kg)", "weight_packages_kg", [
              "50 kg", "25 kg", "1 kg"
            ])}

            {renderInputNumber("TOTAL WEIGHT (Kg)", "total_weight_kg")}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {renderSelectWithOther("QUALITY", "quality", [
              "STANDARD", "HIGH GLUTEN", "SEMOLA"
            ])}

            {renderSelectWithOther("BRAND", "brand", [
              "FINKA PATRON", "NITZA", "PERSHYY MLYN"
            ])}

            {renderSelectWithOther("DEPARTURE PORT", "departure_port", [
              "CONSTANTA", "ODESSA", "Chornomorsk"
            ])}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {renderInput("DEPARTURE DATE", "departure_date", { type: "date" })}

            {renderSelectWithOther("PORT OF ARRIVAL", "port_of_arrival", [
              "MARIEL", "SANTIAGO DE CUBA"
            ])}

            {renderInput("POSSIBLE DATE OF ARRIVAL", "possible_date_of_arrival", {
              type: "date"
            })}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {renderSelectWithOther("IMPORTER CUBA", "importer_cuba", [
              "CONSUMIMPORT", "AGRIMPEX"
            ])}

            {renderSelectWithOther("INCONTERMS", "incoterms", [
              "FOB", "CFR", "CIF"
            ])}

            {renderInputNumber("TOTAL PRICE (USD)", "total_price_usd")}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {renderInputNumber("PRICE per t FOB (USD)", "price_per_t_fob_usd")}
            {renderInputNumber("PRICE PER T FORWARDER (USD)", "price_per_t_forwarder_usd")}
            {renderInput("FORWARDING COMPANY", "forwarding_company")}
          </div>

          {renderInputNumber("NUMBER CONTRACT", "number_contract")}

          {/* PRODUCTO */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">PRODUCTO</label>

            <select
              value={productSelect}
              onChange={(e) => {
                const val = e.target.value;
                setProductSelect(val);

                if (val === "OTRO") {
                  setProductOther("");
                  handleChange("product", "");
                } else {
                  handleChange("product", val);
                }
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm shadow-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccione...</option>
              <option value="ACEITE">ACEITE</option>
              <option value="HARINA">HARINA</option>
              <option value="OTRO">OTRO</option>
            </select>

            {productSelect === "OTRO" && (
              <input
                type="text"
                placeholder="Escriba el producto"
                value={productOther}
                onChange={(e) => {
                  setProductOther(e.target.value);
                  handleChange("product", e.target.value);
                }}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {renderInput("SPECIFICATIONS", "specifications", { textarea: true })}
          {renderInput("ESPECIFICATION SUPPLIER", "especification_supplier", {
            textarea: true
          })}

          {/* ===== ARCHIVOS ===== */}
          <h3 className="text-lg font-semibold text-gray-700 mt-6">
            Documentos cargados
          </h3>

          {[
            ["BL DRAFT", "bl_draft_url", "bl_draft_file"],
            ["SWB", "swb_url", "swb_file"],
            ["INVOICE FORWARDER", "invoice_forwarder_url", "invoice_forwarder_file"],
            ["CONTRACT", "contract_url", "contract_file"],
            ["INVOICE SUPPLIER", "invoice_supplier_url", "invoice_supplier_file"],
            ["ESPECIFICATION SUPPLIER", "especification_supplier", "especification_supplier_file"],
          ].map(([label, urlKey, fileKey]: any) => (
            <div key={label} className="mb-3">
              <label className="text-sm font-medium text-gray-700">{label}</label>

              {form[urlKey] ? (
                <div className="mt-1 text-xs">
                  <a href={form[urlKey]} target="_blank" className="text-blue-600 underline">
                    Ver archivo actual
                  </a>
                </div>
              ) : (
                <div className="text-xs text-gray-400">No cargado</div>
              )}

              <FileInput
                label="Reemplazar archivo"
                onChange={(file: File | null) => handleFileChange(fileKey, file)}
              />
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/registros")}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm shadow-md transition ${
                loading ? "opacity-60" : "hover:bg-blue-700"
              }`}
            >
              {loading ? "Guardando cambios..." : "Guardar cambios"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}


/***************************
 * FILE INPUT
 ***************************/
function FileInput({ label, onChange }: any) {
  return (
    <div className="flex flex-col gap-1 mt-1">
      <label className="text-sm text-gray-600">{label}</label>
      <input
        type="file"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="w-full text-sm bg-white px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
      />
    </div>
  );
}
