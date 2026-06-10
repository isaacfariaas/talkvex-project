import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "../route";
import { NextRequest } from "next/server";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    dailyHabit: {
      findUnique: vi.fn(),
      update: vi.fn(),
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

describe("PATCH /api/daily/habits/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should toggle habit completion when authorized", async () => {
    const mockHabit = {
      id: "habit-123",
      completed: false,
      weeklyTask: {
        milestone: {
          annualPlan: { userId: "user-123" },
        },
      },
    };

    const updatedHabit = { ...mockHabit, completed: true };

    vi.mocked(requireAuth).mockResolvedValue({
      session: { user: { id: "user-123" } },
      response: null,
    });
    vi.mocked(prisma.dailyHabit.findUnique).mockResolvedValue(mockHabit as never);
    vi.mocked(prisma.dailyHabit.update).mockResolvedValue(updatedHabit as never);

    const request = new NextRequest("http://localhost/api/daily/habits/habit-123", {
      method: "PATCH",
      body: JSON.stringify({ completed: true }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "habit-123" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.completed).toBe(true);
    expect(prisma.dailyHabit.update).toHaveBeenCalledWith({
      where: { id: "habit-123" },
      data: { completed: true },
    });
  });

  it("should return 404 when habit not found", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      session: { user: { id: "user-123" } },
      response: null,
    });
    vi.mocked(prisma.dailyHabit.findUnique).mockResolvedValue(null);

    const request = new NextRequest("http://localhost/api/daily/habits/nonexistent", {
      method: "PATCH",
      body: JSON.stringify({ completed: true }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "nonexistent" }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain("não encontrado");
  });

  it("should return 403 when user is not authorized", async () => {
    const mockHabit = {
      id: "habit-123",
      completed: false,
      weeklyTask: {
        milestone: {
          annualPlan: { userId: "other-user" },
        },
      },
    };

    vi.mocked(requireAuth).mockResolvedValue({
      session: { user: { id: "user-123" } },
      response: null,
    });
    vi.mocked(prisma.dailyHabit.findUnique).mockResolvedValue(mockHabit as never);

    const request = new NextRequest("http://localhost/api/daily/habits/habit-123", {
      method: "PATCH",
      body: JSON.stringify({ completed: true }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "habit-123" }) });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain("Não autorizado");
  });

  it("should reject invalid JSON", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      session: { user: { id: "user-123" } },
      response: null,
    });
    vi.mocked(prisma.dailyHabit.findUnique).mockResolvedValue({
      id: "habit-123",
      weeklyTask: {
        milestone: { annualPlan: { userId: "user-123" } },
      },
    } as never);

    const request = new NextRequest("http://localhost/api/daily/habits/habit-123", {
      method: "PATCH",
      body: "invalid json",
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "habit-123" }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("inválido");
  });
});
