import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  Square,
  Volume2,
  VolumeX,
  Languages,
  ArrowRightLeft,
  RefreshCcw,
  AlertCircle,
  Copy,
  Check,
  Send,
  Sparkles,
  Bookmark,
  BookMarked
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SUPPORTED_LANGUAGES, TranslationSession } from "../types";

export default function TranslatorCard() {
  // Session Configuration State
  const [direction, setDirection] = useState<"foreign-to-nepali" | "nepali-to-foreign">("foreign-to-nepali");
  const [foreignLang, setForeignLang] = useState<string>("English");
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  // Process State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorString, setErrorString] = useState<string | null>(null);
  
  // Active Output State
  const [transcribedText, setTranscribedText] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [detectedLanguage, setDetectedLanguage] = useState<string>("");
  
  // Direct Text Input Fallback
  const [textInput, setTextInput] = useState<string>("");
  const [showTextInput, setShowTextInput] = useState<boolean>(false);

  // Playback / TTS State
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [useServerTts, setUseServerTts] = useState<boolean>(true); // Default to Server-side TTS for robust voice synthesis across all platforms!

  // Utils
  const [copiedTrans, setCopiedTrans] = useState<boolean>(false);
  const [copiedOriginal, setCopiedOriginal] = useState<boolean>(false);
  
  // History Tracker
  const [history, setHistory] = useState<TranslationSession[]>([]);

  // Refs for audio capturing
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

  // Load history on mount
  useEffect(() => {
    const cached = localStorage.getItem("sajilo_history");
    if (cached) {
      try {
        setHistory(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse localStorage history", e);
      }
    }
  }, []);

  // Sync history with cache
  const saveHistory = (newHistory: TranslationSession[]) => {
    setHistory(newHistory);
    localStorage.setItem("sajilo_history", JSON.stringify(newHistory));
  };

  // Duration ticking during record
  useEffect(() => {
    if (isRecording) {
      setRecordingDuration(0);
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }
    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    };
  }, [isRecording]);

  // Audio recording handlers
  const startRecording = async () => {
    setErrorString(null);
    audioChunksRef.current = [];
    setAudioBlob(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine supported mimeTypes for audio recording
      let options = { mimeType: "audio/webm" };
      if (!MediaRecorder.isTypeSupported("audio/webm")) {
        options = { mimeType: "audio/mp4" }; // fallback for Safari/macOS
        if (!MediaRecorder.isTypeSupported("audio/mp4")) {
          options = { mimeType: "" }; // default browser choice
        }
      }

      const recorder = new MediaRecorder(stream, options);
      
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setAudioBlob(audioBlob);
        processRecordedAudio(audioBlob);
        
        // Stop all mic hardware tracks to clean up the browser permission light
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error("Microphone Access Error:", err);
      setErrorString("Microphone access denied or unsupported. Please check device settings or type directly below.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Call translation backend on voice submit
  const processRecordedAudio = async (blobToUpload: Blob) => {
    setIsLoading(true);
    setErrorString(null);

    const formData = new FormData();
    formData.append("audio", blobToUpload, "voice.webm");
    formData.append("direction", direction);
    formData.append("targetLanguage", foreignLang);

    try {
      const response = await fetch("/api/process-audio", {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("The translation server returned an unexpected non-JSON response (HTML page). If you are running on Render, ensure your full-stack Node server is started correctly instead of hosting static files only.");
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned error ${response.status}: Failed to process translation.`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setTranscribedText(data.transcribedText || "");
      setTranslatedText(data.translatedText || "");
      setDetectedLanguage(data.detectedLanguage || (direction === "foreign-to-nepali" ? foreignLang : "Nepali"));

      // Speak aloud in Nepali / output language automatically for convenience!
      triggerSpeechSynthesis(data.translatedText, direction === "foreign-to-nepali" ? "ne-NP" : "en-US");

      // Save to local session history
      const newSession: TranslationSession = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        direction,
        inputLanguage: direction === "foreign-to-nepali" ? foreignLang : "Nepali",
        outputLanguage: direction === "foreign-to-nepali" ? "Nepali" : foreignLang,
        transcribedText: data.transcribedText,
        translatedText: data.translatedText,
      };

      saveHistory([newSession, ...history].slice(0, 20)); // Limit to 20 search sessions
    } catch (err: any) {
      console.error("Translation Pipeline error:", err);
      setErrorString(err.message || "Failed to contact translation services. Check internet access or try typing below.");
    } finally {
      setIsLoading(false);
    }
  };

  // Direct Text Translation Trigger
  const triggerTextTranslation = async () => {
    if (!textInput.trim()) return;
    setIsLoading(true);
    setErrorString(null);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textInput,
          direction,
          targetLanguage: foreignLang,
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("The translation server returned an unexpected non-JSON response (HTML page). If you are running on Render, ensure your full-stack Node server is started correctly instead of hosting static files only.");
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setTranscribedText(textInput);
      setTranslatedText(data.text);
      setDetectedLanguage(direction === "foreign-to-nepali" ? foreignLang : "Nepali");

      // Automatic synthetic audio
      triggerSpeechSynthesis(data.text, direction === "foreign-to-nepali" ? "ne-NP" : "en-US");

      // Cache session in history
      const newSession: TranslationSession = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        direction,
        inputLanguage: direction === "foreign-to-nepali" ? foreignLang : "Nepali",
        outputLanguage: direction === "foreign-to-nepali" ? "Nepali" : foreignLang,
        transcribedText: textInput,
        translatedText: data.text,
      };
      saveHistory([newSession, ...history].slice(0, 20));
      setTextInput("");
    } catch (err: any) {
      console.error(err);
      setErrorString("Failed to translate the text input. Please check connectivity and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to convert base64 linear PCM returned from Gemini into standard WAV 44-byte format
  const pcmBase64ToWavUrl = (pcmBase64: string, sampleRate: number = 24000): string => {
    const binaryString = window.atob(pcmBase64);
    const len = binaryString.length;
    const buffer = new ArrayBuffer(44 + len);
    const view = new DataView(buffer);

    const writeString = (v: DataView, offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        v.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* file length (header size 36 + data size) */
    view.setUint32(4, 36 + len, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw pcm = 1) */
    view.setUint16(20, 1, true);
    /* channel count (mono = 1) */
    view.setUint16(22, 1, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * 2, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, 2, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* chunk length */
    view.setUint32(40, len, true);

    // Write raw PCM audio bytes
    for (let i = 0; i < len; i++) {
      view.setUint8(44 + i, binaryString.charCodeAt(i));
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  };

  // Text-To-Speech Synthesis Engine
  const triggerSpeechSynthesis = async (speechText: string, langCode: string) => {
    if (!speechText) return;
    setIsSpeaking(true);

    if (useServerTts) {
      // PREMIUM SERVER-SIDE TTS (gemini-3.1-flash-tts-preview)
      try {
        const voiceChoice = direction === "foreign-to-nepali" ? "Zephyr" : "Kore";
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: speechText,
            voice: voiceChoice,
          }),
        });
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("The translation server returned an unexpected non-JSON response (HTML page) for Speech Synthesis.");
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          if (response.status === 429 || errData.code === "QUOTA_EXCEEDED") {
            setUseServerTts(false); // Switch to offline client-side TTS automatically!
            throw new Error("Gemini Speech synthesis quota limit exceeded. Switching to device synthesis.");
          }
          throw new Error(errData.error || `Server TTS returned status ${response.status}`);
        }
        const data = await response.json();
        
        if (data.audio) {
          if (ttsAudioRef.current) {
            ttsAudioRef.current.pause();
          }

          let audioUrl = "";
          const lowercaseMime = (data.mimeType || "").toLowerCase();
          
          if (lowercaseMime.includes("pcm")) {
            // Raw PCM -> Convert with WAV 44-byte standard header
            audioUrl = pcmBase64ToWavUrl(data.audio, 24000);
          } else if (lowercaseMime.includes("wav") || lowercaseMime.includes("mp3") || lowercaseMime.includes("mpeg")) {
            // Already container-encoded audio
            audioUrl = `data:${data.mimeType};base64,${data.audio}`;
          } else {
            // Default: try to wrap in WAV since Gemini TTS output is linear PCM
            try {
              audioUrl = pcmBase64ToWavUrl(data.audio, 24000);
            } catch (convErr) {
              console.warn("PCM conversion failed, falling back to data URI", convErr);
              audioUrl = `data:${data.mimeType || "audio/wav"};base64,${data.audio}`;
            }
          }

          const audio = new Audio(audioUrl);
          ttsAudioRef.current = audio;
          audio.onended = () => setIsSpeaking(false);
          audio.onerror = () => {
            console.warn("WAV Audio element decode error, falling back to client-side speech synthesis");
            triggerClientSpeechSynthesis(speechText, langCode);
          };
          audio.play().catch((playErr) => {
            console.warn("Audio play blocked/failed, falling back to client-side speech synthesis", playErr);
            triggerClientSpeechSynthesis(speechText, langCode);
          });
        } else {
          throw new Error("No audio returned");
        }
      } catch (err: any) {
        console.warn("Server-side TTS failed, using client-side synthesis instead.", err);
        const errString = String(err.message || "").toLowerCase();
        if (errString.includes("quota") || errString.includes("limit") || errString.includes("429")) {
          setErrorString("Gemini Speech free tier daily quota (10 requests/day) reached! Sajilo has dynamically switched you to 'OFFLINE LIGHT' device-to-speech synthesis for uninterrupted voice support.");
        }
        triggerClientSpeechSynthesis(speechText, langCode);
      }
    } else {
      // BANDWIDTH OPTIMIZED LOCAL BROWSER-SIDE SYNTHESIS (Web Speech API)
      triggerClientSpeechSynthesis(speechText, langCode);
    }
  };

  const triggerClientSpeechSynthesis = (speechText: string, langCode: string) => {
    if (!window.speechSynthesis) {
      console.error("Browser does not support Web Speech synthesis.");
      setIsSpeaking(false);
      return;
    }

    // Cancel dynamic speaking is active
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = langCode; // e.g. ne-NP for Nepali text or en-US for English text
    
    // Attempt picking ideal installed local voices
    const voices = window.speechSynthesis.getVoices();
    const voiceMatch = voices.find(
      (v) => v.lang.startsWith(langCode.substring(0, 2)) || v.lang.includes(langCode)
    );
    if (voiceMatch) {
      utterance.voice = voiceMatch;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (e) => {
      console.error("Speech Synthesis Error:", e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (useServerTts && ttsAudioRef.current) {
      ttsAudioRef.current.pause();
    } else {
      window.speechSynthesis?.cancel();
    }
    setIsSpeaking(false);
  };

  // Reset inputs
  const resetTranslationBoard = () => {
    setTranscribedText("");
    setTranslatedText("");
    setDetectedLanguage("");
    setErrorString(null);
  };

  // Copy to Clipboard helpers
  const copyText = (text: string, type: "trans" | "original") => {
    navigator.clipboard.writeText(text);
    if (type === "trans") {
      setCopiedTrans(true);
      setTimeout(() => setCopiedTrans(false), 2000);
    } else {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    }
  };

  // Toggle Direction shortcut
  const toggleDirection = () => {
    resetTranslationBoard();
    setDirection((prev) => (prev === "foreign-to-nepali" ? "nepali-to-foreign" : "foreign-to-nepali"));
  };

  // Inline duration parser
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div id="translator-card" className="max-w-4xl mx-auto px-4 py-4 space-y-6 select-none">
      
      {/* Configuration row */}
      <div className="bg-white border border-slate-200/90 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        
        {/* Direction Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-stretch md:self-auto">
          <button
            onClick={() => {
              if (direction !== "foreign-to-nepali") {
                toggleDirection();
              }
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs md:text-sm font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
              direction === "foreign-to-nepali"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Languages className="h-4 w-4" />
            <span>Foreign Key ➜ Nepali</span>
          </button>
          
          <button
            onClick={() => {
              if (direction !== "nepali-to-foreign") {
                toggleDirection();
              }
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs md:text-sm font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
              direction === "nepali-to-foreign"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Languages className="h-4 w-4" />
            <span>नेपाली ➜ Foreigner</span>
          </button>
        </div>

        {/* Mid swap arrow */}
        <button
          onClick={toggleDirection}
          className="p-2.5 hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors rounded-xl flex items-center justify-center cursor-pointer border border-dashed border-slate-200"
          title="Swap communication direction"
        >
          <ArrowRightLeft className="h-4 w-4" />
        </button>

        {/* Foreigner Language selection dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Foreigner's Language:</label>
          <select
            value={foreignLang}
            onChange={(e) => {
              setForeignLang(e.target.value);
              resetTranslationBoard();
            }}
            disabled={isRecording || isLoading}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer disabled:opacity-50"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.name}>
                {lang.flag} {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary translation console */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* Input Panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col justify-between min-h-[350px] shadow-sm relative overflow-hidden">
          
          {/* Active indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>

          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold uppercase rounded-lg tracking-wider">
                Speak {direction === "foreign-to-nepali" ? foreignLang : "Nepali"}
              </span>
              <button
                onClick={() => setShowTextInput(!showTextInput)}
                className="text-xs text-slate-400 hover:text-emerald-600 font-semibold transition-colors underline cursor-pointer"
              >
                {showTextInput ? "Use Microphone" : "Weak Connection? Type Instead"}
              </button>
            </div>

            {/* Core capturing zone */}
            {!showTextInput ? (
              <div className="flex flex-col items-center justify-center py-6">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={isLoading}
                    id="btn-voice-record-start"
                    className="h-24 w-24 rounded-full bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-500 flex flex-col items-center justify-center text-emerald-600 transition-all hover:scale-105 active:scale-95 shadow-md shadow-emerald-50 border-dashed cursor-pointer disabled:opacity-50 disabled:scale-100 duration-200 group"
                  >
                    <Mic className="h-8 w-8 text-emerald-600 group-hover:animate-bounce" />
                    <span className="text-[10px] font-bold uppercase mt-1">Tap to Speak</span>
                  </button>
                ) : (
                  <div className="flex flex-col items-center">
                    <button
                      onClick={stopRecording}
                      id="btn-voice-record-stop"
                      className="h-24 w-24 rounded-full bg-red-600 flex flex-col items-center justify-center text-white border-4 border-red-100 cursor-pointer animate-record-pulse"
                    >
                      <Square className="h-8 w-8 text-white scale-90" />
                      <span className="text-[10px] font-bold uppercase mt-1">Stop mic</span>
                    </button>
                    <span className="text-sm font-semibold text-red-600 uppercase tracking-widest mt-4 animate-pulse">
                      Recording ({formatDuration(recordingDuration)})
                    </span>
                    <p className="text-xs text-slate-400 mt-1">AI listening closely. Speak clearly near mic.</p>
                  </div>
                )}

                {!isRecording && (
                  <p className="text-xs text-slate-400 text-center mt-6">
                    Press microphone to start recording.<br />
                    We optimize compression automatically to save rural networks data.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={
                    direction === "foreign-to-nepali"
                      ? `Type whatever you want to translate to Nepali here...`
                      : `नेपालीमा लेख्नुहोस् (Type Nepali words)...`
                  }
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200/80 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-2xl p-4 text-sm resize-none text-slate-800 placeholder-slate-400 font-sans"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setTextInput("");
                      setShowTextInput(false);
                    }}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-slate-600 font-bold tracking-wide uppercase transition-colors mr-2 inline-block cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={triggerTextTranslation}
                    disabled={isLoading || !textInput.trim()}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <span>Translate</span>
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Loader or recorded indicator */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            {transcribedText ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                  <span>VERBATIM TRANSCRIPTION:</span>
                  <button
                    onClick={() => copyText(transcribedText, "original")}
                    className="flex items-center gap-1 hover:text-emerald-600 transition-colors cursor-pointer"
                  >
                    {copiedOriginal ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedOriginal ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <p className="text-slate-800 text-base md:text-lg font-medium font-sans leading-relaxed">
                  "{transcribedText}"
                </p>
                {detectedLanguage && (
                  <span className="inline-block text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Language: {detectedLanguage}
                  </span>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">No input processed yet in this iteration.</div>
            )}
          </div>
        </div>

        {/* Translation Output Panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col justify-between min-h-[350px] shadow-sm relative overflow-hidden">
          
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-amber-600"></div>

          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold uppercase rounded-lg tracking-wider border border-amber-100/50">
                Translation Output • नेपाली अनुवाद
              </span>
              
              {/* Refinement toggle settings to let custom users select Voice synthesis profile */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Dynamic Voice:</span>
                <button
                  onClick={() => setUseServerTts(!useServerTts)}
                  className={`px-2 py-1 rounded text-[10px] font-bold ${
                    useServerTts
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  } transition-all cursor-pointer`}
                  title={useServerTts ? "Uses high quality core model synthesis" : "Zero bandwidth local device speech translation"}
                >
                  {useServerTts ? "PREMIUM AI (Web)" : "OFFLINE LIGHT"}
                </button>
              </div>
            </div>

            {/* Synthesis output content */}
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <div className="h-10 w-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                  <p className="text-sm font-semibold text-slate-600 tracking-wide mt-4">AI Translating • अनुवाद हुँदैछ...</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[240px] text-center">Comparing localized phrases for optimal conversational fit</p>
                </motion.div>
              ) : translatedText ? (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <p className="text-slate-950 font-display text-2xl md:text-3xl font-bold tracking-tight leading-snug">
                    {translatedText}
                  </p>

                  <div className="flex gap-2">
                    {/* Audio output trigger buttons */}
                    {isSpeaking ? (
                      <button
                        onClick={stopSpeaking}
                        className="flex items-center gap-2 px-5 py-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-sm animate-pulse"
                      >
                        <VolumeX className="h-4 w-4" />
                        <span>Mute • रोक्नुहोस्</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => triggerSpeechSynthesis(translatedText, direction === "foreign-to-nepali" ? "ne-NP" : "en-US")}
                        className="flex items-center gap-2 px-5 py-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-sm"
                      >
                        <Volume2 className="h-4 w-4" />
                        <span>Speak loud • सुनाउनुहोस्</span>
                      </button>
                    )}

                    {/* Copy button */}
                    <button
                      onClick={() => copyText(translatedText, "trans")}
                      className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                      title="Copy translated output"
                    >
                      {copiedTrans ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <Sparkles className="h-8 w-8 text-amber-300 animate-pulse mb-3" />
                  <p className="text-slate-400 text-sm max-w-[250px] leading-relaxed">
                    Sajilo Chautari will present the translated Nepali or foreign speech results, idioms, and voice controls right here.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Clear controls */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            {translatedText ? (
              <button
                onClick={resetTranslationBoard}
                className="text-slate-400 hover:text-red-500 font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
              >
                <RefreshCcw className="h-3 w-3" />
                <span>Reset Screen</span>
              </button>
            ) : (
              <span className="text-slate-300">Ready to accept translation signals</span>
            )}
            
            {/* Tone Helper tag */}
            <span className="font-semibold text-slate-400 uppercase tracking-widest text-[10px]">
              {direction === "foreign-to-nepali" ? "Rural Friendly Accent" : `${foreignLang} Output`}
            </span>
          </div>
        </div>

      </div>

      {/* Embedded error feedback banner */}
      {errorString && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex gap-3 text-sm text-rose-800 items-start shadow-sm"
        >
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Dynamic Audio processing obstacle:</p>
            <p className="text-xs text-rose-700 leading-relaxed">{errorString}</p>
          </div>
        </motion.div>
      )}

      {/* History log block */}
      {history.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <BookMarked className="h-4 w-4 text-slate-400" />
            <span>Recent Conversation logs (Saved locally)</span>
          </h3>

          <div className="space-y-3 divide-y divide-slate-100 max-h-60 overflow-y-auto pr-2">
            {history.map((log) => (
              <div key={log.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-bold text-slate-400">
                      {log.direction === "foreign-to-nepali" ? `${log.inputLanguage} ➜ Nepali` : `Nepali ➜ ${log.outputLanguage}`}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800 font-sans">
                    Original: <span className="text-slate-600 italic">"{log.transcribedText}"</span>
                  </p>
                  <p className="text-sm font-bold text-slate-950 font-display">
                    Translated: <span className="text-emerald-700">"{log.translatedText}"</span>
                  </p>
                </div>
                
                {/* Immediate synthesis on list */}
                <button
                  onClick={() => {
                    setTranscribedText(log.transcribedText);
                    setTranslatedText(log.translatedText);
                    setDetectedLanguage(log.direction === "foreign-to-nepali" ? log.inputLanguage : "Nepali");
                    triggerSpeechSynthesis(log.translatedText, log.direction === "foreign-to-nepali" ? "ne-NP" : "en-US");
                  }}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-emerald-200 hover:text-emerald-700 rounded-lg text-xs font-semibold self-start sm:self-center cursor-pointer transition-all"
                >
                  Load & Speak
                </button>
              </div>
            ))}
          </div>

          {/* Clear history button */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => saveHistory([])}
              className="text-xs text-slate-400 hover:text-red-500 font-bold uppercase transition-colors cursor-pointer"
            >
              Clear Logs
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
