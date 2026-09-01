// Real Firestore Database operations service
import { 
  db, 
  auth, 
  UserProfile, 
  VideoDoc, 
  CommentDoc, 
  AppNotification, 
  ReportDoc 
} from './firebase';
import { 
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
  serverTimestamp 
} from 'firebase/firestore';

// Collection refs
export const usersCol = collection(db, 'users');
export const videosCol = collection(db, 'videos');
export const notificationsCol = collection(db, 'notifications');
export const reportsCol = collection(db, 'reports');

// Real-time live videos listener with optional category
export function getLiveVideos(callback: (videos: VideoDoc[]) => void) {
  const q = query(videosCol, limit(50));
  return onSnapshot(q, (snapshot) => {
    const list: VideoDoc[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as VideoDoc);
    });
    // Sort descending by createdAt or views
    list.sort((a, b) => {
      const tA = a.createdAt?.seconds || 0;
      const tB = b.createdAt?.seconds || 0;
      return tB - tA;
    });
    callback(list);
  }, (error) => {
    console.error('Error in getLiveVideos snapshot:', error);
    callback([]);
  });
}

// User Profile Operations
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (e) {
    console.error('getUserProfile error:', e);
    return null;
  }
}

export async function createOrUpdateUserProfile(profile: Partial<UserProfile> & { uid: string }) {
  const ref = doc(db, 'users', profile.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const newProfile: UserProfile = {
      uid: profile.uid,
      email: profile.email || '',
      phoneNumber: profile.phoneNumber || '',
      authProvider: profile.authProvider || (profile.phoneNumber ? 'phone' : profile.email ? 'email' : 'google'),
      name: profile.name || 'مستخدم مهارة',
      handle: profile.handle || `@user_${profile.uid.slice(0, 6)}`,
      avatar: profile.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.uid}`,
      bio: profile.bio || 'متعلم شغوف ومشارك في مجتمع مهارة 🚀',
      title: profile.title || 'طالب مهارات',
      isVerified: false,
      role: profile.email === 'admin@mahara.app' ? 'admin' : (profile.role || 'user'),
      followersCount: 0,
      followingCount: 0,
      followers: [],
      following: [],
      likesCount: 0,
      xp: 150,
      level: 1,
      streakDays: 1,
      createdAt: serverTimestamp(),
      ...profile,
    };
    await setDoc(ref, newProfile);
    return newProfile;
  } else {
    const existing = snap.data() as UserProfile;
    const updates: Partial<UserProfile> = {
      ...profile,
      // Preserve existing profile details if incoming are empty
      name: profile.name || existing.name,
      avatar: profile.avatar || existing.avatar,
      email: profile.email || existing.email || '',
      phoneNumber: profile.phoneNumber || existing.phoneNumber || '',
    };
    await updateDoc(ref, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return (await getDoc(ref)).data() as UserProfile;
  }
}

// Toggle Follow / Unfollow
export async function toggleFollowUser(currentUid: string, targetHandleOrUid: string): Promise<boolean> {
  if (!currentUid || !targetHandleOrUid) return false;
  const currentRef = doc(db, 'users', currentUid);
  const currentSnap = await getDoc(currentRef);
  if (!currentSnap.exists()) return false;

  const currentData = currentSnap.data() as UserProfile;
  const isFollowing = currentData.following?.includes(targetHandleOrUid);

  if (isFollowing) {
    // Unfollow
    await updateDoc(currentRef, {
      following: arrayRemove(targetHandleOrUid),
      followingCount: increment(-1),
    });
    return false;
  } else {
    // Follow
    await updateDoc(currentRef, {
      following: arrayUnion(targetHandleOrUid),
      followingCount: increment(1),
    });
    return true;
  }
}

// Toggle Like Video with notifications
export async function toggleVideoLike(
  videoId: string, 
  userId: string, 
  userName?: string,
  userAvatar?: string,
  videoTitle?: string,
  creatorUid?: string
) {
  const ref = doc(db, 'videos', videoId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data() as VideoDoc;
  const hasLiked = data.likedBy?.includes(userId);

  if (hasLiked) {
    await updateDoc(ref, {
      likedBy: arrayRemove(userId),
      likesCount: increment(-1),
    });
  } else {
    await updateDoc(ref, {
      likedBy: arrayUnion(userId),
      likesCount: increment(1),
    });

    // Notify creator if available
    const targetUserId = creatorUid || data.userId;
    if (targetUserId && targetUserId !== userId && targetUserId !== 'official_creator') {
      await addDoc(notificationsCol, {
        userId: targetUserId,
        fromUserId: userId,
        fromUserName: userName || 'مستخدم',
        fromUserAvatar: userAvatar || '',
        type: 'like',
        title: 'إعجاب جديد',
        message: `أعجب ${userName || 'مستخدم'} بمقطعك "${data.title || videoTitle || 'فيديو'}"`,
        videoId,
        isRead: false,
        createdAt: serverTimestamp(),
      });
    }
  }
}

// Toggle Save Video
export async function toggleSaveVideo(videoId: string, userId: string, isCurrentlySaved?: boolean) {
  const ref = doc(db, 'videos', videoId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data() as VideoDoc;
  const hasSaved = isCurrentlySaved !== undefined ? isCurrentlySaved : data.savedBy?.includes(userId);

  if (hasSaved) {
    await updateDoc(ref, {
      savedBy: arrayRemove(userId),
      savesCount: increment(-1),
    });
  } else {
    await updateDoc(ref, {
      savedBy: arrayUnion(userId),
      savesCount: increment(1),
    });
  }
}

// Increment View Count
export async function recordVideoView(videoId: string) {
  try {
    const ref = doc(db, 'videos', videoId);
    await updateDoc(ref, {
      viewsCount: increment(1),
    });
  } catch (e) {
    console.error('recordVideoView error:', e);
  }
}

// Comments
export async function addVideoComment(
  videoId: string,
  user: { uid: string; name: string; avatar: string; badge?: string },
  text: string,
  creatorUid?: string
) {
  const commentsSubCol = collection(db, 'videos', videoId, 'comments');
  const docRef = await addDoc(commentsSubCol, {
    videoId,
    userId: user.uid,
    userName: user.name,
    userAvatar: user.avatar,
    userBadge: user.badge || '',
    text: text.trim(),
    likesCount: 0,
    likedBy: [],
    createdAt: serverTimestamp(),
    replies: [],
  });

  // Increment video comment count
  await updateDoc(doc(db, 'videos', videoId), {
    commentsCount: increment(1),
  });

  // Notify video creator
  if (creatorUid && creatorUid !== user.uid && creatorUid !== 'official_creator') {
    await addDoc(notificationsCol, {
      userId: creatorUid,
      fromUserId: user.uid,
      fromUserName: user.name,
      fromUserAvatar: user.avatar,
      type: 'comment',
      title: 'تعليق جديد',
      message: `علّق ${user.name}: "${text.slice(0, 40)}..."`,
      videoId,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  }

  return docRef.id;
}

// Upload & Publish Video
export async function publishNewVideo(videoData: Omit<VideoDoc, 'id' | 'createdAt' | 'viewsCount' | 'likesCount' | 'savesCount' | 'sharesCount' | 'commentsCount' | 'likedBy' | 'savedBy'>) {
  const newRef = doc(videosCol);
  const fullData: VideoDoc = {
    ...videoData,
    id: newRef.id,
    viewsCount: 1,
    likesCount: 0,
    savesCount: 0,
    sharesCount: 0,
    commentsCount: 0,
    likedBy: [],
    savedBy: [],
    isApproved: true,
    createdAt: serverTimestamp(),
  };

  await setDoc(newRef, fullData);

  // Grant user creator badge/xp
  if (videoData.userId && videoData.userId !== 'guest_creator') {
    try {
      const uRef = doc(db, 'users', videoData.userId);
      await updateDoc(uRef, {
        xp: increment(100),
      });
    } catch (err) {
      console.warn('Could not update user XP on publish:', err);
    }
  }

  return fullData;
}

// Delete Video
export async function deleteVideo(videoId: string) {
  await deleteDoc(doc(db, 'videos', videoId));
}

// Admin: Ban User
export async function setAdminUserStatus(uid: string, isBanned: boolean) {
  await updateDoc(doc(db, 'users', uid), {
    isBanned,
  });
}

// Report Video
export async function reportVideo(videoId: string, videoTitle: string, user: { uid: string; name: string }, reason: string) {
  await addDoc(reportsCol, {
    videoId,
    videoTitle,
    reportedByUid: user.uid,
    reportedByName: user.name,
    reason,
    status: 'pending',
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, 'videos', videoId), {
    reportsCount: increment(1),
  });
}
