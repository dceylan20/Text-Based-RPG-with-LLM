// src/lib/llm/imageGenerator.ts

export const generateBattleImageFromText = async (description: string): Promise<string | null> => {
  const cleanedPrompt = sanitizePrompt(description);
  const styledPrompt = `A dramatic medieval fantasy battle scene illustrated with vintage fantasy atmosphere. Avoid sketch, drawing, or hand-drawn style. Use soft digital painting techniques instead. ${cleanedPrompt}`;
  
  console.log("🧾 Prompt being sent to /api/image:", styledPrompt);

  try {
    const res = await fetch("/api/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: styledPrompt }),
    });

    const data = await res.json();
    return data.imageUrl;
  } catch (e) {
    console.error("Image generation failed", e);
    return null;
  }
};

function sanitizePrompt(raw: string): string {
  let cleaned = raw.replace(/\[BATTLE_START.*?\]/g, "").trim();

  // ASCII dışı karakterleri temizle
  cleaned = cleaned.replace(/[^\x00-\x7F]/g, "");

  // Fazla boşlukları temizle
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // ✨ İlk 10 anlamlı cümleyi al
  const sentenceSplit = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  const firstSentences = sentenceSplit.slice(0, 1).join(" ");

  return firstSentences;
}

