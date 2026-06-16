import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, err, requireAuth } from "@/lib/api";
import { encrypt, decrypt } from "@/lib/crypto";

const apiKeySchema = z.object({
  anthropicApiKey: z.string().optional(),
});

/**
 * Masks an API key for secure display.
 * Returns format: "sk-ant...last4" or similar prefix...suffix format
 */
function maskApiKey(key: string): string {
  if (!key || key.length < 8) return "***";

  const prefixLength = Math.min(7, Math.floor(key.length * 0.2));
  const suffixLength = 4;

  const prefix = key.slice(0, prefixLength);
  const suffix = key.slice(-suffixLength);

  return `${prefix}...${suffix}`;
}

export async function GET() {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { anthropicApiKey: true },
  });

  const hasApiKey = !!user?.anthropicApiKey;
  const maskedKey = hasApiKey ? maskApiKey(decrypt(user.anthropicApiKey!)) : null;

  return ok({
    anthropicApiKey: maskedKey,
    hasApiKey,
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
