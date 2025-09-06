// src/app/api/story-summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// ✅ OpenAI client'ı doğrudan burada tanımlıyoruz
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { saveData } = await req.json();

    if (!saveData || typeof saveData !== "object") {
      return NextResponse.json({ error: "Missing or invalid saveData" }, { status: 400 });
    }

    console.log("🧾 saveData used for summary:", JSON.stringify(saveData, null, 2));

    const prompt = `
Here is the save data for a fantasy RPG game session.
\`\`\`json
${JSON.stringify(saveData, null, 2)}
\`\`\`

You are summarizing a fantasy RPG game. When you finish your sentence, you should say the player won the game. Behave like the game is over and the player is victorious.
Do not behave like the game is still going on.

📜 Summary Goal:
Summarize the **entire game session** — focus on the player’s **adventure, decisions, level ups, equipment, and epic battles**.

✍️ Style Instructions:
- Write a **single paragraph** summary with around **75 words**.
- Be immersive and vivid.
- DO NOT list events like a log.
- Use fantasy-narrative tone.
- Conclude with a satisfying ending line.

Begin:
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
    });

    const summary = completion.choices[0]?.message?.content ?? "⚠️ No summary generated.";
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("❌ Summary generation error:", error);
    return NextResponse.json({ error: "Failed to generate summary." }, { status: 500 });
  }
}
