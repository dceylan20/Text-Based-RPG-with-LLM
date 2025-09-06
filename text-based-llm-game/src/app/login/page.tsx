// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGame } from "@/context/GameContext";

export default function LoginPage() {
    const [inputUserId, setInputUserId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const { setUserId } = useGame();

    const handleLogin = async () => {
        if (!inputUserId || !password) {
            setError("Please fill in all fields");
            return;
        }

        try {
            const check = await fetch(`/api/user?userId=${inputUserId}`);
            const userExists = await check.json();

            if (!userExists?.found) {
                setError("User does not exist.");
                return;
            }

            const res = await fetch("/api/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: inputUserId, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setUserId(inputUserId);
                localStorage.setItem("userId", inputUserId); 
                router.push("/dashboard");
            } else {
                setError(data.error || "Login failed");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Something went wrong");
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center 
                 bg-[url('/arkaplan_duz.png')] bg-cover bg-center 
                 p-6 font-bold"
                 style={{ fontFamily: "'Caudex', serif" }} >
        

            <div className="bg-[#edcf98] shadow-xl rounded-lg p-8 max-w-md w-full">
                <h1 className="text-4xl text-yellow-800 mb-6 text-center font-extrabold" style={{ fontFamily: "Pirata One, cursive" }}>
                    Login to Monster Clash
                </h1>

                <div className="mb-4">
                    <label className="block text-yellow-800 mb-1">User ID</label>
                    <input
                        type="text"
                        value={inputUserId}
                        onChange={(e) => setInputUserId(e.target.value)}
                        className="w-full p-2 border rounded bg-[#fff5e6] text-black placeholder-gray-500 font-bold"
                        placeholder="Enter your user ID"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-yellow-800 mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded bg-[#fff5e6] text-black placeholder-gray-500 leading-relaxed"
                        placeholder="Enter your password"
                    />
                </div>

                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                <button
                onClick={handleLogin}
                className="block w-1/2 text-2xl bg-yellow-700 text-white py-2 rounded-3xl hover:bg-yellow-800 transition font-bold mx-auto" style={{ fontFamily: "Pirata One, cursive" }}
                >
                Login
                </button>

                <div className="mt-6 text-center"> 
                    <Link
                        href="/signup"
                        className="text-[#874c31] text-lg hover:underline font-semibold" 
                    >
                        Don’t have an account? Sign-up →
                    </Link>
                </div>

            </div>
        </main>
    );
}
