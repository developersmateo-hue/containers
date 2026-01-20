import { Suspense } from "react";
import NuevaPersonaClient from "./NuevaPersonaClient";

export default function NuevaPersonaPage() {
  return (
    <Suspense
      fallback={
        <div className="py-10 text-center text-gray-500">
          Cargando formulario...
        </div>
      }
    >
      <NuevaPersonaClient />
    </Suspense>
  );
}
