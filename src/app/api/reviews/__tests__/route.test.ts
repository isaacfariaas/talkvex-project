import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "../route";
import { NextRequest } from "next/server";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    weeklyReview: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual("@/lib/api");
  return {
    ...actual,
    requireAuth: vi.fn(),
  };
});

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api";
import { NextResponse } from "next/server";

describe("GET /api/reviews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return user reviews when authenticated", async () => {
    const mockReviews = [
      {
        id: "review-1",
        userId: "user-123",
        weekStart: new Date("2026-06-01"),
        weekEnd: new Date("2026-06-07"),
        wins: "Completed all tasks",
        rating: 8,
      },
      {
        id: "review-2",
        userId: "user-123",
        weekStart: new Date("2026-05-25"),
        weekEnd: new Date("2026-05-31"),
        wins: "Good progress",
        rating: 7,
      },
    ];

    vi.mocked(requireAuth).mockResolvedValue({
      session: { user: { id: "user-123" } } as any,
      response: null,
    });
    vi.mocked(prisma.weeklyReview.findMany).mockResolvedValue(mockReviews as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(prisma.weeklyReview.findMany).toHaveBeenCalledWith({
      where: { userId: "user-123" },
      orderBy: { weekStart: "desc" },
    });
  });

  it("should return 401 when not authenticated", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      session: null,
      response: NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Não autenticado");
  });
});

describe("POST /api/reviews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a review with valid data", async () => {
    const mockReview = {
      id: "review-123",
      userId: "user-123",
      weekStart: new Date("2026-06-01"),
      weekEnd: new Date("2026-06-07"),
      wins: "Great week!",
      challenges: "Time management",
      nextWeekPlan: "Focus on priorities",
      rating: 9,
    };

    vi.mocked(requireAuth).mockResolvedValue({
      session: { user: { id: "user-123" } } as any,
      response: null,
    });
    vi.mocked(prisma.weeklyReview.create).mockResolvedValue(mockReview as any);

    const request = new NextRequest("http://localhost/api/reviews", {
      method: "POST",
      body: JSON.stringify({
        weekStart: "2026-06-01T00:00:00Z",
        weekEnd: "2026-06-07T23:59:59Z",
        wins: "Great week!",
        challenges: "Time management",
        nextWeekPlan: "Focus on priorities",
        rating: 9,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.wins).toBe("Great week!");
    expect(prisma.weeklyReview.create).toHaveBeenCalled();
  });

  it("should reject review with missing required fields", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      session: { user: { id: "user-123" } } as any,
      response: null,
    });

    const request = new NextRequest("http://localhost/api/reviews", {
      method: "POST",
      body: JSON.stringify({
        weekStart: "2026-06-01T00:00:00Z",
        // missing weekEnd
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.error).toBeDefined();
  });

  it("should reject review with invalid rating", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      session: { user: { id: "user-123" } } as any,
      response: null,
    });

    const request = new NextRequest("http://localhost/api/reviews", {
      method: "POST",
      body: JSON.stringify({
        weekStart: "2026-06-01T00:00:00Z",
        weekEnd: "2026-06-07T23:59:59Z",
        rating: 15, // invalid, must be 1-10
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.error).toBeDefined();
  });
});
