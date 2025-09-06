// src/app/api/image/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const sanitizedPrompt = sanitizePrompt(prompt);
    const fullPrompt = `Highly detailed fantasy illustration, dramatic lighting, concept art, soft digital painting, ${sanitizedPrompt}`;

    console.log("🧾 FFFFFFFinal Image Prompt:", fullPrompt);
    console.log("🧾 Prompt Length:", fullPrompt.length);

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-2",
        prompt: fullPrompt,
        n: 1,
        size: "1024x1024",
      }),
    });

    const data = await response.json();

    console.log("🪵 RAW OPENAI RESPONSE:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("❌ OpenAI image generation failed:", data);
      return NextResponse.json(
        { error: data.error?.message || "Unknown error from OpenAI" },
        { status: 500 }
      );
    }

    const imageUrl = data?.data?.[0]?.url;

    if (!imageUrl) {
      console.error("❌ No image URL returned by OpenAI:", data);
      return NextResponse.json({ error: "No image URL in response" }, { status: 500 });
    }

    return NextResponse.json({ imageUrl });
  } catch (err) {
    console.error("❌ Unexpected error in image route:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
function sanitizePrompt(raw: string): string {
  let cleaned = raw.replace(/\[BATTLE_START.*?\]/g, "").trim();

  // ASCII dışı karakterleri temizle
  cleaned = cleaned.replace(/[^\x00-\x7F]/g, "");

  // Fazla boşlukları temizle
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // ✨ İlk 10 anlamlı cümleyi al
  const sentenceSplit = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  const firstSentences = sentenceSplit.slice(0, 10).join(" ");

  return firstSentences;
}


