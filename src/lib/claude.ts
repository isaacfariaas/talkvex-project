import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const CLAUDE_MODEL = "claude-sonnet-4-6";

export function getAnthropicClient(userApiKey?: string | null): Anthropic {
  const key = userApiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("No Anthropic API key configured");
  return new Anthropic({ apiKey: key });
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface GenerationResult<T> {
  data: T;
  tokensIn: number;
  tokensOut: number;
}

export async function generateWithRetry<T>(
  systemPrompt: string,
  userMessage: string,
  userId: string,
  goalId: string | null,
  userApiKey?: string | null,
): Promise<GenerationResult<T>> {
  let lastError: Error | null = null;
  const client = getAnthropicClient(userApiKey);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 8192,
        system: [
          {
            type: "text",
            text: systemPrompt,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [
          {
            role: "user",
            content: userMessage,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== "text") {
        throw new Error("Resposta inesperada da API Claude");
      }

      const rawText = content.text.trim();
      const jsonText = extractJSON(rawText);
      const parsed: T = JSON.parse(jsonText);

      const tokensIn = response.usage.input_tokens;
      const tokensOut = response.usage.output_tokens;

      await prisma.planGenerationLog.create({
        data: {
          userId,
          goalId,
          prompt: `${systemPrompt}\n\n${userMessage}`,
          response: rawText,
          model: CLAUDE_MODEL,
          tokensIn,
          tokensOut,
        },
      });

      return { data: parsed, tokensIn, tokensOut };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError ?? new Error("Falha ao chamar a API Claude após tentativas");
}

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
