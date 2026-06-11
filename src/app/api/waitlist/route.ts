/**
 * Waitlist API
 *
 * POST /api/waitlist - Add email to waitlist
 * GET /api/waitlist/verify?code=XXX - Verify Early Adopter code
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const waitlistSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
});

function generateEarlyAdopterCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'EARLY-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email } = waitlistSchema.parse(body);

    const existing = await prisma.waitlist.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: 'Este email já está na lista de espera',
          code: existing.earlyAdopterCode,
        },
        { status: 409 }
      );
    }

    let earlyAdopterCode = generateEarlyAdopterCode();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const codeExists = await prisma.waitlist.findUnique({
        where: { earlyAdopterCode },
      });

      if (!codeExists) break;

      earlyAdopterCode = generateEarlyAdopterCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique Early Adopter code');
    }

    const waitlistEntry = await prisma.waitlist.create({
      data: {
        name,
        email,
        earlyAdopterCode,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Adicionado à lista de espera com sucesso!',
        earlyAdopterCode: waitlistEntry.earlyAdopterCode,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Error adding to waitlist:', error);
    return NextResponse.json(
      {
        error: 'Erro ao adicionar à lista de espera',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Early Adopter code is required' },
        { status: 400 }
      );
    }

    const waitlistEntry = await prisma.waitlist.findUnique({
      where: { earlyAdopterCode: code },
      select: {
        name: true,
        email: true,
        earlyAdopterCode: true,
        createdAt: true,
        registeredAt: true,
      },
    });

    if (!waitlistEntry) {
      return NextResponse.json(
        { error: 'Código Early Adopter inválido' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      name: waitlistEntry.name,
      earlyAdopter: true,
      registered: !!waitlistEntry.registeredAt,
    });
  } catch (error) {
    console.error('Error verifying Early Adopter code:', error);
    return NextResponse.json(
      {
        error: 'Erro ao verificar código',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
