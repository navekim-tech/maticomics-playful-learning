import { createFileRoute } from "@tanstack/react-router";

type HandlerArgs = {
  context?: { env?: Record<string, string | undefined> };
};

type AiStatus = {
  geminiConfigured: boolean;
  geminiModel: string;
  geminiReachable: boolean | null;
  provider: "gemini" | "demo";
  errorType?: "missing-key" | "auth-or-key" | "quota-or-limit" | "model-not-found" | "network" | "provider-error";
  message: string;
};

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-lite";

export const Route = createFileRoute("/api/ai/status")({
  server: {
    handlers: {
      GET: async ({ context }: HandlerArgs) => {
        const env = readEnv(context?.env);
        const apiKey = env.GEMINI_API_KEY?.trim();
        const model = env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

        if (!apiKey) {
          return Response.json({
            geminiConfigured: false,
            geminiModel: model,
            geminiReachable: null,
            provider: "demo",
            errorType: "missing-key",
            message: "GEMINI_API_KEY is not available to the server route.",
          } satisfies AiStatus);
        }

        try {
          await pingGemini({ apiKey, model });
          return Response.json({
            geminiConfigured: true,
            geminiModel: model,
            geminiReachable: true,
            provider: "gemini",
            message: "Gemini key is configured and a minimal test request succeeded.",
          } satisfies AiStatus);
        } catch (error) {
          const classified = classifyGeminiError(error);
          return Response.json({
            geminiConfigured: true,
            geminiModel: model,
            geminiReachable: false,
            provider: "demo",
            errorType: classified.errorType,
            message: classified.message,
          } satisfies AiStatus);
        }
      },
    },
  },
});

function readEnv(contextEnv?: Record<string, string | undefined>): Record<string, string | undefined> {
  const processEnv = typeof process !== "undefined" ? process.env : undefined;
  return {
    GEMINI_API_KEY: contextEnv?.GEMINI_API_KEY ?? processEnv?.GEMINI_API_KEY,
    GEMINI_MODEL: contextEnv?.GEMINI_MODEL ?? processEnv?.GEMINI_MODEL,
  };
}

async function pingGemini({ apiKey, model }: { apiKey: string; model: string }): Promise<void> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: "ענה במילה אחת בעברית: תקין" }] }],
      generationConfig: { temperature: 0, maxOutputTokens: 8 },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Gemini status ${response.status}: ${body.slice(0, 500)}`);
  }
}

function classifyGeminiError(error: unknown): { errorType: NonNullable<AiStatus["errorType"]>; message: string } {
  const text = error instanceof Error ? error.message : String(error);

  if (/401|403|API_KEY_INVALID|PERMISSION_DENIED|invalid api key/i.test(text)) {
    return { errorType: "auth-or-key", message: "Gemini rejected the request. The API key may be wrong, restricted, or not allowed for this API." };
  }

  if (/404|not found|model/i.test(text)) {
    return { errorType: "model-not-found", message: "Gemini key exists, but the configured model name may be unavailable." };
  }

  if (/429|quota|rate/i.test(text)) {
    return { errorType: "quota-or-limit", message: "Gemini key exists, but the request hit quota or rate limits." };
  }

  if (/fetch failed|network|ENOTFOUND|ETIMEDOUT/i.test(text)) {
    return { errorType: "network", message: "Gemini key exists, but the server could not reach Gemini." };
  }

  return { errorType: "provider-error", message: "Gemini key exists, but the test request failed for an unexpected provider error." };
}
