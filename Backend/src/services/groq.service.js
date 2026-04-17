import { env } from "../validators/env.schema.js";

const DEFAULT_MODEL = env.GROQ_MODEL || "llama-3.3-70b-versatile";

const extractJson = (content) => {
  if (!content) {
    throw new Error("Groq returned an empty response");
  }

  const trimmed = content.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)```/i) || trimmed.match(/```\s*([\s\S]*?)```/i);
    if (fencedMatch?.[1]) {
      return JSON.parse(fencedMatch[1].trim());
    }

    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    }

    throw new Error("Unable to parse JSON from Groq response");
  }
};

export const groqJsonCompletion = async ({
  systemPrompt,
  userPrompt,
  temperature = 0.2,
  model = DEFAULT_MODEL,
}) => {
  if (!env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const message = payload?.error?.message || payload?.message || "Groq request failed";
      const error = new Error(message);
      error.name = "GroqApiError";
      throw error;
    }

    const content = payload?.choices?.[0]?.message?.content;
    return extractJson(content);
  } catch (error) {
    if (error?.name === "AbortError") {
      const timeoutError = new Error("Groq request timed out");
      timeoutError.name = "GroqTimeoutError";
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};
