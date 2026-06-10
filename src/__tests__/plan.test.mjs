import { describe, it } from "node:test";
import assert from "node:assert/strict";

function extractJSON(text) {
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

function validateAnnualPlan(plan) {
  if (!plan || typeof plan !== "object") return false;
  const p = plan;
  if (typeof p.title !== "string" || typeof p.summary !== "string") return false;
  if (!Array.isArray(p.milestones) || p.milestones.length !== 12) return false;
  return p.milestones.every(
    (m) => m && typeof m === "object" && typeof m.month === "number" && typeof m.quarter === "number"
  );
}

function quarterForMonth(month) {
  return Math.ceil(month / 3);
}

const validPlan = {
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

describe("extractJSON", () => {
  it("extracts JSON from markdown code fence", () => {
    const text = '```json\n{"key": "value"}\n```';
    assert.deepEqual(JSON.parse(extractJSON(text)), { key: "value" });
  });

  it("extracts bare JSON object", () => {
    const text = 'Some prefix {"key": 1} some suffix';
    assert.deepEqual(JSON.parse(extractJSON(text)), { key: 1 });
  });

  it("extracts JSON array", () => {
    assert.deepEqual(JSON.parse(extractJSON("[1, 2, 3]")), [1, 2, 3]);
  });

  it("returns original text when no JSON markers found", () => {
    assert.equal(extractJSON("plain text"), "plain text");
  });
});

describe("validateAnnualPlan", () => {
  it("accepts a valid 12-milestone plan", () => {
    assert.equal(validateAnnualPlan(validPlan), true);
  });

  it("rejects plan with fewer than 12 milestones", () => {
    assert.equal(validateAnnualPlan({ ...validPlan, milestones: validPlan.milestones.slice(0, 6) }), false);
  });

  it("rejects plan missing title", () => {
    const { title: _t, ...rest } = validPlan;
    assert.equal(validateAnnualPlan(rest), false);
  });

  it("rejects null", () => {
    assert.equal(validateAnnualPlan(null), false);
  });
});

describe("quarterForMonth", () => {
  const cases = [
    [1, 1], [2, 1], [3, 1],
    [4, 2], [5, 2], [6, 2],
    [7, 3], [8, 3], [9, 3],
    [10, 4], [11, 4], [12, 4],
  ];
  for (const [month, quarter] of cases) {
    it(`month ${month} → quarter ${quarter}`, () => {
      assert.equal(quarterForMonth(month), quarter);
    });
  }
});
