// src/lib/combat/abilities/classAbilities.ts
import { Character, CharacterClass } from "@/lib/types/character";
import { AttackResult } from "@/lib/types/combat";
export type Skill = {
    name: string;
    description: string;
    manaCost: number;
    cooldown: number;
    isPermanent: boolean;
    effectDuration?: number; // only used if not permanent
    availableLevel: number;
    target: "enemy" | "self";
    execute: (player: Character, enemy: Character) => AttackResult;
};

const randomVariance = () => 1 + Math.random() * 0.1;


export const classSkills: Record<CharacterClass, Skill[]> = {
    [CharacterClass.Warrior]: [

        {
            name: "Battle Roar",
            description: "Boosts strength by 100% for next skill. Boosted: Also stuns.",
            manaCost: 8,
            cooldown: 6,
            isPermanent: false,
            availableLevel: 1,
            target: "self",
            execute: (player, enemy) => {
                (player as any).boostNextSkill = true;

                return {
                    damage: 0,
                    isCritical: false,
                    isEvaded: false,
                    log: `🦁 ${player.name} roars with fury! Their next strike is empowered and evasive.`,
                    enemyStunned: false,
                    autoDodge: false,
                    updatedEnemy: { ...enemy },
                };
            },
        },

        {
            name: "Focus Mind",
            description: "Recovers max mana by 25%.",
            manaCost: 5,
            cooldown: 4,
            isPermanent: true,
            availableLevel: 1,
            target: "self",
            execute: (player, enemy) => {
                const maxMP = player.intelligence * 5;
                const boost = Math.min(Math.floor(maxMP * 0.25), maxMP - player.MP);
                player.MP += boost;
                return {
                    damage: 0,
                    isCritical: false,
                    isEvaded: false,
                    log: `🧠 ${player.name} used Focus Mind and increased MP by ${boost}.`,
                    enemyStunned: false,
                    autoDodge: false,
                    updatedEnemy: { ...enemy },
                };
            },
        },

        {
            name: "Piercing Strike",
            description: "High-damage attack ignoring some defence. Boosted: double STR and also stuns.",
            manaCost: 10,
            cooldown: 4,
            isPermanent: false,
            availableLevel: 1,
            target: "enemy",
            execute: (player, enemy) => {
                const isBoosted = (player as any).boostNextSkill;
                const variance = randomVariance();

                const effectiveStrength = isBoosted ? player.strength * 2 : player.strength;
                const damage = Math.floor(Math.max(0, effectiveStrength * 1.7 - enemy.defence / 2) * variance);

                const newEnemy = { ...enemy, HP: Math.max(0, enemy.HP - damage) };
                player.MP -= 10;

                if (isBoosted) (player as any).boostNextSkill = false;

                return {
                    damage,
                    isCritical: false,
                    isEvaded: false,
                    log: `🗡️ ${player.name} used Piercing Strike for ${damage} damage ignoring enemy armour.${isBoosted ? " (Boosted STR + Stun!)" : ""}`,
                    enemyStunned: isBoosted,
                    autoDodge: false,
                    updatedEnemy: newEnemy,
                };
            },
        },

        {
            name: "Shield Bash",
            description: "Stuns and damages the enemy. Boosted: Deals double damage.",
            manaCost: 10,
            cooldown: 4,
            isPermanent: false,
            effectDuration: 1,
            availableLevel: 2,
            target: "enemy",
            execute: (player, enemy) => {
                const isBoosted = (player as any).boostNextSkill;
                const multiplier = isBoosted ? 2 : 1;
                const variance = randomVariance();
                const damage = Math.floor((player.strength / 2) * multiplier * variance);
                const newEnemy = { ...enemy, HP: Math.max(0, enemy.HP - damage) };
                player.MP -= 10;

                if (isBoosted) (player as any).boostNextSkill = false;

                return {
                    damage,
                    isCritical: false,
                    isEvaded: false,
                    log: `🛡️ ${player.name} used Shield Bash! ${enemy.name} is stunned and took ${damage} damage.${isBoosted ? " (Empowered!)" : ""}`,
                    enemyStunned: true,
                    autoDodge: false,
                    updatedEnemy: newEnemy,
                };
            },
        },

        {
            name: "Earthsplitter",
            description: "Massive AOE hit. STR-based. 25% crit. Boosted: 2x damage + dodge.",
            manaCost: 18,
            cooldown: 6,
            isPermanent: false,
            availableLevel: 3,
            target: "enemy",
            execute: (player, enemy) => {
                const isBoosted = (player as any).boostNextSkill;
                const critChance = isBoosted ? 0.75 : 0.25;
                const isCrit = Math.random() < critChance;
                const baseDamage = player.strength * 2;
                const multiplier = isBoosted ? 2.0 : (isCrit ? 1.5 : 1.0);
                const variance = randomVariance();
                const damage = Math.floor(baseDamage * multiplier * variance);
                player.MP -= 18;

                if (isBoosted) (player as any).boostNextSkill = false;

                return {
                    damage,
                    isCritical: isCrit || isBoosted,
                    isEvaded: false,
                    log: `🌋 ${player.name} slammed the ground with Earthsplitter, dealing ${damage} damage!${(isCrit || isBoosted) ? " (Critical!)" : ""}`,
                    updatedEnemy: { ...enemy, HP: Math.max(0, enemy.HP - damage) },
                    enemyStunned: isBoosted,
                    autoDodge: false,
                };
            },
        },

    ],

    [CharacterClass.Spellcaster]: [

        {
            name: "Fireball",
            description: "Deals heavy fire damage (INT). 20% chance to crit for +50% damage. Boosted: +200% base damage.",
            manaCost: 15,
            cooldown: 3,
            isPermanent: false,
            availableLevel: 1,
            target: "enemy",
            execute: (player, enemy) => {
                const isBoosted = (player as any).boostNextSkill;
                const boostMultiplier = isBoosted ? 3 : 1.0;
                const baseDamage = player.intelligence * boostMultiplier * randomVariance();

                const isCritical = Math.random() < 0.2;
                const finalDamage = Math.floor(isCritical ? baseDamage * 1.5 : baseDamage);

                const newEnemy = { ...enemy, HP: Math.max(0, enemy.HP - finalDamage) };
                player.MP -= 15;

                if (isBoosted) (player as any).boostNextSkill = false;

                return {
                    damage: finalDamage,
                    isCritical,
                    isEvaded: false,
                    log: `🔥 ${player.name} cast Fireball on ${enemy.name} for ${finalDamage} damage!${isBoosted ? " (Boosted!)" : ""}${isCritical ? " 💥 Critical hit!" : ""}`,
                    updatedEnemy: newEnemy,
                    enemyStunned: false,
                    autoDodge: false,
                };
            },
        },

        {
            name: "Heal",
            description: "Restores HP based on intelligence. Boosted:  +150% healing.",
            manaCost: 10,
            cooldown: 4,
            isPermanent: true,
            availableLevel: 2,
            target: "self",
            execute: (player, enemy) => {
                const maxHP = player.defence * 20;
                const isBoosted = (player as any).boostNextSkill;
                const boostMultiplier = isBoosted ? 2.5 : 1.0;

                const healAmount = Math.floor(player.intelligence * 0.75 * boostMultiplier * randomVariance());
                const actualHeal = Math.min(healAmount, maxHP - player.HP);
                player.HP += actualHeal;
                player.MP -= 10;

                if (isBoosted) (player as any).boostNextSkill = false;

                return {
                    damage: 0,
                    isCritical: false,
                    isEvaded: false,
                    log: `✨ ${player.name} cast Heal and recovered ${actualHeal} HP!${isBoosted ? " (Boosted!)" : ""}`,
                    enemyStunned: false,
                    autoDodge: false,
                    updatedEnemy: { ...enemy },
                };
            },
        },

        {
            name: "Arcane Meditation",
            description: "Regenerates 25% of maximum mana. Boosted: +100% more MP recovered.",
            manaCost: 0,
            cooldown: 4,
            isPermanent: true,
            availableLevel: 1,
            target: "self",
            execute: (player, enemy) => {
                const maxMP = player.intelligence * 5;
                const isBoosted = (player as any).boostNextSkill;
                const boostMultiplier = isBoosted ? 2 : 1.0;

                const boost = Math.min(Math.floor(maxMP * 0.25 * boostMultiplier), maxMP - player.MP);
                player.MP += boost;

                if (isBoosted) (player as any).boostNextSkill = false;

                return {
                    damage: 0,
                    isCritical: false,
                    isEvaded: false,
                    log: `🧘 ${player.name} entered Arcane Meditation and recovered ${boost} MP.${isBoosted ? " (Boosted!)" : ""}`,
                    enemyStunned: false,
                    autoDodge: false,
                    updatedEnemy: { ...enemy },
                };
            },
        },

        {
            name: "Arcane Surge",
            description: "Empowers your next skill, increasing its effectiveness by %100-200.",
            manaCost: 40,
            cooldown: 5,
            isPermanent: true,
            availableLevel: 1,
            target: "self",
            execute: (player, enemy) => {
                player.MP -= 12;
                (player as any).boostNextSkill = true;

                return {
                    damage: 0,
                    isCritical: false,
                    isEvaded: false,
                    log: `⚡ ${player.name} is surrounded by arcane energy. Their next skill will be empowered!`,
                    enemyStunned: false,
                    autoDodge: false,
                    updatedEnemy: { ...enemy },
                };
            },
        },
    ],
    [CharacterClass.Rogue]: [
        {
            name: "Shadow Strike",
            description: "Dex tabanlı ağır vuruş. Crit: 2x. Boosted: %70 crit + dodge.",
            manaCost: 12,
            cooldown: 3,
            isPermanent: false,
            availableLevel: 1,
            target: "enemy",
            execute: (player, enemy) => {
                const isBoosted = (player as any).boostNextSkill;
                const critChance = isBoosted ? 0.7 : 0.2;
                const isCrit = Math.random() < critChance;
                const variance = randomVariance();
                const base = Math.max(0, player.dexterity - enemy.defence);
                const damage = Math.floor(base * (isCrit ? 2 : 1) * variance);

                if (isBoosted) (player as any).boostNextSkill = false;
                player.MP -= 12;

                return {
                    damage,
                    isCritical: isCrit,
                    isEvaded: false,
                    log: `🗡️ ${player.name} used Shadow Strike and dealt ${damage} damage.${isCrit ? " (Critical!)" : ""}`,
                    updatedEnemy: { ...enemy, HP: Math.max(0, enemy.HP - damage) },
                    enemyStunned: false,
                    autoDodge: isBoosted,
                };
            },
        },
        {
            name: "Silent Focus",
            description: "Restores MP , %25. Boosted: also dodges the next attack.",
            manaCost: 0,
            cooldown: 4,
            isPermanent: true,
            availableLevel: 1,
            target: "self",
            execute: (player, enemy) => {
                const isBoosted = (player as any).boostNextSkill;
                const maxMP = player.intelligence * 5;
                const regen = Math.min(Math.floor(maxMP * 0.25), maxMP - player.MP);
                player.MP += regen;

                if (isBoosted) (player as any).boostNextSkill = false;

                return {
                    damage: 0,
                    isCritical: false,
                    isEvaded: false,
                    log: `🌑 ${player.name} silently recovered ${regen} MP.${isBoosted ? " (Dodged this turn!)" : ""}`,
                    updatedEnemy: { ...enemy },
                    enemyStunned: false,
                    autoDodge: isBoosted,
                };
            },
        },
        {
            name: "Throwing Knife",
            description: "Attack boosted by Dex. Crit: 1.5x. Boosted: %70 crit + dodge.",
            manaCost: 5,
            cooldown: 2,
            isPermanent: false,
            availableLevel: 1,
            target: "enemy",
            execute: (player, enemy) => {
                const isBoosted = (player as any).boostNextSkill;
                const critChance = isBoosted ? 0.7 : 0.2;
                const isCrit = Math.random() < critChance;
                const variance = randomVariance();
                const damage = Math.floor(player.dexterity * (isCrit ? 1.5 : 1) * variance);

                if (isBoosted) (player as any).boostNextSkill = false;
                player.MP -= 5;

                return {
                    damage,
                    isCritical: isCrit,
                    isEvaded: false,
                    log: `🔪 ${player.name} threw a knife dealing ${damage} damage.${isCrit ? " (Critical!)" : ""}`,
                    updatedEnemy: { ...enemy, HP: Math.max(0, enemy.HP - damage) },
                    enemyStunned: false,
                    autoDodge: isBoosted,
                };
            },
        },
        {
            name: "Stealth Preparation",
            description: "Next skill: +%50 crit & guaranteed dodge.",
            manaCost: 8,
            cooldown: 5,
            isPermanent: false,
            availableLevel: 2,
            target: "self",
            execute: (player, enemy) => {
                (player as any).boostNextSkill = true;

                return {
                    damage: 0,
                    isCritical: false,
                    isEvaded: false,
                    log: `🎭 ${player.name} vanished into shadows. Next skill: guaranteed dodge + 50% crit boost.`,
                    updatedEnemy: { ...enemy },
                    enemyStunned: false,
                    autoDodge: false,
                };
            },
        },
        {
            name: "Dodging Ambush",
            description: "Dex based damage + guaranteed dodge. Crit: 2x.",
            manaCost: 14,
            cooldown: 6,
            isPermanent: false,
            availableLevel: 3,
            target: "enemy",
            execute: (player, enemy) => {
                const isBoosted = (player as any).boostNextSkill;
                const critChance = isBoosted ? 0.7 : 0.2;
                const isCrit = Math.random() < critChance;
                const variance = randomVariance();
                const base = player.dexterity * 1.7;
                const damage = Math.floor(base * (isCrit ? 2 : 1) * variance);

                if (isBoosted) (player as any).boostNextSkill = false;
                player.MP -= 14;

                return {
                    damage,
                    isCritical: isCrit,
                    isEvaded: false,
                    log: `🎯 ${player.name} performed Dodging Ambush for ${damage} damage!${isCrit ? " (Critical!)" : ""}`,
                    updatedEnemy: { ...enemy, HP: Math.max(0, enemy.HP - damage) },
                    enemyStunned: false,
                    autoDodge: true,
                };
            },
        },
    ],



    [CharacterClass.Missionary]: [
        {
            name: "Healing Shot",
            description: "Deals holy damage (INT) and restores HP (WIS). 20% crit chance: x2 damage, x1.5 healing. (Guaranteed if blessed)",
            manaCost: 10,
            cooldown: 5,
            isPermanent: true,
            availableLevel: 1,
            target: "enemy",
            execute: (player, enemy) => {
                const isGuaranteed = (player as any).guaranteeNextCrit;
                const isCrit = isGuaranteed || Math.random() < 0.2;
                const damageMultiplier = isCrit ? 2 : 1;
                const healMultiplier = isCrit ? 1.5 : 1;
                const variance = randomVariance();

                const baseDamage = player.intelligence;
                const damage = Math.floor(baseDamage * damageMultiplier * variance);
                const newEnemy = { ...enemy, HP: Math.max(0, enemy.HP - damage) };

                const maxHP = player.defence * 20;
                const baseHeal = player.wisdom;
                const heal = Math.min(Math.floor(baseHeal * healMultiplier), maxHP - player.HP);
                player.HP += heal;
                player.MP -= 10;

                if (isGuaranteed) (player as any).guaranteeNextCrit = false;

                return {
                    damage,
                    isCritical: isCrit,
                    isEvaded: false,
                    log: `🌟 ${player.name} used Healing Shot! It dealt ${damage} damage to ${enemy.name} and restored ${heal} HP.${isCrit ? " (Critical!)" : ""}`,
                    updatedEnemy: newEnemy,
                    enemyStunned: false,
                    autoDodge: false,
                };
            },
        },
        {
            name: "Divine Recovery",
            description: "Recovers 25% of max mana.",
            manaCost: 0,
            cooldown: 4,
            isPermanent: true,
            availableLevel: 1,
            target: "self",
            execute: (player, enemy) => {
                const maxMP = player.intelligence * 5;
                const boost = Math.min(Math.floor(maxMP * 0.25), maxMP - player.MP);
                player.MP += boost;
                return {
                    damage: 0,
                    isCritical: false,
                    isEvaded: false,
                    log: `🕊️ ${player.name} used Divine Recovery and regained ${boost} MP.`,
                    enemyStunned: false,
                    autoDodge: false,
                    updatedEnemy: { ...enemy },
                };
            },
        },
        {
            name: "Holy Shield",
            description: "Summons a holy shield that guarantees evasion of the next enemy attack.",
            manaCost: 15,
            cooldown: 4,
            isPermanent: false,
            availableLevel: 2,
            target: "self",
            execute: (player, enemy) => {
                player.MP -= 15;

                return {
                    damage: 0,
                    isCritical: false,
                    isEvaded: false,
                    log: `🛡️ ${player.name} summoned a Holy Light shield and will dodge the next attack!`,
                    updatedEnemy: { ...enemy },
                    enemyStunned: false,
                    autoDodge: true,
                };
            },
        },
        {
            name: "Divine Judgment",
            description: "Smite the enemy with divine force. Deals heavy wisdom-based damage. Crit: 3x damage. (Guaranteed if blessed)",
            manaCost: 12,
            cooldown: 4,
            isPermanent: false,
            availableLevel: 1,
            target: "enemy",
            execute: (player, enemy) => {
                const isGuaranteed = (player as any).guaranteeNextCrit;
                const isCrit = isGuaranteed || Math.random() < 0.2;
                const variance = randomVariance();
                const multiplier = isCrit ? 3.0 : 1.0;

                const baseDamage = player.wisdom * 1.5;
                const damage = Math.floor(baseDamage * multiplier * variance);

                const newEnemy = { ...enemy, HP: Math.max(0, enemy.HP - damage) };
                player.MP -= 12;

                if (isGuaranteed) (player as any).guaranteeNextCrit = false;

                return {
                    damage,
                    isCritical: isCrit,
                    isEvaded: false,
                    log: `⚖️ ${player.name} cast Divine Judgment and dealt ${damage} damage to ${enemy.name}!${isCrit ? " (Critical!)" : ""}`,
                    updatedEnemy: newEnemy,
                    enemyStunned: false,
                    autoDodge: false,
                };
            },
        },
        {
            name: "God Bless Us",
            description: "Grants 100% critical chance for your next skill.",
            manaCost: 30,
            cooldown: 5,
            isPermanent: true,
            availableLevel: 3,
            target: "self",
            execute: (player, enemy) => {
                (player as any).guaranteeNextCrit = true;
                player.MP -= 8;

                return {
                    damage: 0,
                    isCritical: false,
                    isEvaded: false,
                    log: `🙏 ${player.name} invoked the divine. Their next skill is guaranteed to critically strike!`,
                    updatedEnemy: { ...enemy },
                    enemyStunned: false,
                    autoDodge: false,
                };
            },
        },
    ],
};






