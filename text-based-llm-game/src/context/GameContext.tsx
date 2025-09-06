// src/conntext/GameContext.tsx
"use client";
import { createContext, useState, ReactNode, useContext } from "react";

interface GameState {
    userId: string;
    setUserId: (id: string) => void;
    playerName: string;
    setPlayerName: (name: string) => void;
    sessionId: string;
    setSessionId: (id: string) => void;
}

const GameContext = createContext<GameState | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
    const [userId, setUserId] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [sessionId, setSessionId] = useState("");

    return (
        <GameContext.Provider value={{ userId, setUserId, playerName, setPlayerName, sessionId, setSessionId }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error("useGame must be used within a GameProvider");
    }
    return context;
};
