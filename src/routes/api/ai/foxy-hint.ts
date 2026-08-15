import { createFileRoute } from "@tanstack/react-router";

import { categoryMeta, type Category } from "@/data/topics";

type HandlerArgs = {
  request: Request;
  context?: { env?: Record<string, string | undefined> };
};

type FoxyHintRequest = {
  category?: string;
  question?: string;
  options?: string[];
  topicHint?: string;
};

type ProviderName = "demo" | "gemini" | "openai-compatible";

const MAX_TEXT_LENGTH = 600;
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-lite";
const DEFAULT_OPENAI_COMPAT_MODEL = "mistral-small-latest";

export const Route = createFileRoute("/api/ai/foxy-hint")({
  server: {
    handlers: {
      POST: async ({ request, context }: HandlerArgs) => {
        const payload = await safeJson(request);
        const input = validatePayload(payload);

        if (!input.ok) {
          return Response.json({ error: input.error }, { status: 400 });
        }

        const env = readEnv(context?.env);
        const prompt = buildPrompt(input.value);

        try {
          if (env.GEMINI_API_KEY) {
            const hint = await callGemini({
              apiKey: env.GEMINI_API_KEY,
              model: env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL,
              prompt,
            });
            return hintResponse(hint, "gemini");
          }

          if (env.AI_API_KEY && env.AI_BASE_URL) {
            const hint = await callOpenAICompatible({
              apiKey: env.AI_API_KEY,
              baseUrl: env.AI_BASE_URL,
              model: env.AI_MODEL ?? DEFAULT_OPENAI_COMPAT_MODEL,
              prompt,
            });
            return hintResponse(hint, "openai-compatible");
          }
        } catch (error) {
          console.error("Foxy AI provider failed; using demo hint", error);
        }

        return hintResponse(buildDemoHint(input.value), "demo");
      },
    },
  },
});

async function safeJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function validatePayload(payload: unknown):
  | { ok: true; value: Required<Pick<FoxyHintRequest, "category" | "question" | "options">> & { topicHint?: string } }
  | { ok: false; error: string } {
  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return { ok: false, error: "Invalid request" };
  }

  const fields = payload as FoxyHintRequest;
  if (!fields.category || !(fields.category in categoryMeta)) {
    return { ok: false, error: "Unknown category" };
  }

  if (!fields.question || typeof fields.question !== "string") {
    return { ok: false, error: "Missing question" };
  }

  if (!Array.isArray(fields.options) || fields.options.length < 2 || fields.options.length > 6) {
    return { ok: false, error: "Missing options" };
  }

  return {
    ok: true,
    value: {
      category: fields.category.slice(0, 40),
      question: fields.question.slice(0, MAX_TEXT_LENGTH),
      options: fields.options.map((option) => String(option).slice(0, 160)),
      topicHint: fields.topicHint?.slice(0, 80),
    },
  };
}

function readEnv(contextEnv?: Record<string, string | undefined>): Record<string, string | undefined> {
  const processEnv = typeof process !== "undefined" ? process.env : undefined;
  return {
    GEMINI_API_KEY: contextEnv?.GEMINI_API_KEY ?? processEnv?.GEMINI_API_KEY,
    GEMINI_MODEL: contextEnv?.GEMINI_MODEL ?? processEnv?.GEMINI_MODEL,
    AI_API_KEY: contextEnv?.AI_API_KEY ?? processEnv?.AI_API_KEY,
    AI_BASE_URL: contextEnv?.AI_BASE_URL ?? processEnv?.AI_BASE_URL,
    AI_MODEL: contextEnv?.AI_MODEL ?? processEnv?.AI_MODEL,
  };
}

function buildPrompt(input: { category: string; question: string; options: string[]; topicHint?: string }): string {
  const category = categoryMeta[input.category as Category]?.title ?? input.category;
  return [
    "אתה פוקסי, עוזר לימודי קצר לילדים במתמטיקומיקס.",
    "כתוב בעברית פשוטה, חמה ומעודדת.",
    "תן רמז אחד בלבד לשאלה מתמטית. אל תגלה את התשובה ואל תגיד איזו אפשרות נכונה.",
    "אם השאלה לא מתמטית או לא לימודית, החזר בעדינות שכרגע עוזרים רק במתמטיקה.",
    "אורך מקסימלי: 2 משפטים קצרים.",
    `עולם: ${category}`,
    input.topicHint ? `נושא: ${input.topicHint}` : undefined,
    `שאלה: ${input.question}`,
    `אפשרויות: ${input.options.join(" | ")}`,
  ].filter(Boolean).join("\n");
}

async function callGemini({ apiKey, model, prompt }: { apiKey: string; model: string; prompt: string }): Promise<string> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.35, maxOutputTokens: 90 },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini failed: ${response.status}`);
  }

  const data = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  return data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join(" ").trim() ?? "";
}

async function callOpenAICompatible({ apiKey, baseUrl, model, prompt }: { apiKey: string; baseUrl: string; model: string; prompt: string }): Promise<string> {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "authorization": `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      max_tokens: 90,
      messages: [
        { role: "system", content: "You are a child-safe Hebrew math tutor. Give a hint only, never the answer." },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI-compatible provider failed: ${response.status}`);
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

function buildDemoHint(input: { topicHint?: string; question: string }): string {
  const topic = input.topicHint ? ` בנושא ${input.topicHint}` : "";
  if (input.question.includes("אחוז") || input.question.includes("%")) {
    return "נסו לחשוב על אחוז כחלק מתוך 100. פוקסי מציע להפוך את זה קודם לשבר או לכמות קטנה יותר.";
  }
  if (input.question.includes("שבר") || input.question.includes("/")) {
    return "פוקסי מציע לבדוק קודם מי המונה ומי המכנה. אל תמהרו — חפשו שבר שקול או מכנים משותפים.";
  }
  if (input.question.includes("נפח") || input.question.includes("שטח") || input.question.includes("רדיוס")) {
    return "חשבו אם מדובר במדידה על הצורה או בתוך הגוף. פוקסי מזכיר: שטח הוא דו־ממדי ונפח הוא תלת־ממדי.";
  }
  return `פוקסי מציע לעצור רגע${topic}, לקרוא את השאלה שוב, ולחפש את מילת המפתח שמספרת איזו פעולה מתמטית צריך לעשות.`;
}

function hintResponse(hint: string, provider: ProviderName): Response {
  const cleanHint = hint.trim() || "פוקסי מציע לקרוא שוב את השאלה ולחפש את מילת המפתח לפני שבוחרים תשובה.";
  return Response.json({ hint: cleanHint.slice(0, 260), provider });
}
