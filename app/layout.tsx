import "./globals.css";
import Header from "@/src/components/Header";
import { AuthProvider } from "@/src/context/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <AuthProvider>
          <Header />
          <main className="max-w-6xl mx-auto px-4 py-10">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
