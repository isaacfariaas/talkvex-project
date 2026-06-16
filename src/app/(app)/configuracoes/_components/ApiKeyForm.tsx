"use client";

import { useState, useEffect } from "react";
import { Key, Eye, EyeOff } from "lucide-react";

export function ApiKeyForm() {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchApiKey() {
      try {
        const res = await fetch("/api/user/api-key");
        if (res.ok) {
          const data = await res.json();
          setHasApiKey(data.hasApiKey);
          if (data.anthropicApiKey) {
            setMaskedKey(data.anthropicApiKey);
          }
        }
      } catch {
        // Silently fail
      }
    }
    fetchApiKey();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    // Don't submit if user hasn't entered a new key
    if (!apiKey && hasApiKey) {
      setStatus("error");
      setMessage("Digite uma nova chave para atualizar ou limpe o campo para remover");
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 3000);
      return;
    }

    try {
      const res = await fetch("/api/user/api-key", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anthropicApiKey: apiKey || null }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Erro ao salvar chave API");
        return;
      }

      setStatus("success");
      setMessage("Chave API salva com sucesso");
      setHasApiKey(!!apiKey);
      setApiKey("");

      // Fetch the updated masked key
      if (apiKey) {
        const keyRes = await fetch("/api/user/api-key");
        if (keyRes.ok) {
          const keyData = await keyRes.json();
          setMaskedKey(keyData.anthropicApiKey);
        }
      } else {
        setMaskedKey(null);
      }

      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 3000);
    } catch {
      setStatus("error");
      setMessage("Erro de conexão. Tente novamente.");
    }
  }

  return (
    <div
      className="rounded-xl border p-6"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
    >
      <div className="flex items-start gap-3 mb-4">
        <Key size={20} className="mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }} />
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-1" style={{ color: "hsl(var(--foreground))" }}>
            Chave API do Claude (Anthropic)
          </h2>
          <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            Configure sua chave API do Anthropic para habilitar recursos de IA como geração automática de planos e perguntas de revisão.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {hasApiKey && maskedKey && (
          <div className="mb-3 p-3 rounded-lg border" style={{
            background: "hsl(var(--muted))",
            borderColor: "hsl(var(--border))"
          }}>
            <p className="text-xs font-medium mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>
              Chave atual configurada:
            </p>
            <code className="text-sm" style={{ color: "hsl(var(--foreground))" }}>
              {maskedKey}
            </code>
          </div>
        )}

        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium mb-2" style={{ color: "hsl(var(--foreground))" }}>
            {hasApiKey ? "Nova Chave API (deixe vazio para manter a atual)" : "Chave API"}
          </label>
          <div className="relative">
            <input
              id="apiKey"
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={hasApiKey ? "Digite uma nova chave para atualizar..." : "sk-ant-api03-..."}
              className="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                background: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--foreground))",
              }}
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            Obtenha sua chave em{" "}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: "hsl(var(--primary))" }}
            >
              console.anthropic.com
            </a>
          </p>
        </div>

        {status === "success" && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
            {message}
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          style={{
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
          }}
        >
          {status === "loading" ? "Salvando..." : "Salvar Chave API"}
        </button>
      </form>
    </div>
  );
}
