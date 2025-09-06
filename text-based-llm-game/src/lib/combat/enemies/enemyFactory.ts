// src/lib/combat/enemies/enemyFactory.ts
import { Character } from "@/lib/types/character";
import { enemyTemplates } from "./enemyTemplates";
import { EnemyTemplate } from "./enemyTypes";

export function createEnemy(scenarioId: number, level: number): Character {
  const templates = enemyTemplates[scenarioId];

  if (!templates || templates.length === 0) {
    throw new Error(`No enemy templates found for scenario ${scenarioId}`);
  }

  const selectedTemplate: EnemyTemplate =
    templates[Math.floor(Math.random() * templates.length)];

  const stats: Character = {
    name: `${selectedTemplate.baseName} Lv.${level}`,
    characterClass: selectedTemplate.characterClass,
    level,
    HP: calculateStat(selectedTemplate.baseStats.HP, selectedTemplate.scaling.HP, level),
    MP: calculateStat(selectedTemplate.baseStats.MP, selectedTemplate.scaling.MP, level),
    accuracy: calculateStat(selectedTemplate.baseStats.accuracy, selectedTemplate.scaling.accuracy, level),
    speed: calculateStat(selectedTemplate.baseStats.speed, selectedTemplate.scaling.speed, level),
    defence: calculateStat(
  selectedTemplate.baseStats.defence,
  selectedTemplate.scaling.defence,
  level
) * level * 1.25,

    strength: calculateStat(selectedTemplate.baseStats.strength, selectedTemplate.scaling.strength, level),
    // Diğer karakter statları varsayılan olarak sıfırlanır
    dexterity: 0,
    intelligence: 0,
    constitution: 0,
    spirit: 0,
    agility: 0,
    charisma: 0,
    wisdom: 0,
    equipment: [],
  };

  return stats;
}

const SCALE_MULTIPLIER = 8;

function calculateStat(base: number, scale: number, level: number): number {
  const variation = Math.floor(Math.random() * 3);
  return Math.floor(base + (scale * SCALE_MULTIPLIER) * (level - 1) + variation);
}

