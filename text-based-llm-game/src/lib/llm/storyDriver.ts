// src/lib/llm/storyDriver.ts

import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * LLM ile konuşur ve metin cevabını döner.
 */
export async function getStoryResponse(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful, creative game master." },
      { role: "user", content: prompt },
    ],
  });

  return response.choices[0]?.message.content || "No response.";
}
