
export const AppMode = {
  CHAT: 'CHAT',
  VISION: 'VISION',
  SETTINGS: 'SETTINGS'
} as const;

export type AppMode = typeof AppMode[keyof typeof AppMode];

export const ModelType = {
  FLASH: 'gemini-3-flash-preview',
  PRO: 'gemini-3-pro-preview',
} as const;

export type ModelType = typeof ModelType[keyof typeof ModelType];

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  error?: boolean;
  image?: string;
  sources?: GroundingSource[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  model: ModelType;
  updatedAt: number;
}
