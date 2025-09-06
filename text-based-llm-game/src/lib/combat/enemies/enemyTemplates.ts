// // src/lib/combat/enemies/enemyTemplates.ts

import { CharacterClass } from '@/lib/types/character'; // Adjust the path as needed
import { EnemyTemplate } from "./enemyTypes";

export const enemyTemplates: Record<number, EnemyTemplate[]> = {
    1: [
  
      {
        baseName: "Egg Thief",
        characterClass: CharacterClass.Rogue,
        theme: "thief",
        baseStats: { HP: 90, MP: 20, accuracy: 15, speed: 16, defence: 6, strength: 10 },
        scaling: { HP: 12, MP: 2, accuracy: 1.5, speed: 1.8, defence: 0.6, strength: 1.1 },
      },
      {
        baseName: "Cave Brawler",
        characterClass: CharacterClass.Warrior,
        theme: "wild",
        baseStats: { HP: 120, MP: 10, accuracy: 12, speed: 10, defence: 12, strength: 20 },
        scaling: { HP: 15, MP: 1, accuracy: 1.0, speed: 1.2, defence: 1.5, strength: 2.0 },
      },
      {
        baseName: "Silent Blade",
        characterClass: CharacterClass.Rogue,
        theme: "assassin",
        baseStats: { HP: 80, MP: 25, accuracy: 18, speed: 20, defence: 5, strength: 12 },
        scaling: { HP: 10, MP: 3, accuracy: 2.2, speed: 2.5, defence: 0.4, strength: 1.4 },
      },
      {
        baseName: "Ancient Tracker",
        characterClass: CharacterClass.Missionary,
        theme: "seer",
        baseStats: { HP: 100, MP: 35, accuracy: 13, speed: 9, defence: 8, strength: 9 },
        scaling: { HP: 11, MP: 4, accuracy: 1.3, speed: 1.0, defence: 1.0, strength: 1.0 },
      },
      {
        baseName: "Burrow Raider",
        characterClass: CharacterClass.Rogue,
        theme: "underground",
        baseStats: { HP: 95, MP: 15, accuracy: 14, speed: 15, defence: 7, strength: 11 },
        scaling: { HP: 12, MP: 1, accuracy: 1.6, speed: 1.7, defence: 0.8, strength: 1.2 },
      },
      {
        baseName: "Apprentice Flamecaller",
        characterClass: CharacterClass.Spellcaster,
        theme: "fire",
        baseStats: { HP: 85, MP: 45, accuracy: 16, speed: 11, defence: 5, strength: 8 },
        scaling: { HP: 10, MP: 5, accuracy: 1.4, speed: 1.2, defence: 0.7, strength: 0.9 },
      },
      {
        baseName: "Forest Outlaw",
        characterClass: CharacterClass.Warrior,
        theme: "bandit",
        baseStats: { HP: 120, MP: 20, accuracy: 14, speed: 12, defence: 10, strength: 16 },
        scaling: { HP: 13, MP: 1, accuracy: 1.5, speed: 1.3, defence: 1.1, strength: 1.7 },
      },
      {
        baseName: "Trickster Monk",
        characterClass: CharacterClass.Missionary,
        theme: "illusion",
        baseStats: { HP: 95, MP: 40, accuracy: 12, speed: 10, defence: 7, strength: 9 },
        scaling: { HP: 11, MP: 4.5, accuracy: 1.2, speed: 1.2, defence: 0.9, strength: 1.0 },
      },
      {
        baseName: "Rune Slicer",
        characterClass: CharacterClass.Warrior,
        theme: "enchanted",
        baseStats: { HP: 130, MP: 25, accuracy: 13, speed: 10, defence: 11, strength: 18 },
        scaling: { HP: 14, MP: 2, accuracy: 1.3, speed: 1.1, defence: 1.2, strength: 1.9 },
      },
      {
        baseName: "Swamp Lurker",
        characterClass: CharacterClass.Missionary,
        theme: "toxic",
        baseStats: { HP: 105, MP: 30, accuracy: 11, speed: 8, defence: 9, strength: 10 },
        scaling: { HP: 12, MP: 3, accuracy: 1.1, speed: 1.0, defence: 1.0, strength: 1.0 },
      },
      {
        baseName: "Bone Collector",
        characterClass: CharacterClass.Rogue,
        theme: "grave",
        baseStats: { HP: 90, MP: 20, accuracy: 15, speed: 13, defence: 6, strength: 13 },
        scaling: { HP: 11, MP: 2, accuracy: 1.7, speed: 1.4, defence: 0.7, strength: 1.3 },
      },
      {
        baseName: "Watcher of the Ember",
        characterClass: CharacterClass.Spellcaster,
        theme: "fire",
        baseStats: { HP: 100, MP: 50, accuracy: 17, speed: 12, defence: 6, strength: 9 },
        scaling: { HP: 10, MP: 5, accuracy: 1.5, speed: 1.4, defence: 0.8, strength: 1.0 },
      },
      {
        baseName: "Pathless Hermit",
        characterClass: CharacterClass.Missionary,
        theme: "mystic",
        baseStats: { HP: 90, MP: 35, accuracy: 12, speed: 10, defence: 7, strength: 10 },
        scaling: { HP: 11, MP: 3.5, accuracy: 1.2, speed: 1.1, defence: 0.9, strength: 1.1 },
      },
      {
        baseName: "Goldfang Mercenary",
        characterClass: CharacterClass.Warrior,
        theme: "elite",
        baseStats: { HP: 130, MP: 25, accuracy: 16, speed: 14, defence: 12, strength: 22 },
        scaling: { HP: 16, MP: 2, accuracy: 1.8, speed: 1.6, defence: 1.4, strength: 2.2 },
      },
      {
        baseName: "Shadow Whisperer",
        characterClass: CharacterClass.Rogue,
        theme: "stealth",
        baseStats: { HP: 85, MP: 25, accuracy: 18, speed: 19, defence: 5, strength: 11 },
        scaling: { HP: 9, MP: 2.5, accuracy: 2.2, speed: 2.4, defence: 0.5, strength: 1.3 },
      }
  
    ],



    2: [

        {
          baseName: "Cursed Royal Guard",
          characterClass: CharacterClass.Warrior,
          theme: "cursed-knight",
          baseStats: { HP: 130, MP: 10, accuracy: 13, speed: 10, defence: 14, strength: 22 },
          scaling: { HP: 16, MP: 1, accuracy: 1.3, speed: 1.1, defence: 1.7, strength: 2.2 },
        },
        {
          baseName: "Spectral Archer",
          characterClass: CharacterClass.Rogue,
          theme: "ghost",
          baseStats: { HP: 100, MP: 25, accuracy: 18, speed: 16, defence: 7, strength: 14 },
          scaling: { HP: 11, MP: 3, accuracy: 2.1, speed: 1.9, defence: 0.8, strength: 1.6 },
        },
        {
          baseName: "Banished Priest",
          characterClass: CharacterClass.Missionary,
          theme: "dark-cleric",
          baseStats: { HP: 110, MP: 40, accuracy: 14, speed: 10, defence: 8, strength: 11 },
          scaling: { HP: 12, MP: 4.5, accuracy: 1.5, speed: 1.2, defence: 1.0, strength: 1.1 },
        },
        {
          baseName: "Temple Gargoyle",
          characterClass: CharacterClass.Warrior,
          theme: "stone",
          baseStats: { HP: 120, MP: 0, accuracy: 10, speed: 8, defence: 18, strength: 20 },
          scaling: { HP: 18, MP: 0, accuracy: 1.0, speed: 1.0, defence: 2.0, strength: 1.8 },
        },
        {
          baseName: "Dark Flame Scribe",
          characterClass: CharacterClass.Spellcaster,
          theme: "fire-dark",
          baseStats: { HP: 90, MP: 50, accuracy: 17, speed: 12, defence: 6, strength: 9 },
          scaling: { HP: 10, MP: 5.5, accuracy: 1.8, speed: 1.3, defence: 0.7, strength: 0.9 },
        },
        {
          baseName: "Exiled Noble",
          characterClass: CharacterClass.Missionary,
          theme: "fallen-royal",
          baseStats: { HP: 105, MP: 35, accuracy: 14, speed: 10, defence: 10, strength: 12 },
          scaling: { HP: 12, MP: 3.5, accuracy: 1.5, speed: 1.3, defence: 1.1, strength: 1.4 },
        },
        {
          baseName: "Crimson Blade Revenant",
          characterClass: CharacterClass.Warrior,
          theme: "revenant",
          baseStats: { HP: 110, MP: 20, accuracy: 16, speed: 14, defence: 11, strength: 20 },
          scaling: { HP: 15, MP: 2, accuracy: 1.8, speed: 1.6, defence: 1.3, strength: 2.3 },
        },
        {
          baseName: "Shadowbound Servant",
          characterClass: CharacterClass.Rogue,
          theme: "bound-shadow",
          baseStats: { HP: 95, MP: 25, accuracy: 19, speed: 18, defence: 6, strength: 13 },
          scaling: { HP: 10, MP: 2.5, accuracy: 2.3, speed: 2.0, defence: 0.7, strength: 1.5 },
        },
        {
          baseName: "Blood Runesmith",
          characterClass: CharacterClass.Spellcaster,
          theme: "rune-blood",
          baseStats: { HP: 100, MP: 55, accuracy: 15, speed: 11, defence: 7, strength: 10 },
          scaling: { HP: 10, MP: 6, accuracy: 1.6, speed: 1.2, defence: 0.9, strength: 1.0 },
        },
        {
          baseName: "Vengeful Widow",
          characterClass: CharacterClass.Missionary,
          theme: "cursed-spirit",
          baseStats: { HP: 110, MP: 30, accuracy: 14, speed: 13, defence: 9, strength: 12 },
          scaling: { HP: 11, MP: 3.5, accuracy: 1.5, speed: 1.5, defence: 1.1, strength: 1.2 },
        },
        {
          baseName: "Royal Crypt Stalker",
          characterClass: CharacterClass.Rogue,
          theme: "tomb-thief",
          baseStats: { HP: 100, MP: 20, accuracy: 17, speed: 16, defence: 7, strength: 15 },
          scaling: { HP: 11, MP: 2, accuracy: 2.0, speed: 1.8, defence: 0.8, strength: 1.6 },
        },
        {
          baseName: "Twilight Inquisitor",
          characterClass: CharacterClass.Warrior,
          theme: "dark-knight",
          baseStats: { HP: 110, MP: 30, accuracy: 15, speed: 13, defence: 13, strength: 15 },
          scaling: { HP: 15, MP: 2.5, accuracy: 1.5, speed: 1.4, defence: 1.3, strength: 2.1 },
        },
        {
          baseName: "Forsaken Oracle",
          characterClass: CharacterClass.Spellcaster,
          theme: "oracle",
          baseStats: { HP: 95, MP: 60, accuracy: 18, speed: 12, defence: 6, strength: 8 },
          scaling: { HP: 9, MP: 6.5, accuracy: 2.0, speed: 1.4, defence: 0.6, strength: 0.8 },
        },
        {
          baseName: "Blackveil Assassin",
          characterClass: CharacterClass.Rogue,
          theme: "veil",
          baseStats: { HP: 90, MP: 25, accuracy: 20, speed: 20, defence: 5, strength: 14 },
          scaling: { HP: 10, MP: 2, accuracy: 2.5, speed: 2.2, defence: 0.5, strength: 1.5 },
        },
        {
          baseName: "Bound King’s Warden",
          characterClass: CharacterClass.Warrior,
          theme: "king's-curse",
          baseStats: { HP: 110, MP: 15, accuracy: 14, speed: 12, defence: 14, strength: 15 },
          scaling: { HP: 16, MP: 1, accuracy: 1.5, speed: 1.4, defence: 1.6, strength: 2.4 },
        },
    
      ],





      3: [

        {
          baseName: "Undead Soldier",
          characterClass: CharacterClass.Warrior,
          theme: "undead",
          baseStats: { HP: 120, MP: 5, accuracy: 13, speed: 9, defence: 14, strength: 15 },
          scaling: { HP: 15, MP: 0.5, accuracy: 1.2, speed: 1.0, defence: 1.4, strength: 2.0 },
        },
        {
          baseName: "Necromancer",
          characterClass: CharacterClass.Spellcaster,
          theme: "dark-mage",
          baseStats: { HP: 90, MP: 60, accuracy: 16, speed: 11, defence: 7, strength: 8 },
          scaling: { HP: 10, MP: 6, accuracy: 1.8, speed: 1.3, defence: 0.9, strength: 1.0 },
        },
        {
          baseName: "Ghoul Stalker",
          characterClass: CharacterClass.Rogue,
          theme: "ghoul",
          baseStats: { HP: 100, MP: 10, accuracy: 17, speed: 14, defence: 6, strength: 16 },
          scaling: { HP: 11, MP: 1, accuracy: 2.0, speed: 1.7, defence: 0.8, strength: 1.6 },
        },
        {
          baseName: "Bone Knight",
          characterClass: CharacterClass.Warrior,
          theme: "skeletal-knight",
          baseStats: { HP: 110, MP: 0, accuracy: 12, speed: 10, defence: 16, strength: 15 },
          scaling: { HP: 17, MP: 0, accuracy: 1.0, speed: 1.2, defence: 1.8, strength: 2.2 },
        },
        {
          baseName: "Spirit Howler",
          characterClass: CharacterClass.Missionary,
          theme: "ghost",
          baseStats: { HP: 95, MP: 40, accuracy: 14, speed: 13, defence: 7, strength: 12 },
          scaling: { HP: 11, MP: 4, accuracy: 1.5, speed: 1.5, defence: 0.9, strength: 1.2 },
        },
        {
          baseName: "Corpse Crawler",
          characterClass: CharacterClass.Rogue,
          theme: "plague",
          baseStats: { HP: 110, MP: 5, accuracy: 15, speed: 12, defence: 8, strength: 15 },
          scaling: { HP: 12, MP: 0.5, accuracy: 1.7, speed: 1.3, defence: 1.0, strength: 1.5 },
        },
        {
          baseName: "Crypt Blazer",
          characterClass: CharacterClass.Spellcaster,
          theme: "fire-lich",
          baseStats: { HP: 100, MP: 55, accuracy: 17, speed: 11, defence: 6, strength: 10 },
          scaling: { HP: 10, MP: 6, accuracy: 1.9, speed: 1.2, defence: 0.8, strength: 1.1 },
        },
        {
          baseName: "Deathbringer",
          characterClass: CharacterClass.Warrior,
          theme: "elite-undead",
          baseStats: { HP: 120, MP: 10, accuracy: 15, speed: 13, defence: 13, strength: 17 },
          scaling: { HP: 16, MP: 1, accuracy: 1.6, speed: 1.4, defence: 1.3, strength: 2.3 },
        },
        {
          baseName: "Skeletal Archer",
          characterClass: CharacterClass.Rogue,
          theme: "skeletal",
          baseStats: { HP: 95, MP: 10, accuracy: 18, speed: 16, defence: 5, strength: 13 },
          scaling: { HP: 10, MP: 1, accuracy: 2.2, speed: 2.0, defence: 0.6, strength: 1.4 },
        },
        {
          baseName: "Crypt Oracle",
          characterClass: CharacterClass.Missionary,
          theme: "seer-undead",
          baseStats: { HP: 100, MP: 50, accuracy: 15, speed: 12, defence: 7, strength: 11 },
          scaling: { HP: 10, MP: 5, accuracy: 1.6, speed: 1.4, defence: 0.9, strength: 1.1 },
        },
        {
          baseName: "Plagued Knight",
          characterClass: CharacterClass.Warrior,
          theme: "plague",
          baseStats: { HP: 125, MP: 10, accuracy: 14, speed: 10, defence: 15, strength:16 },
          scaling: { HP: 15, MP: 1, accuracy: 1.4, speed: 1.1, defence: 1.6, strength: 2.0 },
        },
        {
          baseName: "Shade Assassin",
          characterClass: CharacterClass.Rogue,
          theme: "shadow",
          baseStats: { HP: 85, MP: 20, accuracy: 20, speed: 19, defence: 5, strength: 14 },
          scaling: { HP: 9, MP: 2, accuracy: 2.4, speed: 2.1, defence: 0.6, strength: 1.5 },
        },
        {
          baseName: "Eternal Sentinel",
          characterClass: CharacterClass.Warrior,
          theme: "eternal-guardian",
          baseStats: { HP: 115, MP: 5, accuracy: 13, speed: 9, defence: 17, strength: 17 },
          scaling: { HP: 17, MP: 0.5, accuracy: 1.2, speed: 1.0, defence: 1.7, strength: 2.1 },
        },
        {
          baseName: "Voidfire Channeler",
          characterClass: CharacterClass.Spellcaster,
          theme: "void",
          baseStats: { HP: 95, MP: 60, accuracy: 16, speed: 13, defence: 6, strength: 9 },
          scaling: { HP: 9, MP: 6.5, accuracy: 1.9, speed: 1.5, defence: 0.7, strength: 1.0 },
        },
        {
          baseName: "Bloodbone Prophet",
          characterClass: CharacterClass.Missionary,
          theme: "blood-curse",
          baseStats: { HP: 105, MP: 40, accuracy: 14, speed: 11, defence: 8, strength: 12 },
          scaling: { HP: 11, MP: 4, accuracy: 1.5, speed: 1.2, defence: 1.0, strength: 1.3 },
        }
    
      ],
    

      4: [

        {
          baseName: "Temporal Wraith",
          characterClass: CharacterClass.Missionary,
          theme: "time-wraith",
          baseStats: { HP: 100, MP: 50, accuracy: 18, speed: 18, defence: 8, strength: 13 },
          scaling: { HP: 11, MP: 5, accuracy: 2.1, speed: 2.2, defence: 1.0, strength: 1.3 },
        },
        {
          baseName: "Chrono Duelist",
          characterClass: CharacterClass.Warrior,
          theme: "clock-warrior",
          baseStats: { HP: 130, MP: 20, accuracy: 15, speed: 14, defence: 13, strength: 15 },
          scaling: { HP: 14, MP: 2, accuracy: 1.6, speed: 1.6, defence: 1.4, strength: 2.0 },
        },
        {
          baseName: "Shardbound Hunter",
          characterClass: CharacterClass.Rogue,
          theme: "fragment-thief",
          baseStats: { HP: 95, MP: 30, accuracy: 19, speed: 17, defence: 6, strength: 15 },
          scaling: { HP: 10, MP: 3, accuracy: 2.2, speed: 2.0, defence: 0.8, strength: 1.5 },
        },
        {
          baseName: "Future Echo",
          characterClass: CharacterClass.Missionary,
          theme: "illusion-time",
          baseStats: { HP: 90, MP: 45, accuracy: 16, speed: 15, defence: 7, strength: 11 },
          scaling: { HP: 10, MP: 4.5, accuracy: 1.8, speed: 1.7, defence: 0.9, strength: 1.1 },
        },
        {
          baseName: "Clockwork Enforcer",
          characterClass: CharacterClass.Warrior,
          theme: "gear",
          baseStats: { HP: 110, MP: 10, accuracy: 13, speed: 10, defence: 15, strength: 18 },
          scaling: { HP: 16, MP: 1, accuracy: 1.2, speed: 1.2, defence: 1.7, strength: 2.2 },
        },
        {
          baseName: "Temporal Assassin",
          characterClass: CharacterClass.Rogue,
          theme: "shift",
          baseStats: { HP: 85, MP: 25, accuracy: 20, speed: 21, defence: 5, strength: 14 },
          scaling: { HP: 9, MP: 2.5, accuracy: 2.5, speed: 2.5, defence: 0.5, strength: 1.4 },
        },
        {
          baseName: "Crystal Guardian",
          characterClass: CharacterClass.Warrior,
          theme: "shard",
          baseStats: { HP: 125, MP: 30, accuracy: 14, speed: 12, defence: 13, strength: 16 },
          scaling: { HP: 15, MP: 3, accuracy: 1.4, speed: 1.4, defence: 1.5, strength: 2.1 },
        },
        {
          baseName: "Reverse Echo",
          characterClass: CharacterClass.Spellcaster,
          theme: "inversion",
          baseStats: { HP: 90, MP: 60, accuracy: 17, speed: 13, defence: 7, strength: 10 },
          scaling: { HP: 9, MP: 6.5, accuracy: 1.9, speed: 1.5, defence: 0.8, strength: 1.0 },
        },
        {
          baseName: "Time-Bound Phantom",
          characterClass: CharacterClass.Missionary,
          theme: "ghost-time",
          baseStats: { HP: 100, MP: 50, accuracy: 16, speed: 16, defence: 8, strength: 12 },
          scaling: { HP: 11, MP: 5, accuracy: 1.7, speed: 2.0, defence: 1.0, strength: 1.3 },
        },
        {
          baseName: "Clocksworn Duelist",
          characterClass: CharacterClass.Warrior,
          theme: "clock",
          baseStats: { HP: 115, MP: 15, accuracy: 15, speed: 14, defence: 12, strength: 16 },
          scaling: { HP: 14, MP: 1.5, accuracy: 1.5, speed: 1.5, defence: 1.3, strength: 2.0 },
        },
        {
          baseName: "Prism Leaper",
          characterClass: CharacterClass.Rogue,
          theme: "light-shift",
          baseStats: { HP: 90, MP: 25, accuracy: 19, speed: 20, defence: 6, strength: 13 },
          scaling: { HP: 10, MP: 2.5, accuracy: 2.3, speed: 2.4, defence: 0.7, strength: 1.3 },
        },
        {
          baseName: "Entropic Sorcerer",
          characterClass: CharacterClass.Spellcaster,
          theme: "chaos",
          baseStats: { HP: 95, MP: 65, accuracy: 18, speed: 13, defence: 6, strength: 9 },
          scaling: { HP: 9, MP: 6.8, accuracy: 2.1, speed: 1.4, defence: 0.8, strength: 1.0 },
        },
        {
          baseName: "Frozen Timeline Guard",
          characterClass: CharacterClass.Warrior,
          theme: "ice-time",
          baseStats: { HP: 130, MP: 20, accuracy: 14, speed: 10, defence: 14, strength: 18 },
          scaling: { HP: 16, MP: 2, accuracy: 1.3, speed: 1.2, defence: 1.6, strength: 2.2 },
        },
        {
          baseName: "Anomaly Splitter",
          characterClass: CharacterClass.Spellcaster,
          theme: "split-reality",
          baseStats: { HP: 100, MP: 55, accuracy: 17, speed: 14, defence: 7, strength: 11 },
          scaling: { HP: 10, MP: 5.5, accuracy: 1.8, speed: 1.5, defence: 0.9, strength: 1.2 },
        },
        {
          baseName: "Chrono Walker",
          characterClass: CharacterClass.Missionary,
          theme: "timetraveler",
          baseStats: { HP: 105, MP: 45, accuracy: 15, speed: 15, defence: 9, strength: 12 },
          scaling: { HP: 11, MP: 4, accuracy: 1.6, speed: 1.7, defence: 1.1, strength: 1.4 },
        }
    
      ],
    
    
  };
  