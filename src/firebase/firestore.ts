/**
 * Firestore Service Layer
 * 
 * All database operations for every collection.
 * Each function checks if Firebase is available; if not, returns silently
 * so the app falls back to Zustand-only (offline mock mode).
 */

import {
  collection, doc, addDoc, setDoc, updateDoc, deleteDoc,
  getDocs, onSnapshot, query, orderBy, where,
  serverTimestamp, Timestamp, Unsubscribe, limit
} from 'firebase/firestore';
import { db, isFirebaseEnabled } from './config';

// ── Collection Names ──
export const COLLECTIONS = {
  users: 'users',
  ambulanceRequests: 'ambulanceRequests',
  fireRequests: 'fireRequests',
  complaints: 'complaints',
  communityAlerts: 'communityAlerts',
  bloodRequests: 'bloodRequests',
  uavMissions: 'uavMissions',
  liveLocations: 'liveLocations',
} as const;

// Helper: get collection ref safely
function col(name: string) {
  if (!db) throw new Error('Firestore not initialized');
  return collection(db, name);
}
function docRef(name: string, id: string) {
  if (!db) throw new Error('Firestore not initialized');
  return doc(db, name, id);
}

// ═══════════════════════════════════════
//              USERS / AUTH
// ═══════════════════════════════════════

export async function createUser(userData: any): Promise<string | null> {
  if (!isFirebaseEnabled()) return null;
  try {
    const docData = { ...userData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
    if (userData.id) {
      await setDoc(docRef(COLLECTIONS.users, userData.id), docData);
      return userData.id;
    }
    const ref = await addDoc(col(COLLECTIONS.users), docData);
    return ref.id;
  } catch (e) { console.error('createUser error:', e); return null; }
}

export async function getUserByPhone(phone: string): Promise<any | null> {
  if (!isFirebaseEnabled()) return null;
  try {
    const q = query(col(COLLECTIONS.users), where('phone', '==', phone), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (e) { console.error('getUserByPhone error:', e); return null; }
}

export async function updateUserStatus(id: string, status: string): Promise<void> {
  if (!isFirebaseEnabled()) return;
  try {
    await updateDoc(docRef(COLLECTIONS.users, id), { status, updatedAt: serverTimestamp() });
  } catch (e) { console.error('updateUserStatus error:', e); }
}

export function subscribeUsers(callback: (users: any[]) => void): Unsubscribe | null {
  if (!isFirebaseEnabled()) return null;
  try {
    return onSnapshot(col(COLLECTIONS.users), (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...convertTimestamps(d.data()) })));
    });
  } catch (e) { console.error('subscribeUsers error:', e); return null; }
}

// ═══════════════════════════════════════
//         AMBULANCE REQUESTS
// ═══════════════════════════════════════

export async function createAmbulanceRequest(data: any): Promise<string | null> {
  if (!isFirebaseEnabled()) return null;
  try {
    const ref = await addDoc(col(COLLECTIONS.ambulanceRequests), { ...data, status: 'Requested', createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    return ref.id;
  } catch (e) { console.error('createAmbulanceRequest error:', e); return null; }
}

export async function updateAmbulanceRequest(id: string, updates: any): Promise<void> {
  if (!isFirebaseEnabled()) return;
  try {
    await updateDoc(docRef(COLLECTIONS.ambulanceRequests, id), { ...updates, updatedAt: serverTimestamp() });
  } catch (e) { console.error('updateAmbulanceRequest error:', e); }
}

export function subscribeAmbulanceRequests(callback: (items: any[]) => void): Unsubscribe | null {
  if (!isFirebaseEnabled()) return null;
  try {
    const q = query(col(COLLECTIONS.ambulanceRequests), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...convertTimestamps(d.data()) })));
    });
  } catch (e) { console.error('subscribeAmbulanceRequests error:', e); return null; }
}

// ═══════════════════════════════════════
//           FIRE REQUESTS
// ═══════════════════════════════════════

export async function createFireRequest(data: any): Promise<string | null> {
  if (!isFirebaseEnabled()) return null;
  try {
    const ref = await addDoc(col(COLLECTIONS.fireRequests), { ...data, status: 'Requested', createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    return ref.id;
  } catch (e) { console.error('createFireRequest error:', e); return null; }
}

export async function updateFireRequest(id: string, updates: any): Promise<void> {
  if (!isFirebaseEnabled()) return;
  try {
    await updateDoc(docRef(COLLECTIONS.fireRequests, id), { ...updates, updatedAt: serverTimestamp() });
  } catch (e) { console.error('updateFireRequest error:', e); }
}

export function subscribeFireRequests(callback: (items: any[]) => void): Unsubscribe | null {
  if (!isFirebaseEnabled()) return null;
  try {
    const q = query(col(COLLECTIONS.fireRequests), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...convertTimestamps(d.data()) })));
    });
  } catch (e) { console.error('subscribeFireRequests error:', e); return null; }
}

// ═══════════════════════════════════════
//             COMPLAINTS
// ═══════════════════════════════════════

