// Firebase client initialization for Mahara / LearnTok
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged, 
  updateProfile,
  signInAnonymously,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  increment, 
  arrayUnion, 
  arrayRemove, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

export interface UserProfile {
  uid: string;
  email?: string;
  phoneNumber?: string;
  authProvider?: 'email' | 'phone' | 'google' | 'anonymous';
  name: string;
  handle: string;
  avatar: string;
  bio?: string;
  title?: string;
  isVerified?: boolean;
  role?: 'user' | 'creator' | 'admin';
  followersCount: number;
  followingCount: number;
  followers: string[]; // uids
  following: string[]; // uids
  likesCount: number;
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate?: string;
  isBanned?: boolean;
  createdAt?: any;
}

export interface VideoDoc {
  id: string;
  userId: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string;
  creatorTitle?: string;
  isVerified?: boolean;
  title: string;
  summary: string;
  videoUrl: string;
  posterUrl?: string;
  category: string;
  categoryLabel: string;
  level: string;
  durationSeconds: number;
  xpReward: number;
  tags: string[];
  captionHighlights: { time: number; text: string; keywords: string[] }[];
  steps: { id: string; stepNumber: number; title: string; description: string; tip?: string }[];
  quiz: { id: string; question: string; options: string[]; correctIndex: number; explanation: string }[];
  resources: { id: string; title: string; type: string; content: string; url?: string }[];
  sandboxType?: string;
  viewsCount: number;
  likesCount: number;
  savesCount: number;
  sharesCount: number;
  commentsCount: number;
  likedBy: string[]; // uids
  savedBy: string[]; // uids
  reportsCount?: number;
  isApproved?: boolean;
  createdAt: any;
}

export interface CommentDoc {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userBadge?: string;
  text: string;
  likesCount: number;
  likedBy: string[];
  createdAt: any;
  replies?: {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    text: string;
    createdAt: any;
  }[];
}

export interface AppNotification {
  id: string;
  userId: string; // target user
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  type: 'like' | 'comment' | 'follow' | 'system' | 'badge';
  title: string;
  message: string;
  videoId?: string;
  isRead: boolean;
  createdAt: any;
}

export interface ReportDoc {
  id: string;
  videoId: string;
  videoTitle: string;
  reportedByUid: string;
  reportedByName: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  createdAt: any;
}
