import { create } from 'zustand';
import { 
  User, Ambulance, FireStation, Hospital, 
  AmbulanceRequest, FireRequest, Complaint, 
  CommunityAlert, BloodRequest, UAVMission, LiveLocation, Location 
} from '../types';
import { isFirebaseEnabled } from '../firebase/config';
import * as FS from '../firebase/firestore';

interface AppState {
  currentUser: User | Ambulance | FireStation | Hospital | null;
  users: (User | Ambulance | FireStation | Hospital)[];
  ambulanceRequests: AmbulanceRequest[];
  fireRequests: FireRequest[];
  complaints: Complaint[];
  communityAlerts: CommunityAlert[];
  bloodRequests: BloodRequest[];
  uavMissions: UAVMission[];
  liveLocations: LiveLocation[];
  
  login: (phone: string, role?: string) => boolean;
  logout: () => void;
  register: (user: Partial<User | Ambulance | FireStation | Hospital>) => void;
  
  addAmbulanceRequest: (req: Omit<AmbulanceRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  updateAmbulanceRequestStatus: (id: string, status: AmbulanceRequest['status'], ambulanceId?: string) => void;
  
  addFireRequest: (req: Omit<FireRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  updateFireRequestStatus: (id: string, status: FireRequest['status'], stationId?: string) => void;

  addComplaint: (req: Omit<Complaint, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  
  addCommunityAlert: (req: Omit<CommunityAlert, 'id' | 'status' | 'createdAt'>) => void;
  updateAlertStatus: (id: string, status: CommunityAlert['status']) => void;
  deleteAlert: (id: string) => void;
  updateComplaintStatus: (id: string, status: Complaint['status']) => void;

  addBloodRequest: (req: Omit<BloodRequest, 'id' | 'createdAt'>) => void;

  addUavMission: (req: Omit<UAVMission, 'id' | 'status' | 'createdAt'>) => void;
  updateUavMissionStatus: (id: string, status: UAVMission['status']) => void;

  updateLiveLocation: (entityId: string, location: Location, speed?: number, altitude?: number) => void;
  
  approveUser: (id: string) => void;
  rejectUser: (id: string) => void;
}

// ── Mock Data (used when Firebase is not configured) ──
const mockControlCenter: User = { id: 'cc1', role: 'controlCenter', name: 'Commander Thapa', phone: '000', status: 'active', createdAt: Date.now() };
const mockCitizen: User = { id: 'c1', role: 'citizen', name: 'Hari Bahadur Thapa', phone: '123', status: 'active', createdAt: Date.now() };
const mockAmbulance: Ambulance = { id: 'a1', role: 'ambulance', name: 'Ram Kumar Shrestha', driverName: 'Ram Kumar Shrestha', phone: '234', licenseNumber: 'LIC-001', vehicleNumber: 'NPB-2021', vehicleType: 'ALS', status: 'active', available: true, createdAt: Date.now(), location: { lat: 27.7172, lng: 85.3240 } };
const mockHospital: Hospital = { id: 'h1', role: 'hospital', name: 'Dr. Sushila Shrestha', hospitalName: 'Bir Hospital', phone: '345', address: 'Mahaboudha, Kathmandu', emergencyContact: '+977-1-4221119', hospitalType: 'Trauma', status: 'active', createdAt: Date.now(), location: { lat: 27.7045, lng: 85.3145 } };
const mockFireStation: FireStation = { id: 'f1', role: 'fireStation', name: 'Station Officer Rana', phone: '456', status: 'active', stationName: 'Baneshwor Station', createdAt: Date.now(), location: { lat: 27.6906, lng: 85.3414 } };
const extraAmbulance1: Ambulance = { ...mockAmbulance, id: 'a2', name: 'AMB-2 Driver', vehicleNumber: 'NPB-2034', phone: '234-2', location: { lat: 27.7250, lng: 85.3400 } };
const extraHospital1: Hospital = { ...mockHospital, id: 'h2', name: 'TUTH Admin', hospitalName: 'TUTH Maharajgunj', phone: '345-2', location: { lat: 27.7370, lng: 85.3300 } };
const extraHospital2: Hospital = { ...mockHospital, id: 'h3', name: 'Patan Hospital Admin', hospitalName: 'Patan Hospital', phone: '345-3', location: { lat: 27.6710, lng: 85.3260 } };

const defaultUsers = [mockControlCenter, mockCitizen, mockAmbulance, mockHospital, mockFireStation, extraAmbulance1, extraHospital1, extraHospital2];
const defaultAlerts: CommunityAlert[] = [
  { id: 'ca1', creatorId: 'cc1', type: 'Road Block', description: 'Major accident on Kathmandu Ring Road near Kalanki. Traffic diverted.', location: { lat: 27.6933, lng: 85.2812 }, status: 'Published', createdAt: Date.now() - 3600000 },
  { id: 'ca2', creatorId: 'cc1', type: 'Flood', description: 'Bagmati river level rising near Teku bridge. Caution advised.', location: { lat: 27.6960, lng: 85.3080 }, status: 'Published', createdAt: Date.now() - 7200000 },
];
const defaultLiveLocations: LiveLocation[] = [
  { entityId: 'a1', entityType: 'ambulance', location: { lat: 27.7172, lng: 85.3240 }, timestamp: Date.now(), speed: 0 },
  { entityId: 'a2', entityType: 'ambulance', location: { lat: 27.7250, lng: 85.3400 }, timestamp: Date.now(), speed: 35 },
  { entityId: 'uav-a', entityType: 'uav', location: { lat: 27.7300, lng: 85.3200 }, timestamp: Date.now(), speed: 80, altitude: 400 },
  { entityId: 'vtol-1', entityType: 'vtol', location: { lat: 27.7200, lng: 85.3300 }, timestamp: Date.now(), altitude: 1200, speed: 150 },
];

// Helper: run Firebase write in background, never block the UI
function firebaseWrite(fn: () => Promise<any>) {
  if (isFirebaseEnabled()) fn().catch(e => console.error('Firebase write error:', e));
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: defaultUsers,
  ambulanceRequests: [],
  fireRequests: [],
  complaints: [],
  communityAlerts: defaultAlerts,
  bloodRequests: [],
  uavMissions: [],
  liveLocations: defaultLiveLocations,

  // ── AUTH ──
  login: (phone) => {
    const user = get().users.find(u => u.phone === phone);
    if (user && user.status === 'active') {
      set({ currentUser: user });
      return true;
    }
    return false;
  },

  logout: () => set({ currentUser: null }),

  register: (user) => {
    const newUser = {
      ...user,
      id: Math.random().toString(36).substring(7),
      status: user.role === 'citizen' ? 'active' : 'pending',
      createdAt: Date.now()
    } as any;
    // Local
    set(state => ({ users: [...state.users, newUser] }));
    // Firebase
    firebaseWrite(() => FS.createUser(newUser));
  },

  // ── AMBULANCE REQUESTS ──
  addAmbulanceRequest: (req) => {
    const newReq: AmbulanceRequest = { ...req, id: `ar-${Date.now()}`, status: 'Requested', createdAt: Date.now(), updatedAt: Date.now() };
    set(state => ({ ambulanceRequests: [newReq, ...state.ambulanceRequests] }));
    firebaseWrite(() => FS.createAmbulanceRequest(req));
  },

  updateAmbulanceRequestStatus: (id, status, ambulanceId) => {
    set(state => ({
      ambulanceRequests: state.ambulanceRequests.map(r => 
        r.id === id ? { ...r, status, updatedAt: Date.now(), ...(ambulanceId ? { assignedAmbulanceId: ambulanceId } : {}) } : r
      )
    }));
    firebaseWrite(() => FS.updateAmbulanceRequest(id, { status, ...(ambulanceId ? { assignedAmbulanceId: ambulanceId } : {}) }));
  },

  // ── FIRE REQUESTS ──
  addFireRequest: (req) => {
    const newReq: FireRequest = { ...req, id: `fr-${Date.now()}`, status: 'Requested', createdAt: Date.now(), updatedAt: Date.now() };
    set(state => ({ fireRequests: [newReq, ...state.fireRequests] }));
    firebaseWrite(() => FS.createFireRequest(req));
  },

  updateFireRequestStatus: (id, status, stationId) => {
    set(state => ({
      fireRequests: state.fireRequests.map(r => 
        r.id === id ? { ...r, status, updatedAt: Date.now(), ...(stationId ? { assignedStationId: stationId } : {}) } : r
      )
    }));
    firebaseWrite(() => FS.updateFireRequest(id, { status, ...(stationId ? { assignedStationId: stationId } : {}) }));
  },

  // ── COMPLAINTS ──
  addComplaint: (req) => {
    set(state => ({ complaints: [{ ...req, id: `c-${Date.now()}`, status: 'Submitted', createdAt: Date.now(), updatedAt: Date.now() }, ...state.complaints] }));
    firebaseWrite(() => FS.createComplaint(req));
  },

  updateComplaintStatus: (id, status) => {
    set(state => ({ complaints: state.complaints.map(c => c.id === id ? { ...c, status, updatedAt: Date.now() } : c) }));
    firebaseWrite(() => FS.updateComplaint(id, { status }));
  },

  // ── COMMUNITY ALERTS ──
  addCommunityAlert: (req) => {
    const status = get().currentUser?.role === 'controlCenter' ? 'Published' : 'Pending';
    set(state => ({ communityAlerts: [{ ...req, id: `ca-${Date.now()}`, status, createdAt: Date.now() }, ...state.communityAlerts] }));
    firebaseWrite(() => FS.createCommunityAlert({ ...req, status }));
  },

  updateAlertStatus: (id, status) => {
    set(state => ({ communityAlerts: state.communityAlerts.map(a => a.id === id ? { ...a, status } : a) }));
    firebaseWrite(() => FS.updateCommunityAlert(id, { status }));
  },

  deleteAlert: (id) => {
    set(state => ({ communityAlerts: state.communityAlerts.filter(a => a.id !== id) }));
    firebaseWrite(() => FS.deleteCommunityAlert(id));
  },

  // ── BLOOD REQUESTS ──
  addBloodRequest: (req) => {
    set(state => ({ bloodRequests: [{ ...req, id: `br-${Date.now()}`, createdAt: Date.now() }, ...state.bloodRequests] }));
    firebaseWrite(() => FS.createBloodRequest(req));
  },

  // ── UAV MISSIONS ──
  addUavMission: (req) => {
    set(state => ({ uavMissions: [{ ...req, id: `uav-${Date.now()}`, status: 'Pending', createdAt: Date.now() }, ...state.uavMissions] }));
    firebaseWrite(() => FS.createUavMission(req));
  },

  updateUavMissionStatus: (id, status) => {
    set(state => ({ uavMissions: state.uavMissions.map(m => m.id === id ? { ...m, status } : m) }));
    firebaseWrite(() => FS.updateUavMission(id, { status }));
  },

  // ── LIVE LOCATIONS ──
  updateLiveLocation: (entityId, location, speed, altitude) => {
    set(state => {
      const idx = state.liveLocations.findIndex(l => l.entityId === entityId);
      const newLoc: LiveLocation = { entityId, entityType: idx >= 0 ? state.liveLocations[idx].entityType : 'ambulance', location, timestamp: Date.now(), speed, altitude };
      if (idx >= 0) { const list = [...state.liveLocations]; list[idx] = newLoc; return { liveLocations: list }; }
      return { liveLocations: [...state.liveLocations, newLoc] };
    });
    firebaseWrite(() => FS.setLiveLocation(entityId, { location, speed, altitude, entityType: get().liveLocations.find(l => l.entityId === entityId)?.entityType || 'ambulance' }));
  },

  // ── USER APPROVALS ──
  approveUser: (id) => {
    set(state => ({ users: state.users.map(u => u.id === id ? { ...u, status: 'active' } : u) }));
    firebaseWrite(() => FS.updateUserStatus(id, 'active'));
  },
  
  rejectUser: (id) => {
    set(state => ({ users: state.users.map(u => u.id === id ? { ...u, status: 'rejected' } : u) }));
    firebaseWrite(() => FS.updateUserStatus(id, 'rejected'));
  },
}));
