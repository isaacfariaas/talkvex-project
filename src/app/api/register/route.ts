import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "anonymous";
    const { success, limit, remaining, reset } = await checkRateLimit(`register:${ip}`);

    if (!success) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente mais tarde." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    }

    const body = await request.json();
    const { name, email, password, referralCode } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 8 caracteres" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Usuário já cadastrado com esse email" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Validate referral code if provided
    let referrer: { id: string } | null = null;
    if (referralCode) {
      referrer = await prisma.user.findUnique({
        where: { referralCode },
        select: { id: true },
      });

      if (!referrer) {
        return NextResponse.json(
          { error: "Código de indicação inválido" },
          { status: 400 }
        );
      }
    }

    const now = new Date();
    const proTrialExpiry = referralCode
      ? new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)
      : null;

    // Create user with referral data and generate their own referral code
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        referralCode: nanoid(10),
        referredBy: referralCode || null,
        proExpiresAt: proTrialExpiry,
      },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    // Create referral record if user was referred
    if (referrer) {
      await prisma.referral.create({
        data: {
          referrerId: referrer.id,
          referredUserId: user.id,
        },
      });

      // Create reward record for the new user
      await prisma.referralReward.create({
        data: {
          userId: user.id,
          type: "PRO_TRIAL",
          description: "15 dias de Talkvex Pro (boas-vindas via indicação)",
          expiresAt: proTrialExpiry,
        },
      });
    }

    return NextResponse.json(user, {
      status: 201,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
