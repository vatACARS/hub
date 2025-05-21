// pages/home.tsx
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Toaster } from "react-hot-toast";

const description = "Welcome to vatACARS Hub, the new home for all things to do with vatSys Plugins";

export default function HomePage() {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    setTyped(""); // Reset on mount
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTyped(description.slice(0, i));
      if (i >= description.length) {
        clearInterval(interval);
      }
    }, 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <Toaster position="top-center" />
      <div className="relative w-full min-h-screen flex flex-col items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/img/home-background.jpg')" }}
        />
        <div className="relative z-10 flex flex-col items-center">
          <img
            src="/img/vatacars-logo-dark.png"
            alt="vatACARS Logo"
            className="w-full max-w-[400px] h-auto object-contain pointer-events-none mb-4"
          />
          <h1 className="text-4xl font-bold">
            <span>{typed}</span>
            <span className="animate-pulse text-slate-400">|</span>
          </h1>
        </div>
      </div>
    </Layout>
  );
}
