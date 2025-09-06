// src/lib/types/equipment.ts

import { Character } from "./character";

export type Equipment = {
  name: string;
  bonusStats: Partial<Omit<Character, "name" | "level" | "HP" | "MP" | "characterClass" | "equipment">>;
};
