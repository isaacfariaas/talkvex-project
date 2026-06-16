import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * POST /api/referral/convert
 * Marks a referral as converted when the referred user creates their first goal/plan
 * and grants rewards to both users
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if user was referred
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referredBy: true },
    });

    if (!user?.referredBy) {
      return NextResponse.json(
        { error: "User was not referred" },
        { status: 400 }
      );
    }

    // Find the referrer
    const referrer = await prisma.user.findUnique({
      where: { referralCode: user.referredBy },
      select: { id: true },
    });

    if (!referrer) {
      return NextResponse.json(
        { error: "Referrer not found" },
        { status: 404 }
      );
    }

    // Check if referral already exists
    const existingReferral = await prisma.referral.findUnique({
      where: {
        referrerId_referredUserId: {
          referrerId: referrer.id,
          referredUserId: userId,
        },
      },
    });

    if (existingReferral?.convertedAt) {
      return NextResponse.json(
        { message: "Referral already converted" },
        { status: 200 }
      );
    }

    const now = new Date();
    const referredUserProExpiry = new Date(
      now.getTime() + 15 * 24 * 60 * 60 * 1000
    ); // 15 days
    const referrerProExpiry = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    ); // 30 days

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create or update referral
      const referral = await tx.referral.upsert({
        where: {
          referrerId_referredUserId: {
            referrerId: referrer.id,
            referredUserId: userId,
          },
        },
        create: {
          referrerId: referrer.id,
          referredUserId: userId,
          convertedAt: now,
          rewardGrantedAt: now,
        },
        update: {
          convertedAt: now,
          rewardGrantedAt: now,
        },
      });

      // Grant 15 days Pro to referred user
      await tx.user.update({
        where: { id: userId },
        data: {
          proExpiresAt: referredUserProExpiry,
        },
      });

      await tx.referralReward.create({
        data: {
          userId,
          type: "PRO_TRIAL",
          description: "15 dias de Talkvex Pro (novo usuário)",
          expiresAt: referredUserProExpiry,
        },
      });

      // Extend referrer's Pro by 30 days
      const currentReferrer = await tx.user.findUnique({
        where: { id: referrer.id },
        select: { proExpiresAt: true },
      });

      const newReferrerProExpiry =
        currentReferrer?.proExpiresAt &&
        currentReferrer.proExpiresAt > now
          ? new Date(
              currentReferrer.proExpiresAt.getTime() + 30 * 24 * 60 * 60 * 1000
            )
          : referrerProExpiry;

      await tx.user.update({
        where: { id: referrer.id },
        data: {
          proExpiresAt: newReferrerProExpiry,
        },
      });

      await tx.referralReward.create({
        data: {
          userId: referrer.id,
          type: "PRO_MONTH",
          description: "1 mês de Talkvex Pro (indicação convertida)",
          expiresAt: newReferrerProExpiry,
        },
      });

      // Check if referrer has 5 converted referrals for Founding Mentor badge
      const convertedCount = await tx.referral.count({
        where: {
          referrerId: referrer.id,
          convertedAt: { not: null },
        },
      });

      if (convertedCount >= 5) {
        const existingBadge = await tx.referralReward.findFirst({
          where: {
            userId: referrer.id,
            type: "FOUNDING_MENTOR_BADGE",
          },
        });

        if (!existingBadge) {
          await tx.referralReward.create({
            data: {
              userId: referrer.id,
              type: "FOUNDING_MENTOR_BADGE",
              description:
                'Badge exclusivo "Founding Mentor" + acesso antecipado',
            },
          });
        }
      }

      return referral;
    });

    return NextResponse.json({
      success: true,
      message: "Referral converted and rewards granted",
      referral: result,
    });
  } catch (error) {
    console.error("Error converting referral:", error);
    return NextResponse.json(
      { error: "Failed to convert referral" },
      { status: 500 }
    );
  }
}
