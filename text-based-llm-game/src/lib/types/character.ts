// src/lib/types/character.ts

import { Equipment } from "./equipment"; 

export enum CharacterClass {
    Warrior = "Warrior",
    Spellcaster = "Spellcaster",
    Rogue = "Rogue",
    Missionary = "Missionary",
  }
  
  export type Character = {
    name: string;
    characterClass: CharacterClass;
    level: number;
    HP: number;
    MP: number;
    strength: number;
    dexterity: number;
    intelligence: number;
    constitution: number;
    spirit: number;
    agility: number;
    accuracy: number;
    charisma: number;
    wisdom: number;
    defence: number;
    speed: number;
    currentExp: number;
    equipment?: Equipment[];
    maxHP?: number;
  };
  