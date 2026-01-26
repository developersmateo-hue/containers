"use client";

import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-gray-800">
          Containers Manager
        </h1>

        {user && (
          <nav className="flex gap-4 text-sm font-medium items-center">
            <Link href="/personas?tipo=cliente" className="nav-link">
              Clients / Sellers
            </Link>

            <Link href="/registros" className="nav-link">
              Records
            </Link>

            <Link href="/ventas" className="nav-link">
              Sales
            </Link>

            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-100 transition"
            >
              Logout
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
