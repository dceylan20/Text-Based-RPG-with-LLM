// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const validateInput = () => {
        if (userId.length < 4) {
            return "User ID must be at least 4 characters long.";
        }
        if (password.length < 6) {
            return "Password must be at least 6 characters long.";
        }
        if (userId === password) {
            return "User ID and password cannot be the same.";
        }
        return null;
    };

    const handleSignup = async () => {
        const validationError = validateInput();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            const res = await fetch("/api/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, password }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push("/login");
            } else {
                setError(data.error || "Signup failed");
            }
        } catch (err) {
            setError("Something went wrong");
        }
    };

    return (
        <main
            className="min-h-screen flex flex-col items-center justify-center 
                       bg-[url('/arkaplan_duz.png')] bg-cover bg-center 
                       p-6 font-bold"
            style={{ fontFamily: "'Caudex', serif" }}
        >

            {/* Signup Card */}
            <div className="bg-[#edcf98] shadow-xl rounded-lg p-8 max-w-md w-full">
                <h1 className="text-4xl font-bold text-yellow-800 mb-4 text-center" style={{ fontFamily: "Pirata One, cursive" }}>
                    Create Your Account
                </h1>

                {/* Kurallar Kutusu */}
                <div className="bg-[#fff5e6] border border-[#d4b080] text-sm text-[#5a3e2b] rounded-md p-4 mb-6">
                    <p className="mb-1"> - <strong>User ID</strong> must be at least <strong>4 characters</strong> long.</p>
                    <p className="mb-1"> - <strong>Password</strong> must be at least <strong>6 characters</strong> long.</p>
                    <p> - <strong>User ID</strong> and <strong>Password</strong> cannot be the same.</p>
                </div>

                <div className="mb-4">
                    <label className="block text-yellow-800 mb-1">User ID</label>
                    <input
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="w-full p-2 border rounded bg-[#fff5e6] text-black placeholder-gray-500"
                        placeholder="Choose your user ID"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-yellow-800 mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded bg-[#fff5e6] text-black placeholder-gray-500 leading-relaxed"
                        placeholder="Choose a password"
                    />
                </div>

                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                <button
                    onClick={handleSignup}
                    className="block w-1/2 text-2xl bg-yellow-700 text-white py-2 rounded-3xl hover:bg-yellow-800 transition font-bold mx-auto" style={{ fontFamily: "Pirata One, cursive" }}
                >
                    Sign up
                </button>

                <div className="mt-6 text-center"> 
                    <Link
                        href="/login"
                        className="text-[#874c31] text-lg hover:underline font-semibold" 
                    >
                        Already have an account? Login →
                    </Link>
                </div>

            </div>
        </main>
    );
}
