// src/app/dashboard/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGame } from "@/context/GameContext";

type ModalType = "confirm" | "success" | "error" | "";

type SessionInfo = {
  sessionId: string;
  hp: number;
  nickname: string;
};

export default function Dashboard() {
  const router = useRouter();
  const { userId, setSessionId, setPlayerName } = useGame();
  const [showSelectSessionPopup, setShowSelectSessionPopup] = useState(false);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    type: "" as ModalType,
  });
  const [sessionToDelete, setSessionToDelete] = useState<SessionInfo | null>(
    null
  );

  const handleResumeClick = async () => {
    if (!userId) {
      setModalContent({
        title: "Error",
        message: "User ID not found. Please log in.",
        type: "error",
      });
      setIsModalOpen(true);
      return;
    }

    try {
      const res = await fetch(`/api/session?userId=${userId}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Could not fetch sessions." }));
        throw new Error(errorData.message || "Failed to fetch sessions");
      }
      const data = await res.json();

      if (data.sessions) {
        const enrichedSessions: SessionInfo[] = [];
        for (const session of data.sessions) {
          try {
            const playerRes = await fetch(
              `/api/player?sessionId=${session.sessionId}`
            );
            if (!playerRes.ok) {
                console.warn(`Player data for session ${session.sessionId} not found or error.`);
                enrichedSessions.push({
                    sessionId: session.sessionId,
                    hp: 0, 
                    nickname: "Player Data Error",
                });
                continue;
            }
            const playerData = await playerRes.json();
            enrichedSessions.push({
              sessionId: session.sessionId,
              hp: playerData.hp,
              nickname: playerData.nickname || "Unknown Player",
            });
          } catch (err) {
            console.warn(
              "Failed to load player for session",
              session.sessionId,
              err
            );
            enrichedSessions.push({
              sessionId: session.sessionId,
              hp: 0,
              nickname: "Load Error",
            });
          }
        }
        setSessions(enrichedSessions);
        setShowSelectSessionPopup(true);
      } else {
         setSessions([]);
         setShowSelectSessionPopup(true); 
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
      setModalContent({
        title: "Loading Error",
        message:
          error instanceof Error ? error.message : "Could not load sessions. Please check your connection.",
        type: "error",
      });
      setIsModalOpen(true);
      setSessions([]);
      setShowSelectSessionPopup(true);
    }
  };

  const handleSessionSelect = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/player?sessionId=${sessionId}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Could not load player data for selection." }));
        throw new Error(errorData.message || "Failed to load player data.");
      }
      const data = await res.json();
      setSessionId(sessionId);
      setPlayerName(data.nickname);
      router.push("/game/play");

    } catch (err) {
      console.error("Failed to load player data for selection:", err);
      setModalContent({
        title: "Error",
        message:
          err instanceof Error ? err.message : "An error occurred while trying to load player data.",
        type: "error",
      });
      setIsModalOpen(true);
    }
  };

  const requestDeleteSession = (session: SessionInfo) => {
    setSessionToDelete(session);
    setModalContent({
      title: "Delete Session",
      message: `Are you sure you want to permanently delete the session "${session.nickname}"?\nThis action cannot be undone.`,
      type: "confirm",
    });
    setIsModalOpen(true);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete || !userId) {
      setModalContent({
        title: "Error",
        message: "Session to delete or User ID not found. Cannot proceed.",
        type: "error",
      });
      setIsModalOpen(true); 
      setSessionToDelete(null);
      return;
    }

    setIsModalOpen(false); 

    try {
      const res = await fetch(
        `/api/session?sessionId=${sessionToDelete.sessionId}&userId=${userId}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        setSessions((prevSessions) =>
          prevSessions.filter(
            (s) => s.sessionId !== sessionToDelete!.sessionId
          )
        );
        setModalContent({
          title: "Success",
          message: `Session "${sessionToDelete.nickname}" has been successfully deleted.`,
          type: "success",
        });
      } else {
        const errorData = await res
          .json()
          .catch(() => ({ message: "Could not parse error response from server." }));
        setModalContent({
          title: "Deletion Failed",
          message: `An error occurred while deleting the session: ${
            errorData.message || "Unknown server error"
          }`,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      setModalContent({
        title: "Deletion Error",
        message:
          "A connection or client-side error occurred while deleting the session.",
        type: "error",
      });
    }
    setIsModalOpen(true); 
    setSessionToDelete(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSessionToDelete(null);
  };

  return (
    <main
      className="h-screen flex flex-col items-center justify-center text-brown-900 p-6 bg-cover bg-center bg-no-repeat text-[#3b2614] px-6 py-12 text-center font-bold"
      style={{
        backgroundImage: 'url("/arkaplan_duz.png")',
        fontFamily: "Pirata One, cursive",
      }}
    >
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4">
        Text-based Adventure with AI-powered storytelling
      </h2>

      <h1 className="text-8xl md:text-8xl lg:text-9xl font-extrabold mb-10 tracking-wide">
        MONSTER CLASH RPG
      </h1>

      <div className="flex flex-col gap-6 items-center w-full max-w-sm">
        <button
          onClick={() => router.push("/game")}
          className="w-full bg-[#edcf98] px-6 py-3 rounded-3xl text-4xl border-2 border-[#3b2614] hover:scale-105 transition"
        >
          NEW GAME
        </button>

        <button
          onClick={handleResumeClick}
          className="w-full bg-[#edcf98] px-6 py-3 rounded-3xl text-4xl border-2 border-[#3b2614] hover:scale-105 transition"
        >
          RESUME GAME
        </button>

        <button
          onClick={() => router.push("/")}
          className="w-full bg-[#edcf98] px-6 py-3 rounded-3xl text-4xl border-2 border-[#3b2614] hover:scale-105 transition"
        >
          EXIT GAME
        </button>
      </div>

      {/* Session Selection Popup */}
      {showSelectSessionPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-[4px]">
          <div className="bg-[#fdf1dc] p-6 rounded-lg shadow-lg text-center text-[#3b2614] max-w-md w-full">
            <h2
              className="text-3xl font-bold mb-4"
              style={{ fontFamily: "Pirata One, cursive" }}
            >
              Select a Session
            </h2>
            <div
              className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#7a4e2d] scrollbar-track-[#fdf1dc] pr-2"
              style={{ fontFamily: "'Caudex', serif" }}
            >
              {sessions.filter((s) => s.hp > 0).length > 0 ? (
                sessions
                  .filter((session) => session.hp > 0)
                  .map((session) => (
                    <div
                      key={session.sessionId}
                      className="flex items-center justify-between bg-[#edcf98] border border-[#5a3e2b] rounded-3xl group hover:bg-[#e6b457]/80 transition"
                    >
                      <button
                        onClick={() => handleSessionSelect(session.sessionId)}
                        className="flex-grow text-left px-4 py-2 transition rounded-l-3xl focus:outline-none text-lg"
                        aria-label={`Select session ${session.nickname} - ${session.sessionId}`}
                      >
                        {session.nickname} – {session.sessionId.substring(0, 8)}
                        ...
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          requestDeleteSession(session);
                        }}
                        className="p-2 mr-2 rounded-full text-[#8c5a32] hover:bg-[#d4aa7a]/60 hover:text-[#5a3e2b] transition-colors flex items-center justify-center"
                        title={`Delete session ${session.nickname}`}
                        aria-label={`Delete session ${session.nickname}`}
                        style={{ minWidth: "36px", minHeight: "36px" }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))
              ) : (
                <p className="text-[#7a4e2d] py-4 text-lg">
                  No active sessions found.
                </p>
              )}
            </div>
            <button
              onClick={() => setShowSelectSessionPopup(false)}
              className="mt-6 text-2xl underline text-[#7a4e2d] hover:text-[#3b2614]"
              style={{ fontFamily: "Pirata One, cursive" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* General Purpose Modal (Confirm, Success, Error) */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-[3px]"
          style={{ fontFamily: "'Caudex', serif" }}
        >
          <div className="bg-[#fdf1dc] p-7 rounded-xl shadow-2xl text-center text-[#3b2614] max-w-sm w-full mx-4">
            <h3
              className="text-3xl font-bold mb-5"
              style={{ fontFamily: "Pirata One, cursive" }}
            >
              {modalContent.title}
            </h3>
            <p className="text-lg mb-6 whitespace-pre-line px-2">
              {modalContent.message}
            </p>
            <div className="flex justify-center gap-4">
              {modalContent.type === "confirm" && (
                <>
                  <button
                    onClick={closeModal}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2.5 px-7 rounded-lg transition-colors text-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteSession}
                    className="bg-[#c84848] hover:bg-[#a33b3b] text-white font-semibold py-2.5 px-7 rounded-lg transition-colors text-xl"
                  >
                    Delete
                  </button>
                </>
              )}
              {(modalContent.type === "success" ||
                modalContent.type === "error") && (
                <button
                  onClick={closeModal}
                  className="bg-[#7a4e2d] hover:bg-[#5a3e2b] text-white font-semibold py-3 px-8 rounded-lg transition-colors text-xl"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}