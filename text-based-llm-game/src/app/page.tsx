// src/app/page.tsx

"use client";

import Link from "next/link";

export default function Home() {
  return (
     <main
            className="h-screen flex flex-col items-center justify-center text-brown-900 p-6 bg-cover bg-center bg-no-repeat text-[#3b2614] px-6 py-12 text-center font-bold"
            style={{
                backgroundImage: 'url("/arkaplan_duz.png")',
                fontFamily: "Pirata One, cursive"
              }}
      >

      <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4">
        Text-based Adventure with AI-powered storytelling
      </h2>

      <h1 className="text-8xl md:text-8xl lg:text-9xl font-extrabold mb-2 tracking-wide">
        MONSTER CLASH RPG
      </h1>

      <p className="italic text-2xl md:text-3xl text-[#3b2614]/90 mb-15">
        You only need your imagination... and a bit of luck 🎲
      </p>

      <div className="flex gap-6 mb-15">
        <Link
          href="/login"
          className="px-8 py-3 bg-[#f2cf9b] text-[#3b2614] border border-[#3b2614] 
                     rounded-full shadow hover:scale-105 transition text-3xl font-bold" 
        >
          LOGIN
        </Link>
        <Link
          href="/signup"
          className="px-8 py-3 bg-[#f2cf9b] text-[#3b2614] border border-[#3b2614] 
                     rounded-full shadow hover:scale-105 transition text-3xl font-bold"
        >
          SIGN UP
        </Link>
      </div>

      <p className="max-w-4xl text-base md:text-2xl text-[#3b2614]">
        Create your character, choose your class, and embark on an epic journey where your decisions matter.
        Each move is powered by a large language model that dynamically generates new story paths.
      </p>

      <footer className="mt-12 text-md text-[#3b2614]/60">
        © 2025 Monster Clash AI RPG. All rights reserved.
      </footer>
    </main>
  );
}
