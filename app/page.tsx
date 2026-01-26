"use client";

import { useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [emailOrUser, setEmailOrUser] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const userValue = emailOrUser.includes("@")
        ? emailOrUser
        : `${emailOrUser}@%`;

      const { data, error } = await supabase
        .from("personas")
        .select("*")
        .ilike("correo", userValue)
        .eq("code", code)
        .eq("activo", true)
        .single();

      if (error || !data) {
        setErrorMsg("Invalid credentials");
        return;
      }
      // ✅ AQUÍ VA EL CÓDIGO QUE NO SABÍAS DÓNDE PONER
  document.cookie = "auth_user=true; path=/";

  // (opcional) guardar usuario en localStorage
  localStorage.setItem("user_session", JSON.stringify(data));
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Containers Manager
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Sign in to your account
        </p>

        {errorMsg && (
          <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-2 mb-4 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">
              User or Email
            </label>
            <input
              type="text"
              value={emailOrUser}
              onChange={(e) => setEmailOrUser(e.target.value)}
              placeholder="example or example@email.com"
              className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Code
            </label>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your code"
              className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition shadow-md disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Enter"}
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-6">
          © 2026 Containers Manager
        </p>
      </div>
    </div>
  );
}
