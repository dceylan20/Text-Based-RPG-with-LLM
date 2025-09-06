// src/app/api/intro/route.ts
import OpenAI from "openai";
import { NextRequest } from "next/server";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { scenarioId, playerState } = await req.json();

  const scenarioIntroMap: Record<number, string> = {
    1: `
Introduce the world of "The Stolen Dragon Egg":
- Describe the shadowy mountains, the theft of the dragon egg, and the distressed dragon mother.
- End with the player approaching the mountains, ready to begin the search.
`,
    2: `
Introduce the world of "The Cursed King":
- Describe the mysterious illness plaguing the king and whispers of an ancient elixir hidden in magical forests.
- End with the player nearing the first signs of the forest path.
`,
    3: `
Introduce the world of "Rise of the Undead":
- Describe eerie tombs, vanishing villagers, and a necromantic presence growing beneath the soil.
- End with the player arriving at the edge of a cursed graveyard.
`,
    4: `
Introduce the world of "The Broken Time Crystal":
- Describe the shattering of the crystal, time distortions, and collapsing cities.
- End with the player stepping toward a glowing portal in a frozen moment.
`,
  };

  const selectedIntro = scenarioIntroMap[scenarioId] ?? scenarioIntroMap[1];

  const playerStatsText = playerState
    ? `
Player Stats:
- Charisma: ${playerState.charisma}
- Intelligence: ${playerState.intelligence}
- Wisdom: ${playerState.wisdom}
- Dexterity: ${playerState.dexterity}
- Strength: ${playerState.strength}
`
    : `
Player stats are unknown.
`;

  const systemPrompt = `
You are narrating the beginning of a fantasy RPG adventure for a player.

${selectedIntro}

Use immersive storytelling that reflects the player's current stats when appropriate.

${playerStatsText}

Guidelines:
- Keep the intro under 100 words.
- Do not include any battles yet. This is only an opening.
- Do not use [BATTLE_START].
- This is the first scene. Be vivid and atmospheric.
- Make the player feel immersed, referencing their stats where fitting.

Respond only with the intro narrative. Do not explain anything outside the story.
`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Begin the opening scene now." },
        ],
      });

      for await (const chunk of completion) {
        const text = chunk.choices[0]?.delta?.content || "";
        controller.enqueue(encoder.encode(text));
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "no-cache",
    },
  });
}
