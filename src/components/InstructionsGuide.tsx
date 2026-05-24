import React from "react";
import { Mic, ArrowRight, Volume2, HelpCircle } from "lucide-react";

export default function InstructionsGuide() {
  return (
    <div id="instructions-guide" className="max-w-2xl mx-auto mt-12 px-4 select-none">
      <div className="bg-gradient-to-tr from-emerald-50/50 via-white to-amber-50/30 border border-emerald-100 rounded-2xl p-6">
        <h3 className="flex items-center gap-2 text-base md:text-lg font-bold text-slate-800 mb-4 border-b border-emerald-100/60 pb-3">
          <HelpCircle className="h-5 w-5 text-emerald-600" />
          <span>How to use Sajilo Chautari • प्रयोग गर्ने तरिका</span>
        </h3>

        <div className="space-y-4">
          {/* Step 1 */}
          <div className="flex gap-4 items-start">
            <div className="bg-white border border-emerald-200 h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm text-emerald-700 flex-shrink-0 shadow-sm">
              १
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Choose Mode & Language • भाषा र तरिका रोज्नुहोस्</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Select your language mode. If a foreigner is speaking, use the "Foreigner → Nepali" mode. If you are a Nepali speaker, use the "Nepali → Foreigner" mode.
              </p>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                कुरा गर्ने तरिका रोज्नुहोस् (विदेशीले बोल्ने हो कि नेपालीले)।
              </p>
            </div>
          </div>

          <div className="border-l border-dashed border-emerald-200 h-4 ml-4"></div>

          {/* Step 2 */}
          <div className="flex gap-4 items-start">
            <div className="bg-white border border-emerald-200 h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm text-emerald-700 flex-shrink-0 shadow-sm">
              २
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                Press microphone & Speak • माइक थिची बोल्नुहोस्
                <Mic className="h-4 w-4 text-emerald-600" />
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Grant microphone access. Click "Tap to Speak", wait for the glowing red animation, and speak clearly. Click "Stop" when you are done.
              </p>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                "माइक" चित्र भएको बटन थिचेर सुस्तरी र प्रष्टसँग बोल्नुहोस्।
              </p>
            </div>
          </div>

          <div className="border-l border-dashed border-emerald-200 h-4 ml-4"></div>

          {/* Step 3 */}
          <div className="flex gap-4 items-start">
            <div className="bg-white border border-emerald-200 h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm text-emerald-700 flex-shrink-0 shadow-sm">
              ३
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                Read or Listen in Nepali • नेपालीमा सुन्नुहोस् वा पढ्नुहोस्
                <Volume2 className="h-4 w-4 text-amber-500" />
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Our AI instantly transcribes and translates your voice. Press the speaker button to hear the translation spoken aloud in standard accent.
              </p>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                नेपालीमा अनुवाद सुन्न वा पढ्न "स्पिकर" को बटन थिच्नुहोस्।
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
