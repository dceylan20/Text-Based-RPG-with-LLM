// src/components/Chatbox.tsx
"use client";
import Image from "next/image";
import { useGame } from "@/context/GameContext";
import { Character, CharacterClass } from "@/lib/types/character";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { generateBattleImageFromText } from "@/lib/llm/imageGenerator";
import { useRouter } from "next/navigation";
import Head from 'next/head';
import { classSkills, Skill } from "@/lib/combat/abilities/classAbilities";


export default function GameUILayout() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState(["🧙‍♂️ Welcome to your adventure!"]);
    const [inputCounter, setInputCounter] = useState(0);
    const { playerName, sessionId, userId } = useGame();
    const [battleWinCounter, setBattleWinCounter] = useState(0);
    const [battleImageUrl, setBattleImageUrl] = useState<string | null>(null);
    const ENABLE_IMAGE = false; //image generationı kapatmak için false yapın
    const router = useRouter();
    const [showExitModal, setShowExitModal] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [storyCountSinceStart, setStoryCountSinceStart] = useState(0);
    const [storyCountSinceLastBattle, setStoryCountSinceLastBattle] = useState(0);
    const hasBattledOnce = useRef(false);
    const [inBattleMode, setInBattleMode] = useState(false);
    const [enemy, setEnemy] = useState<Character | null>(null);
    const [selectableStats, setSelectableStats] = useState<string[]>([]);
    const [skillCooldowns, setSkillCooldowns] = useState<Record<string, number>>({});
    const [finalSummary, setFinalSummary] = useState<string | null>(null);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [deathByDefeat, setDeathByDefeat] = useState(false);
    const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);



    const [scenarioId, setScenarioId] = useState<number>(() => Math.floor(Math.random() * 4) + 1);
    const [saveData, setSaveData] = useState({
        playerState: {
            HP: 100,
            MP: 50,
            level: 1,
            strength: 20,
            defence: 10,
            speed: 10,
            accuracy: 12,
            characterClass: "Warrior",
            charisma: 10,
            intelligence: 10,
            wisdom: 10,
            dexterity: 10,
        },
        scenarioId: scenarioId,
        currentStory: "",
        lastAction: "",
        currentBattle: null,
    });

    const [inventory, setInventory] = useState([
        { name: "Health Potion", icon: "/health-potion-icon.png", count: 1 },
        { name: "Mana Potion", icon: "/mana-potion-icon.png", count: 1 },
    ]);
    const exitModalMessage =
        inBattleMode && enemy
            ? "If you exit now, you will forfeit the current battle, and it will be considered a loss. Are you sure you want to exit?"
            : "Your progress is automatically saved. Are you sure you want to exit the current adventure?";


    const [equipment, setEquipment] = useState<EquipmentItem[]>([]);



    const [isFirstTurn, setIsFirstTurn] = useState(true);
    const [isGameOver, setIsGameOver] = useState(false);
    const hasStartedStory = useRef(false);
    const storyBoxRef = useRef<HTMLDivElement>(null);



    const defaultCharacter: Character = {
        name: "Hero",
        characterClass: CharacterClass.Warrior,
        level: 1,
        HP: 100,
        MP: 50,
        accuracy: 10,
        speed: 10,
        defence: 10,
        strength: 10,
        dexterity: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
        constitution: 10,
        spirit: 10,
        agility: 10,
        equipment: [],
        currentExp: 0,
    };
    const [player, setPlayer] = useState<Character>(defaultCharacter);

    const availableSkills: Skill[] = (classSkills[player.characterClass] || []).filter(
        (s) => !s.availableLevel || s.availableLevel <= player.level
    );
    // arayüzden hero'yu backend'e bağla
    useEffect(() => {
        async function loadPlayer() {
            if (!sessionId) return;

            try {
                const res = await fetch(`/api/player?sessionId=${sessionId}`);
                const data = await res.json();

                if (res.ok) {
                    setPlayer({
                        name: data.nickname,
                        characterClass: data.class,
                        level: data.lvl,
                        HP: data.hp,
                        MP: data.mana,
                        speed: data.speed,
                        defence: data.defence,
                        intelligence: data.intelligence,
                        dexterity: data.dexterity,
                        charisma: data.charisma,
                        wisdom: data.wisdom,
                        strength: data.strength,
                        accuracy: data.accuracy ?? 12,
                        constitution: 10,
                        spirit: 10,
                        agility: 10,
                        equipment: [],
                        currentExp: data.currentExp ?? 0,
                    });
                    setEquipment(JSON.parse(data.equipment ?? "[]"));
                } else {
                    console.error("❌ Failed to load player:", data.error);
                }
            } catch (err) {
                console.error("❌ Player fetch error:", err);
            }
        }

        loadPlayer();
    }, [sessionId]);

    function reduceCooldowns(prevCooldowns: Record<string, number>) {
        const newCooldowns: Record<string, number> = {};
        Object.entries(prevCooldowns).forEach(([name, turns]) => {
            if (turns > 1) newCooldowns[name] = turns - 1;
        });
        return newCooldowns;
    }



    useEffect(() => {
        if (isFirstTurn && !hasStartedStory.current) {
            hasStartedStory.current = true;
            const introPrompt = getScenarioIntroPrompt(scenarioId);

            const sendIntro = async () => {
                let fullText = "";
                try {
                    const response = await fetch("/api/intro", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ scenarioId }),
                    });

                    const reader = response.body?.getReader();
                    const decoder = new TextDecoder("utf-8");
                    let buffer = "🤖 Game: ";

                    setMessages((prev) => [...prev, buffer]);

                    if (reader) {
                        while (true) {
                            const { value, done } = await reader.read();
                            if (done) break;

                            const chunk = decoder.decode(value, { stream: true });
                            buffer += chunk;
                            fullText += chunk;

                            setMessages((prev) => {
                                const updated = [...prev];
                                updated[updated.length - 1] = buffer;
                                return updated;
                            });
                        }
                    }
                    //  Hikaye tamamen yüklendiyse, kullanıcı artık input yazabilir
                    setIsFirstTurn(false);

                    console.log(" Full intro:", fullText);

                    // Görsel üretme kısmı
                    if (ENABLE_IMAGE) {
                        try {
                            const imageRes = await generateBattleImageFromText(fullText);
                            if (imageRes) {
                                console.log("🎨 Intro image generated:", imageRes);
                                setBattleImageUrl(imageRes);
                            } else {
                                console.warn("⚠️ Image generation returned null");
                            }
                        } catch (imgErr) {
                            console.error("❌ Image generation error:", imgErr);
                        }
                    }
                    setSaveData((prev) => ({
                        ...prev,

                        currentStory: prev.currentStory + "\n" + fullText,
                    }));
                    
                } catch (error) {
                    console.error("❌ Failed to load intro story:", error);
                    setMessages((prev) => [...prev, "❌ Failed to load story."]);
                    setSaveData((prev) => ({
                        ...prev,

                        currentStory: prev.currentStory + "\n" + fullText,
                    }));
                    setIsFirstTurn(false);
                }
            };


            sendIntro().catch(() => {
                const fullText = ""; // Ensure fullText is defined here
                setMessages((prev) => [...prev, "❌ Failed to load story."]);
                setSaveData((prev) => ({
                    ...prev,
                    currentStory: prev.currentStory + "\n" + fullText,
                }));

                setIsFirstTurn(false);
            });
        }
    }, [isFirstTurn]);

    useEffect(() => {
        if (storyBoxRef.current) {
            storyBoxRef.current.scrollTop = storyBoxRef.current.scrollHeight;
        }
    }, [messages]);


    
    useEffect(() => {
      if (!player || !sessionId || !userId) return;
      if (player.name === "Hero") return;
    
      const saveInventory = async () => {
        console.log("📦 Saving to DB:", inventory);
    
        await fetch("/api/player", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            equipment,
            inventory,
            sessionId,
            userId,
            ...player,
          }),
        });
    
        console.log("✅ Inventory auto-saved.");
        console.log("📦 current inventory", inventory);
        console.log("📦 current player", player);

      };
    
      saveInventory();
    }, [inventory]);

    useEffect(() => {
      if (!player || !sessionId || !userId) return;
      if (player.name === "Hero") return;
    
      const saveEquipment = async () => {
        await fetch("/api/player", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...player,
            equipment,
            sessionId,
            userId,
          }),
        });
    
        console.log("🛡️ Equipment auto-saved.");
      };
    
      saveEquipment();
    }, [equipment]);
    


    const sendMessage = async (
        forcedInput?: string,
        options?: { silent?: boolean; forceLLM?: boolean }
    ) => {
        const actualInput = forcedInput ?? input.trim();
        setInput("");
        setInputCounter((prev) => prev + 1);

        if (isGameOver || !actualInput) return;
        if (!options?.silent) setMessages((prev) => [...prev, `👤 ${actualInput}`]);

        const lowerInput = actualInput.toLowerCase();
        if (lowerInput === "use health potion") {
            usePotion("Health Potion", player, setPlayer, setMessages, inventory, setInventory);
            return;
        }
        if (lowerInput === "use mana potion") {
            usePotion("Mana Potion", player, setPlayer, setMessages, inventory, setInventory);
            return;
        }

        // 👇 Savaş modunda ama enemy henüz oluşmamışsa bekle
        if (inBattleMode && !enemy) {
            setMessages((prev) => [...prev, "⏳ Enemy is preparing... try again in a moment."]);
            return;
        }

        // 👇 Normal savaş inputu
        if (inBattleMode && !options?.forceLLM) {
            await handleBattleTurn(actualInput);
            return;
        }

        try {
            const response = await fetch("/api/game", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ playerAction: actualInput, saveData }),
            });
            console.log("📦 Sent saveData to LLM:", JSON.stringify(saveData, null, 2));

            const reader = response.body?.getReader();
            const decoder = new TextDecoder("utf-8");

            let fullText = "";
            let messageBuffer = "🤖 Game: ";
            setMessages((prev) => [...prev, messageBuffer]);

            let isBattleStart = false;
            let llmEnemyName: string | null = null;

            if (reader) {
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    fullText += chunk;
                    messageBuffer += chunk;

                    setMessages((prev) => {
                        const updated = [...prev];
                        updated[updated.length - 1] = messageBuffer;
                        return updated;
                    });
                }

                const BATTLE_TOKEN_REGEX = /\[BATTLE_START(?::\s*(.+?))?\]/;
                const match = fullText.match(BATTLE_TOKEN_REGEX);
                isBattleStart = !!match;
                llmEnemyName = match?.[1]?.trim() || null;
                console.log("⚠️ LLM Battle Token Match:", match);
            }

            setStoryCountSinceStart((prev) => prev + 1);
            if (hasBattledOnce.current) {
                setStoryCountSinceLastBattle((prev) => prev + 1);
            }

            const cleanedResponse = fullText.replace("[BATTLE_START]", "");

            if (fullText.includes("[BATTLE_START]")) {
                const cleanedResponse = fullText.replace("[BATTLE_START]", "");

                // LLM mesajını yaz
                setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = "🤖 Game: " + cleanedResponse;
                    return updated;
                });



                // Battle kısıtlaması (opsiyonel, istersen tutabilirsin)
                if (!hasBattledOnce.current && storyCountSinceStart < 1) return;
                if (hasBattledOnce.current && storyCountSinceLastBattle < 1) return;
                setInBattleMode(true);
                // Eğer düşman daha önce oluşturulmadıysa, şimdi oluştur
                if (!enemy) {
                    try {
                        const res = await fetch("/api/enemy", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ scenarioId, player }),
                        });

                        const newEnemy = await res.json();
                        setEnemy({
                            ...newEnemy,
                            maxHP: newEnemy.HP, //  HP'nin ilk halini maxHP olarak saklıyoruz
                        });
                        setMessages((prev) => [
                            ...prev,
                            `⚔️ War is started! Enemy: **${newEnemy.name}**`,
                        ]);
                    } catch (err) {
                        console.error("❌ Enemy creation failed:", err);
                        setMessages((prev) => [...prev, "❌ Failed to create enemy."]);
                        return;
                    }
                }

                if (ENABLE_IMAGE) {
                    const imageUrl = await generateBattleImageFromText(cleanedResponse);
                    if (imageUrl) setBattleImageUrl(imageUrl);
                }

                hasBattledOnce.current = true;
                setStoryCountSinceLastBattle(0);
                return;
            }
            if (fullText.includes("[ITEM_FOUND:")) {
                const match = fullText.match(/\[ITEM_FOUND:\s*(.+?)\]/);
                if (match) {
                    const type = match[1].trim().toLowerCase();

                    const typeToCategoryMap = {
                        sword: "weapon",
                        armor: "armor",
                        robe: "robe",
                    } as const;

                    const category = typeToCategoryMap[type as keyof typeof typeToCategoryMap];
                    if (!category) return;

                    const ownedOfType = equipment
                        .filter((e) => e.type === category)
                        .map((e) => e.name);

                    const progressionChains: Record<string, string[]> = {
                        weapon: ["Wooden Sword", "Steel Sword", "Flaming Sword"],
                        armor: ["Leather Armor", "Chainmail Armor", "Dragon Armor"],
                        robe: ["Cloth Robe", "Wizard's Robe", "Enchanted Robe"],
                    };

                    const chain = progressionChains[category];
                    let toGive = chain[0];

                    for (let i = 0; i < chain.length; i++) {
                        if (!ownedOfType.includes(chain[i])) {
                            toGive = chain[i];
                            break;
                        }
                        if (i === chain.length - 1) {
                            toGive = chain[i];
                        }
                    }

                    fullText = fullText.replace(match[0], `[ITEM_FOUND: ${toGive}]`);
                    const newItem = getEquipmentByName(toGive);
                    if (messages.some((m) => m.includes(`🪙 You found a **${newItem.name}**`))) return;


                    const statDesc = Object.entries(newItem.statBoosts)
                        .map(([stat, value]) => {
                            const base = Number(player[stat as keyof Character]) || 1;
                            const percent = Math.floor((value! / base) * 100);
                            return `+${value} ${stat} (${percent}% boost)`;
                        })
                        .join(", ");

                    setEquipment((prev) => {
                        const exists = prev.find((e) => e.name === newItem.name);

                        if (!exists) {
                            setPlayer((p) => {
                                const updated = { ...p };
                                for (const stat in newItem.statBoosts) {
                                    const s = stat as BoostableStat;
                                    updated[s] += newItem.statBoosts[s] ?? 0;
                                }
                                return updated;
                            });

                            setMessages((prev) => {
                                if (prev.some((m) => m.includes(`🪙 You found a **${newItem.name}**`))) return prev;
                                return [
                                    ...prev,
                                    `🪙 You found a **${newItem.name}** during exploration!`,
                                    `🧠 It boosts your stats: ${statDesc}`,
                                ];
                            });

                            return [...prev, { ...newItem, owned: true }];
                        }

                        const nextName = equipmentProgressionMap[exists.name];
                        if (!nextName) return prev;

                        const upgraded = getEquipmentByName(nextName);

                        setPlayer((p) => {
                            const updated = { ...p };
                            for (const stat in exists.statBoosts) {
                                const s = stat as BoostableStat;
                                updated[s] -= exists.statBoosts[s] ?? 0;
                            }
                            for (const stat in upgraded.statBoosts) {
                                const s = stat as BoostableStat;
                                const base = upgraded.statBoosts[s] ?? 0;
                                const bonus = Math.floor(base * 0.1);
                                updated[s] += base + bonus;
                            }
                            return updated;
                        });

                        const upgradeDesc = Object.entries(upgraded.statBoosts)
                            .map(([stat, value]) => `+${value} ${stat}`)
                            .join(", ");

                        setMessages((prev) => [
                            ...prev,
                            `🔥 Your **${exists.name}** has evolved into **${upgraded.name}** with enhanced power!`,
                            `🛡️ New bonuses: ${upgradeDesc}`,
                        ]);

                        return prev.map((e) =>
                            e.name === exists.name ? { ...upgraded, owned: true } : e
                        );
                    });
                }
            }





            setSaveData((prev) => ({
                ...prev,
                lastAction: actualInput,
                currentStory: prev.currentStory + "\n" + cleanedResponse,
            }));

            await fetch("/api/memory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    sessionId,
                    message: `👤 ${actualInput}\n🤖 Game: ${cleanedResponse}`,
                }),
            });




            // ⚔️ Savaş başlatma
            setStoryCountSinceStart((prev) => prev + 1);
            if (hasBattledOnce.current) setStoryCountSinceLastBattle((prev) => prev + 1);

            if (isBattleStart) {
                if (!hasBattledOnce.current && storyCountSinceStart < 1) return;
                if (hasBattledOnce.current && storyCountSinceLastBattle < 1) return;

                setInBattleMode(true);
                hasBattledOnce.current = true;
                setStoryCountSinceLastBattle(0);

                try {
                    const url = llmEnemyName ? "/api/enemy/by-name" : "/api/enemy";
                    const body = llmEnemyName
                        ? { name: llmEnemyName }
                        : { scenarioId, player };

                    const res = await fetch(url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                    });

                    const newEnemy = await res.json();
                    setEnemy({ ...newEnemy, maxHP: newEnemy.HP });

                    setMessages((prev) => [
                        ...prev,
                        `⚔️ War is started! Enemy: **${newEnemy.name}**`,
                    ]);

                    if (ENABLE_IMAGE) {
                        const imageUrl = await generateBattleImageFromText(cleanedResponse);
                        if (imageUrl) setBattleImageUrl(imageUrl);
                    }
                } catch (err) {
                    console.error("❌ Enemy creation failed:", err);
                    setMessages((prev) => [...prev, "❌ Failed to create enemy."]);
                }
            }
        } catch (err) {
            console.error("❌ sendMessage error:", err);
            setMessages((prev) => [...prev, "❌ Could not fetch response"]);
        }
    };






    const handleBattleTurn = async (command: string) => {
        if (!player || !enemy) {
            setMessages((prev) => [...prev, "❌ Error: Missing player or enemy data."]);
            return;
        }

        // Eğer komut "use SkillName" ise beceriyi bul ve çalıştır
        if (command.toLowerCase().startsWith("use ")) {
            const skillName = command.substring(4).trim(); // "use Fireball" -> "Fireball"
            const skills = classSkills[player.characterClass] || [];
            const skill = skills.find((s) => s.name.toLowerCase() === skillName.toLowerCase());

            if (!skill) {
                setMessages((prev) => [...prev, `❌ Skill '${skillName}' not found for your class.`]);
                return;
            }

            if (skillCooldowns[skill.name] > 0) {
                setMessages((prev) => [...prev, `⏳ ${skill.name} is on cooldown (${skillCooldowns[skill.name]} turns left).`]);
                return;
            }


            if (player.MP < skill.manaCost) {
                setMessages((prev) => [...prev, `💧 Not enough MP to use ${skill.name}.`]);
                return;
            }
            setSkillCooldowns((prev) => reduceCooldowns(prev));

            // execute fonksiyonunu çağır
            const result = skill.execute(player, enemy);

            const updatedEnemy = result.updatedEnemy;

            // Güncel log'u göster
            setMessages((prev) => [...prev, result.log]);

            // Oyuncu ve düşmanı güncelle
            setPlayer({ ...player });
            setEnemy(updatedEnemy);

            // Burada zafer/yok oluş kontrolü yapılabilir

            // Karşı saldırı burada kontrol edilmeli:
            const enemyCanAttack = !result.enemyStunned;
            const playerCanAutoDodge = !!result.autoDodge;

            if (enemyCanAttack) {
                const enemyDamage = Math.max(1, Math.floor(enemy.strength*1.5 - player.defence/2));
                const finalDamage = playerCanAutoDodge ? 0 : enemyDamage;

                setMessages((prev) => [
                    ...prev,
                    `👹 ${enemy.name} strikes back for ${finalDamage} damage!${playerCanAutoDodge ? " (Missed due to dodge!)" : ""}`,
                ]);
                setPlayer((prev) => ({ ...prev, HP: Math.max(0, prev.HP - finalDamage) }));

                if (player.HP - finalDamage <= 0) {
                    setMessages((prev) => [...prev, "💀 You have been defeated. GAME OVER."]);
                    setIsGameOver(true);
                    setInBattleMode(false);
                    setDeathByDefeat(true);
                }

                if (updatedEnemy.HP <= 0) {
                    setMessages((prev) => [...prev, `🏆 You have defeated **${updatedEnemy.name}**!`]);
                    setInBattleMode(false);

                    const newCounter = battleWinCounter + 1;
                    setBattleWinCounter(newCounter);

                    if (newCounter >= 4) {
                        setMessages((prev) => [...prev, "🏆 You have completed your adventure!"]);

                        try {
                             const memoryRes = await fetch(`/api/memory?userId=${userId}&sessionId=${sessionId}`);
                             const memoryJson = await memoryRes.json();
                             const memoryLog = memoryJson.memory?.map((m: any) => m.LLMmemory).join("\n") || "";
                             console.log("savedatraaaaaa", saveData); 

                             const summaryRes = await fetch("/api/story-summary", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ saveData }),
                                });
                
                            const summaryData = await summaryRes.json();
                            setFinalSummary(summaryData.summary);
                        } catch (err) {
                            console.error("❌ Failed to generate final summary:", err);
                            setFinalSummary("⚠️ Could not generate a final story summary.");
                        }
                        setShowSummaryModal(true); 
                        setIsGameOver(true); 
                        return;
                    }
                                        // 🎯 XP Gain (same as attack path)
                    const levelDifference = Math.max(0, enemy.level - player.level);
                    const gainedXP = Math.floor((1 + (levelDifference + 4) * 5));

                    let newLevel = player.level;
                    let newXP = (player.currentExp || 0) + gainedXP;
                    const levelThresholds = [0, 20, 50, 100, 200, 350];

                    while (newLevel < levelThresholds.length - 1 && newXP >= levelThresholds[newLevel]) {
                        newLevel++;
                        setSelectableStats(["Strength", "Defence", "Speed", "Dexterity", "Wisdom", "Charisma", "Intelligence"]);
                        setMessages((prev) => [...prev, "🟢 Level up! Choose one stat to boost by an extra 40%!"]);
                    }

                    const statMultiplier = newLevel > player.level ? 1.5 : 1;

                    setPlayer((prev) => ({
                        ...prev,
                        currentExp: newXP,
                        level: newLevel,
                        strength: Math.ceil(prev.strength * statMultiplier),
                        defence: Math.ceil(prev.defence * statMultiplier),
                        speed: Math.ceil(prev.speed * statMultiplier),
                        dexterity: Math.ceil(prev.dexterity * statMultiplier),
                        intelligence: Math.ceil(prev.intelligence * statMultiplier),
                        wisdom: Math.ceil(prev.wisdom * statMultiplier),
                        charisma: Math.ceil(prev.charisma * statMultiplier),
                        HP: Math.ceil(prev.HP * statMultiplier),
                        MP: Math.ceil(prev.MP * statMultiplier),
                    }));

                    const newlyUnlockedSkills = (classSkills[player.characterClass] || []).filter(
                        (s) => s.availableLevel > player.level && s.availableLevel <= newLevel
                    );
                    if (newlyUnlockedSkills.length > 0) {
                        setMessages((prev) => [
                        ...prev,
                        ...newlyUnlockedSkills.map((s) => `✨ New skill unlocked: **${s.name}**!`),
                        ]);
                    }

                    setMessages((prev) => [
                        ...prev,
                        `📈 You gained **${gainedXP} XP**!`,
                        ...(newLevel > player.level ? [`🎉 You leveled up to **Level ${newLevel}**!`] : []),
                    ]);

                    const rewards = getBattleRewards();
        
                    for (const reward of rewards) {
                        if (reward.type === "potion") {
                            const updatedInventory = inventory.some((i) => i.name === reward.item.name)
                                ? inventory.map((i) =>
                                    i.name === reward.item.name
                                        ? { ...i, count: i.count + 1 }
                                        : i
                                )
                                : [...inventory, reward.item];
            
                            setInventory(updatedInventory);
                            setMessages((prev) => [
                                ...prev,
                                `🎁 After the battle, you found a **${reward.item.name}**!`,
                            ]);
                        } else if (reward.type === "equipment") {
                            // Equipment drop sistemini kullan
                            await handleEquipmentDrop(reward.equipmentType, equipment, setEquipment, setPlayer, setMessages);
                        }
                    }

                    const battleSummary = `
                        The player has fought bravely and defeated the enemy.
                        Here is what happened during the battle:
                        ${result.log}

                        Now, using this information, narrate the aftermath naturally.
                        Do not copy or list the combat log directly; instead, weave it into the story.
                    `;

                    await narrateVictoryAfterBattle(battleSummary, setEnemy, sendMessage);
                    return;
                }

            } else {
                setMessages((prev) => [...prev, `😵 ${enemy.name} is stunned and can't attack this turn.`]);
            }
            return;
        }

        try {
            const res = await fetch("/api/combat-turn", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ player, enemy, command }),
            });

            const data = await res.json();
            setMessages((prev) => [...prev, ...data.combatLog]);
            setPlayer(data.updatedPlayer);
            setEnemy(data.updatedEnemy);

            await fetch("/api/player", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data.updatedPlayer,
                    sessionId,
                    userId,
                }),
            });


            if (player.name === "Hero") {
                console.warn("⏳ Skipping save: defaultCharacter detected, not saving to DB.");
                return;
            }


            if (data.winner === "enemy") {
                setMessages((prev) => [...prev, "💀 You have been defeated. GAME OVER."]);
                setIsGameOver(true);
                setInBattleMode(false);
                setDeathByDefeat(true);
                return;
            }

            setSkillCooldowns((prev) => reduceCooldowns(prev));


            if (data.winner === "player") {

                // 🎯 XP Gain
                const levelDifference = Math.max(0, enemy.level - player.level);
                const gainedXP = Math.floor((1 + (levelDifference + 4) * 5));

                let newLevel = player.level;
                let newXP = (player.currentExp || 0) + gainedXP;

                //  XP Thresholds (you can later refactor this as a separate function)
                const levelThresholds = [0, 20, 50, 100, 200, 350]; // Add more as needed

                //  Level Up Check
                while (newLevel < levelThresholds.length - 1 && newXP >= levelThresholds[newLevel]) {
                    newLevel++;
                    setSelectableStats(["Strength", "Defence", "Speed", "Dexterity", "Wisdom", "Charisma", "Intelligence"]);
                    setMessages((prev) => [...prev, "🟢 Level up! Choose one stat to boost by an extra 40%!"]);
                }

                //  %20 Stat Increase (only if leveled up)
                const statMultiplier = newLevel > player.level ? 1.5 : 1;

                // Update player state locally
                setPlayer((prev) => ({
                    ...prev,
                    currentExp: newXP,
                    level: newLevel,
                    strength: Math.ceil(prev.strength * statMultiplier),
                    defence: Math.ceil(prev.defence * statMultiplier),
                    speed: Math.ceil(prev.speed * statMultiplier),
                    dexterity: Math.ceil(prev.dexterity * statMultiplier),
                    intelligence: Math.ceil(prev.intelligence * statMultiplier),
                    wisdom: Math.ceil(prev.wisdom * statMultiplier),
                    charisma: Math.ceil(prev.charisma * statMultiplier),
                    HP: Math.ceil(prev.HP * statMultiplier),
                    MP: Math.ceil(prev.MP * statMultiplier),
                }));

                const newlyUnlockedSkills = (classSkills[player.characterClass] || []).filter(
                    (s) => s.availableLevel > player.level && s.availableLevel <= newLevel
                );

                if (newlyUnlockedSkills.length > 0) {
                    setMessages((prev) => [
                        ...prev,
                        ...newlyUnlockedSkills.map((s) => `✨ New skill unlocked: **${s.name}**!`),
                    ]);
                }

                setMessages((prev) => [
                    ...prev,
                    `📈 You gained **${gainedXP} XP**!`,
                    ...(newLevel > player.level ? [`🎉 You leveled up to **Level ${newLevel}**!`] : []),
                ]);
                setInBattleMode(false);
                const newCounter = battleWinCounter + 1;
                setBattleWinCounter(newCounter);

                // item düşme
                const rewards = getBattleRewards();
                let updatedInventory = inventory;
                for (const reward of rewards) {
                  if (reward.type === "potion") {
                    updatedInventory = updatedInventory.some((i) => i.name === reward.item.name)
                    ? updatedInventory.map((i) =>
                        i.name === reward.item.name
                            ? { ...i, count: i.count + 1 }
                            : i
                    )
                    : [...updatedInventory, reward.item];
        
                    setInventory(updatedInventory);
                    setMessages((prev) => [
                          ...prev,
                          `🎁 After the battle, you found a **${reward.item.name}**!`,
                      ]);
                  } else if (reward.type === "equipment") {
                      // Equipment drop sistemini simulate et
                      await handleEquipmentDrop(reward.equipmentType, equipment, setEquipment, setPlayer, setMessages);
                  }
                }

                if (player.name === "Hero") {
                    console.warn("⏳ Skipping save: defaultCharacter detected, not saving to DB.");
                    return;
                }

                //  DB'ye güncel inventory ile kaydet
                await fetch("/api/player", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...data.updatedPlayer,
                        inventory: updatedInventory,
                        sessionId,
                        userId,
                    }),
                });


                if (newCounter >= 4) {
                    setMessages((prev) => [...prev, "🏆 You have completed your adventure!"]);

                    try {
                        const memoryRes = await fetch(`/api/memory?userId=${userId}&sessionId=${sessionId}`);
                        const memoryJson = await memoryRes.json();
                        const memoryLog = memoryJson.memory?.map((m: any) => m.LLMmemory).join("\n") || "";

                        const summaryRes = await fetch("/api/story-summary", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ saveData }),

                        });

                        const summaryData = await summaryRes.json();
                        setFinalSummary(summaryData.summary);
                        setShowSummaryModal(true);
                    } catch (err) {
                        console.error("❌ Failed to generate final summary:", err);
                        setFinalSummary("⚠️ Could not generate a final story summary.");
                        setShowSummaryModal(true);
                    }

                    setIsGameOver(true);
                    return;
                }


                setSaveData((prev) => ({
                    ...prev,

                    playerState: {
                        ...prev.playerState,
                        HP: data.updatedPlayer.HP,
                        MP: data.updatedPlayer.MP,
                        level: data.updatedPlayer.level,
                        strength: data.updatedPlayer.strength,
                        defence: data.updatedPlayer.defence,
                        speed: data.updatedPlayer.speed,
                        accuracy: data.updatedPlayer.accuracy,
                        characterClass: data.updatedPlayer.characterClass,
                        charisma: data.updatedPlayer.charisma,
                        intelligence: data.updatedPlayer.intelligence,
                        wisdom: data.updatedPlayer.wisdom,
                        dexterity: data.updatedPlayer.dexterity,
                    },
                }));

                const battleSummary = `
            The player has fought bravely and defeated the enemy.
            Here is what happened during the battle:
            ${data.combatLog.join("\n")}
    
            Now, using this information, narrate the aftermath naturally.
            Do not copy or list the combat log directly; instead, weave it into the story.
          `;
                await narrateVictoryAfterBattle( battleSummary, setEnemy, sendMessage);



                /*
                //  Cooldown'ları 1 azalt
                const newCooldowns: Record<string, number> = {};
                Object.entries(skillCooldowns).forEach(([name, turns]) => {
                    if (turns > 1) newCooldowns[name] = turns - 1;
                });
                setSkillCooldowns(newCooldowns);
  
                */
            }
        } catch (err) {
            console.error("❌ Battle turn error:", err);
            setMessages((prev) => [...prev, "❌ Failed to process battle turn."]);
        }
    };

    const handleSkillClick = async (skill: Skill) => {
        if (player.MP < skill.manaCost) {
            setMessages((prev) => [...prev, `🛑 Not enough mana to use ${skill.name}`]);
            return;
        }
        if (skillCooldowns[skill.name] > 0) {
            setMessages((prev) => [...prev, `⏳ ${skill.name} is on cooldown (${skillCooldowns[skill.name]} turns left).`]);
            return;
        }

        // cooldown başlat
        setSkillCooldowns((prev) => ({ ...prev, [skill.name]: skill.cooldown }));

        // battle komutu çalıştır
        await handleBattleTurn(`use ${skill.name}`);
    };


    const displayList = getDisplayEquipmentList(equipment);
    return (
        <>
            <Head>
                <style jsx global>{`
            html {
              font-size: clamp(7px, 1.3vmin, 15px);
            }
          `}</style>
            </Head>
            <div className="h-screen w-full flex flex-col overflow-hidden bg-[url('/arkaplan_duz.png')] bg-cover bg-center text-[#5a3e2b] flex flex-col p-2 sm:p-4" style={{ fontFamily: "'Caudex', serif" }}>
                <div className="w-full flex-1 min-h-0 mx-auto flex flex-col gap-2 sm:gap-4">
                    {/* Navbar*/}
                    <div className="flex justify-between items-center bg-[#f7dfba] rounded-lg border-2 border-[#7a4e2d] min-h-[6rem] sm:min-h-[7.5rem] shadow-md py-0.5 px-1 sm:px-2 sm:py-1 mx-auto w-full">

                        {/* Sol: Karakter Bilgileri */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 p-1 overflow-hidden ">
                            <div className="w-[3.5rem] h-[3.5rem] sm:w-[4.5rem] sm:h-[4.5rem] rounded-full border-2 border-[#7a4e2d] shadow-md overflow-hidden relative flex-shrink-0">
                                <Image
                                    src={getClassImage(player?.characterClass)}
                                    alt="Profile"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex flex-col leading-tight text-xs sm:text-sm">
                                <h2 className="text-base sm:text-lg font-bold text-[#5a3e2b]">{playerName}</h2>
                                <h3 className="font-bold break-all">Session: {sessionId}</h3>
                                <p className="text-sm sm:text-base text-[#5a3e2b]">
                                    Level: {player?.level}{' '}
                                    {player?.level && player.level > 0 ? '⭐'.repeat(player.level) : ''}
                                </p>
                            </div>
                        </div>


                        {/* Orta: Statlar, Ekipman, Envanter */}

                        <div className="flex items-center justify-center gap-x-2 sm:gap-x-3 flex-grow px-1 mx-1 sm:mx-2 min-w-[12.5rem] sm:min-w-[18.75rem] mt-1 sm:mt-2 ">  {/* overflow-x-auto overflow-y-visible yazarsak üst üste binme sorunu çözülür ama tooltipler dikeyde kırpıldığı için tam gözükmüyor  */}
                            {/* Grup 1: Statlar */}

                            <div className="flex flex-nowrap justify-center items-center gap-x-1 sm:gap-x-1.5 md:gap-x-2 pt-1 pb-4 scrollbar-thin scrollbar-thumb-[#5a3e2b] scrollbar-track-[#e4c9a5]"> {/* şu anda scrollbar çalışmıyor üstte overflow-x-auto yapmadığım için*/}
                                <StatBox label="HP" value={player?.HP || 0} highlight={selectableStats.includes("HP")} onClick={() => { if (selectableStats.includes("HP")) { setPlayer((prev) => ({ ...prev, HP: Math.floor(prev.HP * 1.4) })); setSelectableStats([]); setMessages((prev) => [...prev, `❤️ HP boosted!`]); } }} />
                                <StatBox label="MP" value={player?.MP || 0} highlight={selectableStats.includes("MP")} onClick={() => { if (selectableStats.includes("MP")) { setPlayer((prev) => ({ ...prev, MP: Math.floor(prev.MP * 1.4) })); setSelectableStats([]); setMessages((prev) => [...prev, `🔋 MP boosted!`]); } }} />
                                <StatBox label="Speed" value={player?.speed || 0} highlight={selectableStats.includes("Speed")} onClick={() => { if (selectableStats.includes("Speed")) { setPlayer((prev) => ({ ...prev, speed: Math.floor(prev.speed * 1.4) })); setSelectableStats([]); setMessages((prev) => [...prev, `⚡ Speed boosted!`]); } }} />
                                <StatBox label="Defence" value={player?.defence || 0} highlight={selectableStats.includes("Defence")} onClick={() => { if (selectableStats.includes("Defence")) { setPlayer((prev) => ({ ...prev, defence: Math.floor(prev.defence * 1.4) })); setSelectableStats([]); setMessages((prev) => [...prev, `🛡️ Defence boosted!`]); } }} />
                                <StatBox label="Charisma" value={player?.charisma || 0} highlight={selectableStats.includes("Charisma")} onClick={() => { if (selectableStats.includes("Charisma")) { setPlayer((prev) => ({ ...prev, charisma: Math.floor(prev.charisma * 1.4) })); setSelectableStats([]); setMessages((prev) => [...prev, `💫 Charisma boosted!`]); } }} />
                                <StatBox label="Intelligence" value={player?.intelligence || 0} highlight={selectableStats.includes("Intelligence")} onClick={() => { if (selectableStats.includes("Intelligence")) { setPlayer((prev) => ({ ...prev, intelligence: Math.floor(prev.intelligence * 1.4) })); setSelectableStats([]); setMessages((prev) => [...prev, `🧠 Intelligence boosted!`]); } }} />
                                <StatBox label="Wisdom" value={player?.wisdom || 0} highlight={selectableStats.includes("Wisdom")} onClick={() => { if (selectableStats.includes("Wisdom")) { setPlayer((prev) => ({ ...prev, wisdom: Math.floor(prev.wisdom * 1.4) })); setSelectableStats([]); setMessages((prev) => [...prev, `📖 Wisdom boosted!`]); } }} />
                                <StatBox label="Dexterity" value={player?.dexterity || 0} highlight={selectableStats.includes("Dexterity")} onClick={() => { if (selectableStats.includes("Dexterity")) { setPlayer((prev) => ({ ...prev, dexterity: Math.floor(prev.dexterity * 1.4) })); setSelectableStats([]); setMessages((prev) => [...prev, `🎯 Dexterity boosted!`]); } }} />
                                <StatBox label="Strength" value={player?.strength || 0} highlight={selectableStats.includes("Strength")} onClick={() => { if (selectableStats.includes("Strength")) { setPlayer((prev) => ({ ...prev, strength: Math.floor(prev.strength * 1.4) })); setSelectableStats([]); setMessages((prev) => [...prev, `💪 Strength boosted!`]); } }} />
                            </div>

                            {/* Grup 2: ekipmanlar */}
                            <div className="flex flex-nowrap justify-center items-center gap-x-1 sm:gap-x-1.5 md:gap-x-2 pt-1 pb-4  scrollbar-thin scrollbar-thumb-[#5a3e2b] scrollbar-track-[#e4c9a5]">
                                {displayList.map((item) => (<ItemBox key={item.name} iconSrc={item.icon} name={item.name} owned={item.owned} />))}
                                {inventory.map((item) => (<ItemBox key={item.name} iconSrc={item.icon} name={item.name} owned={item.count > 0} count={item.count} onClick={() => { if (!player) return; if (item.name === "Health Potion" || item.name === "Mana Potion") { usePotion(item.name as "Health Potion" | "Mana Potion", player, setPlayer, setMessages, inventory, setInventory); } }} />))}
                            </div>
                        </div>

                        {/* Sağ: Nasıl oynanır ve Exit*/}
                        <div className="flex items-center justify-end gap-2 sm:gap-3 flex-shrink-0 p-1 min-w-[6rem] sm:min-w-[8rem]">

                            {/* Nasıl Oynanır? Button (Eski Save Button) */}
                            <div className="relative group w-[2.5rem] h-[2.5rem] sm:w-12 sm:h-12">
                                <button
                                    onClick={() => setShowHowToPlayModal(true)}
                                    className="w-full h-full rounded-full border-2 border-[#7a4e2d] overflow-hidden hover:scale-110 transition relative bg-[#D2B48C] shadow-md" > 
                                    <Image src="/save-icon.png" alt="How to play?" fill className="object-cover" /> 
                                </button>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0.5 hidden group-hover:block bg-[#5a3e2b] text-white text-xs rounded px-0.5 py-[1px] whitespace-nowrap z-10">
                                    How to play? 
                                </div>
                            </div>

                            {/* Exit Button */}
                            <div className="relative group w-[2.5rem] h-[2.5rem] sm:w-12 sm:h-12">
                                <button onClick={() => setShowExitModal(true)} className="w-full h-full rounded-full border-2 border-[#7a4e2d] overflow-hidden hover:scale-110 transition relative bg-[#D2B48C] shadow-md" >
                                    <Image src="/exit-icon.png" alt="Exit" fill className="object-cover" />
                                </button>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0.5 hidden group-hover:block bg-[#5a3e2b] text-white text-xs rounded px-0.5 py-[1px] whitespace-nowrap z-10"> Exit </div>
                            </div>
                            
                            {/* Düşman Bilgileri */}
                            {enemy && inBattleMode && (
                                        <div className="absolute top-[5rem] sm:top-[5.5rem] right-1 sm:right-2 w-[12rem] sm:w-[15rem] bg-[#e4c9a5] border border-[#7a4e2d] p-1.5 sm:p-2 rounded-lg shadow-md text-center animate-pulse z-20">
                                            <p className="text-[#5a3e2b] font-bold text-sm sm:text-base mb-0.5"> ⚔️ {enemy.name} </p>
                                            <div className="w-full h-2 sm:h-2.5 bg-gray-300 rounded-full overflow-hidden">
                                                <div className="h-full transition-all duration-300" style={{ width: `${(enemy.HP / (enemy.maxHP || 100)) * 100}%`, backgroundColor: enemy.HP / (enemy.maxHP || 100) > 0.6 ? "#9ca27b" : enemy.HP / (enemy.maxHP || 100) > 0.3 ? "#e0aa5c" : "#b65c43", }} />
                                            </div>
                                            <p className="text-xs mt-0.5 text-[#5a3e2b] font-semibold"> {enemy.HP} / {enemy.maxHP || 100} HP </p>
                                        </div>
                            )}
                        </div>
                    </div>


                    {/* Alt İçerik: Görsel + Story + Input/Actions */}
                    <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 mt-1 sm:mt-2 flex-1 overflow-hidden w-full mx-auto">
                        {/* Sol: Battle/Scene Görseli */}
                        <div className="flex flex-col justify-start items-center w-full lg:w-3/8 lg:min-w-0 h-[15rem] sm:h-[20rem] lg:h-full">
                            <div className="w-full h-full border-2 border-[#7a4e2d] rounded-lg overflow-hidden shadow-md relative">
                                <img
                                    src={battleImageUrl || "/icon.png"}
                                    alt="Adventure Scene"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            </div>
                        </div>

                        {/* Sağ: Hikaye + Input/Savaş Aksiyonları */}
                        <div className="flex flex-col flex-1 min-h-0 overflow-hidden w-full lg:w-5/8 lg:min-w-0 min-w-[15rem] sm:min-w-[18rem] gap-1 sm:gap-2">
                            {/* Hikaye Alanı: */}
                            <div
                                ref={storyBoxRef}
                                className="flex-1 overflow-y-auto min-h-0 border-2 border-[#7a4e2d] bg-[#f7dfba] rounded-lg shadow-inner p-1.5 sm:p-2 text-[#5a3e2b] scrollbar-thin scrollbar-thumb-[#5a3e2b] scrollbar-track-[#e4c9a5] scrollbar-thumb-rounded-full scrollbar-track-rounded-full shadow-md"
                            >
                                {messages.map((msg, idx) => (
                                    <ReactMarkdown
                                        key={idx}
                                        components={{
                                            p: ({ children }) => <p className="mb-1 text-sm sm:text-base">{children}</p>,
                                            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                            ul: ({ children }) => <ul className="list-disc list-inside ml-4 mb-1 text-sm sm:text-base">{children}</ul>,
                                            ol: ({ children }) => <ol className="list-decimal list-inside ml-4 mb-1 text-sm sm:text-base">{children}</ol>,
                                            li: ({ children }) => <li className="mb-0.5 text-sm sm:text-base">{children}</li>,
                                        }}
                                    >
                                        {msg}
                                    </ReactMarkdown>
                                ))}
                            </div>

                            {/* Input Alanı / Savaş Aksiyonları Alanı */}
                            {inBattleMode && enemy ? (
                                <div className="flex flex-wrap gap-2 justify-center items-center bg-[#f7dfba] p-2 border-2 border-[#7a4e2d] rounded-lg shadow-md w-full min-h-[2.8rem] sm:min-h-[3rem] box-border">
                                    {availableSkills.map((skill) => {
                                        const isOnCooldown = skillCooldowns[skill.name] > 0;
                                        const isNotEnoughMana = player.MP < skill.manaCost;

                                        // Butonlar için ortak stil sınıfları 
                                        const baseButtonClasses = "rounded-full border font-bold px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base transition-all duration-300 ease-in-out";
                                        const enabledButtonClasses = "bg-gradient-to-br from-[#7a4e2d] to-[#5c3821] text-white border-[#7a4e2d] shadow-md hover:shadow-lg hover:scale-105 active:scale-95";
                                        const disabledButtonClasses = "bg-[#a8907c] text-[#e0d5cb] border-[#8e7866] shadow-sm cursor-not-allowed";

                                        return (
                                            <div key={skill.name} className="relative group">
                                                <button
                                                    disabled={isOnCooldown || isNotEnoughMana}
                                                    onClick={() => handleSkillClick(skill)}
                                                    className={`${baseButtonClasses} ${isOnCooldown || isNotEnoughMana
                                                        ? disabledButtonClasses
                                                        : enabledButtonClasses
                                                        }`}
                                                >
                                                    {skill.name} {isOnCooldown ? `(${skillCooldowns[skill.name]}⏳)` : ""}
                                                    {isNotEnoughMana ? ` 💧` : ""}
                                                </button>

                                                {/* Tooltip */}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-[#5a3e2b] text-white text-xs rounded px-2 py-1 z-50 max-w-[15rem] text-center whitespace-pre-wrap">
                                                    {skill.description}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {/* Normal Attack ve Dodge Butonları */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleBattleTurn("attack")}
                                            className="bg-gradient-to-br from-[#7a4e2d] to-[#5c3821] text-white border-[#7a4e2d] rounded-full shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out border font-bold px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base"
                                        >
                                            ⚔️ Attack
                                        </button>
                                        <button
                                            onClick={() => handleBattleTurn("dodge")}
                                            className="bg-gradient-to-br from-[#7a4e2d] to-[#5c3821] text-white border-[#7a4e2d] rounded-full shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out border font-bold px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base"
                                        >
                                            🌀 Dodge
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // savaş modu dışındayken gözükecek olan INPUT + SEND alanı
                                <form
                                    className="h-[2.8rem] sm:h-[3rem] flex gap-1 sm:gap-2"
                                    onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                                >
                                    <input
                                        className="flex-1 bg-[#f7dfba] border-2 border-[#7a4e2d] p-1.5 sm:p-2 rounded-lg placeholder:text-[#7a4e2d] focus:outline-none focus:ring-[#7a4e2d] transition shadow-md text-sm sm:text-base"
                                        placeholder={isFirstTurn ? "Loading story..." : isGameOver ? "Game Over..." : "Enter your action..."}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        disabled={isFirstTurn || isGameOver}
                                    />
                                    <button
                                        type="submit"
                                        className="bg-gradient-to-br from-[#7a4e2d] to-[#5c3821] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out border border-[#7a4e2d] cursor-pointer text-sm sm:text-base"
                                        disabled={isFirstTurn || isGameOver}
                                    >
                                        ⚔️ Send
                                    </button>
                                </form>
                            )}

                        </div>
                    </div>


                    {/* Modallar*/}
                    {showExitModal && (
                        <div className="fixed inset-0 z-50 bg-[#5a3e2b]/60 flex items-center justify-center p-4">
                            <div className="bg-[#e4c9a5] border-2 border-[#7a4e2d] rounded-lg p-4 sm:p-6 shadow-2xl w-full max-w-md text-center text-[#5a3e2b] font-[Caudex]">
                                <h2 className="text-xl sm:text-2xl mb-3 sm:mb-4">⚠️ Exit Game</h2>
                                <p className="mb-4 sm:mb-6 text-sm sm:text-base whitespace-pre-line">
                                    {exitModalMessage}
                                </p>
                                <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
                                    <button
                                        onClick={() => setShowExitModal(false)}
                                        className="px-4 py-2 text-sm sm:text-base bg-[#874c31] text-white rounded-full hover:scale-105 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            router.push("/dashboard");
                                        }}
                                        className="px-4 py-2 text-sm sm:text-base bg-[#803232] text-white rounded-full hover:scale-105 transition"
                                    >
                                        Exit
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showSaveModal && (
                        <div className="fixed inset-0 z-50 bg-[#5a3e2b]/60 flex items-center justify-center p-4">
                            <div className="bg-[#e4c9a5] border-2 border-[#7a4e2d] rounded-lg p-4 sm:p-6 shadow-2xl text-center text-[#5a3e2b] font-[Caudex] max-w-xs sm:max-w-sm w-full">
                                <h2 className="text-xl sm:text-2xl mb-3 sm:mb-4">Game Saved</h2>
                                <p className="text-sm sm:text-base">Your progress has been saved successfully!</p>
                                <button onClick={() => setShowSaveModal(false)} className="mt-4 sm:mt-6 px-5 py-2 text-sm sm:text-base bg-[#7a4e2d] text-white rounded-full hover:scale-105 transition" > OK </button>
                            </div>
                        </div>
                    )}
                    {showSummaryModal && (
                        <div className="fixed inset-0 z-50 bg-[#5a3e2b]/60 flex items-center justify-center p-4">
                            <div className="bg-[#e4c9a5] border-2 border-[#7a4e2d] rounded-lg p-4 sm:p-6 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto text-[#5a3e2b] font-[Caudex] text-center">
                            <h2 className="text-xl sm:text-2xl font-bold mb-3">📜 Story Recap</h2>

                            <p className="text-sm sm:text-base whitespace-pre-line text-left mb-4">{finalSummary}</p>

                            <h3 className="text-xl sm:text-2xl font-bold text-[#5a3e2b] mb-2">🏆 You have completed your adventure!</h3>

                            <div className="flex justify-center gap-4 mt-4">
                                <button
                                onClick={() => router.push("/login")}
                                className="px-5 py-2 text-sm sm:text-base bg-[#803232] text-white rounded-full hover:scale-105 transition"
                                > Exit
                                </button>

                                <button onClick={() => router.push("/dashboard")} className="px-5 py-2 text-sm sm:text-base bg-[#5f8041] text-white rounded-full hover:scale-105 transition" > 
                                Restart </button>
                            </div>
                            </div>
                        </div>
                        )}

                    {isGameOver && deathByDefeat &&(
                        <div className="fixed inset-0 z-50 bg-[#5a3e2b]/60 flex items-center justify-center p-4">
                            <div className="bg-[#e4c9a5] border-2 border-[#7a4e2d] rounded-lg p-4 sm:p-6 shadow-2xl w-full max-w-md text-center text-[#5a3e2b] font-[Caudex]">
                            <h2 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">💀 GAME OVER</h2>
                            <p className="text-sm sm:text-md italic mb-3 sm:mb-4 whitespace-pre-line">
                                {messages[messages.length - 1]}
                            </p>
                            <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
                                <button onClick={() => router.push("/login")} className="px-5 py-2 text-sm sm:text-base bg-[#803232] text-white rounded-full hover:scale-105 transition" > Exit </button>
                                <button onClick={() => router.push("/dashboard")} className="px-5 py-2 text-sm sm:text-base bg-[#5f8041] text-white rounded-full hover:scale-105 transition" > Restart </button>
                            </div>
                            </div>
                        </div>
                        )}

                    {/* How to Play Modal */}
                    {showHowToPlayModal && (
                        <div className="fixed inset-0 z-50 bg-[#5a3e2b]/60 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out">
                            <div className="bg-[#e4c9a5] border-2 border-[#7a4e2d] rounded-lg p-4 sm:p-6 shadow-2xl w-full max-w-lg text-[#5a3e2b] font-[Caudex] flex flex-col transform transition-all duration-300 ease-in-out scale-100 opacity-100">
                                <h2 className="text-xl sm:text-2xl mb-3 sm:mb-4 text-center font-bold">📜 How to play?</h2>

                                <div className="overflow-y-auto max-h-[60vh] sm:max-h-[65vh] pr-2 text-sm sm:text-base space-y-3 scrollbar-thin scrollbar-thumb-[#7a4e2d] scrollbar-track-[#c7ad8f] rounded">
                                    <p><strong>Welcome, Adventurer!</strong> Here's everything you need to begin your quest:</p>

                                    <div>
                                        <h3 className="font-semibold text-md sm:text-lg mb-1 text-[#7a4e2d]">📖 Story & Exploration:</h3>
                                        <ul className="list-disc list-inside ml-2 space-y-1">
                                            <li>The story unfolds through dynamic text. You can either select from presented choices or type your own actions (e.g., "open the chest", "talk to the knight").</li>
                                            <li>Your choices shape the narrative. Be mindful—what you say and do may have lasting consequences.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-md sm:text-lg mb-1 text-[#7a4e2d]">⚔️ Combat System:</h3>
                                        <ul className="list-disc list-inside ml-2 space-y-1">
                                            <li>Encounters with enemies initiate turn-based combat.</li>
                                            <li>You’ll see available **Skills**, a **Normal Attack (⚔️)**, and **Dodge (🌀)** actions.</li>
                                            <li><strong>Skills:</strong> Consume MP and may deal damage, apply effects (e.g., stun, heal, buff), or provide strategic advantage. Some are passive, others have cooldowns.</li>
                                            <li><strong>Attack:</strong> Performs a basic physical attack based on your Strength.</li>
                                            <li><strong>Dodge:</strong> Gives a chance to avoid damage and sometimes grants benefits for the next turn (depending on class or skill used).</li>
                                            <li>Reduce your enemy’s HP to 0 to win. If your HP reaches 0, your journey ends!</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-md sm:text-lg mb-1 text-[#7a4e2d]">📊 Stats Overview:</h3>
                                        <ul className="list-disc list-inside ml-2 space-y-1">
                                            <li><strong>HP (Health):</strong> Your life total. When it reaches 0, you’re defeated. MaxHP = 20 * defence </li>
                                            <li><strong>MP (Mana):</strong> Required to cast most skills. MaxMP = 5 * intelligence</li>
                                            <li><strong>Strength:</strong> Affects physical damage.</li>
                                            <li><strong>Dexterity:</strong> Improves dodge chance, accuracy, and some Rogue damage.</li>
                                            <li><strong>Intelligence:</strong> Increases magical damage and maxMP.</li>
                                            <li><strong>Wisdom:</strong> Enhances healing and divine-based skills.</li>
                                            <li><strong>Charisma:</strong> May influence story interactions and skill success in certain cases.</li>
                                            <li><strong>Speed:</strong> Influences turn priority and sometimes critical effects.</li>
                                            <li><strong>Defence:</strong> Reduces incoming damage and increases HP scaling.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-md sm:text-lg mb-1 text-[#7a4e2d]">🧙‍♂️ Classes & Stat Focus:</h3>
                                        <ul className="list-disc list-inside ml-2 space-y-1">
                                            <li><strong>Warrior:</strong> Focus on Strength and Defence. Tough frontliner with stuns and high HP.</li>
                                            <li><strong>Spellcaster:</strong> Uses Intelligence and MP for devastating spells and healing. Great at ranged magic combat.</li>
                                            <li><strong>Rogue:</strong> Relies on Dexterity and Speed. Excels in dodging, critical strikes, and stealth tactics.</li>
                                            <li><strong>Missionary:</strong> Leverages Wisdom and Intelligence. Mixes healing, holy damage, and divine buffs.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-md sm:text-lg mb-1 text-[#7a4e2d]">🎒 Inventory, Items & Equipment:</h3>
                                        <ul className="list-disc list-inside ml-2 space-y-1">
                                            <li>After each battle, you automatically receive <strong>1 potion</strong>.</li>
                                            <li>There's also a <strong>60% chance</strong> to receive a random <strong>equipment item</strong> (weapon, armor, etc.).</li>
                                            <li>Potions can be used to restore HP or MP in battle or in story. Click on them from your inventory to use.</li>
                                            <li>Equipment increases your stats passively and has durability.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-md sm:text-lg mb-1 text-[#7a4e2d]">✨ Skill Mechanics:</h3>
                                        <ul className="list-disc list-inside ml-2 space-y-1">
                                            <li>Skills may <strong>critically hit</strong> or have random <strong>variance in damage</strong>.</li>
                                            <li>Some skills apply effects like stun, guaranteed dodge, or increased crit chance for the next action.</li>
                                            <li><strong>Boosted skills</strong> gain temporary enhancements (e.g., x2 damage, guaranteed crit). Certain skills set these boosts for the next move.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-md sm:text-lg mb-1 text-[#7a4e2d]">💾 Save System:</h3>
                                        <ul className="list-disc list-inside ml-2 space-y-1">
                                            <li>Your progress is auto-saved after major story events and battles.</li>
                                            <li>There is no manual save; just continue your journey boldly!</li>
                                        </ul>
                                    </div>

                                    <p className="mt-4 pt-2 border-t border-[#c7ad8f]"><strong>Tip:</strong> Learn the strengths of your class, manage your resources, and choose your actions wisely. Your legacy is waiting to be written!</p>
                                </div>

                                <button
                                    onClick={() => setShowHowToPlayModal(false)}
                                    className="mt-4 sm:mt-6 px-6 py-2 text-sm sm:text-base bg-[#7a4e2d] text-white rounded-full hover:bg-[#5c3821] hover:scale-105 transition-all duration-200 ease-in-out self-center shadow-md"
                                >
                                    Got it, Continue Adventure!
                                </button>
                            </div>
                        </div>
                    
                    )}

                </div>
            </div>
        </>
    );
}

const iconMap: Record<string, string> = {
    HP: "/hp-icon.png",
    MP: "/mp-icon.png",
    Accuracy: "/accuracy-icon.png",
    Speed: "/speed-icon.png",
    Defence: "/defence-icon.png",
    Charisma: "/charisma-icon.png",
    Intelligence: "/intelligence-icon.png",
    Wisdom: "/wisdom-icon.png",
    Dexterity: "/dexterity-icon.png",
    Strength: "/strength-icon.png",
};

export function StatBox({
    label,
    value,
    onClick,
    highlight = false,
}: {
    label: string;
    value: number;
    onClick?: () => void;
    highlight?: boolean;
}) {
    const iconSrc = iconMap[label] || "/icons/default.png";

    return (
        <div
            onClick={onClick}
            className={`relative group w-11 h-11 hover:scale-110 transition-transform duration-200 ${onClick ? "cursor-pointer" : ""
                }`}
            style={{ overflow: "visible" }}
        >
            <div
                className={`w-full h-full rounded-full border-2 flex items-center justify-center ${highlight ? "border-green-500 animate-pulse" : "border-[#7a4e2d]"
                    } overflow-hidden`}
            >
                <Image
                    src={iconSrc}
                    alt={label}
                    width={40}
                    height={40}
                    className="object-cover pointer-events-none"
                />
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0.01 hidden group-hover:block bg-[#5a3e2b] text-white text-[10px] rounded px-1 py-[2px] whitespace-nowrap z-50">
                {highlight ? `Click to boost ${label}` : label}
            </div>

            {/* Value */}
            <span className="absolute bottom-[-18px] left-1/2 transform -translate-x-1/2 text-xs text-[#5a3e2b] pointer-events-none">
                {value}
            </span>
        </div>
    );
}


interface ItemBoxProps {
    iconSrc: string;
    name: string;
    owned: boolean;
    count?: number;
    onClick?: () => void;
}
// Dosyanın en sonunda olabilir, StatBox, ItemBox gibi helper'ların altına da koyabilirsin

async function narrateVictoryAfterBattle(
  battleSummary: string,
  setEnemy: React.Dispatch<React.SetStateAction<Character | null>>,
  sendMessage: (input: string, options?: { silent?: boolean; forceLLM?: boolean }) => Promise<void>
) {
  setEnemy(null);
  await sendMessage(battleSummary, { silent: true, forceLLM: true });
}



export const ItemBox = ({ iconSrc, name, owned, count, onClick }: ItemBoxProps) => {
    return (
        <div
            className={`relative group w-12 h-12 hover:scale-110 transition-transform duration-200 ${onClick ? "cursor-pointer" : ""
                }`}
            onClick={onClick}
            style={{ overflow: "visible" }}
        >
            <div
                className={`w-full h-full rounded-full border-2 border-[#7a4e2d] overflow-hidden flex items-center justify-center ${owned ? "" : "opacity-50"
                    }`}
            >
                <Image
                    src={iconSrc}
                    alt={name}
                    width={40}
                    height={40}
                    className="object-cover pointer-events-none"
                />
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0.01 hidden group-hover:block bg-[#5a3e2b] text-white text-[10px] rounded px-1 py-[2px] whitespace-nowrap z-50">
                {name}
            </div>

            {/* Count badge */}
            {owned && count !== undefined && count > 0 && (
                <div className="absolute bottom-0 right-0 bg-red-700 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {count}
                </div>
            )}
        </div>
    );
};




function getScenarioIntroPrompt(id: number): string {
    switch (id) {
        case 1:
            return "Begin the story of retrieving the stolen dragon egg from the shadow mountains.";
        case 2:
            return "Start the quest for the legendary elixir to cure the cursed king.";
        case 3:
            return "Begin the battle against the undead army rising from the ancient tombs.";
        case 4:
            return "Begin the mission to restore the shattered time crystal before the world collapses.";
        default:
            return "Begin a fantasy adventure.";
    }
}

//TODO: scenario name ekrana eklenecek!
function getScenarioName(id: number): string {
    switch (id) {
        case 1:
            return "🐉 Kayıp Ejderha Yumurtası";
        case 2:
            return "🧪 Lanetli Kraliyet Kanı";
        case 3:
            return "💀 Ölüler Ordusu";
        case 4:
            return "⏳ Kırılmış Zaman Kristali";
        default:
            return "❓ Bilinmeyen Senaryo";
    }
}


type InventoryItem = { name: string; icon: string; count: number; };

function usePotion(
    type: "Health Potion" | "Mana Potion",
    player: Character,
    setPlayer: React.Dispatch<React.SetStateAction<Character>>,
    setMessages: React.Dispatch<React.SetStateAction<string[]>>,
    inventory: InventoryItem[],
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>
) {
    const maxHP = player.defence * 20;
    const maxMP = player.intelligence * 5;

    const hasPotion = inventory.find((item) => item.name === type && item.count > 0);
    if (!hasPotion) {
        setMessages((prev) => [...prev, `❌ You don't have a ${type} to use.`]);
        return;
    }

    if (type === "Health Potion" && player.HP >= maxHP) {
        setMessages((prev) => [...prev, "🧪 Your HP is already full."]);
        return;
    }
    if (type === "Mana Potion" && player.MP >= maxMP) {
        setMessages((prev) => [...prev, "🔋 Your MP is already full."]);
        return;
    }



    if (type === "Health Potion") {
        const healed = Math.min(30, maxHP - player.HP);
        setPlayer((prev) => ({ ...prev, HP: prev.HP + healed }));
        setMessages((prev) => [...prev, `🧪 You drank a Health Potion and restored **${healed} HP**!`]);
    } else {
        const restored = Math.min(25, maxMP - player.MP);
        setPlayer((prev) => ({ ...prev, MP: prev.MP + restored }));
        setMessages((prev) => [...prev, `🔋 You drank a Mana Potion and restored **${restored} MP**!`]);
    }

    setInventory((prev) =>
        prev.map((item) =>
            item.name === type
                ? { ...item, count: Math.max(item.count - 1, 0) }
                : item
        )
    );

}

function getRandomPotion(): InventoryItem {
    const potions = [
        { name: "Health Potion", icon: "/health-potion-icon.png", count: 1 },
        { name: "Mana Potion", icon: "/mana-potion-icon.png", count: 1 },
    ];
    const randomIndex = Math.floor(Math.random() * potions.length);
    return potions[randomIndex];
}



type EquipmentItem = {
    name: string;
    type: "weapon" | "armor" | "robe";
    icon: string;
    statBoosts: Partial<Pick<Character, "strength" | "defence" | "intelligence" | "speed" | "dexterity" | "accuracy" | "agility" | "MP" | "spirit">>;
    owned: boolean;
    equipped: boolean;
};

function getEquipmentByName(name: string): EquipmentItem {
    const equipmentMap: Record<string, EquipmentItem> = {
        "Wooden Sword": {
            name: "Wooden Sword",
            type: "weapon",
            icon: "/wooden-sword-icon.png",
            statBoosts: { strength: 2 },
            owned: false,
            equipped: false,
        },
        "Steel Sword": {
            name: "Steel Sword",
            type: "weapon",
            icon: "/steel-sword-icon.png",
            statBoosts: { strength: 5 },
            owned: false,
            equipped: false,
        },
        "Flaming Sword": {
            name: "Flaming Sword",
            type: "weapon",
            icon: "/flaming-sword-icon.png",
            statBoosts: { strength: 9, accuracy: 2 },
            owned: false,
            equipped: false,
        },

        "Leather Armor": {
            name: "Leather Armor",
            type: "armor",
            icon: "/leather-armor-icon.png",
            statBoosts: { defence: 4 },
            owned: false,
            equipped: false,
        },
        "Chainmail Armor": {
            name: "Chainmail Armor",
            type: "armor",
            icon: "/chainmail-armor-icon.png",
            statBoosts: { defence: 7 },
            owned: false,
            equipped: false,
        },
        "Dragon Armor": {
            name: "Dragon Armor",
            type: "armor",
            icon: "/dragon-armor-icon.png",
            statBoosts: { defence: 11, speed: 2 },
            owned: false,
            equipped: false,
        },

        "Cloth Robe": {
            name: "Cloth Robe",
            type: "robe",
            icon: "/cloth-robe-icon.png",
            statBoosts: { intelligence: 3 },
            owned: false,
            equipped: false,
        },
        "Wizard's Robe": {
            name: "Wizard's Robe",
            type: "robe",
            icon: "/wizards-robe-icon.png",
            statBoosts: { intelligence: 6 },
            owned: false,
            equipped: false,
        },
        "Enchanted Robe": {
            name: "Enchanted Robe",
            type: "robe",
            icon: "/enchanted-robe-icon.png",
            statBoosts: { intelligence: 10, spirit: 2 },
            owned: false,
            equipped: false,
        },
    };

    return equipmentMap[name] ?? {
        name,
        type: "weapon",
        icon: "/unknown.png",
        statBoosts: {},
        owned: false,
        equipped: false,
    };
}


const boostableStats = ["strength", "defence", "intelligence", "speed", "dexterity"] as const;
type BoostableStat = typeof boostableStats[number];


export const allEquipmentBase: Record<"weapon" | "armor" | "robe", string> = {
    weapon: "Wooden Sword",
    armor: "Leather Armor",
    robe: "Cloth Robe",
};


const equipmentProgressionMap: Record<string, string | null> = {
    "Wooden Sword": "Steel Sword",
    "Steel Sword": "Flaming Sword",
    "Flaming Sword": null,

    "Leather Armor": "Chainmail Armor",
    "Chainmail Armor": "Dragon Armor",
    "Dragon Armor": null,

    "Cloth Robe": "Wizard's Robe",
    "Wizard's Robe": "Enchanted Robe",
    "Enchanted Robe": null,
};


const allEquipmentNames = [
    "Wooden Sword",
    "Steel Sword",
    "Flaming Sword",
    "Leather Armor",
    "Chainmail Armor",
    "Dragon Armor",
    "Cloth Robe",
    "Wizard's Robe",
    "Enchanted Robe",
];

export function getEquipmentUpgradeChain(start: string): string[] {
    const chain = [start];
    let current = start;

    while (equipmentProgressionMap[current]) {
        const next = equipmentProgressionMap[current];
        if (!next || chain.includes(next)) break; // döngüyü önle
        chain.push(next);
        current = next;
    }

    return chain;
}

export function getDisplayEquipmentList(
    ownedEquipment: EquipmentItem[]
): EquipmentItem[] {
    return Object.entries(allEquipmentBase).map(([type, baseName]) => {
        // Oyuncunun o türde sahip olduğu en güncel versiyonu bul
        const chain = getEquipmentUpgradeChain(baseName); // ["Wooden Sword", "Flaming Sword", ...]
        const owned = chain.findLast((name) => ownedEquipment.some((e) => e.name === name));
        const finalName = owned ?? baseName;
        const ownedFlag = !!owned;

        const fromOwned = ownedEquipment.find((e) => e.name === finalName);
        const equipped = fromOwned?.equipped ?? false;

        return {
            ...getEquipmentByName(finalName),
            owned: ownedFlag,
            equipped,
        };
    });
}

function getEquipmentStartNameByType(type: "Sword" | "Armor" | "Robe"): string {
    switch (type) {
        case "Sword":
            return "Wooden Sword";
        case "Armor":
            return "Chainmail Armor";
        case "Robe":
            return "Cloth Robe";
        default:
            return "Wooden Sword";
    }
}


function getNextEquipmentToGive(
    type: "Sword" | "Armor" | "Robe",
    equipmentList: EquipmentItem[]
): EquipmentItem {
    const typeMap = {
        Sword: "weapon",
        Armor: "armor",
        Robe: "robe",
    } as const;

    const eqType = typeMap[type]; // 'weapon' | 'armor' | 'robe'

    const current = equipmentList.find((eq) => eq.type === eqType && eq.owned);
    const currentName = current?.name ?? getEquipmentStartNameByType(type);
    const nextName = current ? equipmentProgressionMap[current.name] : currentName;

    return getEquipmentByName(nextName ?? currentName);
}


function getClassImage(characterClass?: string): string {
    switch (characterClass) {
        case "Spellcaster":
            return "/spelcaster.png";
        case "Rogue":
            return "/rogue..png";
        case "Warrior":
            return "/warrior.png";
        case "Missionary":
            return "/missionary..png";
        default:
            return "/pp.jpeg"; // fallback image
    }
}

function getBattleRewards(): Array<{type: "potion", item: InventoryItem} | {type: "equipment", equipmentType: "sword" | "armor" | "robe"}> {
  const rewards: Array<{type: "potion", item: InventoryItem} | {type: "equipment", equipmentType: "sword" | "armor" | "robe"}> = [];
  
  // Her savaş sonrası %80 şansla potion düşer
  if (Math.random() < 0.8) {
      rewards.push({
          type: "potion" as const,
          item: getRandomPotion()
      });
  }
  
  // %40 şansla equipment düşer (potion'dan bağımsız)
  if (Math.random() < 0.99) {
      const equipmentTypes = ["sword", "armor", "robe"] as const;
      const randomType = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
      rewards.push({
          type: "equipment" as const,
          equipmentType: randomType
      });
  }
  
  return rewards;
}

// Chatbox.tsx dosyanızın EN SONUNDA bu fonksiyonu bulun:

async function handleEquipmentDrop(
  equipmentType: "sword" | "armor" | "robe",
  equipment: EquipmentItem[],
  setEquipment: React.Dispatch<React.SetStateAction<EquipmentItem[]>>,
  setPlayer: React.Dispatch<React.SetStateAction<Character>>,
  setMessages: React.Dispatch<React.SetStateAction<string[]>>
) {
  // *** BURADA OLAN TÜM KODU SİLİN ***
  // Ve yerine şunu koyun:

  const typeToCategoryMap = {
      sword: "weapon",
      armor: "armor",
      robe: "robe",
  } as const;

  const category = typeToCategoryMap[equipmentType];
  
  const ownedOfType = equipment
      .filter((e) => e.type === category)
      .map((e) => e.name);

  const progressionChains: Record<string, string[]> = {
      weapon: ["Wooden Sword", "Steel Sword", "Flaming Sword"],
      armor: ["Leather Armor", "Chainmail Armor", "Dragon Armor"],
      robe: ["Cloth Robe", "Wizard's Robe", "Enchanted Robe"],
  };

  const chain = progressionChains[category];
  let toGive = chain[0];

  // Progression chain'de sahip olmadığı ilk item'ı bul
  for (let i = 0; i < chain.length; i++) {
      if (!ownedOfType.includes(chain[i])) {
          toGive = chain[i];
          break;
      }
      if (i === chain.length - 1) {
          toGive = chain[i]; // En üst seviye item'ı ver
      }
  }

  const newItem = getEquipmentByName(toGive);
  const statDesc = Object.entries(newItem.statBoosts)
      .map(([stat, value]) => {
          return `+${value} ${stat}`;
      })
      .join(", ");

  const exists = equipment.find((e) => e.name === newItem.name);

  if (!exists) {
      // Yeni item ekle ve stat'ları artır
      setPlayer((p) => {
          const updated = { ...p };
          for (const stat in newItem.statBoosts) {
              const s = stat as BoostableStat;
              updated[s] += newItem.statBoosts[s] ?? 0;
          }
          return updated;
      });

      setEquipment((prev) => [...prev, { ...newItem, owned: true }]);
      
      setMessages((prev) => [
          ...prev,
          `⚔️ You found a **${newItem.name}** after the battle!`,
          `🛡️ It boosts your stats: ${statDesc}`,
      ]);

  } else {
      // Upgrade sistemini uygula
      const nextName = equipmentProgressionMap[exists.name];
      if (!nextName) {
          setMessages((prev) => [
              ...prev,
              `✨ You found another **${exists.name}**, but you already have the best version!`,
          ]);
          return;
      }

      const upgraded = getEquipmentByName(nextName);

      setPlayer((p) => {
          const updated = { ...p };
          // Eski bonusları çıkar
          for (const stat in exists.statBoosts) {
              const s = stat as BoostableStat;
              updated[s] -= exists.statBoosts[s] ?? 0;
          }
          // Yeni bonusları ekle (10% bonus ile)
          for (const stat in upgraded.statBoosts) {
              const s = stat as BoostableStat;
              const base = upgraded.statBoosts[s] ?? 0;
              const bonus = Math.floor(base * 0.1);
              updated[s] += base + bonus;
          }
          return updated;
      });

      const upgradeDesc = Object.entries(upgraded.statBoosts)
          .map(([stat, value]) => `+${value} ${stat}`)
          .join(", ");

      setEquipment((prev) => 
          prev.map((e) =>
              e.name === exists.name ? { ...upgraded, owned: true } : e
          )
      );

      setMessages((prev) => [
          ...prev,
          `🔥 Your **${exists.name}** has evolved into **${upgraded.name}** with enhanced power!`,
          `🛡️ New bonuses: ${upgradeDesc}`,
      ]);
  }
}
