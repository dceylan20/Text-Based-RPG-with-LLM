// src/app/api/game/route.ts

import OpenAI from "openai";
import { NextRequest } from "next/server";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { playerAction, saveData } = await req.json();
  const playerStats = saveData?.playerState;

  const playerStatsText = playerStats
    ? `
📊 Player Stats:
- Charisma: ${playerStats.charisma}
- Intelligence: ${playerStats.intelligence}
- Wisdom: ${playerStats.wisdom}
- Dexterity: ${playerStats.dexterity}
- Strength: ${playerStats.strength}
`
    : `📊 Player stats are unknown.`;


  const systemPrompt = `
You are continuing a fantasy RPG adventure for the player.

Here is the current game save data:
${JSON.stringify(saveData, null, 2)}

${playerStatsText}

Your task is to continue the story based on the save data, the player's story attributes, and the new action.

Guidelines:
- Write in simple, clear, and easy-to-understand English. Avoid complex vocabulary and long sentences.
- Keep the entire story response within 75 words.
- Maintain a logical and natural flow in the story.
- When writing exploration, conversation, or decision moments, take into account the player's Charisma, Intelligence, Wisdom, Dexterity, and Strength.
  - High Charisma: Easier to persuade or negotiate with characters.
  - High Intelligence: Better at solving puzzles, finding clever solutions.
  - High Wisdom: More likely to sense danger or understand mysteries.
  - High Dexterity: Better at sneaking, escaping traps, quick physical moves.
  - High Strength: Better at forcing doors open, lifting heavy objects, performing feats of physical power.

- If a battle is necessary (e.g., encountering aggressive enemies, ambushes, immediate threats), insert the token [BATTLE_START] clearly at the end of your response.
- If no battle is necessary, continue the story normally without adding [BATTLE_START].
- If you start a battle, include a brief attack description at the end of your response, such as:  "The goblin lunges at you with a rusty dagger, its eyes filled with malice."
, "A shadowy figure emerges from the darkness, brandishing a wicked-looking sword."



Always keep the player engaged and active in the world.

Respond only with the next part of the story. Do not summarize or explain anything outside the story itself.
`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `"${playerAction}"` },
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
