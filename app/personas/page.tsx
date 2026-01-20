import { Suspense } from "react";
import PersonasClient from "./PersonasClient";

export default function PersonasPage() {
  return (
    <Suspense
      fallback={
        <div className="py-10 text-center text-gray-500">
          Cargando personas...
        </div>
      }
    >
      <PersonasClient />
    </Suspense>
  );
}