export async function createComplaint(data: any): Promise<string | null> {
  if (!isFirebaseEnabled()) return null;
  try {
    const ref = await addDoc(col(COLLECTIONS.complaints), { ...data, status: 'Submitted', createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    return ref.id;
  } catch (e) { console.error('createComplaint error:', e); return null; }
}

export async function updateComplaint(id: string, updates: any): Promise<void> {
  if (!isFirebaseEnabled()) return;
  try {
    await updateDoc(docRef(COLLECTIONS.complaints, id), { ...updates, updatedAt: serverTimestamp() });
  } catch (e) { console.error('updateComplaint error:', e); }
}

export function subscribeComplaints(callback: (items: any[]) => void): Unsubscribe | null {
  if (!isFirebaseEnabled()) return null;
  try {
    const q = query(col(COLLECTIONS.complaints), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...convertTimestamps(d.data()) })));
    });
  } catch (e) { console.error('subscribeComplaints error:', e); return null; }
}

// ═══════════════════════════════════════
//          COMMUNITY ALERTS
// ═══════════════════════════════════════

export async function createCommunityAlert(data: any): Promise<string | null> {
  if (!isFirebaseEnabled()) return null;
  try {
    const ref = await addDoc(col(COLLECTIONS.communityAlerts), { ...data, createdAt: serverTimestamp() });
    return ref.id;
  } catch (e) { console.error('createCommunityAlert error:', e); return null; }
}

export async function updateCommunityAlert(id: string, updates: any): Promise<void> {
  if (!isFirebaseEnabled()) return;
  try {
    await updateDoc(docRef(COLLECTIONS.communityAlerts, id), { ...updates });
  } catch (e) { console.error('updateCommunityAlert error:', e); }
}

export async function deleteCommunityAlert(id: string): Promise<void> {
  if (!isFirebaseEnabled()) return;
  try {
    await deleteDoc(docRef(COLLECTIONS.communityAlerts, id));
  } catch (e) { console.error('deleteCommunityAlert error:', e); }
}

export function subscribeCommunityAlerts(callback: (items: any[]) => void): Unsubscribe | null {
  if (!isFirebaseEnabled()) return null;
  try {
    const q = query(col(COLLECTIONS.communityAlerts), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...convertTimestamps(d.data()) })));
    });
  } catch (e) { console.error('subscribeCommunityAlerts error:', e); return null; }
}

// ═══════════════════════════════════════
//          BLOOD REQUESTS
// ═══════════════════════════════════════

export async function createBloodRequest(data: any): Promise<string | null> {
  if (!isFirebaseEnabled()) return null;
  try {
    const ref = await addDoc(col(COLLECTIONS.bloodRequests), { ...data, createdAt: serverTimestamp() });
    return ref.id;
  } catch (e) { console.error('createBloodRequest error:', e); return null; }
}

export function subscribeBloodRequests(callback: (items: any[]) => void): Unsubscribe | null {
  if (!isFirebaseEnabled()) return null;
  try {
    const q = query(col(COLLECTIONS.bloodRequests), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...convertTimestamps(d.data()) })));
    });
  } catch (e) { console.error('subscribeBloodRequests error:', e); return null; }
}

// ═══════════════════════════════════════
//           UAV MISSIONS
// ═══════════════════════════════════════

export async function createUavMission(data: any): Promise<string | null> {
  if (!isFirebaseEnabled()) return null;
  try {
    const ref = await addDoc(col(COLLECTIONS.uavMissions), { ...data, status: 'Pending', createdAt: serverTimestamp() });
    return ref.id;
  } catch (e) { console.error('createUavMission error:', e); return null; }
}

export async function updateUavMission(id: string, updates: any): Promise<void> {
  if (!isFirebaseEnabled()) return;
  try {
    await updateDoc(docRef(COLLECTIONS.uavMissions, id), { ...updates });
  } catch (e) { console.error('updateUavMission error:', e); }
}

export function subscribeUavMissions(callback: (items: any[]) => void): Unsubscribe | null {
  if (!isFirebaseEnabled()) return null;
  try {
    const q = query(col(COLLECTIONS.uavMissions), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...convertTimestamps(d.data()) })));
    });
  } catch (e) { console.error('subscribeUavMissions error:', e); return null; }
}

// ═══════════════════════════════════════
//          LIVE LOCATIONS
// ═══════════════════════════════════════

export async function setLiveLocation(entityId: string, data: any): Promise<void> {
  if (!isFirebaseEnabled()) return;
  try {
    await setDoc(docRef(COLLECTIONS.liveLocations, entityId), { ...data, entityId, timestamp: serverTimestamp() }, { merge: true });
  } catch (e) { console.error('setLiveLocation error:', e); }
}

export function subscribeLiveLocations(callback: (items: any[]) => void): Unsubscribe | null {
  if (!isFirebaseEnabled()) return null;
  try {
    return onSnapshot(col(COLLECTIONS.liveLocations), (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...convertTimestamps(d.data()) })));
    });
  } catch (e) { console.error('subscribeLiveLocations error:', e); return null; }
}

// ═══════════════════════════════════════
//            UTILITIES
// ═══════════════════════════════════════

/** Convert Firestore Timestamps to JS numbers */
function convertTimestamps(data: any): any {
  const result = { ...data };
  for (const key of Object.keys(result)) {
    if (result[key] instanceof Timestamp) {
      result[key] = result[key].toMillis();
    } else if (result[key] && typeof result[key] === 'object' && result[key].seconds !== undefined && result[key].nanoseconds !== undefined) {
      result[key] = result[key].seconds * 1000;
    }
  }
  return result;
}
