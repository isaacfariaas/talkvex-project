import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, err, requireAuth } from "@/lib/api";

const createReviewSchema = z.object({
  weekStart: z.string().datetime(),
  weekEnd: z.string().datetime(),
  wins: z.string().optional(),
  challenges: z.string().optional(),
  nextWeekPlan: z.string().optional(),
  rating: z.number().int().min(1).max(10).optional(),
});

export async function GET() {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const reviews = await prisma.weeklyReview.findMany({
    where: { userId: session.user.id },
    orderBy: { weekStart: "desc" },
  });

  return ok(reviews);
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return err("JSON inválido");
  }

  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.issues.map((e: { message: string }) => e.message).join("; "), 422);
  }

  const review = await prisma.weeklyReview.create({
    data: {
      userId: session.user.id,
      weekStart: new Date(parsed.data.weekStart),
      weekEnd: new Date(parsed.data.weekEnd),
      wins: parsed.data.wins,
      challenges: parsed.data.challenges,
      nextWeekPlan: parsed.data.nextWeekPlan,
      rating: parsed.data.rating,
    },
  });

  return ok(review, 201);
}
