import { handlers } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = handlers.GET;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "anonymous";
  const { success, limit, remaining, reset } = await checkRateLimit(`auth:${ip}`);

  if (!success) {
    return NextResponse.json(
      { error: "Muitas tentativas de login. Tente novamente mais tarde." },
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

  return handlers.POST(request);
}
