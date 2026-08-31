export type SkillCategory = 
  | 'all'
  | 'tech'
  | 'ai'
  | 'diy'
  | 'languages'
  | 'business'
  | 'design'
  | 'life_hacks';

export type SkillLevel = 'مبتدئ' | 'متوسط' | 'متقدم';

export interface ActionStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  tip?: string;
  codeSnippet?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  type: 'code' | 'link' | 'prompt' | 'cheat_sheet' | 'formula';
  content: string;
  url?: string;
}

export interface Comment {
  id: string;
  userName: string;
  userAvatar: string;
  badge?: string;
  text: string;
  likes: number;
  isLiked?: boolean;
  timestamp: string;
  replies?: Comment[];
}

export interface SkillVideo {
  id: string;
  title: string;
  creator: {
    name: string;
    handle: string;
    avatar: string;
    title: string;
    isVerified?: boolean;
    followersCount: string;
  };
  videoUrl: string; // Video URL or animated demo canvas
  posterUrl?: string;
  category: SkillCategory;
  categoryLabel: string;
  level: SkillLevel;
  durationSeconds: number;
  xpReward: number;
  tags: string[];
  summary: string;
  captionHighlights: { time: number; text: string; keywords: string[] }[];
  steps: ActionStep[];
  quiz: QuizQuestion[];
  resources: ResourceItem[];
  sandboxType?: 'code' | 'prompt' | 'calculator' | 'speech_timer' | 'none';
  sandboxInitialData?: {
    codeLanguage?: string;
    defaultCode?: string;
    expectedOutput?: string;
    promptTemplate?: string;
    calculatorFields?: { label: string; key: string; defaultValue: number; unit?: string }[];
  };
  stats: {
    views: number;
    likes: number;
    saves: number;
    shares: number;
    completions: number;
  };
  isLiked?: boolean;
  isSaved?: boolean;
  isCompleted?: boolean;
  comments: Comment[];
}

export interface UserProgress {
  xp: number;
  level: number;
  levelTitle: string;
  streakDays: number;
  completedSkillIds: string[];
  savedSkillIds: string[];
  likedSkillIds: string[];
  badges: {
    id: string;
    title: string;
    icon: string;
    description: string;
    earnedAt: string;
  }[];
  quizStats: {
    totalAttempted: number;
    totalCorrect: number;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedAction?: string;
}
