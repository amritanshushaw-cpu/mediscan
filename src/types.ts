export type Screen = 'idle' | 'camera' | 'processing' | 'results' | 'error';

export interface ScanResult {
  drugName: string;
  dosage: string;
  sideEffects: string;
  warnings: string;
  confidence: 'high' | 'medium' | 'low';
  cached?: boolean;
  timestamp?: number;
  language?: string;
}

export interface HistoryItem {
  id: string;
  result: ScanResult;
  thumbnail?: string;
  timestamp: number;
}

export interface Language {
  code: string;
  name: string;
  native: string;
  bhashiniCode: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English',    native: 'English',    bhashiniCode: 'en',  flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi',      native: 'हिंदी',        bhashiniCode: 'hi',  flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali',    native: 'বাংলা',        bhashiniCode: 'bn',  flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil',      native: 'தமிழ்',        bhashiniCode: 'ta',  flag: '🇮🇳' },
  { code: 'te', name: 'Telugu',     native: 'తెలుగు',       bhashiniCode: 'te',  flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi',    native: 'मराठी',        bhashiniCode: 'mr',  flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati',   native: 'ગુજરાતી',      bhashiniCode: 'gu',  flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada',    native: 'ಕನ್ನಡ',        bhashiniCode: 'kn',  flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam',  native: 'മലയാളം',       bhashiniCode: 'ml',  flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi',    native: 'ਪੰਜਾਬੀ',       bhashiniCode: 'pa',  flag: '🇮🇳' },
  { code: 'or', name: 'Odia',       native: 'ଓଡ଼ିଆ',        bhashiniCode: 'or',  flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu',       native: 'اردو',         bhashiniCode: 'ur',  flag: '🇮🇳' },
];

export const RESULT_CARDS = [
  { key: 'drugName'    as const, icon: '💊', label: 'Medicine Name',  color: '#F4C430', ariaLabel: 'Medicine name' },
  { key: 'dosage'      as const, icon: '📋', label: 'How to Take It', color: '#60A5FA', ariaLabel: 'Dosage' },
  { key: 'sideEffects' as const, icon: '⚡', label: 'Side Effects',   color: '#A78BFA', ariaLabel: 'Side effects' },
  { key: 'warnings'    as const, icon: '⚠️', label: 'Warnings',       color: '#F87171', ariaLabel: 'Warnings' },
];

export const CONFIDENCE_STYLE = {
  high:   { bg: 'rgba(74,222,128,.15)',  border: 'rgba(74,222,128,.4)',  color: '#4ADE80', label: '✓ Clear read' },
  medium: { bg: 'rgba(250,204,21,.15)',  border: 'rgba(250,204,21,.4)',  color: '#FACC15', label: '~ Fair read'  },
  low:    { bg: 'rgba(248,113,113,.15)', border: 'rgba(248,113,113,.4)', color: '#F87171', label: '! Unclear'    },
};
