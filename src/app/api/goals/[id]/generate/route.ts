import { NextRequest } from "next/server";
import { err } from "@/lib/api";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_req: NextRequest) {
  return err("Geração de planos via IA está desabilitada.", 501);
}
