"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setStatus("loading");
    setError("");

    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Erro ao redefinir senha.");
      setStatus("error");
      return;
    }

    setStatus("success");
    setTimeout(() => router.push("/login"), 2000);
  }

  if (!token) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded text-sm text-center">
        Link inválido. Solicite uma nova redefinição de senha.
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded text-sm text-center">
        Senha redefinida com sucesso! Redirecionando para o login...
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {status === "error" && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Nova senha (mínimo 8 caracteres)
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
          Confirmar nova senha
        </label>
        <input
          id="confirm"
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
      >
        {status === "loading" ? "Redefinindo..." : "Redefinir senha"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">Nova senha</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Escolha uma senha segura para sua conta.
          </p>
        </div>
        <Suspense fallback={<div className="text-center text-gray-500">Carregando...</div>}>
          <ResetPasswordForm />
        </Suspense>
        <p className="text-center text-sm text-gray-600">
          <Link href="/login" className="text-blue-600 hover:underline">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}
