/**
 * Seed Firestore with initial demo data on first run.
 * Checks if the 'users' collection already has data — if yes, skips.
 */

import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db, isFirebaseEnabled } from './config';

const SEED_USERS = [
  { id: 'cc1', role: 'controlCenter', name: 'Commander Thapa', phone: '000', status: 'active', createdAt: Date.now() },
  { id: 'c1', role: 'citizen', name: 'Hari Bahadur Thapa', phone: '123', status: 'active', createdAt: Date.now() },
  { id: 'a1', role: 'ambulance', name: 'Ram Kumar Shrestha', driverName: 'Ram Kumar Shrestha', phone: '234', licenseNumber: 'LIC-001', vehicleNumber: 'NPB-2021', vehicleType: 'ALS', status: 'active', available: true, createdAt: Date.now(), location: { lat: 27.7172, lng: 85.3240 } },
  { id: 'h1', role: 'hospital', name: 'Dr. Sushila Shrestha', hospitalName: 'Bir Hospital', phone: '345', address: 'Mahaboudha, Kathmandu', emergencyContact: '+977-1-4221119', hospitalType: 'Trauma', status: 'active', createdAt: Date.now(), location: { lat: 27.7045, lng: 85.3145 } },
  { id: 'f1', role: 'fireStation', name: 'Station Officer Rana', phone: '456', status: 'active', stationName: 'Baneshwor Station', createdAt: Date.now(), location: { lat: 27.6906, lng: 85.3414 } },
  { id: 'a2', role: 'ambulance', name: 'AMB-2 Driver', driverName: 'AMB-2 Driver', phone: '234-2', licenseNumber: 'LIC-002', vehicleNumber: 'NPB-2034', vehicleType: 'BLS', status: 'active', available: true, createdAt: Date.now(), location: { lat: 27.7250, lng: 85.3400 } },
  { id: 'h2', role: 'hospital', name: 'TUTH Admin', hospitalName: 'TUTH Maharajgunj', phone: '345-2', address: 'Maharajgunj, Kathmandu', emergencyContact: '+977-1-4412303', hospitalType: 'General', status: 'active', createdAt: Date.now(), location: { lat: 27.7370, lng: 85.3300 } },
  { id: 'h3', role: 'hospital', name: 'Patan Hospital Admin', hospitalName: 'Patan Hospital', phone: '345-3', address: 'Lagankhel, Lalitpur', emergencyContact: '+977-1-5522266', hospitalType: 'General', status: 'active', createdAt: Date.now(), location: { lat: 27.6710, lng: 85.3260 } },
];

const SEED_ALERTS = [
  { id: 'ca1', creatorId: 'cc1', type: 'Road Block', description: 'Major accident on Kathmandu Ring Road near Kalanki. Traffic diverted.', location: { lat: 27.6933, lng: 85.2812 }, status: 'Published', createdAt: Date.now() - 3600000 },
  { id: 'ca2', creatorId: 'cc1', type: 'Flood', description: 'Bagmati river level rising near Teku bridge. Caution advised.', location: { lat: 27.6960, lng: 85.3080 }, status: 'Published', createdAt: Date.now() - 7200000 },
];

const SEED_LOCATIONS = [
  { entityId: 'a1', entityType: 'ambulance', location: { lat: 27.7172, lng: 85.3240 }, timestamp: Date.now(), speed: 0 },
  { entityId: 'a2', entityType: 'ambulance', location: { lat: 27.7250, lng: 85.3400 }, timestamp: Date.now(), speed: 35 },
  { entityId: 'uav-a', entityType: 'uav', location: { lat: 27.7300, lng: 85.3200 }, timestamp: Date.now(), speed: 80, altitude: 400 },
  { entityId: 'vtol-1', entityType: 'vtol', location: { lat: 27.7200, lng: 85.3300 }, timestamp: Date.now(), altitude: 1200, speed: 150 },
];

export async function seedFirestore(): Promise<void> {
  if (!isFirebaseEnabled() || !db) return;

  try {
    // Check if already seeded
    const usersSnap = await getDocs(collection(db, 'users'));
    if (!usersSnap.empty) {
      console.log('✅ Firestore already has data — skipping seed');
      return;
    }

    console.log('🌱 Seeding Firestore with demo data...');
    const batch = writeBatch(db);

    // Seed users
    for (const user of SEED_USERS) {
      batch.set(doc(db, 'users', user.id), user);
    }

    // Seed alerts
    for (const alert of SEED_ALERTS) {
      batch.set(doc(db, 'communityAlerts', alert.id), alert);
    }

    // Seed live locations
    for (const loc of SEED_LOCATIONS) {
      batch.set(doc(db, 'liveLocations', loc.entityId), loc);
    }

    await batch.commit();
    console.log('✅ Firestore seeded successfully with', SEED_USERS.length, 'users,', SEED_ALERTS.length, 'alerts,', SEED_LOCATIONS.length, 'live locations');
  } catch (e) {
    console.error('❌ Seed error:', e);
  }
}
