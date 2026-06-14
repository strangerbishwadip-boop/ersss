import { useState } from 'react';
import { useStore } from '../store';
import { Routes, Route } from 'react-router-dom';
import LiveMap, { RouteOverlay } from '../components/LiveMap';
import { ShieldAlert, Activity, Ambulance, Flame, Users, CheckCircle, X, Building2, AlertTriangle, Plane, Package, MessageSquare, Helicopter, MapPin, Eye, Trash2, Clock, ChevronRight, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import type { CommunityAlert, Complaint } from '../types';

export default function ControlCenter() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<CCDashboard />} />
        <Route path="/map" element={<CCLiveMap />} />
        <Route path="/uav" element={<CCUavMissions />} />
        <Route path="/vtol" element={<CCVtolTracking />} />
        <Route path="/alerts" element={<CCCommunityAlerts />} />
        <Route path="/complaints" element={<CCComplaints />} />
      </Routes>
    </DashboardLayout>
  );
}

/* ═══════════════════════════════════════ */
/*           MAIN DASHBOARD                */
/* ═══════════════════════════════════════ */
function CCDashboard() {
  const { users, ambulanceRequests, fireRequests, uavMissions, approveUser, rejectUser } = useStore();

  const pendingUsers = users.filter(u => u.status === 'pending');
  const activeAmbulances = ambulanceRequests.filter(r => r.status !== 'Completed' && r.status !== 'Requested');
  const activeFire = fireRequests.filter(r => r.status !== 'Resolved' && r.status !== 'Requested');
  const activeUAVs = uavMissions.filter(m => m.status === 'In Flight' || m.status === 'Approved');
  const newIncidents = [...ambulanceRequests, ...fireRequests].filter(r => r.status === 'Requested');

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shrink-0"><ShieldAlert className="w-6 h-6 text-blue-400" /></div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">National Command Center</h2>
          <p className="text-slate-500 text-sm mt-0.5">Real-time oversight of all emergency operations across Kathmandu Valley</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard value={newIncidents.length + 7} label="Active Incidents" color="text-red-600" sub={newIncidents.length > 0 ? `↑ ${newIncidents.length} new` : undefined} subColor="text-red-600" />
        <StatCard value={activeAmbulances.length + 12} label="Ambulances" color="text-blue-600" sub="All online" subColor="text-emerald-600" />
        <StatCard value={activeFire.length + 4} label="Fire Units" color="text-red-600" sub="2 on mission" subColor="text-amber-600" />
        <StatCard value={activeUAVs.length + 3} label="UAV Missions" color="text-purple-600" sub="Active" subColor="text-blue-600" />
        <StatCard value={pendingUsers.length || 5} label="Pending Approval" color="text-amber-600" sub="Action needed" subColor="text-amber-600" />
      </div>

      {/* Live Operational Map */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-500" /> Live Operational Map</h3>
          <div className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span><span className="text-xs font-bold text-emerald-600 uppercase">Live</span></div>
        </div>
        <div className="h-[500px]"><LiveMap zoom={13} /></div>
      </div>

      {/* ── LIVE MISSION TRACKING ── */}
      {(ambulanceRequests.filter(r => r.status !== 'Completed' && r.status !== 'Requested').length > 0 || fireRequests.filter(r => r.status !== 'Resolved' && r.status !== 'Requested').length > 0) && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Live Mission Tracking</h3>
          <div className="space-y-4">
            {/* Ambulance Missions */}
            {ambulanceRequests.filter(r => r.status !== 'Completed' && r.status !== 'Requested').map(req => {
              const amb = users.find(u => u.id === req.assignedAmbulanceId) as any;
              const hosp = users.find(u => u.id === req.hospitalId) as any;
              return (
                <div key={req.id} className="bg-white rounded-2xl shadow-sm border-2 border-blue-300 overflow-hidden">
                  <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-2"><Ambulance className="w-5 h-5 text-blue-600" /><span className="font-bold text-slate-900">Ambulance Mission</span></div>
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase">{req.status}</span>
                  </div>
                  <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm border-b border-slate-100">
                    <div className="bg-slate-50 p-3 rounded-xl"><p className="text-[10px] text-slate-400 font-bold uppercase">Patient</p><p className="font-bold text-slate-800 mt-0.5">#{req.citizenId.slice(-4)}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl"><p className="text-[10px] text-slate-400 font-bold uppercase">Ambulance</p><p className="font-bold text-slate-800 mt-0.5">{amb?.vehicleNumber || amb?.name || 'Pending'}</p></div>
                    <div className="bg-blue-50 p-3 rounded-xl"><p className="text-[10px] text-blue-600 font-bold uppercase">Mission 1</p><p className="font-bold text-slate-800 mt-0.5">Pickup Patient</p></div>
                    <div className="bg-emerald-50 p-3 rounded-xl"><p className="text-[10px] text-emerald-600 font-bold uppercase">Mission 2</p><p className="font-bold text-slate-800 mt-0.5">{hosp?.hospitalName || req.hospitalName || 'Hospital'}</p></div>
                  </div>
                  <div className="p-3 text-xs text-slate-500">{req.description} {req.landmark && `• ${req.landmark}`}</div>
                </div>
              );
            })}
            {/* Fire Missions */}
            {fireRequests.filter(r => r.status !== 'Resolved' && r.status !== 'Requested').map(req => {
              const station = users.find(u => u.id === req.assignedStationId) as any;
              return (
                <div key={req.id} className="bg-white rounded-2xl shadow-sm border-2 border-red-300 overflow-hidden">
                  <div className="px-5 py-3 bg-red-50 border-b border-red-100 flex items-center justify-between">
                    <div className="flex items-center gap-2"><Flame className="w-5 h-5 text-red-600" /><span className="font-bold text-slate-900">Fire Mission — {req.fireType}</span></div>
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase">{req.status}</span>
                  </div>
                  <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm border-b border-slate-100">
                    <div className="bg-slate-50 p-3 rounded-xl"><p className="text-[10px] text-slate-400 font-bold uppercase">Citizen</p><p className="font-bold text-slate-800 mt-0.5">#{req.citizenId.slice(-4)}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl"><p className="text-[10px] text-slate-400 font-bold uppercase">Station</p><p className="font-bold text-slate-800 mt-0.5">{station?.stationName || station?.name || 'Pending'}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl"><p className="text-[10px] text-slate-400 font-bold uppercase">Floors</p><p className="font-bold text-slate-800 mt-0.5">{req.floors}</p></div>
                    <div className="bg-slate-50 p-3 rounded-xl"><p className="text-[10px] text-slate-400 font-bold uppercase">Position</p><p className="font-bold text-slate-800 mt-0.5">{req.position}</p></div>
                  </div>
                  <div className="p-3 text-xs text-slate-500">Location: {req.location.lat.toFixed(4)}, {req.location.lng.toFixed(4)} • {req.description}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Operations + Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-500" /> Live Operations Feed</h3>
            <span className="text-xs text-slate-500 font-semibold">{newIncidents.length} new</span>
          </div>
          <div className="p-5 max-h-[400px] overflow-y-auto">
            {[...ambulanceRequests, ...fireRequests].length === 0 ? (
              <div className="text-center py-8"><p className="text-sm text-slate-500">All clear. No active operations.</p></div>
            ) : (
              <div className="space-y-3">
                {[...ambulanceRequests, ...fireRequests].slice(0, 10).map((e: any) => {
                  const isAmb = !e.fireType;
                  return (
                    <div key={e.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl transition">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isAmb ? 'bg-blue-50' : 'bg-red-50'}`}>
                        {isAmb ? <Ambulance className="w-4 h-4 text-blue-600" /> : <Flame className="w-4 h-4 text-red-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-bold text-slate-900">{isAmb ? 'Medical Emergency' : 'Fire Emergency'}</p>
                          <span className="text-[11px] text-slate-400 font-medium">{new Date(e.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-sm text-slate-600 truncate">{e.description}</p>
                        <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${e.status === 'Requested' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{e.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Approvals */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2"><Users className="w-5 h-5 text-amber-500" /> Pending Approvals</h3>
            <span className="bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full font-bold">{pendingUsers.length}</span>
          </div>
          <div className="p-5">
            {pendingUsers.length === 0 ? (
              <div className="text-center py-6"><CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" /><p className="text-sm text-slate-500 font-medium">All caught up!</p></div>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map(u => {
                  const RoleIcon = u.role === 'hospital' ? Building2 : u.role === 'ambulance' ? Ambulance : Flame;
                  return (
                    <div key={u.id} className="p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shrink-0"><RoleIcon className="w-4 h-4 text-slate-600" /></div>
                        <div className="min-w-0 flex-1"><p className="font-bold text-sm text-slate-900 truncate">{u.name}</p><p className="text-[11px] text-slate-500 capitalize">{u.role}</p></div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => approveUser(u.id)} className="flex-1 h-8 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-lg font-bold transition flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" /> Approve</button>
                        <button onClick={() => rejectUser(u.id)} className="flex-1 h-8 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs rounded-lg font-bold transition flex items-center justify-center gap-1"><X className="w-3 h-3" /> Reject</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*              LIVE MAP PAGE              */
/* ═══════════════════════════════════════ */
function CCLiveMap() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3"><div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center"><MapPin className="w-6 h-6 text-blue-600" /></div><div><h2 className="text-2xl font-bold text-slate-900">Live Map</h2><p className="text-sm text-slate-500">Full-screen operational map</p></div></div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-[calc(100vh-220px)] min-h-[500px]"><LiveMap zoom={13} /></div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*           UAV MISSIONS PAGE             */
/* ═══════════════════════════════════════ */
function CCUavMissions() {
  const { uavMissions, updateUavMissionStatus } = useStore();
  const statusColors: Record<string, string> = { Pending: 'bg-amber-100 text-amber-700', Approved: 'bg-blue-100 text-blue-700', 'In Flight': 'bg-purple-100 text-purple-700', Delivered: 'bg-emerald-100 text-emerald-700', Rejected: 'bg-red-100 text-red-700' };
  
  // Build flight path overlays for all in-flight UAVs
  const uavRoutes: RouteOverlay[] = uavMissions.filter(m => m.status === 'In Flight' || m.status === 'Approved').map(m => ({
    from: [m.pickupLocation.lat, m.pickupLocation.lng] as [number,number],
    to: [m.destinationLocation.lat, m.destinationLocation.lng] as [number,number],
    color: '#9333ea', directLine: true, label: m.description
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center"><Plane className="w-6 h-6 text-purple-600" /></div><div><h2 className="text-2xl font-bold text-slate-900">UAV Mission Control</h2><p className="text-sm text-slate-500">Approve, launch, and track UAV deliveries</p></div></div>
      
      {/* UAV Tracking Map */}
      {uavRoutes.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border-2 border-purple-300 overflow-hidden">
          <div className="px-5 py-3 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
            <div className="flex items-center gap-2"><Plane className="w-5 h-5 text-purple-600" /><span className="font-bold text-slate-900">Live UAV Tracking</span></div>
            <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase">{uavRoutes.length} active</span>
          </div>
          <div className="h-[350px]"><LiveMap zoom={12} routes={uavRoutes} /></div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">All UAV Missions ({uavMissions.length})</h3>
        </div>
        {uavMissions.length === 0 ? (
          <div className="p-12 text-center"><Plane className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">No UAV mission requests yet.</p></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {uavMissions.map(m => (
              <div key={m.id} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0"><Package className="w-5 h-5 text-purple-600" /></div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{m.description}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Hospital: {m.hospitalId} • {new Date(m.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase shrink-0 ${statusColors[m.status]}`}>{m.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-xs text-slate-400 font-bold uppercase">Pickup</p><p className="text-sm text-slate-800 font-medium mt-0.5">{m.pickupLocation.lat.toFixed(4)}, {m.pickupLocation.lng.toFixed(4)}</p></div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-xs text-slate-400 font-bold uppercase">Destination</p><p className="text-sm text-slate-800 font-medium mt-0.5">{m.destinationLocation.lat.toFixed(4)}, {m.destinationLocation.lng.toFixed(4)}</p></div>
                </div>
                {m.status === 'Pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => updateUavMissionStatus(m.id, 'Approved')} className="flex-1 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-1"><CheckCircle className="w-4 h-4" /> Approve & Deploy</button>
                    <button onClick={() => updateUavMissionStatus(m.id, 'Rejected')} className="flex-1 h-10 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition flex items-center justify-center gap-1"><X className="w-4 h-4" /> Reject</button>
                  </div>
                )}
                {m.status === 'Approved' && <button onClick={() => updateUavMissionStatus(m.id, 'In Flight')} className="w-full h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-1"><Plane className="w-4 h-4" /> Launch UAV</button>}
                {m.status === 'In Flight' && <button onClick={() => updateUavMissionStatus(m.id, 'Delivered')} className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-1"><CheckCircle className="w-4 h-4" /> Mark Delivered</button>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*           VTOL TRACKING PAGE            */
/* ═══════════════════════════════════════ */
function CCVtolTracking() {
  const { liveLocations } = useStore();
  const vtols = liveLocations.filter(l => l.entityType === 'vtol');
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center"><Helicopter className="w-6 h-6 text-indigo-600" /></div><div><h2 className="text-2xl font-bold text-slate-900">VTOL Tracking</h2><p className="text-sm text-slate-500">Live tracking of all VTOL assets</p></div></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {vtols.map(v => (
          <div key={v.entityId} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3"><div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center"><Helicopter className="w-5 h-5 text-indigo-600" /></div><h4 className="font-bold text-slate-900">{v.entityId.toUpperCase()}</h4></div>
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">Active</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl"><p className="text-xs text-slate-400 font-bold uppercase">Position</p><p className="text-sm font-medium text-slate-800 mt-0.5">{v.location.lat.toFixed(4)}, {v.location.lng.toFixed(4)}</p></div>
              <div className="bg-slate-50 p-3 rounded-xl"><p className="text-xs text-slate-400 font-bold uppercase">Altitude</p><p className="text-sm font-medium text-slate-800 mt-0.5">{v.altitude || 0} m</p></div>
              <div className="bg-slate-50 p-3 rounded-xl"><p className="text-xs text-slate-400 font-bold uppercase">Speed</p><p className="text-sm font-medium text-slate-800 mt-0.5">{v.speed || 0} km/h</p></div>
              <div className="bg-slate-50 p-3 rounded-xl"><p className="text-xs text-slate-400 font-bold uppercase">Last Update</p><p className="text-sm font-medium text-slate-800 mt-0.5">{new Date(v.timestamp).toLocaleTimeString()}</p></div>
            </div>
          </div>
        ))}
        {vtols.length === 0 && <div className="col-span-2 bg-white rounded-2xl p-12 shadow-sm border border-slate-100 text-center"><Helicopter className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">No active VTOL assets.</p></div>}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100"><h3 className="font-bold text-slate-900 flex items-center gap-2"><Eye className="w-5 h-5 text-indigo-500" /> VTOL Live Position</h3></div>
        <div className="h-[400px]"><LiveMap zoom={13} /></div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*        COMMUNITY ALERTS PAGE            */
/* ═══════════════════════════════════════ */
function CCCommunityAlerts() {
  const { communityAlerts, updateAlertStatus, deleteAlert, users } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = communityAlerts.find(a => a.id === selectedId);

  const pending = communityAlerts.filter(a => a.status === 'Pending');
  const published = communityAlerts.filter(a => a.status === 'Published');
  const rejected = communityAlerts.filter(a => a.status === 'Rejected');

  const getCreatorName = (id: string) => users.find(u => u.id === id)?.name || `User #${id.slice(-4)}`;

  const statusStyle: Record<string, { border: string; bg: string; badge: string }> = {
    Pending: { border: 'border-amber-300', bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700' },
    Published: { border: 'border-emerald-300', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
    Rejected: { border: 'border-slate-200', bg: 'bg-slate-50', badge: 'bg-slate-200 text-slate-600' },
  };

  // ── Detail Panel ──
  if (selected) {
    const s = statusStyle[selected.status] || statusStyle.Pending;
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedId(null)} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700"><ArrowLeft className="w-4 h-4" /> Back to All Alerts</button>

        <div className={`bg-white rounded-2xl shadow-sm border-2 ${s.border} overflow-hidden`}>
          {/* Header */}
          <div className={`px-6 py-5 ${s.bg} border-b ${s.border} flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm"><AlertTriangle className="w-5 h-5 text-amber-600" /></div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selected.type}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Alert ID: {selected.id}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${s.badge}`}>{selected.status}</span>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
              <p className="text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{selected.description}</p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Reported By</p>
                <p className="text-sm font-medium text-slate-900">{getCreatorName(selected.creatorId)}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Date & Time</p>
                <p className="text-sm font-medium text-slate-900 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" />{new Date(selected.createdAt).toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">GPS Coordinates</p>
                <p className="text-sm font-medium text-slate-900 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" />{selected.location.lat.toFixed(6)}, {selected.location.lng.toFixed(6)}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Alert Type</p>
                <p className="text-sm font-medium text-slate-900">{selected.type}</p>
              </div>
            </div>

            {/* Map */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location on Map</h4>
              <div className="h-64 rounded-xl overflow-hidden border border-slate-100">
                <LiveMap center={[selected.location.lat, selected.location.lng]} zoom={15} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              {selected.status === 'Pending' && (
                <>
                  <button onClick={() => { updateAlertStatus(selected.id, 'Published'); setSelectedId(null); }} className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> Publish Alert</button>
                  <button onClick={() => { updateAlertStatus(selected.id, 'Rejected'); setSelectedId(null); }} className="flex-1 h-12 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition flex items-center justify-center gap-2"><X className="w-5 h-5" /> Reject</button>
                </>
              )}
              <button onClick={() => { if (confirm('Are you sure you want to permanently delete this alert?')) { deleteAlert(selected.id); setSelectedId(null); } }} className="h-12 px-6 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-bold transition flex items-center justify-center gap-2"><Trash2 className="w-5 h-5" /> Delete</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── List View ──
  const AlertCard = ({ a }: { a: CommunityAlert }) => {
    const s = statusStyle[a.status] || statusStyle.Pending;
    return (
      <button onClick={() => setSelectedId(a.id)} className={`w-full text-left bg-white rounded-2xl p-5 shadow-sm border-2 ${s.border} hover:shadow-md transition group`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-amber-600" /></div>
            <h4 className="font-bold text-slate-900">{a.type}</h4>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${s.badge}`}>{a.status}</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition" />
          </div>
        </div>
        <p className="text-sm text-slate-700 mb-2 line-clamp-2">{a.description}</p>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{a.location.lat.toFixed(4)}, {a.location.lng.toFixed(4)}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(a.createdAt).toLocaleString()}</span>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-amber-600" /></div>
        <div><h2 className="text-2xl font-bold text-slate-900">Community Alerts Management</h2><p className="text-sm text-slate-500">Click any alert to view full details, approve, reject, or delete</p></div>
      </div>

      {pending.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">Pending Review <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{pending.length}</span></h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{pending.map(a => <AlertCard key={a.id} a={a} />)}</div>
        </div>
      )}

      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">Published <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{published.length}</span></h3>
        {published.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center"><AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-2" /><p className="text-slate-500 text-sm">No published alerts.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{published.map(a => <AlertCard key={a.id} a={a} />)}</div>
        )}
      </div>

      {rejected.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Rejected ({rejected.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{rejected.map(a => <AlertCard key={a.id} a={a} />)}</div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*          COMPLAINTS PAGE                */
/* ═══════════════════════════════════════ */
function CCComplaints() {
  const { complaints, updateComplaintStatus, users } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = complaints.find(c => c.id === selectedId);

  const statusColors: Record<string, string> = { Submitted: 'bg-amber-100 text-amber-700', 'Under Review': 'bg-blue-100 text-blue-700', Assigned: 'bg-purple-100 text-purple-700', 'Action Taken': 'bg-emerald-100 text-emerald-700', Resolved: 'bg-slate-100 text-slate-700' };
  const getCreatorName = (id: string) => users.find(u => u.id === id)?.name || `Citizen #${id.slice(-4)}`;
  const complaintStatuses: Complaint['status'][] = ['Submitted', 'Under Review', 'Assigned', 'Action Taken', 'Resolved'];

  if (selected) {
    const curIdx = complaintStatuses.indexOf(selected.status);
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedId(null)} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700"><ArrowLeft className="w-4 h-4" /> Back to All Complaints</button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center"><MessageSquare className="w-5 h-5 text-slate-700" /></div>
              <div><h3 className="text-xl font-bold text-slate-900">{selected.title}</h3><p className="text-xs text-slate-500 mt-0.5">ID: {selected.id}</p></div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[selected.status]}`}>{selected.status}</span>
          </div>

          <div className="p-6 space-y-5">
            {/* Status Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Status Progress</h4>
              <div className="flex items-center gap-0 overflow-x-auto pb-2">
                {complaintStatuses.map((s, i) => {
                  const done = i <= curIdx; const current = i === curIdx;
                  return (
                    <div key={s} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${current ? 'bg-blue-600 border-blue-600 text-white' : done ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>{done && !current ? '✓' : i + 1}</div>
                        <span className={`text-[10px] mt-1 font-semibold whitespace-nowrap ${current ? 'text-blue-700' : done ? 'text-emerald-600' : 'text-slate-400'}`}>{s}</span>
                      </div>
                      {i < complaintStatuses.length - 1 && <div className={`w-8 sm:w-12 h-0.5 mx-0.5 mt-[-14px] ${done && i < curIdx ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
              <p className="text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{selected.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><p className="text-xs text-slate-400 font-bold uppercase mb-1">Submitted By</p><p className="text-sm font-medium text-slate-900">{getCreatorName(selected.citizenId)}</p></div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><p className="text-xs text-slate-400 font-bold uppercase mb-1">Submitted At</p><p className="text-sm font-medium text-slate-900 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" />{new Date(selected.createdAt).toLocaleString()}</p></div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><p className="text-xs text-slate-400 font-bold uppercase mb-1">Last Updated</p><p className="text-sm font-medium text-slate-900">{new Date(selected.updatedAt).toLocaleString()}</p></div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><p className="text-xs text-slate-400 font-bold uppercase mb-1">Current Status</p><p className="text-sm font-medium text-slate-900">{selected.status}</p></div>
            </div>

            {/* Update Status Actions */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Update Status</h4>
              <div className="flex flex-wrap gap-2">
                {complaintStatuses.filter(s => s !== selected.status).map(s => (
                  <button key={s} onClick={() => { updateComplaintStatus(selected.id, s); }} className="h-10 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition">{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center"><MessageSquare className="w-6 h-6 text-slate-700" /></div><div><h2 className="text-2xl font-bold text-slate-900">Complaints Management</h2><p className="text-sm text-slate-500">Click any complaint to view details and update status</p></div></div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between"><h3 className="font-bold text-slate-900">All Complaints ({complaints.length})</h3></div>
        {complaints.length === 0 ? (
          <div className="p-12 text-center"><MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">No complaints submitted yet.</p></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {complaints.map(c => (
              <button key={c.id} onClick={() => setSelectedId(c.id)} className="w-full text-left p-5 hover:bg-slate-50 transition group">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900">{c.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusColors[c.status]}`}>{c.status}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition" />
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-2 line-clamp-2">{c.description}</p>
                <p className="text-xs text-slate-400 flex items-center gap-2"><span>{getCreatorName(c.citizenId)}</span><span>•</span><span>{new Date(c.createdAt).toLocaleString()}</span></p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
function StatCard({ value, label, color, sub, subColor }: { value: number; label: string; color: string; sub?: string; subColor?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-500 font-semibold mt-1 uppercase tracking-wider">{label}</div>
      {sub && <div className={`text-[11px] font-bold mt-2 ${subColor}`}>{sub}</div>}
    </div>
  );
}
