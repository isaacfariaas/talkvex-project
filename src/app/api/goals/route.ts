import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, err, requireAuth } from "@/lib/api";

const createGoalSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().min(1),
  deadline: z.string().optional(),
  targetDate: z.string().optional(),
});

export async function GET() {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const goals = await prisma.goal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return ok(goals);
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

  const parsed = createGoalSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.issues.map((e: { message: string }) => e.message).join("; "), 422);
  }

  // Accept both deadline and targetDate for compatibility
  const deadlineStr = parsed.data.deadline || parsed.data.targetDate;
  let deadline: Date | null = null;

  if (deadlineStr) {
    try {
      // Handle both ISO datetime and date-only formats
      deadline = new Date(deadlineStr);
      if (isNaN(deadline.getTime())) {
        return err("Formato de data inválido", 422);
      }
      // If date-only format was provided, set to end of day
      if (!/T/.test(deadlineStr)) {
        deadline.setHours(23, 59, 59, 999);
      }
    } catch {
      return err("Formato de data inválido", 422);
    }
  }

  const goal = await prisma.goal.create({
    data: {
      userId: session.user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      deadline,
    },
  });

  // Check if this is the user's first goal and trigger referral conversion
  const goalCount = await prisma.goal.count({
    where: { userId: session.user.id },
  });

  if (goalCount === 1) {
    const userRef = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referredBy: true },
    });

    if (userRef?.referredBy) {
      // Trigger referral conversion asynchronously
      fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/referral/convert`, {
        method: "POST",
        headers: {
          Cookie: req.headers.get("cookie") || "",
        },
      }).catch((err) => console.error("Failed to convert referral:", err));
    }
  }

  return ok(goal, 201);
}
