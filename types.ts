
export enum VoiceType {
  MALE = 'Puck',
  FEMALE = 'Kore',
}

export enum VoiceTone {
  FORMAL = 'ทางการ',
  CONCISE = 'กระชับ',
  DYNAMIC = 'เร้าใจ',
}

export interface TTSSettings {
  text: string;
  voice: VoiceType;
  tone: VoiceTone;
  speed: number;
}

export interface AudioState {
  isPlaying: boolean;
  isGenerating: boolean;
  error: string | null;
}
