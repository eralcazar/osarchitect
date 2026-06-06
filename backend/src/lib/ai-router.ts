import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export type AIProvider = "anthropic" | "openai";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CallResult {
  text: string;
  tokens: { in: number; out: number };
}

export async function callAI(
  provider: AIProvider,
  messages: ChatMessage[],
  systemPrompt: string
): Promise<CallResult> {
  if (provider === "anthropic") {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role, content: m.content })),
    });

    const text =
      response.content[0]?.type === "text" ? response.content[0].text : "";

    return {
      text,
      tokens: {
        in: response.usage.input_tokens,
        out: response.usage.output_tokens,
      },
    };
  }

  // OpenAI
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    max_tokens: 1024,
  });

  const text = response.choices[0]?.message.content ?? "";

  return {
    text,
    tokens: {
      in: response.usage?.prompt_tokens ?? 0,
      out: response.usage?.completion_tokens ?? 0,
    },
  };
}

export async function askAIWithFallback(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<{ text: string; provider: AIProvider }> {
  try {
    const result = await callAI("anthropic", messages, systemPrompt);
    return { text: result.text, provider: "anthropic" };
  } catch (err) {
    console.warn("Claude failed, falling back to OpenAI:", err);
    try {
      const result = await callAI("openai", messages, systemPrompt);
      return { text: result.text, provider: "openai" };
    } catch (openaiErr) {
      console.error("Both providers failed:", openaiErr);
      throw openaiErr;
    }
  }
}
