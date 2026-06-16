import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalReferrals, convertedReferrals, rewards, user] = await Promise.all([
      prisma.referral.count({
        where: { referrerId: session.user.id },
      }),
      prisma.referral.count({
        where: {
          referrerId: session.user.id,
          convertedAt: { not: null },
        },
      }),
      prisma.referralReward.findMany({
        where: { userId: session.user.id },
        orderBy: { grantedAt: "desc" },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { proExpiresAt: true },
      }),
    ]);

    const isPro = user?.proExpiresAt ? user.proExpiresAt > new Date() : false;

    const hasFoundingMentorBadge = rewards.some(
      (r: { type: string }) => r.type === "FOUNDING_MENTOR_BADGE"
    );

    return NextResponse.json({
      totalReferrals,
      convertedReferrals,
      hasFoundingMentorBadge,
      isPro,
      proExpiresAt: user?.proExpiresAt,
      rewards: rewards.map((r: { type: string; description: string; grantedAt: Date; expiresAt: Date | null }) => ({
        type: r.type,
        description: r.description,
        grantedAt: r.grantedAt,
        expiresAt: r.expiresAt,
      })),
    });
  } catch (error) {
    console.error("Error getting referral stats:", error);
    return NextResponse.json(
      { error: "Failed to get referral stats" },
      { status: 500 }
    );
  }
}
