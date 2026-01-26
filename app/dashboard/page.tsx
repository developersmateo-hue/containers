// src/app/page.tsx
"use client";

import { supabase } from "@/src/lib/supabaseClient";
import { uploadDocument } from "@/src/lib/uploadDocument";
import { onlyNumberInput } from "@/src/utils/onlyNumberInput";
import { toUpper } from "@/src/utils/toUpper";
// import { uploadDocument } from "@/src/lib/uploadFile";
import { useState } from "react";

interface FormState {
  bl_number: string;
  container_number: string;
  batch: string;
  number_of_packages: string;
  weight_packages_kg: string;
  total_weight_kg: string;
  quality: string;
  brand: string;
  product: string;
  departure_port: string;
  departure_date: string;
  port_of_arrival: string;
  possible_date_of_arrival: string;
  importer_cuba: string;
  incoterms: string;
  total_price_usd: string;
  price_per_t_fob_usd: string;
  price_per_t_forwarder_usd: string;
  forwarding_company: string;
  number_contract: string;
  specifications: string;
  bl_draft_url: string;
  swb_url: string;
  invoice_forwarder_url: string;
  contract_url: string;
  invoice_supplier_url: string;
  especification_supplier: string;
}

const initialForm: FormState = {
  bl_number: "",
  container_number: "",
  batch: "",
  number_of_packages: "",
  weight_packages_kg: "",
  total_weight_kg: "",
  quality: "",
  brand: "",
  product: "", // 👈 NUEVO
  departure_port: "",
  departure_date: "",
  port_of_arrival: "",
  possible_date_of_arrival: "",
  importer_cuba: "",
  incoterms: "",
  total_price_usd: "",
  price_per_t_fob_usd: "",
  price_per_t_forwarder_usd: "",
  forwarding_company: "",
  number_contract: "",
  specifications: "",
  bl_draft_url: "",
  swb_url: "",
  invoice_forwarder_url: "",
  contract_url: "",
  invoice_supplier_url: "",
  especification_supplier: "",
};

export default function HomePage() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState<any>({
    bl_number: "",
    container_number: "",
    batch: "",
    number_of_packages: "",
    weight_packages_kg: "",
    total_weight_kg: "",
    quality: "",
    brand: "",
    product: "",
    departure_port: "",
    departure_date: "",
    port_of_arrival: "",
    possible_date_of_arrival: "",
    importer_cuba: "",
    incoterms: "",
    total_price_usd: "",
    price_per_t_fob_usd: "",
    price_per_t_forwarder_usd: "",
    forwarding_company: "",
    number_contract: "",
    specifications: "",
    bl_draft_file: null,
    swb_file: null,
    invoice_forwarder_file: null,
    contract_file: null,
    invoice_supplier_file: null,
    especification_supplier_file: null,
  });

  const [files, setFiles] = useState({
  bl_draft_file: null as File | null,
  swb_file: null as File | null,
  invoice_forwarder_file: null as File | null,
  contract_file: null as File | null,
  invoice_supplier_file: null as File | null,
  especification_supplier_file: null as File | null,
});

  const handleFileChange = (name: string, file: File | null) => {
  setFiles((prev) => ({
    ...prev,
    [name]: file,
  }));
};

 const handleChange = (e: any) => {
  const { name, value } = e.target;

  setForm((prev: any) => ({
    ...prev,
    [name]: typeof value === "string" ? toUpper(value) : value,
  }));
};

// Nuevo estado UI
const [productSelect, setProductSelect] = useState("");
const [productOther, setProductOther] = useState("");


