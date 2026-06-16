import { prisma } from "./prisma";

/**
 * Verifica se um usuário foi indicado por alguém e se a indicação pode ser concluída.
 * A condição básica é o usuário ter criado pelo menos uma meta.
 */
export async function checkReferralCompletion(userId: string) {
  try {
    // Busca se este usuário foi indicado por alguém e a indicação ainda está pendente
    const referral = await prisma.referral.findUnique({
      where: { referredId: userId },
    });

    if (referral && referral.status === "PENDING") {
      // Verifica se o usuário já tem pelo menos uma meta (ou qualquer outra condição)
      const goalsCount = await prisma.goal.count({
        where: { userId },
      });

      if (goalsCount > 0) {
        // Marca a indicação como concluída
        await prisma.referral.update({
          where: { id: referral.id },
          data: {
            status: "COMPLETED",
            rewardedAt: new Date(),
          },
        });
        
        console.log(`[REFERRAL] Referral ${referral.id} marked as COMPLETED for user ${userId}`);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("[REFERRAL_CHECK_ERROR]", error);
    return false;
  }
}
