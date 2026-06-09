import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function getSession() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return { session: null, response: err("Não autenticado", 401) };
  }
  return { session, response: null };
}
