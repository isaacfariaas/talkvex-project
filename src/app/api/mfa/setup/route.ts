import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateMFASecret } from "@/lib/mfa";

export const dynamic = "force-dynamic";

/**
 * GET /api/mfa/setup
 * Generates a new MFA secret and returns QR code data
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, mfaEnabled: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.mfaEnabled) {
      return NextResponse.json(
        { error: "MFA is already enabled. Disable it first to setup again." },
        { status: 400 }
      );
    }

    const { encryptedSecret, otpauthUrl } = generateMFASecret(user.email);

    // Store the secret temporarily (not enabled yet)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { mfaSecret: encryptedSecret, mfaEnabled: false },
    });

    return NextResponse.json({
      otpauthUrl,
      message: "Scan the QR code with your authenticator app, then verify a token to enable MFA.",
    });
  } catch (error) {
    console.error("[mfa/setup] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