const handleSubmit = async (e: any) => {
  e.preventDefault();

  setLoading(true);
  setSuccessMsg(null);
  setErrorMsg(null);

  try {
    // === Subir archivos según carpeta FIJA ===
    const bl_draft_url = files.bl_draft_file
      ? await uploadDocument(
          files.bl_draft_file,
          "BL_DRAFT",
          form.bl_number,
          form.container_number,
          form.batch
        )
      : null;

    const swb_url = files.swb_file
      ? await uploadDocument(
          files.swb_file,
          "SWB",
          form.bl_number,
          form.container_number,
          form.batch
        )
      : null;

    const invoice_forwarder_url = files.invoice_forwarder_file
      ? await uploadDocument(
          files.invoice_forwarder_file,
          "INVOICE_FORWARDER",
          form.bl_number,
          form.container_number,
          form.batch
        )
      : null;

    const contract_url = files.contract_file
      ? await uploadDocument(
          files.contract_file,
          "CONTRACT",
          form.bl_number,
          form.container_number,
          form.batch
        )
      : null;

    const invoice_supplier_url = files.invoice_supplier_file
      ? await uploadDocument(
          files.invoice_supplier_file,
          "INVOICE_SUPPLIER",
          form.bl_number,
          form.container_number,
          form.batch
        )
      : null;

    const especification_supplier = files.especification_supplier_file
      ? await uploadDocument(
          files.especification_supplier_file,
          "ESPECIFICATION_SUPPLIER",
          form.bl_number,
          form.container_number,
          form.batch
        )
      : null;

      const normalize = (name: string) => {
  if (form[name] === "OTRO") {
    return form[`${name}_other`] || "";
  }
  return form[name];
};


    // === INSERTAR EN BD ===
    const { error } = await supabase.from("containers_new").insert({
      raw_timestamp: new Date().toISOString(),
      bl_number: form.bl_number,
      container_number: form.container_number,
      batch: form.batch,
      number_of_packages: form.number_of_packages,
      weight_packages_kg: normalize("weight_packages_kg"),
      total_weight_kg: form.total_weight_kg,
      quality: normalize("quality"),
      brand: normalize("brand"),
      product: form.product,
      departure_port: normalize("departure_port"),
      departure_date: form.departure_date,
      port_of_arrival: normalize("port_of_arrival"),
      possible_date_of_arrival: form.possible_date_of_arrival,
      importer_cuba: normalize("importer_cuba"),
      incoterms: normalize("incoterms"),
      total_price_usd: form.total_price_usd,
      price_per_t_fob_usd: form.price_per_t_fob_usd,
      price_per_t_forwarder_usd: form.price_per_t_forwarder_usd,
      forwarding_company: form.forwarding_company,
      number_contract: form.number_contract,
      specifications: form.specifications,

      // === URLs de los documentos subidos ===
      bl_draft_url,
      swb_url,
      invoice_forwarder_url,
      contract_url,
      invoice_supplier_url,
      especification_supplier,
    });

    if (error) {
      if (error.code === "23505") {
        setErrorMsg("BL, Contenedor o Batch duplicado.");
      } else {
        setErrorMsg(error.message);
      }
      return;
    }

    // ÉXITO
    setSuccessMsg("Registro creado exitosamente.");

    setForm(initialForm);
    setFiles({
      bl_draft_file: null,
      swb_file: null,
      invoice_forwarder_file: null,
      contract_file: null,
      invoice_supplier_file: null,
      especification_supplier_file: null,
    });

    setTimeout(() => {
      window.location.href = "/registros";
    }, 800);
  } catch (err: any) {
    setErrorMsg(err.message);
  } finally {
    setLoading(false);
  }
};






  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.bl_number.trim()) newErrors.bl_number = "BL es obligatorio";
    if (!form.container_number.trim())
      newErrors.container_number = "Contenedor es obligatorio";
    if (!form.batch.trim()) newErrors.batch = "Batch es obligatorio";

    return newErrors;
  };

//select con opcion otro
  const renderSelectWithOther = (
  label: string,
  name: string,
  options: string[]
) => {
  const value = form[name] ?? "";

  const isOther = value === "OTRO";
  const customValue = form[`${name}_other`] ?? "";

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      <select
        name={name}
        value={value}
        onChange={(e) =>
          setForm((prev: any) => ({
            ...prev,
            [name]: e.target.value,
            ...(e.target.value !== "OTRO" ? { [`${name}_other`]: "" } : {})
          }))
        }
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

      {isOther && (
        <input
          type="text"
          placeholder={`Especifique otro ${label.toLowerCase()}`}
          value={customValue}
          onChange={(e) =>
            setForm((prev: any) => ({
              ...prev,
              [`${name}_other`]: e.target.value,
            }))
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 mt-1"
        />
      )}
    </div>
  );
};

