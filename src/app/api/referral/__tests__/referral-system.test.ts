import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getCode } from "../code/route";
import { GET as getStats } from "../stats/route";
import { POST as convertReferral } from "../convert/route";
import { NextRequest } from "next/server";

// Mock dependencies
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    referral: {
      count: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    referralReward: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("nanoid", () => ({
  nanoid: vi.fn(() => "test-code-123"),
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

describe("Referral System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/referral/code", () => {
    it("should return existing referral code", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-123" },
      } as never);

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        referralCode: "existing-code",
      } as never);

      const response = await getCode();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.referralCode).toBe("existing-code");
      expect(data.referralLink).toContain("?ref=existing-code");
    });

    it("should generate new referral code if user doesn't have one", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-123" },
      } as never);

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        referralCode: null,
      } as never);

      vi.mocked(prisma.user.update).mockResolvedValue({
        referralCode: "test-code-123",
      } as never);

      const response = await getCode();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.referralCode).toBe("test-code-123");
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it("should return 401 if not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const response = await getCode();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });
  });

  describe("GET /api/referral/stats", () => {
    it("should return referral statistics", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-123" },
      } as never);

      vi.mocked(prisma.referral.count)
        .mockResolvedValueOnce(5) // total referrals
        .mockResolvedValueOnce(3); // converted referrals

      vi.mocked(prisma.referralReward.findMany).mockResolvedValue([
        {
          type: "PRO_MONTH",
          description: "Test reward",
          grantedAt: new Date(),
          expiresAt: new Date(),
        },
      ] as never);

      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        proExpiresAt: futureDate,
      } as never);

      const response = await getStats();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalReferrals).toBe(5);
      expect(data.convertedReferrals).toBe(3);
      expect(data.isPro).toBe(true);
      expect(data.rewards).toHaveLength(1);
    });

    it("should return 401 if not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const response = await getStats();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });
  });

  describe("POST /api/referral/convert", () => {
    it("should convert referral and grant rewards", async () => {
      const now = new Date();
      const referredUserProExpiry = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

      vi.mocked(auth).mockResolvedValue({
        user: { id: "referred-user" },
      } as never);

      // User was referred
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({
          referredBy: "referrer-code",
        } as never)
        .mockResolvedValueOnce({
          id: "referrer-user",
        } as never);

      // No existing conversion
      vi.mocked(prisma.referral.findUnique).mockResolvedValue(null);

      // Mock transaction
      const mockReferral = {
        id: "referral-123",
        referrerId: "referrer-user",
        referredUserId: "referred-user",
        convertedAt: now,
        rewardGrantedAt: now,
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        return callback({
          referral: {
            upsert: vi.fn().mockResolvedValue(mockReferral),
          },
          user: {
            findUnique: vi.fn().mockResolvedValue({ proExpiresAt: null }),
            update: vi.fn(),
          },
          referralReward: {
            create: vi.fn(),
            findFirst: vi.fn().mockResolvedValue(null),
          },
          referral: {
            count: vi.fn().mockResolvedValue(1),
          },
        });
      });

      const response = await convertReferral();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain("converted");
    });

    it("should return 400 if user was not referred", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-123" },
      } as never);

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        referredBy: null,
      } as never);

      const response = await convertReferral();
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("not referred");
    });

    it("should handle already converted referrals", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "referred-user" },
      } as never);

      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({
          referredBy: "referrer-code",
        } as never)
        .mockResolvedValueOnce({
          id: "referrer-user",
        } as never);

      vi.mocked(prisma.referral.findUnique).mockResolvedValue({
        convertedAt: new Date(),
      } as never);

      const response = await convertReferral();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain("already converted");
    });

    it("should return 401 if not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const response = await convertReferral();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });
  });
});
