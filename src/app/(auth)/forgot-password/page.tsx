"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Ocorreu um erro. Tente novamente.");
      setStatus("error");
      return;
    }

    setStatus("sent");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">Esqueci minha senha</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Informe seu email e enviaremos as instruções para redefinir sua senha.
          </p>
        </div>

        {status === "sent" ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded text-sm text-center">
            Se o email estiver cadastrado, você receberá as instruções em breve.
            Verifique também sua caixa de spam.
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {status === "error" && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
            >
              {status === "loading" ? "Enviando..." : "Enviar instruções"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600">
          <Link href="/login" className="text-blue-600 hover:underline">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}
