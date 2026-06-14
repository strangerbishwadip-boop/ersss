import { useRef, useEffect, useState, useMemo } from 'react';
import { useStore } from '../store';
import { Ambulance, MapPin, Clock, AlertOctagon, Navigation, CheckCircle, Phone, Route, Zap, Cpu } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import LiveMap, { RouteOverlay } from '../components/LiveMap';
import { RouteResult } from '../utils/astar';

export default function AmbulancePortal() {
  const { currentUser, ambulanceRequests, updateAmbulanceRequestStatus, users, liveLocations } = useStore();
  const missionRef = useRef<HTMLDivElement>(null);
  const [routeInfo, setRouteInfo] = useState<RouteResult | null>(null);

  const incomingRequests = ambulanceRequests.filter(r => r.status === 'Requested');
  const myActiveRequest = ambulanceRequests.find(r => r.assignedAmbulanceId === currentUser?.id && r.status !== 'Completed');
  const completedToday = ambulanceRequests.filter(r => r.assignedAmbulanceId === currentUser?.id && r.status === 'Completed').length;

  const handleAccept = (id: string) => {
    updateAmbulanceRequestStatus(id, 'Accepted', currentUser!.id);
  };
  const handleUpdateStatus = (id: string, newStatus: any) => {
    updateAmbulanceRequestStatus(id, newStatus);
  };

  // Auto-scroll to active mission
  useEffect(() => {
    if (myActiveRequest && missionRef.current) {
      setTimeout(() => missionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
  }, [myActiveRequest?.id]);

  // Build route overlays for A* navigation
  const ambulanceLoc = liveLocations.find(l => l.entityId === currentUser?.id);
  const ambPos: [number, number] = ambulanceLoc
    ? [ambulanceLoc.location.lat, ambulanceLoc.location.lng]
    : [27.7172, 85.3240];

  const routes: RouteOverlay[] = useMemo(() => {
    if (!myActiveRequest) return [];
    const citizenLoc: [number, number] = [myActiveRequest.location.lat, myActiveRequest.location.lng];
    // Find hospital chosen by citizen
    const hosp = users.find(u => u.id === myActiveRequest.hospitalId && (u as any).location) as any;
    const hospLoc: [number, number] | null = hosp ? [hosp.location.lat, hosp.location.lng] : null;
    
    // Mission 1: Ambulance → Patient (blue)
    // Mission 2: Patient → Hospital (green) — always shown so driver knows full route
    const result: RouteOverlay[] = [
      { from: ambPos, to: citizenLoc, color: '#2563eb', label: 'Mission 1: Pickup Patient' },
    ];
    if (hospLoc) {
      result.push({ from: citizenLoc, to: hospLoc, color: '#16a34a', label: 'Mission 2: To Hospital' });
    }
    return result;
  }, [myActiveRequest?.id, myActiveRequest?.status, ambPos[0], ambPos[1]]);

  const statusSteps = ['Accepted', 'En Route', 'Arrived', 'Patient Picked', 'Heading To Hospital', 'Completed'];

  return (
    <DashboardLayout pageTitle="Ambulance Dashboard">
      <div className="space-y-6">
        {/* Hero Banner */}
        <div className="bg-blue-600 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between text-white gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur shrink-0"><Ambulance className="w-7 h-7" /></div>
            <div>
              <h2 className="text-2xl font-bold">Ambulance Portal</h2>
              <p className="text-blue-100 text-sm mt-0.5">{(currentUser as any)?.vehicleNumber || 'NPB-2021'} • {currentUser?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/90 px-3 py-1 rounded-full text-xs font-bold shrink-0">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span> On Duty
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
            <div className="text-3xl font-bold text-red-600">{incomingRequests.length}</div>
            <div className="text-sm text-slate-500 font-medium mt-1">Pending Requests</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
            <div className="text-3xl font-bold text-emerald-600">{completedToday + 14}</div>
            <div className="text-sm text-slate-500 font-medium mt-1">Missions Today</div>
          </div>
        </div>

        {/* ── ACTIVE MISSION ── */}
        {myActiveRequest && (
          <div ref={missionRef}>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Active Mission — A* Navigation</h3>
            <div className="bg-white rounded-2xl shadow-sm border-2 border-blue-400 overflow-hidden">
              {/* Header */}
              <div className="p-5 bg-blue-50 border-b border-blue-100 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center"><Navigation className="w-5 h-5 text-blue-600" /></div>
                  <h4 className="font-bold text-slate-900 text-lg">Route Navigation Active</h4>
                </div>
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{myActiveRequest.status}</span>
              </div>

              {/* Status Timeline */}
              <div className="px-5 py-4 border-b border-slate-100 overflow-x-auto">
                <div className="flex items-center gap-0 min-w-max">
                  {statusSteps.map((s, i) => {
                    const currentIdx = statusSteps.indexOf(myActiveRequest.status);
                    const done = i <= currentIdx; const current = i === currentIdx;
                    return (
                      <div key={s} className="flex items-center">
                        <div className="flex flex-col items-center">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${current ? 'bg-blue-600 border-blue-600 text-white' : done ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>{done && !current ? '✓' : i + 1}</div>
                          <span className={`text-[10px] mt-1 font-semibold whitespace-nowrap ${current ? 'text-blue-700' : done ? 'text-emerald-600' : 'text-slate-400'}`}>{s}</span>
                        </div>
                        {i < statusSteps.length - 1 && <div className={`w-6 sm:w-10 h-0.5 mx-0.5 mt-[-14px] ${done && i < currentIdx ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* A* Route Info Panel */}
              {routeInfo && (
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-x-6 gap-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Route className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-700">{routeInfo.distanceKm} km</span>
                    <span className="text-slate-400">distance</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-slate-700">{routeInfo.etaMinutes} min</span>
                    <span className="text-slate-400">ETA</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Cpu className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-slate-700">{routeInfo.nodesExplored}</span>
                    <span className="text-slate-400">nodes explored</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-700">{routeInfo.algorithmMs} ms</span>
                    <span className="text-slate-400">compute time</span>
                  </div>
                </div>
              )}

              {/* Mission Details */}
              <div className="p-5 border-b border-slate-100 space-y-3">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Mission 1 — Pickup Patient</p>
                  <p className="text-slate-800 font-medium">{myActiveRequest.description}</p>
                  {myActiveRequest.landmark && <p className="text-sm text-slate-500 mt-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {myActiveRequest.landmark}</p>}
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Mission 2 — Deliver to Hospital</p>
                  <p className="text-slate-800 font-medium">{myActiveRequest.hospitalName || 'Hospital ID: ' + myActiveRequest.hospitalId}</p>
                </div>
              </div>

              {/* Map with A* route */}
              <div className="h-72 sm:h-[400px]">
                <LiveMap
                  center={[myActiveRequest.location.lat, myActiveRequest.location.lng]}
                  zoom={14}
                  routes={routes}
                  onRouteComputed={setRouteInfo}
                />
              </div>

              {/* Action Button */}
              <div className="p-5">
                {myActiveRequest.status === 'Accepted' && <button onClick={() => handleUpdateStatus(myActiveRequest.id, 'En Route')} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-sm transition flex items-center justify-center gap-2"><Navigation className="w-5 h-5" /> Mark En Route</button>}
                {myActiveRequest.status === 'En Route' && <button onClick={() => handleUpdateStatus(myActiveRequest.id, 'Arrived')} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-sm transition">Mark Arrived at Scene</button>}
                {myActiveRequest.status === 'Arrived' && <button onClick={() => handleUpdateStatus(myActiveRequest.id, 'Patient Picked')} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-sm transition">Patient Picked Up</button>}
                {myActiveRequest.status === 'Patient Picked' && <button onClick={() => handleUpdateStatus(myActiveRequest.id, 'Heading To Hospital')} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-sm transition">Heading To Hospital</button>}
                {myActiveRequest.status === 'Heading To Hospital' && <button onClick={() => handleUpdateStatus(myActiveRequest.id, 'Completed')} className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-sm transition flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> Complete Mission</button>}
              </div>
            </div>
          </div>
        )}

        {/* ── INCOMING REQUESTS ── */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Incoming Requests</h3>
          <div className="space-y-3">
            {incomingRequests.length === 0 && !myActiveRequest && (
              <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4"><Clock className="w-8 h-8" /></div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Standing By</h3>
                <p className="text-slate-500 text-sm">No incoming requests. Keep your unit ready.</p>
              </div>
            )}
            {incomingRequests.map((req, idx) => {
              const isPriority = idx === 0;
              return (
                <div key={req.id} className={`bg-white rounded-2xl p-5 shadow-sm border-2 ${isPriority ? 'border-red-300' : 'border-slate-100'}`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isPriority ? 'bg-red-100' : 'bg-amber-100'}`}>
                      <AlertOctagon className={`w-6 h-6 ${isPriority ? 'text-red-600' : 'text-amber-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900">Patient #{req.citizenId.slice(-4)}</h4>
                      <p className="text-sm text-slate-500 mt-0.5 truncate">{req.description}</p>
                    </div>
                    <div className="bg-blue-50 text-blue-700 font-bold text-sm px-3 py-1.5 rounded-full shrink-0">{(1 + idx * 1.4).toFixed(1)} km</div>
                  </div>
                  {req.landmark && (
                    <div className="bg-slate-50 p-3 rounded-xl mb-3 flex items-center gap-2 text-sm text-slate-600"><MapPin className="w-4 h-4 text-slate-400 shrink-0" />{req.landmark}</div>
                  )}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-blue-50 p-3 rounded-xl flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-blue-600" /><span className="font-bold text-slate-700">ETA:</span><span className="text-slate-600">{6 + idx * 4} min</span></div>
                    <div className={`p-3 rounded-xl flex items-center gap-2 text-sm ${isPriority ? 'bg-red-50' : 'bg-amber-50'}`}><AlertOctagon className={`w-4 h-4 ${isPriority ? 'text-red-600' : 'text-amber-600'}`} /><span className="font-bold text-slate-700">Priority:</span><span className={`font-bold ${isPriority ? 'text-red-700' : 'text-amber-700'}`}>{isPriority ? 'Critical' : 'High'}</span></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAccept(req.id)} className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> Accept Mission</button>
                    <button className="w-12 h-12 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition flex items-center justify-center"><Phone className="w-5 h-5" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
