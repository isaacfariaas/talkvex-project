import { describe, it, expect } from "vitest";

// JSON extraction logic (from src/lib/claude.ts)
function extractJSON(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    return text.slice(firstBrace, lastBrace + 1);
  }

  const firstBracket = text.indexOf("[");
  const lastBracket = text.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket !== -1) {
    return text.slice(firstBracket, lastBracket + 1);
  }

  return text;
}

// Plan shape validation
interface AnnualPlan {
  title: string;
  summary: string;
  milestones: Array<{
    month: number;
    quarter: number;
    title: string;
    description: string;
    targetDate: string;
  }>;
}

function validateAnnualPlan(plan: unknown): plan is AnnualPlan {
  if (!plan || typeof plan !== "object") return false;
  const p = plan as Record<string, unknown>;
  if (typeof p.title !== "string" || typeof p.summary !== "string") return false;
  if (!Array.isArray(p.milestones) || p.milestones.length !== 12) return false;
  return p.milestones.every(
    (m: unknown) =>
      m &&
      typeof m === "object" &&
      typeof (m as Record<string, unknown>).month === "number" &&
      typeof (m as Record<string, unknown>).quarter === "number"
  );
}

function quarterForMonth(month: number): number {
  return Math.ceil(month / 3);
}

describe("extractJSON", () => {
  it("extracts JSON from markdown code fence", () => {
    const text = '```json\n{"key": "value"}\n```';
    expect(JSON.parse(extractJSON(text))).toEqual({ key: "value" });
  });

  it("extracts bare JSON object", () => {
    const text = 'Some prefix {"key": 1} some suffix';
    expect(JSON.parse(extractJSON(text))).toEqual({ key: 1 });
  });

  it("extracts JSON array", () => {
    const text = "[1, 2, 3]";
    expect(JSON.parse(extractJSON(text))).toEqual([1, 2, 3]);
  });

  it("returns original text when no JSON markers found", () => {
    expect(extractJSON("plain text")).toBe("plain text");
  });
});

describe("validateAnnualPlan", () => {
  const validPlan: AnnualPlan = {
    title: "Plano de Exemplo",
    summary: "Resumo do plano",
    milestones: Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      quarter: quarterForMonth(i + 1),
      title: `Marco ${i + 1}`,
      description: "Descrição",
      targetDate: "2026-12-31",
    })),
  };

  it("accepts a valid 12-milestone plan", () => {
    expect(validateAnnualPlan(validPlan)).toBe(true);
  });

  it("rejects plan with fewer than 12 milestones", () => {
    expect(validateAnnualPlan({ ...validPlan, milestones: validPlan.milestones.slice(0, 6) })).toBe(false);
  });

  it("rejects plan missing title", () => {
    const { title: _t, ...rest } = validPlan;
    expect(validateAnnualPlan(rest)).toBe(false);
  });

  it("rejects null", () => {
    expect(validateAnnualPlan(null)).toBe(false);
  });
});

describe("quarterForMonth", () => {
  it.each([
    [1, 1], [2, 1], [3, 1],
    [4, 2], [5, 2], [6, 2],
    [7, 3], [8, 3], [9, 3],
    [10, 4], [11, 4], [12, 4],
  ])("month %i → quarter %i", (month, quarter) => {
    expect(quarterForMonth(month)).toBe(quarter);
  });
});
