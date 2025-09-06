// src/lib/types/combat.ts
import { Character } from "@/lib/types/character";

export type AttackResult = {
    damage: number;
    isCritical: boolean;
    isEvaded: boolean;
    log: string;
    updatedEnemy: Character;
    enemyStunned: boolean;
    autoDodge: boolean;
  };
  

export type CombatResult = {
export type CombatResult = {
    winner: "player" | "enemy";
    log: string[];
  };