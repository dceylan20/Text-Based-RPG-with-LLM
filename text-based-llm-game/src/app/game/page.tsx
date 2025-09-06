// src/app/game/page.tsx
"use client";
import { useGame } from "@/context/GameContext";
import { useState, useEffect } from "react";
import Chatbox from "@/components/Chatbox";
import Image from "next/image";
import Head from 'next/head';

function generateSessionId(nickname: string) {
  const randomCode = Math.random().toString(36).substring(2, 10);
  return `${nickname}_${randomCode}`;
}

export default function GamePage() {
  const { playerName, setPlayerName, setSessionId, userId, setUserId } = useGame();
  const [input, setInput] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false); 

  const classes = [
    {
      name: "Spellcaster",
      description: "Masters of arcane arts, wielding wands to cast devastating spells like Fireball and Purify.", image: "/spelcaster.png",},
    {
      name: "Rogue",
      description: "Swift and silent, armed with deadly knives. Known for agility and the unique ability to Steal.", image: "/rogue..png",},
    {
      name: "Warrior",
      description: "Stalwart defenders with sword and shield. Excel at close combat and unbreakable defense.", image: "/warrior.png",},
    {
      name: "Missionary",
      description:"Charismatic and wise, wielding staffs or amulets. Experts in persuasion and charm magic.", image: "/missionary..png",}, ];

  useEffect(() => {
    if (!userId) {
      const storedId = localStorage.getItem("userId");
      if (storedId) {
        setUserId(storedId);
      }
    }
  }, [userId, setUserId]);

  const handleStartGame = async () => {
    if (!input || !selectedClass || !userId || isStartingGame) { 
      console.warn("❌ Required fields missing or game start in progress.");
      return;
    }

    setIsStartingGame(true); 
    const fullName = `${input} the ${selectedClass}`;
    const session = generateSessionId(input);

    try {
      await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, sessionId: session }),
      });

      const classRes = await fetch(`/api/classes?className=${selectedClass}`);
      const classData = await classRes.json();

      const newPlayer = {
        name: fullName,
        characterClass: selectedClass,
        level: 1,
        HP: classData.baseHP,
        MP: classData.baseMana,
        strength: classData.baseStrength,
        speed: classData.baseSpeed,
        defence: classData.baseDefence,
        dexterity: classData.baseDexterity,
        intelligence: classData.baseIntelligence,
        wisdom: classData.baseWisdom,
        charisma: classData.baseCharisma,
        accuracy: 12,
        constitution: 10,
        spirit: 10,
        agility: 10,
        userId,
        sessionId: session,
      };

      await fetch("/api/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPlayer),
      });

      setPlayerName(fullName);
      setSessionId(session);

      const skillsRes = await fetch(`/api/skills?className=${selectedClass}`);
      const allSkills = await skillsRes.json();
      const levelOneSkills = allSkills.filter(
        (s: any) => s.skillLevel === 1 || s.skilllevel === 1
      );

      for (const skill of levelOneSkills) {
        await fetch("/api/owned-skill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            sessionId: session,
            skillName: skill.skillName,
          }),
        });
      }
      setGameStarted(true);
    } catch (err) {
      console.error("Error starting game:", err);
      alert("Failed to start session. Please try again.");
    } finally {
      setIsStartingGame(false); 
    }
  };

  return (
    <>
      <Head>
        <style jsx global>{`
        `}</style>
      </Head>
      <div className="h-screen overflow-hidden bg-[url('/arkaplan_duz.png')] bg-cover bg-center text-[#5a3e2b] flex flex-col items-center justify-center p-2">
        {!gameStarted ? (
          <div className="w-full max-w-screen-lg flex flex-col items-center justify-center gap-0.5 xl:gap-2">
            <h1
              style={{ fontFamily: "Pirata One, cursive" }}
              className="text-4xl sm:text-5xl lg:text-6xl text-center text-[#3b2614] leading-tight"
            >
              Welcome, brave adventurer!
              <br />
              <span className="text-2xl sm:text-3xl lg:text-4xl leading-tight">
                  Before we begin, choose your nickname:
              </span>
              <br />
            </h1>


            <input
              type="text"
              placeholder="Enter your name (max 10 char)"
              value={input}
              onChange={(e) => {
                if (e.target.value.length <= 10) {
                  setInput(e.target.value);
                }
              }}
              maxLength={10}
              className="px-4 py-2 w-4/5 max-w-xs text-center text-base rounded-full
                         border-2 border-yellow-800 bg-[#edcf98] text-[#3b2614]
                         placeholder:text-[#a67c52]
                         focus:outline-none focus:ring-2 focus:ring-[#d4b88a]
                         shadow-md leading-tight"
            />
            {input.length > 10 && (
              <p className="text-red-500 text-xs">Nickname cannot exceed 10 characters.</p>
            )}
            <h1
              style={{ fontFamily: "Pirata One, cursive" }}
              className="text-4xl sm:text-5xl lg:text-6xl text-center text-[#3b2614] leading-tight"
            >
              <span className="text-xl sm:text-2xl lg:text-3xl leading-tight">
                  Now, select your destiny:
              </span>
            </h1>


            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full px-2 justify-center mt-1 xl:mt-2">
              {classes.map((charClass) => (
                <div
                  key={charClass.name}
                  onClick={() => setSelectedClass(charClass.name)}
                  className={`w-full flex flex-col items-center border-2 rounded-xl p-2 cursor-pointer
                              transition-all duration-300 hover:scale-105 hover:shadow-xl bg-[#edcf98] text-[#3b2614]
                              ${
                                selectedClass === charClass.name
                                    ? "border-yellow-800 bg-[#e6b457] border-4 shadow-2xl scale-105" 
                                    : "border-transparent bg-[#e6b457]/70 brightness-[.96] hover:brightness-100 hover:border-yellow-600 hover:scale-105 hover:shadow-xl"
                                }`}
                >
                  <div className="w-[9rem] h-[9rem] sm:w-[10rem] sm:h-[10rem] relative mb-1 mx-auto">
                    <Image
                      src={charClass.image}
                      alt={charClass.name}
                      fill
                      sizes="(max-width: 640px) 112px, 128px"
                      className="rounded-lg object-cover shadow-sm"
                    />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-yellow-900 mb-1 text-center leading-tight" style={{ fontFamily: "Pirata One, cursive" }}>
                    {charClass.name}
                  </h3>
                  <p className="text-xxs sm:text-xs text-yellow-900 text-center leading-snug px-1">
                    {charClass.description}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="mt-2 sm:mt-3 w-full flex justify-center"
              style={{ fontFamily: "Pirata One, cursive" }}
            >
              <button
                  onClick={handleStartGame}
                  className={`px-5 py-2 sm:px-6 text-xl sm:text-2xl rounded-full border-2 border-yellow-800 shadow hover:scale-105
                             ${isStartingGame ? "bg-gray-400 text-gray-600 cursor-not-allowed" : "bg-[#edcf98] text-[#5c3b0a]"}`}
                  disabled={isStartingGame} 
              >
                  {isStartingGame ? "Loading..." : "START ADVENTURE"} 
              </button>
            </div>
          </div>
        ) : (
          <Chatbox />
        )}
      </div>
    </>
  );
}