import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error);

  if (error instanceof ApiError) {
    const response: { error: string; details?: unknown } = {
      error: error.message,
    };
    if (error.details) {
      response.details = error.details;
    }
    return NextResponse.json(response, { status: error.statusCode });
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: "Erro desconhecido" },
    { status: 500 }
  );
}

export const ApiErrors = {
  badRequest: (message: string, details?: unknown) =>
    new ApiError(400, message, details),
  unauthorized: (message = "Não autorizado") =>
    new ApiError(401, message),
  forbidden: (message = "Acesso negado") =>
    new ApiError(403, message),
  notFound: (message = "Não encontrado") =>
    new ApiError(404, message),
  conflict: (message: string) =>
    new ApiError(409, message),
  tooManyRequests: (message = "Muitas requisições") =>
    new ApiError(429, message),
  internal: (message = "Erro interno do servidor") =>
    new ApiError(500, message),
};