//campo de texto con numeros y letras
  const renderInput = (
    label: string,
    name: keyof FormState,
    options?: { required?: boolean; type?: string; textarea?: boolean }
  ) => {
    const { required, type, textarea } = options || {};
    const hasError = !!errors[name as string];

    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        {textarea ? (
          <textarea
            name={name}
            value={form[name]}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 text-sm bg-white text-gray-800 shadow-sm 
focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition 
${hasError ? "border-red-400" : "border-gray-300"}`}

            rows={3}
          />
        ) : (
          <input
            type={type || "text"}
            name={name}
            value={form[name]}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 text-sm bg-white text-gray-800 shadow-sm 
focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition 
${hasError ? "border-red-400" : "border-gray-300"}`}

          />
        )}
        {hasError && (
          <p className="text-xs text-red-400 mt-0.5">{errors[name as string]}</p>
        )}
      </div>
    );
  };


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


  return (
    <div className="space-y-6">


      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Formulario de contenedores
        </h2>

        {successMsg && (
          <div className="bg-green-50 border border-green-300 text-green-700 rounded-lg px-4 py-2 mb-4">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border borderå-red-300 text-red-700 rounded-lg px-4 py-2 mb-4">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-3 gap-4">
            {renderInput("BL", "bl_number", { required: true })}
            {renderInput("#CONTENEDOR", "container_number", { required: true })}
            {renderInput("BATCH", "batch", { required: true })}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {renderInputNumber("NUMBER OF PACKAGES", "number_of_packages")}
            {renderSelectWithOther("WEIGHT PACKAGES (kg)", "weight_packages_kg", [
  "50 kg",
  "25 kg",
  "1 kg"
])}

            {renderInputNumber("TOTAL WEIGHT (Kg)", "total_weight_kg")}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {renderSelectWithOther("QUALITY", "quality", [
  "STANDARD",
  "HIGH GLUTEN",
  "SEMOLA"
])}

            {renderSelectWithOther("BRAND", "brand", [
  "FINKA PATRON",
  "NITZA",
  "PERSHYY MLYN"
])}

            {renderSelectWithOther("DEPARTURE PORT", "departure_port", [
  "CONSTANTA",
  "ODESSA",
  "Chornomorsk"
])}

          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {renderInput("DEPARTURE DATE", "departure_date", { type: "date" })}
            {renderSelectWithOther("PORT OF ARRIVAL", "port_of_arrival", [
  "MARIEL",
  "SANTIAGO DE CUBA"
])}

            {renderInput("POSSIBLE DATE OF ARRIVAL", "possible_date_of_arrival", {
              type: "date",
            })}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {renderSelectWithOther("IMPORTER CUBA", "importer_cuba", [
  "CONSUMIMPORT",
  "AGRIMPEX"
])}

            {renderSelectWithOther("INCONTERMS", "incoterms", [
  "FOB",
  "CFR",
  "CIF"
])}

            {renderInputNumber("TOTAL PRICE (USD)", "total_price_usd")}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {renderInput("PRICE per t FOB (USD)", "price_per_t_fob_usd")}
            {renderInputNumber("PRICE PER T FORWARDER (USD)", "price_per_t_forwarder_usd")}
            {renderInput("FORWARDING COMPANY", "forwarding_company")}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {renderInputNumber("NUMBER CONTRACT", "number_contract")}
          {/* PRODUCTO */}
<div className="flex flex-col gap-1">
  <label className="text-sm font-medium text-gray-700">PRODUCTO</label>

  {/* SELECT PRINCIPAL */}
  <select
    value={productSelect}
    onChange={(e) => {
      const val = e.target.value;
      setProductSelect(val);

      if (val === "OTRO") {
        // deja el input en blanco para que el usuario escriba
        setProductOther("");
        setForm((prev: any) => ({
          ...prev,
          product: "",
        }));
      } else {
        setForm((prev: any) => ({
          ...prev,
          product: val,
        }));
      }
    }}
    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm shadow-sm focus:ring-2 focus:ring-blue-500"
  >
    <option value="">Seleccione...</option>
    <option value="ACEITE">ACEITE</option>
    <option value="HARINA">HARINA</option>
    <option value="OTRO">OTRO</option>
  </select>

  {/* INPUT CUANDO ES OTRO */}
  {productSelect === "OTRO" && (
    <input
      type="text"
      placeholder="Escriba el producto"
      value={productOther}
      onChange={(e) => {
        setProductOther(e.target.value);
        setForm((prev: any) => ({
          ...prev,
          product: e.target.value,   // ✔ se guarda EXACTAMENTE lo que escriba
        }));
      }}
      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500"
    />
  )}
</div>



          </div>

          <div className="grid gap-4">
            {renderInput("SPECIFICATIONS", "specifications", { textarea: true })}
            {renderInput("ESPECIFICATION SUPPLIER", "especification_supplier", {
              textarea: true,
            })}
          </div>



          <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">


            {/* ===== Archivos ===== */}
            <h3 className="text-lg font-semibold text-gray-700 mt-4">Documentos</h3>

            <FileInput
              label="BL DRAFT"
              onChange={(file: File | null) => handleFileChange("bl_draft_file", file)}
            />

            <FileInput
              label="SWB"
              onChange={(file: File | null) => handleFileChange("swb_file", file)}
            />

            <FileInput
              label="INVOICE FORWARDER"
              onChange={(file: File | null) =>
                handleFileChange("invoice_forwarder_file", file)
              }
            />

            <FileInput
              label="CONTRACT"
              onChange={(file: File | null) => handleFileChange("contract_file", file)}
            />

            <FileInput
              label="INVOICE SUPPLIER"
              onChange={(file: File | null) =>
                handleFileChange("invoice_supplier_file", file)
              }
            />

            <FileInput
              label="ESPECIFICATION SUPPLIER"
              onChange={(file: File | null) =>
                handleFileChange("especification_supplier_file", file)
              }
            />



          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => setForm(initialForm)}
              className={`px-4 py-2 rounded-lg border border-gray-300 text-sm 
  ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
            >
              Limpiar
            </button>


            {/* Submit */}
            <div className="flex justify-end gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-5 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm shadow-md transition 
  ${loading ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700"}`}
              >
                {loading ? "Guardando información..." : "Guardar registro"}
              </button>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
/***************************
 * Componentes auxiliares
 ***************************/
function Input({ label, name, required, onChange }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        name={name}
        required={required}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function FileInput({ label, onChange }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type="file"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="w-full text-sm bg-white px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
      />
    </div>
  );
}