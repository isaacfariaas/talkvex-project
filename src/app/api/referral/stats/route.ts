import { prisma } from "@/lib/prisma";
import { ok, err, requireAuth } from "@/lib/api";

export async function GET() {
  try {
    const { session, response } = await requireAuth();
    if (!session) return response!;

    const referrals = await prisma.referral.findMany({
      where: { referrerId: session.user.id },
      select: { status: true },
    });

    const stats = {
      invited: referrals.length,
      active: referrals.filter((r) => r.status === "PENDING").length,
      completed: referrals.filter((r) => r.status === "COMPLETED").length,
    };

    return ok(stats);
  } catch (error) {
    console.error("[REFERRAL_STATS_GET]", error);
    return err("Erro interno", 500);
  }
}
