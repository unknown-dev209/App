// Firebase Configuration and Utilities
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
  writeBatch
} from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ==================== AUTH FUNCTIONS ====================

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    // Create or update user document in Firestore
    await createUserDocument(user);
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sign in with Email/Password
export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sign up with Email/Password
export const signUpWithEmail = async (email, password, displayName) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    await createUserDocument(result.user, displayName);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Log out
export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Auth state observer
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// ==================== USER FUNCTIONS ====================

// Create user document in Firestore
const createUserDocument = async (user, displayName = null) => {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: displayName || user.displayName || user.email.split('@')[0],
      photoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
      lastSeen: serverTimestamp(),
      online: true,
    });
  } else {
    await updateDoc(userRef, {
      lastSeen: serverTimestamp(),
      online: true,
    });
  }
};

// Update user online status
export const updateUserStatus = async (uid, online) => {
  if (!uid) return;
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    online,
    lastSeen: serverTimestamp(),
  });
};

// Get all users
export const getAllUsers = async (currentUid) => {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(user => user.uid !== currentUid);
};

// Subscribe to users list
export const subscribeToUsers = (callback) => {
  const usersRef = collection(db, 'users');
  return onSnapshot(usersRef, (snapshot) => {
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(users);
  });
};

// ==================== CHAT FUNCTIONS ====================

// Create a one-on-one chat
export const createDirectChat = async (currentUserId, otherUserId) => {
  // Check if chat already exists
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('type', '==', 'direct'),
    where('participants', 'array-contains', currentUserId)
  );
  const snapshot = await getDocs(q);

  const existingChat = snapshot.docs.find(doc => {
    const data = doc.data();
    return data.participants.includes(otherUserId);
  });

  if (existingChat) {
    return { id: existingChat.id, ...existingChat.data() };
  }

  // Create new chat
  const otherUser = await getDoc(doc(db, 'users', otherUserId));
  const otherUserData = otherUser.data();

  const newChat = await addDoc(chatsRef, {
    type: 'direct',
    participants: [currentUserId, otherUserId],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: currentUserId,
    name: null,
    avatar: otherUserData?.photoURL || null,
    lastMessage: null,
    unreadCount: {
      [currentUserId]: 0,
      [otherUserId]: 0,
    },
  });

  return { id: newChat.id, ...newChat.data() };
};

// Create a group chat
export const createGroupChat = async (currentUserId, name, participantIds) => {
  const chatsRef = collection(db, 'chats');
  const allParticipants = [...new Set([currentUserId, ...participantIds])];

  const unreadCount = {};
  allParticipants.forEach(uid => {
    unreadCount[uid] = 0;
  });

  const newChat = await addDoc(chatsRef, {
    type: 'group',
    name,
    participants: allParticipants,
    admins: [currentUserId],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: currentUserId,
    avatar: null,
    lastMessage: null,
    unreadCount,
  });

  return { id: newChat.id, ...newChat.data() };
};

// Get user's chats
export const getUserChats = async (userId) => {
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Subscribe to user's chats
export const subscribeToUserChats = (userId, callback) => {
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(chats);
  });
};

// ==================== MESSAGE FUNCTIONS ====================

// Send a message
export const sendMessage = async (chatId, senderId, text, replyTo = null) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const chatRef = doc(db, 'chats', chatId);

  const messageData = {
    senderId,
    text,
    createdAt: serverTimestamp(),
    readBy: [senderId],
    replyTo: replyTo || null,
    edited: false,
    editedAt: null,
  };

  const newMessage = await addDoc(messagesRef, messageData);

  // Update chat's last message
  await updateDoc(chatRef, {
    lastMessage: {
      text: text.substring(0, 100),
      senderId,
      createdAt: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  });

  return { id: newMessage.id, ...messageData };
};

// Get messages for a chat
export const getMessages = async (chatId) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Subscribe to messages
export const subscribeToMessages = (chatId, callback) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
};

// Mark messages as read
export const markMessagesAsRead = async (chatId, userId) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, where('readBy', 'not-in', [[userId]]));
  const snapshot = await getDocs(q);

  const batch = writeBatch(db);
  snapshot.docs.forEach(messageDoc => {
    const messageRef = doc(db, 'chats', chatId, 'messages', messageDoc.id);
    batch.update(messageRef, {
      readBy: arrayUnion(userId),
    });
  });

  await batch.commit();

  // Reset unread count for this user
  const chatRef = doc(db, 'chats', chatId);
  await updateDoc(chatRef, {
    [`unreadCount.${userId}`]: 0,
  });
};

// Edit a message
export const editMessage = async (chatId, messageId, newText) => {
  const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
  await updateDoc(messageRef, {
    text: newText,
    edited: true,
    editedAt: serverTimestamp(),
  });
};

// Delete a message
export const deleteMessage = async (chatId, messageId) => {
  const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
  await deleteDoc(messageRef);
};

// ==================== TYPING INDICATORS ====================

// Update typing status
export const updateTypingStatus = async (chatId, userId, isTyping) => {
  const typingRef = doc(db, 'chats', chatId, 'typing', userId);
  if (isTyping) {
    await setDoc(typingRef, {
      userId,
      timestamp: serverTimestamp(),
    });
  } else {
    await deleteDoc(typingRef);
  }
};

// Subscribe to typing indicators
export const subscribeToTyping = (chatId, callback) => {
  const typingRef = collection(db, 'chats', chatId, 'typing');
  return onSnapshot(typingRef, (snapshot) => {
    const typingUsers = snapshot.docs.map(doc => doc.data().userId);
    callback(typingUsers);
  });
};

// ==================== UTILITY FUNCTIONS ====================

// Format timestamp
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  // Less than 1 minute
  if (diff < 60000) {
    return 'just now';
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  }

  // Default: show date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

// Format message time
export const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export { auth, db, app };
