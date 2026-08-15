# Matikomix AI Integration

First safe AI feature: **רמז מפוקסי** in the end-of-world quiz.

## Current behavior

- Frontend calls only the internal route: `POST /api/ai/foxy-hint`.
- No API key is exposed in React/browser code.
- If no provider key exists, the route returns a deterministic demo hint.
- The prompt is constrained for child-safe math learning:
  - Hebrew only
  - short answer
  - hint only, never the answer
  - math/learning scope only

## Provider options

### Gemini

Set server/worker environment variables:

```bash
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash-lite
```

If `GEMINI_MODEL` is missing, the app uses `gemini-2.5-flash-lite`.

### OpenAI-compatible providers

Use this for providers like Mistral, Groq, OpenRouter, or other OpenAI-compatible APIs:

```bash
AI_API_KEY=...
AI_BASE_URL=https://api.mistral.ai/v1
AI_MODEL=mistral-small-latest
```

Examples:

```bash
# Mistral
AI_BASE_URL=https://api.mistral.ai/v1
AI_MODEL=mistral-small-latest

# Groq
AI_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=llama-3.1-8b-instant

# OpenRouter
AI_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=google/gemma-2-9b-it:free
```

## Next checks before production

- Confirm provider privacy/data-retention terms.
- Confirm Hebrew quality with 10–20 real quiz questions.
- Confirm commercial/educational usage terms.
- Add rate limiting if this becomes public.
- Avoid sending names, emails, class IDs, or any student personal data.
