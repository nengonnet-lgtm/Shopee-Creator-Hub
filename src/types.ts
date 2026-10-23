export interface ScriptPreset {
  id: string;
  title: string;
  description: string;
  text: string;
  category: string;
  language: string;
}

export interface VoiceProfile {
  voiceName: string;
  displayLabel: string;
  gender: "Male" | "Female" | "Ambiguous";
  toneDescription: string;
  language: string;
  tags: string[];
}

export interface VoiceoverItem {
  id: string;
  timestamp: Date;
  scriptText: string;
  voice: string;
  emotion: string;
  audioUrl: string;
  rawPcm: Int16Array;
  duration: number; // in seconds
}

export interface QueueItem {
  id: string;
  scriptText: string;
  voice: string;
  emotion: string;
  status: "pending" | "generating" | "completed" | "failed";
  error?: string;
  resultId?: string;
}
