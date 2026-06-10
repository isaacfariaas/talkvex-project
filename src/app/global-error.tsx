"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🚨</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Erro crítico
            </h1>
            <p className="text-gray-600 mb-6">
              Ocorreu um erro crítico na aplicação. Por favor, recarregue a página.
            </p>
            {error.digest && (
              <p className="text-sm text-gray-500 mb-4">
                Código de erro: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Recarregar aplicação
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
