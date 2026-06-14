/**
 * Firebase ↔ Zustand Real-Time Sync
 * 
 * On mount:
 * 1. Seeds Firestore if empty (first run)
 * 2. Subscribes to all collections via onSnapshot
 * 3. Pushes live data into Zustand — Firestore is now source of truth
 */

import { useEffect } from 'react';
import { useStore } from '../store';
import { isFirebaseEnabled } from './config';
import { seedFirestore } from './seed';
import {
  subscribeUsers,
  subscribeAmbulanceRequests,
  subscribeFireRequests,
  subscribeComplaints,
  subscribeCommunityAlerts,
  subscribeBloodRequests,
  subscribeUavMissions,
  subscribeLiveLocations,
} from './firestore';

export function useFirebaseSync() {
  useEffect(() => {
    if (!isFirebaseEnabled()) {
      console.log('📦 Firebase sync disabled — using local mock data');
      return;
    }

    const unsubscribers: ((() => void) | null)[] = [];

    // Seed then subscribe
    seedFirestore().then(() => {
      console.log('🔄 Starting Firebase real-time sync...');

      unsubscribers.push(
        subscribeUsers((users) => {
          if (users.length > 0) useStore.setState({ users });
        })
      );

      unsubscribers.push(
        subscribeAmbulanceRequests((items) => {
          useStore.setState({ ambulanceRequests: items });
        })
      );

      unsubscribers.push(
        subscribeFireRequests((items) => {
          useStore.setState({ fireRequests: items });
        })
      );

      unsubscribers.push(
        subscribeComplaints((items) => {
          useStore.setState({ complaints: items });
        })
      );

      unsubscribers.push(
        subscribeCommunityAlerts((items) => {
          if (items.length > 0) useStore.setState({ communityAlerts: items });
        })
      );

      unsubscribers.push(
        subscribeBloodRequests((items) => {
          useStore.setState({ bloodRequests: items });
        })
      );

      unsubscribers.push(
        subscribeUavMissions((items) => {
          useStore.setState({ uavMissions: items });
        })
      );

      unsubscribers.push(
        subscribeLiveLocations((items) => {
          if (items.length > 0) useStore.setState({ liveLocations: items });
        })
      );
    });

    return () => {
      console.log('🛑 Stopping Firebase sync');
      unsubscribers.forEach(unsub => unsub?.());
    };
  }, []);
}
