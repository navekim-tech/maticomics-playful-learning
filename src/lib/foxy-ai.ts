import type { Category } from "@/data/topics";

export type FoxyHintRequest = {
  category: Category;
  question: string;
  options: string[];
  topicHint?: string;
};

export type FoxyHintResponse = {
  hint: string;
  provider: "demo" | "gemini" | "openai-compatible";
};

export async function requestFoxyHint(payload: FoxyHintRequest): Promise<FoxyHintResponse> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch("/api/ai/foxy-hint", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Foxy hint failed: ${response.status}`);
    }

    const data = (await response.json()) as Partial<FoxyHintResponse>;
    if (!data.hint || typeof data.hint !== "string") {
      throw new Error("Foxy hint response is missing a hint");
    }

    return {
      hint: data.hint,
      provider: data.provider ?? "demo",
    };
  } finally {
    window.clearTimeout(timeout);
  }
}
