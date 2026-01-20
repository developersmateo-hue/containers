import { Suspense } from "react";
import EditarPersonaClient from "./EditarPersonaClient";

export default function EditarPersonaPage() {
  return (
    <Suspense
      fallback={
        <div className="py-10 text-center text-gray-500">
          Cargando persona...
        </div>
      }
    >
      <EditarPersonaClient />
    </Suspense>
  );
}
