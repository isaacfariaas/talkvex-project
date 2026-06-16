import { prisma } from "@/lib/prisma";
import { ok, err, requireAuth } from "@/lib/api";

export async function GET() {
  try {
    const { session, response } = await requireAuth();
    if (!session) return response!;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referralCode: true, email: true },
    });

    if (!user) {
      return err("Usuário não encontrado", 404);
    }

    // Se o usuário não tiver um código por algum motivo, gera um agora
    if (!user.referralCode) {
      const newReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      await prisma.user.update({
        where: { id: session.user.id },
        data: { referralCode: newReferralCode },
      });
      return ok({ code: newReferralCode });
    }

    return ok({ code: user.referralCode });
  } catch (error) {
    console.error("[REFERRAL_CODE_GET]", error);
    return err("Erro interno", 500);
  }
}
