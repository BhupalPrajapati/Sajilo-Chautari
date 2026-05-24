import React, { useState, useEffect } from "react";
import { MessageSquare, HelpCircle, HardDrive, PhoneCall, RefreshCcw, Wifi, ShieldCheck, HeartPulse } from "lucide-react";
import LandingHero from "./components/LandingHero";
import TranslatorCard from "./components/TranslatorCard";
import InstructionsGuide from "./components/InstructionsGuide";
import ArchitectureDocs from "./components/ArchitectureDocs";
import InstallPrompt from "./components/InstallPrompt";

export default function App() {
  const [showWorkspace, setShowWorkspace] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"workspace" | "instructions" | "blueprint">("workspace");
  const [systemConnected, setSystemConnected] = useState<boolean | null>(null);

  // Ping health API to verify connection to Express full-stack backend
  useEffect(() => {
    const pingHealth = async () => {
      try {
        const response = await fetch("/health");
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          setSystemConnected(false);
          return;
        }
        const data = await response.json();
        if (data.status === "ok") {
          setSystemConnected(true);
        } else {
          setSystemConnected(false);
        }
      } catch (err) {
        setSystemConnected(false);
      }
    };
    pingHealth();
  }, []);

  return (
    <div id="full-app-container" className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans transition-colors duration-200 selection:bg-emerald-100 selection:text-emerald-900 pb-12">
      
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setShowWorkspace(false)}>
            <div className="h-9 w-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-emerald-100 font-display">
              स
            </div>
            <div>
              <h1 className="font-extrabold text-sm md:text-base text-slate-900 tracking-tight leading-none font-display">
                Sajilo Chautari
              </h1>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                सजिलो चौतारी • Rural Speech Bridge
              </span>
            </div>
          </div>

          {/* Quick Connection Indicator */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-mono text-xs scale-90">
              <Wifi className="h-3 w-3 text-emerald-500 animate-pulse" />
              <span>
                {systemConnected === true ? "API Active" : systemConnected === false ? "Local Fallback Mode" : "Checking Cloud Routing..."}
              </span>
            </div>

            {/* Simple View Switcher */}
            {showWorkspace && (
              <nav className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab("workspace")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-100 cursor-pointer ${
                    activeTab === "workspace" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Translator Box
                </button>
                <button
                  onClick={() => setActiveTab("instructions")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-100 cursor-pointer ${
                    activeTab === "instructions" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  User Guide
                </button>
                <button
                  onClick={() => setActiveTab("blueprint")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-100 cursor-pointer ${
                    activeTab === "blueprint" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Blueprint Specs
                </button>
              </nav>
            )}
          </div>

        </div>
      </header>

      {/* Main Core Body Area */}
      <main className="flex-grow py-6 md:py-10">
        {!showWorkspace ? (
          // Dynamic Landing Page
          <div className="space-y-12">
            <LandingHero onStart={() => {
              setShowWorkspace(true);
              setActiveTab("workspace");
            }} />
            <InstructionsGuide />
            
            {/* Install Prompt Mobile Companion Section */}
            <InstallPrompt />
            
            {/* Direct Static Reference container */}
            <div className="max-w-4xl mx-auto px-4 mt-8">
              <ArchitectureDocs />
            </div>
          </div>
        ) : (
          // Active Workspace Panel
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Return control bar */}
            <div className="px-4 flex justify-between items-center">
              <button
                onClick={() => setShowWorkspace(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                ← Return to Home
              </button>
              
              <div className="text-xs text-slate-400 font-mono">
                System: <span className="font-bold text-slate-600">Active Node v1.1</span>
              </div>
            </div>

            {/* Selected Tab content */}
            {activeTab === "workspace" && (
              <div className="space-y-6">
                <TranslatorCard />
                {/* Inline humble guide under Translator widget to boost confidence in old users */}
                <div className="max-w-4xl mx-auto px-4">
                  <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100/50 flex gap-3 text-xs text-emerald-800 items-center justify-between">
                    <p className="font-semibold leading-relaxed">
                      💡 <strong>Tip for rural volunteers:</strong> Ensure the smartphone speaker volume is turned fully to maximum so both you and the foreigner can hear output speech properly.
                    </p>
                    <button
                      onClick={() => setActiveTab("instructions")}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg uppercase cursor-pointer"
                    >
                      Bilingual Guide
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "instructions" && (
              <div className="space-y-6">
                <InstructionsGuide />
                <div className="text-center pt-4">
                  <button
                    onClick={() => setActiveTab("workspace")}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer shadow-md"
                  >
                    Return to Translator Screen
                  </button>
                </div>
              </div>
            )}

            {activeTab === "blueprint" && (
              <div className="px-4">
                <ArchitectureDocs />
              </div>
            )}

          </div>
        )}
      </main>

      {/* Simple Humble Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-center select-none">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Sajilo Chautari • सजिलो चौतारी — Proudly built for local Nepalese communication assistance</span>
          </p>
          <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
            Optimized for rural deployment, low data packages, fallback mechanisms, and zero-cost on-device speech synthesis. Safe and private translation data channels.
          </p>
        </div>
      </footer>

    </div>
  );
}
