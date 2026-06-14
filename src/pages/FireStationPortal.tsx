import { useRef, useEffect, useState, useMemo } from 'react';
import { useStore } from '../store';
import { Flame, CheckCircle, X, Navigation, Clock, Route, Zap, Cpu } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import LiveMap, { RouteOverlay } from '../components/LiveMap';
import { RouteResult } from '../utils/astar';

export default function FireStationPortal() {
  const { currentUser, fireRequests, updateFireRequestStatus } = useStore();
  const missionRef = useRef<HTMLDivElement>(null);
  const [routeInfo, setRouteInfo] = useState<RouteResult | null>(null);

  const incomingRequests = fireRequests.filter(r => r.status === 'Requested');
  const myActiveRequest = fireRequests.find(r => r.assignedStationId === currentUser?.id && r.status !== 'Resolved');

  const handleAccept = (id: string) => updateFireRequestStatus(id, 'Accepted', currentUser!.id);
  const handleUpdateStatus = (id: string, newStatus: any) => updateFireRequestStatus(id, newStatus);

  useEffect(() => {
    if (myActiveRequest && missionRef.current) {
      setTimeout(() => missionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
  }, [myActiveRequest?.id]);

  // Fire station position
  const stationLoc = (currentUser as any)?.location;
  const stationPos: [number, number] = stationLoc ? [stationLoc.lat, stationLoc.lng] : [27.6906, 85.3414];

  const routes: RouteOverlay[] = useMemo(() => {
    if (!myActiveRequest) return [];
    return [{ from: stationPos, to: [myActiveRequest.location.lat, myActiveRequest.location.lng], color: '#dc2626', label: 'Route to Incident' }];
  }, [myActiveRequest?.id, myActiveRequest?.status, stationPos[0], stationPos[1]]);

  const statusSteps = ['Accepted', 'En Route', 'Arrived', 'Fire Under Control', 'Resolved'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero Banner */}
        <div className="bg-red-600 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between text-white gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur shrink-0"><Flame className="w-7 h-7" /></div>
            <div>
              <h2 className="text-2xl font-bold">Fire Station — {(currentUser as any).stationName || 'Baneshwor'}</h2>
              <p className="text-red-100 text-sm mt-0.5">3 Units Available • 2 On Mission</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
            <div className="text-3xl font-bold text-red-600">{incomingRequests.length + (myActiveRequest ? 1 : 0)}</div>
            <div className="text-sm text-slate-500 font-medium mt-1">Active Incidents</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
            <div className="text-3xl font-bold text-emerald-600">3</div>
            <div className="text-sm text-slate-500 font-medium mt-1">Units Available</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
            <div className="text-3xl font-bold text-slate-700">8</div>
            <div className="text-sm text-slate-500 font-medium mt-1">Resolved Today</div>
          </div>
        </div>

        {/* ── ACTIVE MISSION ── */}
        {myActiveRequest && (
          <div ref={missionRef}>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Active Mission — A* Navigation</h3>
            <div className="bg-white rounded-2xl shadow-sm border-2 border-red-400 overflow-hidden">
              <div className="p-5 bg-red-50 border-b border-red-100 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center"><Flame className="w-5 h-5 text-red-600" /></div>
                  <h4 className="font-bold text-slate-900 text-lg">{myActiveRequest.fireType} — Navigation</h4>
                </div>
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">{myActiveRequest.status}</span>
              </div>

              {/* Timeline */}
              <div className="px-5 py-4 border-b border-slate-100 overflow-x-auto">
                <div className="flex items-center gap-0 min-w-max">
                  {statusSteps.map((s, i) => {
                    const currentIdx = statusSteps.indexOf(myActiveRequest.status);
                    const done = i <= currentIdx; const current = i === currentIdx;
                    return (
                      <div key={s} className="flex items-center">
                        <div className="flex flex-col items-center">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${current ? 'bg-red-600 border-red-600 text-white' : done ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>{done && !current ? '✓' : i + 1}</div>
                          <span className={`text-[10px] mt-1 font-semibold whitespace-nowrap ${current ? 'text-red-700' : done ? 'text-emerald-600' : 'text-slate-400'}`}>{s}</span>
                        </div>
                        {i < statusSteps.length - 1 && <div className={`w-8 sm:w-12 h-0.5 mx-0.5 mt-[-14px] ${done && i < currentIdx ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* A* Route Info */}
              {routeInfo && (
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-x-6 gap-y-2">
                  <div className="flex items-center gap-2 text-sm"><Route className="w-4 h-4 text-red-600" /><span className="font-bold text-slate-700">{routeInfo.distanceKm} km</span><span className="text-slate-400">distance</span></div>
                  <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-amber-600" /><span className="font-bold text-slate-700">{routeInfo.etaMinutes} min</span><span className="text-slate-400">ETA</span></div>
                  <div className="flex items-center gap-2 text-sm"><Cpu className="w-4 h-4 text-purple-600" /><span className="font-bold text-slate-700">{routeInfo.nodesExplored}</span><span className="text-slate-400">nodes explored</span></div>
                  <div className="flex items-center gap-2 text-sm"><Zap className="w-4 h-4 text-emerald-600" /><span className="font-bold text-slate-700">{routeInfo.algorithmMs} ms</span><span className="text-slate-400">compute time</span></div>
                </div>
              )}

              {/* Info */}
              <div className="p-5 border-b border-slate-100">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-3">
                  <p className="text-slate-800 font-medium">{myActiveRequest.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-xs text-slate-400 font-bold uppercase">Floors</p><p className="font-bold text-slate-800 text-lg mt-0.5">{myActiveRequest.floors}</p></div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-xs text-slate-400 font-bold uppercase">Position</p><p className="font-bold text-slate-800 text-lg mt-0.5">{myActiveRequest.position}</p></div>
                </div>
              </div>

              {/* Map with A* route */}
              <div className="h-72 sm:h-[400px]">
                <LiveMap center={[myActiveRequest.location.lat, myActiveRequest.location.lng]} zoom={14} routes={routes} onRouteComputed={setRouteInfo} />
              </div>

              <div className="p-5">
                {myActiveRequest.status === 'Accepted' && <button onClick={() => handleUpdateStatus(myActiveRequest.id, 'En Route')} className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg shadow-sm transition flex items-center justify-center gap-2"><Navigation className="w-5 h-5" /> Mark En Route</button>}
                {myActiveRequest.status === 'En Route' && <button onClick={() => handleUpdateStatus(myActiveRequest.id, 'Arrived')} className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg shadow-sm transition">Mark Arrived at Scene</button>}
                {myActiveRequest.status === 'Arrived' && <button onClick={() => handleUpdateStatus(myActiveRequest.id, 'Fire Under Control')} className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-lg shadow-sm transition">Fire Under Control</button>}
                {myActiveRequest.status === 'Fire Under Control' && <button onClick={() => handleUpdateStatus(myActiveRequest.id, 'Resolved')} className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-sm transition flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> Mark Resolved</button>}
              </div>
            </div>
          </div>
        )}

        {/* ── INCOMING ── */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Incoming Incidents</h3>
          <div className="space-y-4">
            {incomingRequests.length === 0 && !myActiveRequest && (
              <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4"><Flame className="w-8 h-8" /></div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Standing By</h3>
                <p className="text-slate-500 text-sm">No active incidents. Station ready.</p>
              </div>
            )}
            {incomingRequests.map(req => (
              <div key={req.id} className="bg-white rounded-2xl shadow-sm border-2 border-red-300 overflow-hidden">
                <div className="px-5 py-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center"><Flame className="w-4 h-4 text-red-600" /></div>
                    <h4 className="font-bold text-slate-900">{req.fireType} — PRIORITY</h4>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-red-600"><span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>New</span>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>{req.fireType}</span>
                    <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold">Floors: {req.floors}</span>
                    <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold">Position: {req.position}</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl mb-4"><p className="text-sm text-slate-700">{req.description}</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAccept(req.id)} className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> Accept Incident</button>
                    <button className="px-5 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center gap-2"><X className="w-4 h-4" /> Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
