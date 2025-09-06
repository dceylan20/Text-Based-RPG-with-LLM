// src/lib/llm/promptBuilder.ts
import { Character } from "@/lib/types/character";

const scenarioDescriptions: Record<number, string> = {
  1: "The sacred dragon egg has been stolen. The player must track the thieves through forests, ancient ruins, and cursed caves to recover it.",
  2: "A king has been cursed, and the player must retrieve a legendary elixir hidden in forbidden temples guarded by magical creatures.",
  3: "A necromantic plague is raising the dead. The player must seal the source by battling undead in haunted lands.",
  4: "The Time Crystal has shattered. The player must journey across time and find the fragments before the world collapses.",
};

// Başlangıç prompt'u
export function buildStoryStartPrompt(player: Character, scenarioId: number): string {
  const scenarioText = scenarioDescriptions[scenarioId] || "Unknown scenario.";

  return `
You are an interactive game master in a text-based fantasy RPG.

The player has selected the following character:
- Class: ${player.characterClass}
- Level: ${player.level}

Scenario Description:
${scenarioText}

Start the story in an immersive way. Describe where the player is, what they see or feel, and end with a clear question like: "What would you like to do?"
Do NOT begin combat. Only tell the story and let the player explore first.
`;
}

// Devam prompt'u
export function buildStoryContinuePrompt({
  player,
  scenarioId,
  lastStory,
  playerInput,
  combatLog,
  nodeIndex,
}: {
  player: Character;
  scenarioId: number;
  lastStory: string;
  playerInput: string;
  combatLog?: string[];
  nodeIndex: number;
}): string {
  const scenarioText = scenarioDescriptions[scenarioId] || "Unknown scenario.";

  return `
You are continuing a text-based RPG adventure for a player.

Player:
- Class: ${player.characterClass}
- Level: ${player.level}

Scenario:
${scenarioText}

Current Chapter: ${nodeIndex}

Previous Story:
${lastStory}

Player's Action:
"${playerInput}"

${combatLog ? `They recently fought a battle. Combat summary:\n${combatLog.join("\n")}` : ""}

Now continue the story based on the player's action. Use descriptive language, build suspense or consequences, and end with a new question like "What do you do next?"

Only tell story. Do NOT trigger combat unless absolutely necessary.
`;
}
