import React from "react";
import { MessageSquareCode, Globe2, Heart, Volume2 } from "lucide-react";
import { motion } from "motion/react";

interface LandingHeroProps {
  onStart: () => void;
}

export default function LandingHero({ onStart }: LandingHeroProps) {
  return (
    <div id="landing-hero" className="max-w-4xl mx-auto px-4 py-8 md:py-16 text-center select-none">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-xs md:text-sm border border-emerald-100 mb-6"
      >
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
        Sajilo Chautari • सजिलो चौतारी — Rural Speech Bridge
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 font-display"
      >
        Bridging the Gap Between <br className="hidden sm:inline" />
        <span className="text-emerald-600">Rural Nepal</span> & The World
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-sans"
      >
        Empowering villagers in remote Nepali communities to communicate effortlessly with global travelers.
        Speak in any major language, hear it spoken back instantly in warm, clear conversational Nepali.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
      >
        <button
          onClick={onStart}
          id="btn-start-translation"
          className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-lg rounded-2xl shadow-lg hover:shadow-emerald-100 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer duration-200"
        >
          Start Translation • सुरु गर्नुहोस्
        </button>
        <a
          href="#architecture-section"
          className="w-full sm:w-auto px-6 py-4 text-slate-600 hover:text-slate-800 font-semibold text-base transition-colors"
        >
          View System Blueprint
        </a>
      </motion.div>

      {/* Feature Bento-Lite Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm"
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
            <Globe2 className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-2">Multilingual input</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Foreign tour guides, doctors, and travelers can speak in English, Spanish, Chinese, Hindi, Arabic, or French.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm"
        >
          <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
            <Volume2 className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-2">Nepali Audio Output</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Translates to conversational, gentle, and respectful Nepali, complete with text-to-speech audio synthesis for illiterate users.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm"
        >
          <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
            <Heart className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-2">Low Bandwidth Ready</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Combines speech recognition, language detection, and translation into a single backend audio-processing step to minimize data usage.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
