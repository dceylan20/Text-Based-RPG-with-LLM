// src/lib/combat/enemies/enemyTypes.ts

import { CharacterClass } from "@/lib/types/character";

export type EnemyTemplate = {
  baseName: string;
  characterClass: CharacterClass;
  theme: string;
  baseStats: {
    HP: number;
    MP: number;
    accuracy: number;
    speed: number;
    defence: number;
    strength: number;
  };
  scaling: {
    HP: number;
    MP: number;
    accuracy: number;
    speed: number;
    defence: number;
    strength: number;
  };
};
