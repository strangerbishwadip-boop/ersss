import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Routes, Route } from 'react-router-dom';
import { Activity, Droplet, Plane, AlertTriangle, Heart, Phone, Building2, RefreshCw, MapPin, Package, Zap } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import LiveMap, { RouteOverlay } from '../components/LiveMap';
import { haversine } from '../utils/astar';

export default function HospitalPortal() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<HospitalDashboard />} />
        <Route path="/blood" element={<BloodRequestSection />} />
        <Route path="/uav" element={<UAVSection />} />
        <Route path="/alerts" element={<AlertsSection />} />
      </Routes>
    </DashboardLayout>
  );
}

/* ═══════════════════════════════════════ */
/*           HOSPITAL DASHBOARD            */
/* ═══════════════════════════════════════ */
function HospitalDashboard() {
  const { currentUser, ambulanceRequests, uavMissions } = useStore();
  const incomingEmergencies = ambulanceRequests.filter(r => ['Accepted', 'En Route', 'Arrived', 'Patient Picked', 'Heading To Hospital'].includes(r.status));
  const myUavMissions = uavMissions.filter(m => m.hospitalId === currentUser?.id);

  const mockEmergencies = [
    { id: 'em1', name: 'Rajesh Sharma', age: '45M', condition: 'Cardiac', subtype: 'Cardiac Emergency — Prepare Catheterization Lab', eta: 6, ambulance: 'NPB-2021', driver: 'Ram Kumar', phone: '+977 9841XXXXXX', blood: 'O+ (verified)', location: 'Thamel pickup', critical: true },
    { id: 'em2', name: 'Sita Adhikari', age: '32F', condition: 'Trauma', subtype: 'Road Accident — Multiple injuries suspected', eta: 14, ambulance: 'NPB-2034', driver: 'Hari Bdr', phone: '+977 9851XXXXXX', blood: 'A+ (pending)', location: 'Chabahil', critical: false },
  ];

  const allEmergencies = [...incomingEmergencies.map(r => ({
    id: r.id, name: `Citizen #${r.citizenId.slice(-4)}`, age: '—', condition: 'Emergency',
    subtype: r.description, eta: 8, ambulance: r.assignedAmbulanceId || 'TBD', driver: 'Assigned',
    phone: '+977 98XXXXXXXX', blood: 'Unknown', location: r.landmark || 'In transit', critical: true
  })), ...mockEmergencies];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-emerald-600 rounded-2xl p-6 shadow-sm flex items-center text-white">
        <div className="w-14 h-14 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur mr-4 shrink-0"><Building2 className="w-7 h-7" /></div>
        <div>
          <h2 className="text-2xl font-bold">{(currentUser as any).hospitalName || 'Bir Hospital'} — Emergency Dept.</h2>
          <p className="text-emerald-100 text-sm mt-0.5">Mahaboudha, Kathmandu • Level 1 Trauma Center</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
          <div className="text-3xl font-bold text-red-600">{allEmergencies.length}</div>
          <div className="text-sm text-slate-500 font-medium mt-1">Incoming Patients</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
          <div className="text-3xl font-bold text-amber-600">7</div>
          <div className="text-sm text-slate-500 font-medium mt-1">ER Beds Available</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
          <div className="text-3xl font-bold text-emerald-600">12</div>
          <div className="text-sm text-slate-500 font-medium mt-1">Doctors On Duty</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
          <div className="text-3xl font-bold text-purple-600">{myUavMissions.length}</div>
          <div className="text-sm text-slate-500 font-medium mt-1">UAV Missions</div>
        </div>
      </div>

      {/* Incoming Emergencies */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Incoming Emergencies</h3>
        <div className="space-y-4">
          {allEmergencies.map(em => (
            <div key={em.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${em.critical ? 'bg-red-100' : 'bg-amber-100'}`}>
                    <Heart className={`w-4 h-4 ${em.critical ? 'text-red-600' : 'text-amber-600'}`} />
                  </div>
                  <h4 className="font-bold text-slate-900 truncate">{em.name}, {em.age} — {em.condition}</h4>
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 bg-amber-50 text-amber-700">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> ETA: {em.eta} min
                </span>
              </div>
              <div className="p-5">
                <div className={`${em.critical ? 'bg-red-50 border border-red-100' : 'bg-amber-50 border border-amber-100'} px-4 py-3 rounded-xl mb-4 flex items-center gap-2`}>
                  <AlertTriangle className={`w-4 h-4 shrink-0 ${em.critical ? 'text-red-600' : 'text-amber-600'}`} />
                  <p className={`text-sm font-bold ${em.critical ? 'text-red-700' : 'text-amber-700'}`}>{em.subtype}</p>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-5 text-sm">
                  <div><p className="text-slate-400 font-semibold">Ambulance:</p><p className="text-slate-900 font-medium">{em.ambulance} — {em.driver}</p></div>
                  <div><p className="text-slate-400 font-semibold">Blood Group:</p><p className="text-slate-900 font-medium">{em.blood}</p></div>
                  <div><p className="text-slate-400 font-semibold">Phone:</p><p className="text-slate-900 font-medium">{em.phone}</p></div>
                  <div><p className="text-slate-400 font-semibold">Location:</p><p className="text-slate-900 font-medium">{em.location}</p></div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition"><Activity className="w-4 h-4" /> Confirm Ready</button>
                  <button className="px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-2 transition"><RefreshCw className="w-4 h-4" /> Redirect</button>
                  {em.critical && <button className="px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-2 transition"><Phone className="w-4 h-4" /> Call</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*          BLOOD REQUEST SECTION          */
/* ═══════════════════════════════════════ */
function BloodRequestSection() {
  const { currentUser, bloodRequests, addBloodRequest } = useStore();
  const [bg, setBg] = useState('O+');
  const [desc, setDesc] = useState('');
  const [urgency, setUrgency] = useState('Immediate');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBloodRequest({
      requesterId: currentUser!.id,
      bloodGroup: bg,
      location: (currentUser as any).location || { lat: 27.7045, lng: 85.3145 },
      description: `[${urgency}] ${desc}`,
      contactNumber: currentUser!.phone
    });
    setDesc('');
    alert('Blood request published successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center"><Droplet className="w-6 h-6 text-red-600" /></div>
        <div><h2 className="text-2xl font-bold text-slate-900">Blood Request Management</h2><p className="text-sm text-slate-500">Publish urgent blood needs to the public</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form — 3 cols */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-5">Publish New Blood Request</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Blood Group Required</label>
              <div className="grid grid-cols-4 gap-2">
                {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(g => (
                  <button key={g} type="button" onClick={() => setBg(g)} className={`h-12 rounded-xl font-bold text-sm transition border-2 ${bg === g ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:border-red-300'}`}>{g}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Urgency Level</label>
              <div className="grid grid-cols-3 gap-2">
                {['Immediate','Within 6hrs','Within 24hrs'].map(u => (
                  <button key={u} type="button" onClick={() => setUrgency(u)} className={`h-11 rounded-xl font-semibold text-sm transition border-2 ${urgency === u ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-700 border-slate-200 hover:border-red-300'}`}>{u}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Patient Details / Reason</label>
              <textarea required rows={3} placeholder="Surgery prep, accident trauma, thalassemia patient..." className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-red-500 bg-slate-50 focus:bg-white transition" value={desc} onChange={e => setDesc(e.target.value)} />
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Contact for Donors</p>
              <p className="text-sm font-medium text-slate-800">{currentUser?.phone} • {(currentUser as any).hospitalName || 'Hospital'}</p>
            </div>

            <button disabled={!desc} className="w-full h-12 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2">
              <Droplet className="w-5 h-5" /> Publish Blood Request
            </button>
          </form>
        </div>

        {/* Active Requests — 2 cols */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 mb-4">All Blood Requests ({bloodRequests.length})</h3>
          {bloodRequests.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-100 text-center"><Droplet className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500 text-sm">No active blood requests.</p></div>
          ) : (
            <div className="space-y-3">
              {bloodRequests.map(br => (
                <div key={br.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 bg-red-100 text-red-700 rounded-xl flex items-center justify-center font-black text-xl shrink-0">{br.bloodGroup}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm">{br.description}</p>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Phone className="w-3 h-3" /> {br.contactNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">{new Date(br.createdAt).toLocaleString()}</span>
                    <a href={`tel:${br.contactNumber}`} className="h-8 px-4 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg flex items-center justify-center text-xs font-bold transition gap-1"><Phone className="w-3 h-3" /> Call</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*              UAV SECTION                */
/* ═══════════════════════════════════════ */
function UAVSection() {
  const { currentUser, uavMissions, addUavMission } = useStore();
  const [payload, setPayload] = useState('Blood');
  const [desc, setDesc] = useState('');
  
  // Pickup location
  const [pickupMode, setPickupMode] = useState<'live'|'manual'>('live');
  const hospitalLoc = (currentUser as any).location || { lat: 27.7045, lng: 85.3145 };
  const [pickupLat, setPickupLat] = useState(hospitalLoc.lat.toString());
  const [pickupLng, setPickupLng] = useState(hospitalLoc.lng.toString());
  
  // Destination location
  const [destMode, setDestMode] = useState<'manual'|'live'>('manual');
  const [destLat, setDestLat] = useState('27.7370');
  const [destLng, setDestLng] = useState('85.3300');
  const [gettingLoc, setGettingLoc] = useState<'pickup'|'dest'|null>(null);

  const myMissions = uavMissions.filter(m => m.hospitalId === currentUser?.id);
  const activeMission = myMissions.find(m => m.status === 'In Flight' || m.status === 'Approved');

  // Get live location
  const useLiveLocation = (target: 'pickup' | 'dest') => {
    setGettingLoc(target);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (target === 'pickup') {
            setPickupLat(pos.coords.latitude.toFixed(6));
            setPickupLng(pos.coords.longitude.toFixed(6));
            setPickupMode('live');
          } else {
            setDestLat(pos.coords.latitude.toFixed(6));
            setDestLng(pos.coords.longitude.toFixed(6));
            setDestMode('live');
          }
          setGettingLoc(null);
        },
        () => { alert('Unable to get GPS location. Enter manually.'); setGettingLoc(null); },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      alert('Geolocation not supported'); setGettingLoc(null);
    }
  };

  const finalPickup = pickupMode === 'live' ? hospitalLoc : { lat: parseFloat(pickupLat) || 0, lng: parseFloat(pickupLng) || 0 };
  const finalDest = { lat: parseFloat(destLat) || 0, lng: parseFloat(destLng) || 0 };
  const dist = haversine(finalPickup.lat, finalPickup.lng, finalDest.lat, finalDest.lng);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUavMission({
      hospitalId: currentUser!.id,
      pickupLocation: finalPickup,
      destinationLocation: finalDest,
      description: `[${payload}] ${desc}`
    });
    setDesc('');
    alert('UAV mission requested! Awaiting Control Center approval.');
  };

  const uavRoutes: RouteOverlay[] = useMemo(() => {
    if (!activeMission) return [];
    return [{
      from: [activeMission.pickupLocation.lat, activeMission.pickupLocation.lng],
      to: [activeMission.destinationLocation.lat, activeMission.destinationLocation.lng],
      color: '#9333ea', label: 'UAV Flight Path', directLine: true
    }];
  }, [activeMission?.id, activeMission?.status]);

  const flightDist = activeMission ? haversine(activeMission.pickupLocation.lat, activeMission.pickupLocation.lng, activeMission.destinationLocation.lat, activeMission.destinationLocation.lng) : 0;
  const statusColors: Record<string, string> = { Pending: 'bg-amber-100 text-amber-700', Approved: 'bg-blue-100 text-blue-700', 'In Flight': 'bg-purple-100 text-purple-700', Delivered: 'bg-emerald-100 text-emerald-700', Rejected: 'bg-red-100 text-red-700' };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center"><Plane className="w-6 h-6 text-purple-600" /></div>
        <div><h2 className="text-2xl font-bold text-slate-900">UAV Delivery System</h2><p className="text-sm text-slate-500">Dispatch medical drones for urgent deliveries — straight-line flight</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-5">Request New UAV Mission</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Payload */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payload Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Blood','Medicine','Equipment','Vaccines'].map(p => (
                  <button key={p} type="button" onClick={() => setPayload(p)} className={`h-11 rounded-xl font-semibold text-sm transition border-2 ${payload === p ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'}`}>{p}</button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
              <input required placeholder="e.g. 2 units O- packed RBC, urgent" className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50 focus:bg-white transition" value={desc} onChange={e => setDesc(e.target.value)} />
            </div>

            {/* ── PICKUP LOCATION ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pickup Location</label>
                <button type="button" onClick={() => useLiveLocation('pickup')} className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 transition">
                  <MapPin className="w-3 h-3" /> {gettingLoc === 'pickup' ? 'Acquiring...' : 'Use Live Location'}
                </button>
              </div>
              {pickupMode === 'live' ? (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-sm font-medium text-emerald-800">{(currentUser as any).hospitalName} — {hospitalLoc.lat.toFixed(4)}, {hospitalLoc.lng.toFixed(4)}</span>
                  </div>
                  <button type="button" onClick={() => { setPickupMode('manual'); setPickupLat(hospitalLoc.lat.toString()); setPickupLng(hospitalLoc.lng.toString()); }} className="text-xs font-bold text-slate-500 hover:text-slate-700">Edit</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Latitude" value={pickupLat} onChange={e => setPickupLat(e.target.value)} className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50 focus:bg-white transition" />
                  <input type="text" placeholder="Longitude" value={pickupLng} onChange={e => setPickupLng(e.target.value)} className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50 focus:bg-white transition" />
                </div>
              )}
            </div>

            {/* ── DESTINATION LOCATION ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Destination Location</label>
                <button type="button" onClick={() => useLiveLocation('dest')} className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 transition">
                  <MapPin className="w-3 h-3" /> {gettingLoc === 'dest' ? 'Acquiring...' : 'Use Live Location'}
                </button>
              </div>
              {destMode === 'live' ? (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-sm font-medium text-emerald-800">GPS Location — {destLat}, {destLng}</span>
                  </div>
                  <button type="button" onClick={() => setDestMode('manual')} className="text-xs font-bold text-slate-500 hover:text-slate-700">Edit</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Latitude" value={destLat} onChange={e => setDestLat(e.target.value)} className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50 focus:bg-white transition" />
                  <input type="text" placeholder="Longitude" value={destLng} onChange={e => setDestLng(e.target.value)} className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50 focus:bg-white transition" />
                </div>
              )}
            </div>

            {/* Flight Preview */}
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2"><Zap className="w-4 h-4 text-purple-600 shrink-0" /><span className="text-sm font-bold text-purple-800">Flight Preview</span></div>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <div className="text-center"><p className="text-xs text-purple-500 font-bold uppercase">Distance</p><p className="text-lg font-bold text-purple-800">{dist.toFixed(1)} km</p></div>
                <div className="text-center"><p className="text-xs text-purple-500 font-bold uppercase">ETA</p><p className="text-lg font-bold text-purple-800">~{Math.max(1, Math.round(dist / 1.2))} min</p></div>
                <div className="text-center"><p className="text-xs text-purple-500 font-bold uppercase">Routing</p><p className="text-lg font-bold text-purple-800">Direct</p></div>
              </div>
            </div>

            <button disabled={!desc} className="w-full h-12 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2">
              <Plane className="w-5 h-5" /> Request UAV Mission
            </button>
          </form>
        </div>

        {/* Right Side: Active Mission + History */}
        <div className="space-y-4">
          {activeMission && (
            <div className="bg-white rounded-2xl shadow-sm border-2 border-purple-400 overflow-hidden">
              <div className="p-5 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
                <div className="flex items-center gap-3"><div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center"><Plane className="w-5 h-5 text-purple-600" /></div><h4 className="font-bold text-slate-900">Active UAV Mission</h4></div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusColors[activeMission.status]}`}>{activeMission.status}</span>
              </div>
              <div className="p-5 border-b border-slate-100">
                <p className="text-slate-800 font-medium mb-3">{activeMission.description}</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-xs text-slate-400 font-bold uppercase">Distance</p><p className="font-bold text-slate-800 text-lg mt-0.5">{flightDist.toFixed(1)} km</p></div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-xs text-slate-400 font-bold uppercase">ETA</p><p className="font-bold text-slate-800 text-lg mt-0.5">~{Math.max(1, Math.round(flightDist / 1.2))} min</p></div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-xs text-slate-400 font-bold uppercase">Route</p><p className="font-bold text-purple-700 text-lg mt-0.5">Direct ✈️</p></div>
                </div>
              </div>
              <div className="h-80"><LiveMap center={[(activeMission.pickupLocation.lat + activeMission.destinationLocation.lat) / 2, (activeMission.pickupLocation.lng + activeMission.destinationLocation.lng) / 2]} zoom={13} routes={uavRoutes} /></div>
            </div>
          )}

          {/* Preview map (when no active mission) */}
          {!activeMission && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100"><h3 className="font-bold text-slate-900 text-sm">Flight Path Preview</h3></div>
              <div className="h-72">
                <LiveMap center={[(finalPickup.lat + finalDest.lat) / 2, (finalPickup.lng + finalDest.lng) / 2]} zoom={12}
                  routes={[{ from: [finalPickup.lat, finalPickup.lng], to: [finalDest.lat, finalDest.lng], color: '#9333ea', directLine: true }]}
                />
              </div>
            </div>
          )}

          {/* Mission History */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="px-5 py-4 border-b border-slate-100"><h3 className="font-bold text-slate-900">Mission History ({myMissions.length})</h3></div>
            {myMissions.length === 0 ? (
              <div className="p-8 text-center"><Plane className="w-10 h-10 text-slate-300 mx-auto mb-2" /><p className="text-slate-500 text-sm">No UAV missions yet.</p></div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myMissions.map(m => (
                  <div key={m.id} className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center shrink-0"><Package className="w-4 h-4 text-purple-600" /></div>
                      <div className="min-w-0"><p className="font-bold text-slate-900 text-sm truncate">{m.description}</p><p className="text-xs text-slate-500 mt-0.5">{new Date(m.createdAt).toLocaleString()}</p></div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase shrink-0 ${statusColors[m.status]}`}>{m.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*            ALERTS SECTION               */
/* ═══════════════════════════════════════ */
function AlertsSection() {
  const { communityAlerts } = useStore();
  const published = communityAlerts.filter(a => a.status === 'Published');
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-amber-600" /></div>
        <div><h2 className="text-2xl font-bold text-slate-900">Community Alerts</h2><p className="text-sm text-slate-500">Active alerts in your area</p></div>
      </div>
      {published.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-100 text-center"><AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">No active alerts.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {published.map(a => (
            <div key={a.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-amber-600" /></div>
                <h4 className="font-bold text-slate-900">{a.type}</h4>
              </div>
              <p className="text-sm text-slate-600 mb-2">{a.description}</p>
              <p className="text-[10px] text-slate-400">{new Date(a.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
