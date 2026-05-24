import React, { useState, useEffect } from "react";
import { Smartphone, Download, Share2, PlusSquare, Check, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [deviceOS, setDeviceOS] = useState<"ios" | "android" | "desktop" | "unknown">("unknown");
  const [showiOSTip, setShowiOSTip] = useState<boolean>(false);
  const [installationStep, setInstallationStep] = useState<number>(0); // for developer info step-through

  useEffect(() => {
    // 1. Detect if already running in standalone install mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    
    if (isStandalone) {
      setIsInstalled(true);
    }

    // 2. Detect User Agent OS
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setDeviceOS("ios");
    } else if (/android/.test(ua)) {
      setDeviceOS("android");
    } else {
      setDeviceOS("desktop");
    }

    // 3. Listen for Chrome's beforeinstallprompt Event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if we are already in standalone mode on launch
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const triggerChromeInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the browser install banner
    deferredPrompt.prompt();
    
    // Wait for response
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User installation choice outcome: ${outcome}`);
    
    if (outcome === "accepted") {
      setIsInstalled(true);
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <section id="mobile-app-section" className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-3xl shadow-xl overflow-hidden p-6 md:p-10 border border-emerald-800 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Main Title & Descriptive Section */}
          <div className="lg:col-span-7 text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-800/60 border border-emerald-600/40 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-300">
              <Smartphone className="h-3.5 w-3.5" />
              <span>Mobile Companion • मोबाइल एप</span>
            </div>
            
            <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight font-display text-white">
              Sajilo App on Your Mobile <br />
              <span className="text-emerald-400">Install It For Free</span>
            </h2>
            
            <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-xl">
              Turn Sajilo Chautari into a real lightweight mobile app on your smartphone! It installs instantly, occupies less than 2MB space, runs smoothly, and lets you open translations with a single tap from your home screen.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>No app store fees</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Installs in 5 seconds</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Fully Responsive</span>
              </div>
            </div>
          </div>

          {/* Dynamic App Install Action Card */}
          <div className="lg:col-span-5 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-center flex flex-col justify-between min-h-[220px]">
            
            {/* 1. Condition: Already installed / running in standalone */}
            {isInstalled ? (
              <div className="space-y-4 py-4 flex flex-col items-center justify-center flex-grow">
                <div className="h-16 w-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center animate-bounce">
                  <Check className="h-8 w-8 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-lg">App Active & Installed</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    You are currently using Sajilo Chautari's installed standalone mobile interface. Excellent!
                  </p>
                </div>
              </div>
            ) : (
              /* 2. Condition: Not installed yet */
              <div className="flex-grow flex flex-col justify-between space-y-4">
                
                {/* Visual Top Preview */}
                <div className="space-y-2">
                  <div className="flex justify-center -space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse"></span>
                    <span className="h-2 w-2 rounded-full bg-yellow-400"></span>
                    <span className="h-2 w-2 rounded-full bg-green-400"></span>
                  </div>
                  <div className="bg-slate-900/40 rounded-lg p-2.5 inline-flex items-center gap-2 max-w-[200px] mx-auto border border-white/5">
                    <img src="/sajilo_icon.png" alt="Sajilo" className="h-7 w-7 rounded-md shadow" referrerPolicy="no-referrer" />
                    <span className="text-xs font-bold text-white tracking-tight truncate">Sajilo App</span>
                  </div>
                </div>

                {/* Android / Chrome One-Tap Install Button */}
                {isInstallable && (
                  <button
                    onClick={triggerChromeInstall}
                    className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] cursor-pointer shadow-lg shadow-emerald-950/40"
                  >
                    <Download className="h-4 w-4 stroke-[2.5]" />
                    <span>Install Sajilo on Device</span>
                  </button>
                )}

                {/* If PWA flag is not caught but they have standard browsers (or iOS fallback instructions) */}
                {!isInstallable && (
                  <div className="space-y-3">
                    {deviceOS === "ios" ? (
                      <div className="space-y-2 text-left">
                        <p className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                          <Share2 className="h-3.5 w-3.5 text-emerald-400" />
                          <span>How to install on iOS (Safari):</span>
                        </p>
                        <ol className="text-[11px] text-slate-400 space-y-1 list-decimal list-inside pl-1 bg-slate-950/20 p-2.5 rounded-lg border border-white/5">
                          <li>Open Sajilo on Apple <strong>Safari</strong> browser.</li>
                          <li>Tap the default browser <strong>Share button</strong> in bottom navigation bar.</li>
                          <li>Click on <strong>"Add to Home Screen"</strong> option.</li>
                          <li>Confirm by pressing <strong>Add</strong>. That's it!</li>
                        </ol>
                      </div>
                    ) : (
                      <div className="text-left space-y-2">
                        <button
                          onClick={() => {
                            if (deviceOS === "ios") setShowiOSTip(true);
                            else {
                              // Generically prompt Chrome shortcut instructions
                              alert("Simply tap the '...' (Three dots menu) in your browser top-right corner, and click 'Install app' or 'Add to Home screen' to download Sajilo Chautari!");
                            }
                          }}
                          className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border border-emerald-500/20"
                        >
                          <Download className="h-4 w-4" />
                          <span>Get Setup Directions</span>
                        </button>
                        <p className="text-[10px] text-slate-400 text-center">
                          Supports chrome, Edge, Opera, and Safari.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
              </div>
            )}
            
          </div>

        </div>

        {/* Developer Free Android APK Generation Blueprint */}
        <div className="mt-8 pt-8 border-t border-emerald-800/60 text-left">
          <h3 className="text-xs font-extrabold uppercase text-emerald-300 tracking-wider flex items-center gap-1.5 mb-3">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Bonus Setup: Generate Free Native APK package for Play Store / Offline Sharing</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            If you want to compile a physical <strong>offline .apk file</strong> to share with folks over Bluetooth/SHAREit, you are able to use free wrapping frameworks to bundle Sajilo Chautari automatically without custom rewrite.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-950/30 rounded-xl border border-white/5 text-xs">
              <h4 className="font-bold text-white mb-1.5">⚡ Option A: Capacitor (By Ionic)</h4>
              <p className="text-slate-400 leading-relaxed mb-3">
                Integrates directly into our code to turn our build (`dist`) into an Android Studio & iOS Xcode project. 100% free.
              </p>
              <div className="font-mono text-[10px] bg-slate-950/70 p-2 rounded text-emerald-400 overflow-x-auto space-y-1 select-all">
                <div>npm install @capacitor/core @capacitor/cli</div>
                <div>npx cap init "Sajilo Chautari" "com.sajilo.app"</div>
                <div>npx cap add android</div>
                <div>npx cap copy</div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/30 rounded-xl border border-white/5 text-xs">
              <h4 className="font-bold text-white mb-1.5">⚡ Option B: PWA2APK / Bubblewrap</h4>
              <p className="text-slate-400 leading-relaxed mb-3">
                Uses Google's Trusted Web Activity command-line tool. It reads our `manifest.json` on Render and bundles it into an APK instantly.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                <li>Instant conversion via free web tools like <strong>pwabuilder.com</strong></li>
                <li>Download self-signed `.apk` package for sideloading</li>
                <li>Generates keytool certs for uploading to Google Play Store</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
