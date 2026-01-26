"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  const [user, setUser] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const username = user.toLowerCase().trim();

      // Buscar por correo completo o por parte antes del @
      const { data, error } = await supabase
        .from("personas")
        .select("*")
        .or(
          `correo.ilike.${username}@%,correo.ilike.${username}`
        )
        .eq("code", code)
        .eq("activo", true)
        .single();

      if (error || !data) {
        setErrorMsg("Invalid user or code");
        return;
      }

      // guardar cookie
      document.cookie = `auth_user=${JSON.stringify(data)}; path=/`;

      // guardar sesión
      localStorage.setItem("user_session", JSON.stringify(data));

      // redirigir
      router.push("/registros");



    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Login
        </h2>

        {errorMsg && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">

          {/* USER */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              User
            </label>
            <input
              type="text"
              placeholder="email or username"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* CODE */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Code
            </label>
            <input
              type="password"
              placeholder="enter your code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-medium transition ${loading
              ? "bg-blue-400"
              : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>
      </div>
    </div>
  );
}
