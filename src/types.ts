export interface TranslationSession {
  id: string;
  timestamp: number;
  direction: "foreign-to-nepali" | "nepali-to-foreign";
  inputLanguage: string;
  outputLanguage: string;
  transcribedText: string;
  translatedText: string;
  audioUrl?: string; // Client-side audio URL or Server tts URL
}

export type SupportedLanguageCode = "en" | "es" | "zh" | "hi" | "ar" | "fr";

export interface SupportedLanguage {
  code: SupportedLanguageCode;
  name: string;
  flag: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: "en", name: "English", flag: "🇺🇸", nativeName: "English" },
  { code: "es", name: "Spanish", flag: "🇪🇸", nativeName: "Español" },
  { code: "zh", name: "Chinese", flag: "🇨🇳", nativeName: "中文" },
  { code: "hi", name: "Hindi", flag: "🇮🇳", nativeName: "हिन्दी" },
  { code: "ar", name: "Arabic", flag: "🇸🇦", nativeName: "العربية" },
  { code: "fr", name: "French", flag: "🇫🇷", nativeName: "Français" },
];
