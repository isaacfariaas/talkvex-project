import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "../route";
import { NextRequest } from "next/server";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    goal: {
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

describe("GET /api/goals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return user goals when authenticated", async () => {
    const mockGoals = [
      { id: "1", title: "Goal 1", category: "health", userId: "user-123" },
      { id: "2", title: "Goal 2", category: "career", userId: "user-123" },
    ];

    vi.mocked(requireAuth).mockResolvedValue({
      session: { user: { id: "user-123" } },
      response: null,
    });
    vi.mocked(prisma.goal.findMany).mockResolvedValue(mockGoals as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(prisma.goal.findMany).toHaveBeenCalledWith({
      where: { userId: "user-123" },
      orderBy: { createdAt: "desc" },
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

describe("POST /api/goals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a goal with valid data", async () => {
    const mockGoal = {
      id: "goal-123",
      title: "New Goal",
      category: "health",
      userId: "user-123",
    };

    vi.mocked(requireAuth).mockResolvedValue({
      session: { user: { id: "user-123" } },
      response: null,
    });
    vi.mocked(prisma.goal.create).mockResolvedValue(mockGoal as never);

    const request = new NextRequest("http://localhost/api/goals", {
      method: "POST",
      body: JSON.stringify({
        title: "New Goal",
        category: "health",
        description: "A test goal",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.title).toBe("New Goal");
    expect(prisma.goal.create).toHaveBeenCalled();
  });

  it("should reject goal with invalid data", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      session: { user: { id: "user-123" } },
      response: null,
    });

    const request = new NextRequest("http://localhost/api/goals", {
      method: "POST",
      body: JSON.stringify({
        title: "",
        category: "health",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.error).toBeDefined();
  });

  it("should reject invalid JSON", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      session: { user: { id: "user-123" } },
      response: null,
    });

    const request = new NextRequest("http://localhost/api/goals", {
      method: "POST",
      body: "invalid json",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("inválido");
  });
});
