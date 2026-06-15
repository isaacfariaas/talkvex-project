import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyMFAToken } from "@/lib/mfa";
import { z } from "zod";

export const dynamic = "force-dynamic";

const disableSchema = z.object({
  token: z.string().regex(/^\d{6}$/, "Token must be a 6-digit number"),
});

/**
 * POST /api/mfa/disable
 * Verifies a token and disables MFA for the user
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = disableSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.errors },
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

    if (!user.mfaEnabled) {
      return NextResponse.json(
        { error: "MFA is not enabled" },
        { status: 400 }
      );
    }

    if (!user.mfaSecret) {
      return NextResponse.json(
        { error: "No MFA secret found" },
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
      data: { mfaEnabled: false, mfaSecret: null },
    });

    return NextResponse.json({
      message: "MFA disabled successfully",
    });
  } catch (error) {
    console.error("[mfa/disable] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
