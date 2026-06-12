import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, err, requireAuth } from "@/lib/api";
import { encrypt, decrypt } from "@/lib/crypto";

const apiKeySchema = z.object({
  anthropicApiKey: z.string().optional(),
});

export async function GET() {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { anthropicApiKey: true },
  });

  return ok({
    anthropicApiKey: user?.anthropicApiKey ? decrypt(user.anthropicApiKey) : null,
    hasApiKey: !!user?.anthropicApiKey,
  });
}

export async function PUT(req: NextRequest) {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return err("JSON inválido");
  }

  const parsed = apiKeySchema.safeParse(body);
  if (!parsed.success) {
    return err("Dados inválidos", 422);
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { 
      anthropicApiKey: parsed.data.anthropicApiKey 
        ? encrypt(parsed.data.anthropicApiKey) 
        : null 
    },
  });

  return ok({ message: "Chave API atualizada com sucesso" });
}
