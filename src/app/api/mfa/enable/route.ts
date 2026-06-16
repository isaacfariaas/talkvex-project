import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyMFAToken } from "@/lib/mfa";
import { z } from "zod";

export const dynamic = "force-dynamic";

const enableSchema = z.object({
  token: z.string().regex(/^\d{6}$/, "Token must be a 6-digit number"),
});

/**
 * POST /api/mfa/enable
 * Verifies a token and enables MFA for the user
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = enableSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { token } = validation.data;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { mfaSecret: true, mfaEnabled: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.mfaEnabled) {
      return NextResponse.json(
        { error: "MFA is already enabled" },
        { status: 400 }
      );
    }

    if (!user.mfaSecret) {
      return NextResponse.json(
        { error: "No MFA secret found. Call /api/mfa/setup first." },
        { status: 400 }
      );
    }

    const isValid = verifyMFAToken(user.mfaSecret, token);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid token. Please try again." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { mfaEnabled: true },
    });

    return NextResponse.json({
      message: "MFA enabled successfully",
    });
  } catch (error) {
    console.error("[mfa/enable] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
