import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { useGPS } from '../hooks/useGPS';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Ambulance, Flame, AlertTriangle, MessageSquare, Droplet, MapPin, CheckCircle2, ArrowRight, ArrowLeft, Navigation, Phone, Building2, Pill, Shield, Route as RouteIcon, Clock, Loader2 } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import LiveMap, { RouteOverlay } from '../components/LiveMap';
import FileAttachment from '../components/FileAttachment';
import Chatbot from '../components/Chatbot';
import { RouteResult, haversine } from '../utils/astar';

export default function CitizenPortal() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ambulance" element={<RequestAmbulance />} />
        <Route path="/fire" element={<RequestFire />} />
        <Route path="/complaint" element={<SubmitComplaint />} />
        <Route path="/alerts" element={<SubmitAlert />} />
        <Route path="/blood" element={<BloodRequestPage />} />
        <Route path="/nearby" element={<NearbyServicesPage />} />
        <Route path="/tracking" element={<LiveTrackingPage />} />
      </Routes>
      <Chatbot />
    </DashboardLayout>
  );
}

function BackButton() {
  const navigate = useNavigate();
  return <button onClick={() => navigate('/citizen')} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700 mb-4"><ArrowLeft className="w-4 h-4" /> Back to Dashboard</button>;
}

/** GPS badge showing real location */
function GPSBadge() {
  const { lat, lng, loading, cityName } = useGPS();
  if (loading) return <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3"><Loader2 className="w-5 h-5 text-amber-600 animate-spin shrink-0" /><div><p className="text-sm font-bold text-amber-800">Acquiring GPS Location...</p><p className="text-xs text-amber-600 mt-0.5">Please allow location access</p></div></div>;
  if (!lat || !lng) return <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3"><MapPin className="w-5 h-5 text-red-600 shrink-0" /><p className="text-sm font-bold text-red-800">Location unavailable — please enable GPS</p></div>;
  return (
    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3">
      <CheckCircle2 className="text-emerald-600 w-5 h-5 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-bold text-emerald-800">Location Detected{cityName ? ` — ${cityName}` : ''}</p>
        <p className="text-xs text-emerald-700 mt-1">Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*            DASHBOARD                    */
/* ═══════════════════════════════════════ */
interface ServiceCardProps { icon: any; iconBg: string; iconColor: string; title: string; subtitle: string; buttonText: string; buttonColor: string; to: string }
function ServiceCard({ icon: Icon, iconBg, iconColor, title, subtitle, buttonText, buttonColor, to }: ServiceCardProps) {
  return (
    <Link to={to} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-lg hover:border-slate-200 transition group">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${iconBg}`}><Icon className={`w-7 h-7 ${iconColor}`} /></div>
      <h4 className="text-lg font-bold text-slate-900 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 mb-5">{subtitle}</p>
      <div className={`w-full h-11 ${buttonColor} text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-1 group-hover:gap-2 transition-all`}>{buttonText} <ArrowRight className="w-4 h-4" /></div>
    </Link>
  );
}

function Dashboard() {
  const { currentUser } = useStore();
  const { cityName } = useGPS();
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-7 text-white">
        <div className="absolute inset-0 opacity-10"><div className="absolute top-0 right-0 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div></div>
        <div className="relative">
          <h2 className="text-3xl font-bold mb-1">Emergency Response</h2>
          <p className="text-slate-300 text-sm mb-5">One tap connects you to all emergency services</p>
          <div className="flex flex-wrap gap-2">
            <div className="bg-slate-700/60 backdrop-blur px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5"><MapPin className="w-3 h-3" />{cityName || 'Locating...'}, Nepal</div>
            <div className="bg-emerald-500/20 text-emerald-300 backdrop-blur px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 border border-emerald-500/30"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> All services active</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <ServiceCard icon={Ambulance} iconBg="bg-blue-50" iconColor="text-blue-600" title="Ambulance" subtitle="Medical emergency" buttonText="Request Now" buttonColor="bg-blue-600 hover:bg-blue-700" to="ambulance" />
        <ServiceCard icon={Flame} iconBg="bg-red-50" iconColor="text-red-600" title="Fire Service" subtitle="Fire emergency" buttonText="Request Now" buttonColor="bg-red-600 hover:bg-red-700" to="fire" />
        <ServiceCard icon={Droplet} iconBg="bg-emerald-50" iconColor="text-emerald-600" title="Blood Request" subtitle="Find donors fast" buttonText="Find Donors" buttonColor="bg-emerald-500 hover:bg-emerald-600" to="blood" />
        <ServiceCard icon={AlertTriangle} iconBg="bg-amber-50" iconColor="text-amber-600" title="Community Alert" subtitle="Warn community" buttonText="Send Alert" buttonColor="bg-amber-500 hover:bg-amber-600" to="alerts" />
        <ServiceCard icon={MapPin} iconBg="bg-purple-50" iconColor="text-purple-600" title="Nearby Services" subtitle="Hospitals, police" buttonText="Find Services" buttonColor="bg-purple-600 hover:bg-purple-700" to="nearby" />
        <ServiceCard icon={MessageSquare} iconBg="bg-slate-100" iconColor="text-slate-700" title="Complaint Box" subtitle="Report issues" buttonText="Submit" buttonColor="bg-slate-900 hover:bg-slate-800" to="complaint" />
      </div>
      <div className="text-center text-xs text-slate-400">Logged in as <strong className="text-slate-600">{currentUser?.name}</strong></div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*        LIVE TRACKING PAGE               */
/* ═══════════════════════════════════════ */
function LiveTrackingPage() {
  const { currentUser, ambulanceRequests, fireRequests, users, liveLocations } = useStore();
  const [routeInfo, setRouteInfo] = useState<RouteResult | null>(null);
  const myAmbReqs = ambulanceRequests.filter(r => r.citizenId === currentUser?.id);
  const myFireReqs = fireRequests.filter(r => r.citizenId === currentUser?.id);
  const activeAmb = myAmbReqs.find(r => r.status !== 'Completed');
  const activeFire = myFireReqs.find(r => r.status !== 'Resolved');
  const allStatuses = ['Requested','Accepted','En Route','Arrived','Patient Picked','Heading To Hospital','Completed'];
  const fireStatuses = ['Requested','Accepted','En Route','Arrived','Fire Under Control','Resolved'];

  const ambRoutes: RouteOverlay[] = useMemo(() => {
    if (!activeAmb || !activeAmb.assignedAmbulanceId) return [];
    const unitLoc = liveLocations.find(l => l.entityId === activeAmb.assignedAmbulanceId);
    const from: [number, number] = unitLoc ? [unitLoc.location.lat, unitLoc.location.lng] : [activeAmb.location.lat + 0.01, activeAmb.location.lng + 0.01];
    return [{ from, to: [activeAmb.location.lat, activeAmb.location.lng], color: '#2563eb' }];
  }, [activeAmb?.id, activeAmb?.status]);
  const fireRoutes: RouteOverlay[] = useMemo(() => {
    if (!activeFire || !activeFire.assignedStationId) return [];
    const station = users.find(u => u.id === activeFire.assignedStationId) as any;
    const from: [number, number] = station?.location ? [station.location.lat, station.location.lng] : [activeFire.location.lat + 0.01, activeFire.location.lng + 0.01];
    return [{ from, to: [activeFire.location.lat, activeFire.location.lng], color: '#dc2626' }];
  }, [activeFire?.id, activeFire?.status]);

  const StatusTimeline = ({ statuses, current, color }: { statuses: string[]; current: string; color: string }) => {
    const idx = statuses.indexOf(current);
    return (
      <div className="px-5 py-4 border-b border-slate-100 overflow-x-auto">
        <div className="flex items-center gap-0 min-w-max">
          {statuses.map((s, i) => { const done = i <= idx; const cur = i === idx; return (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${cur ? `bg-${color}-600 border-${color}-600 text-white` : done ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-100 border-slate-200 text-slate-400'}`} style={cur ? {background: color === 'blue' ? '#2563eb' : '#dc2626', borderColor: color === 'blue' ? '#2563eb' : '#dc2626'} : {}}>{done && !cur ? '✓' : i + 1}</div>
                <span className={`text-[10px] mt-1 font-semibold whitespace-nowrap ${cur ? (color === 'blue' ? 'text-blue-700' : 'text-red-700') : done ? 'text-emerald-600' : 'text-slate-400'}`}>{s}</span>
              </div>
              {i < statuses.length - 1 && <div className={`w-8 h-0.5 mx-0.5 mt-[-14px] ${done && i < idx ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>}
            </div>
          );})}
        </div>
      </div>
    );
  };

  return (
    <div>
      <BackButton />
      <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center"><Navigation className="w-6 h-6 text-blue-600" /></div><div><h2 className="text-2xl font-bold text-slate-900">Live Tracking</h2><p className="text-sm text-slate-500">Track your active emergency requests in real-time</p></div></div>
      {!activeAmb && !activeFire && <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-100 text-center"><div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4"><Navigation className="w-8 h-8 text-slate-400" /></div><h3 className="text-xl font-bold text-slate-800 mb-2">No Active Missions</h3><p className="text-slate-500 text-sm mb-6">You don't have any active emergency requests to track.</p><Link to="/citizen" className="inline-flex items-center gap-2 h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition">Go to Dashboard</Link></div>}
      {activeAmb && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          <div className="p-5 bg-blue-50 border-b border-blue-100 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center"><Ambulance className="w-5 h-5 text-blue-600" /></div><h3 className="font-bold text-slate-900 text-lg">Ambulance Request</h3></div><span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">{activeAmb.status}</span></div>
          <StatusTimeline statuses={allStatuses} current={activeAmb.status} color="blue" />
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-100">
            <div className="bg-slate-50 p-3 rounded-xl"><p className="text-xs text-slate-400 font-bold uppercase">Description</p><p className="text-sm text-slate-800 font-medium mt-1">{activeAmb.description}</p></div>
            {activeAmb.assignedAmbulanceId && (() => { const amb = users.find(u => u.id === activeAmb.assignedAmbulanceId) as any; return amb ? <div className="bg-slate-50 p-3 rounded-xl space-y-1.5"><p className="text-xs text-slate-400 font-bold uppercase">Assigned Unit</p><p className="text-sm text-slate-800 font-medium">{amb.driverName || amb.name}</p><p className="text-xs text-slate-500">Vehicle: {amb.vehicleNumber || 'N/A'} • {amb.phone}</p></div> : null; })()}
          </div>
          {routeInfo && activeAmb.assignedAmbulanceId && <div className="px-5 py-3 border-b border-slate-100 bg-blue-50 flex flex-wrap gap-x-6 gap-y-2"><div className="flex items-center gap-2 text-sm"><RouteIcon className="w-4 h-4 text-blue-600" /><span className="font-bold text-slate-700">{routeInfo.distanceKm} km</span></div><div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-amber-600" /><span className="font-bold text-slate-700">{routeInfo.etaMinutes} min ETA</span></div></div>}
          <div className="h-80"><LiveMap center={[activeAmb.location.lat, activeAmb.location.lng]} zoom={14} routes={ambRoutes} onRouteComputed={setRouteInfo} showMyLocation /></div>
        </div>
      )}
      {activeFire && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 bg-red-50 border-b border-red-100 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center"><Flame className="w-5 h-5 text-red-600" /></div><h3 className="font-bold text-slate-900 text-lg">Fire Request</h3></div><span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">{activeFire.status}</span></div>
          <StatusTimeline statuses={fireStatuses} current={activeFire.status} color="red" />
          <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-100">
            <div className="bg-slate-50 p-3 rounded-xl"><p className="text-xs text-slate-400 font-bold uppercase">Fire Type</p><p className="text-sm text-slate-800 font-medium mt-1">{activeFire.fireType}</p></div>
            <div className="bg-slate-50 p-3 rounded-xl"><p className="text-xs text-slate-400 font-bold uppercase">Floors</p><p className="text-sm text-slate-800 font-medium mt-1">{activeFire.floors}</p></div>
            <div className="bg-slate-50 p-3 rounded-xl"><p className="text-xs text-slate-400 font-bold uppercase">Position</p><p className="text-sm text-slate-800 font-medium mt-1">{activeFire.position}</p></div>
          </div>
          <div className="h-80"><LiveMap center={[activeFire.location.lat, activeFire.location.lng]} zoom={14} routes={fireRoutes} onRouteComputed={setRouteInfo} showMyLocation /></div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*        BLOOD REQUEST PAGE               */
/* ═══════════════════════════════════════ */
function BloodRequestPage() {
  const { currentUser, bloodRequests, addBloodRequest } = useStore();
  const gps = useGPS();
  const [bg, setBg] = useState('O+'); const [desc, setDesc] = useState(''); const [contact, setContact] = useState('');
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); addBloodRequest({ requesterId: currentUser!.id, bloodGroup: bg, location: { lat: gps.lat || 0, lng: gps.lng || 0 }, description: desc, contactNumber: contact || currentUser!.phone }); setDesc(''); setContact(''); alert('Blood request published!'); };
  return (
    <div><BackButton />
      <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center"><Droplet className="w-6 h-6 text-red-600" /></div><div><h2 className="text-2xl font-bold text-slate-900">Blood Requests</h2><p className="text-sm text-slate-500">Request blood or help a donor</p></div></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2"><Droplet className="w-5 h-5 text-red-600" /> Publish Blood Request</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Blood Group</label><div className="grid grid-cols-4 gap-2">{['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(g => <button key={g} type="button" onClick={() => setBg(g)} className={`h-11 rounded-xl font-bold text-sm transition border-2 ${bg === g ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-700 border-slate-200 hover:border-red-300'}`}>{g}</button>)}</div></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label><textarea required rows={3} placeholder="Urgency details..." className="w-full border border-slate-200 rounded-xl p-4 outline-none bg-slate-50 focus:bg-white" value={desc} onChange={e => setDesc(e.target.value)} /></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Number</label><input type="text" placeholder={currentUser?.phone} className="w-full border border-slate-200 rounded-xl p-4 outline-none bg-slate-50 focus:bg-white" value={contact} onChange={e => setContact(e.target.value)} /></div>
            <button disabled={!desc} className="w-full h-12 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold rounded-xl shadow-sm transition">Publish Blood Request</button>
          </form>
        </div>
        <div><h3 className="text-lg font-bold text-slate-900 mb-4">Active Blood Requests</h3>{bloodRequests.length === 0 ? <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-100 text-center"><Droplet className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500 text-sm">No active blood requests.</p></div> : <div className="space-y-3">{bloodRequests.map(br => <div key={br.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4"><div className="w-14 h-14 bg-red-100 text-red-700 rounded-xl flex items-center justify-center font-black text-lg shrink-0">{br.bloodGroup}</div><div className="flex-1 min-w-0"><p className="font-bold text-slate-900 text-sm truncate">{br.description}</p><p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Phone className="w-3 h-3" /> {br.contactNumber}</p></div><a href={`tel:${br.contactNumber}`} className="w-10 h-10 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl flex items-center justify-center shrink-0 transition"><Phone className="w-5 h-5" /></a></div>)}</div>}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*        NEARBY SERVICES — REAL GPS       */
/* ═══════════════════════════════════════ */
function NearbyServicesPage() {
  const gps = useGPS();
  const [filter, setFilter] = useState<'all'|'hospital'|'police'|'pharmacy'>('all');
  const [services, setServices] = useState<any[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(true);

  // Fetch real nearby places from Overpass API based on GPS
  useState(() => {
    if (!gps.lat || !gps.lng) return;
    setLoadingNearby(true);
    const radius = 5000; // 5km
    const q = `[out:json][timeout:10];(node["amenity"="hospital"](around:${radius},${gps.lat},${gps.lng});node["amenity"="pharmacy"](around:${radius},${gps.lat},${gps.lng});node["amenity"="police"](around:${radius},${gps.lat},${gps.lng}););out body;`;
    fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(data => {
        const items = data.elements?.map((el: any) => {
          const type = el.tags?.amenity === 'hospital' ? 'Hospital' : el.tags?.amenity === 'pharmacy' ? 'Pharmacy' : 'Police';
          const dist = haversine(gps.lat!, gps.lng!, el.lat, el.lon);
          return { id: el.id.toString(), name: el.tags?.name || `${type} (unnamed)`, type, icon: type === 'Hospital' ? Building2 : type === 'Pharmacy' ? Pill : Shield, distance: dist.toFixed(1), phone: el.tags?.phone || el.tags?.['contact:phone'] || '—', lat: el.lat, lng: el.lon };
        }) || [];
        items.sort((a: any, b: any) => parseFloat(a.distance) - parseFloat(b.distance));
        setServices(items);
        setLoadingNearby(false);
      })
      .catch(() => setLoadingNearby(false));
  });

  const filtered = filter === 'all' ? services : services.filter(s => s.type === (filter === 'hospital' ? 'Hospital' : filter === 'police' ? 'Police' : 'Pharmacy'));
  const typeColors: Record<string, { bg: string; text: string; badge: string }> = { Hospital: { bg: 'bg-emerald-50', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' }, Police: { bg: 'bg-blue-50', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' }, Pharmacy: { bg: 'bg-purple-50', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' } };

  return (
    <div><BackButton />
      <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center"><MapPin className="w-6 h-6 text-purple-600" /></div><div><h2 className="text-2xl font-bold text-slate-900">Nearby Services</h2><p className="text-sm text-slate-500">Real nearby hospitals, police, pharmacies from your GPS location{gps.cityName ? ` in ${gps.cityName}` : ''}</p></div></div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/2 space-y-4">
          <div className="flex gap-2 flex-wrap">{(['all','hospital','police','pharmacy'] as const).map(f => <button key={f} onClick={() => setFilter(f)} className={`px-4 h-9 rounded-full text-sm font-bold transition border ${filter === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>{f === 'all' ? `All (${services.length})` : f.charAt(0).toUpperCase() + f.slice(1)}</button>)}</div>
          {loadingNearby ? <div className="bg-white rounded-2xl p-10 text-center"><Loader2 className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-3" /><p className="text-slate-500 text-sm">Searching nearby services...</p></div> : filtered.length === 0 ? <div className="bg-white rounded-2xl p-10 text-center"><MapPin className="w-8 h-8 text-slate-300 mx-auto mb-3" /><p className="text-slate-500 text-sm">No services found nearby.</p></div> : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filtered.slice(0, 30).map(s => { const Icon = s.icon; const col = typeColors[s.type]; return (
                <div key={s.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className={`w-12 h-12 ${col.bg} rounded-xl flex items-center justify-center shrink-0`}><Icon className={`w-5 h-5 ${col.text}`} /></div>
                  <div className="flex-1 min-w-0"><h4 className="font-bold text-slate-900 text-sm truncate">{s.name}</h4><div className="flex items-center gap-2 mt-1"><span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${col.badge}`}>{s.type}</span><span className="text-xs text-slate-500">{s.distance} km</span></div></div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {s.phone !== '—' && <a href={`tel:${s.phone}`} className="w-9 h-9 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg flex items-center justify-center transition"><Phone className="w-4 h-4" /></a>}
                    <a href={`https://www.google.com/maps/dir/${gps.lat},${gps.lng}/${s.lat},${s.lng}`} target="_blank" className="w-9 h-9 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg flex items-center justify-center transition" title="Navigate"><Navigation className="w-4 h-4" /></a>
                  </div>
                </div>
              );})}
            </div>
          )}
        </div>
        <div className="w-full lg:w-1/2 h-[500px] bg-slate-200 rounded-2xl overflow-hidden shadow-sm border border-slate-100"><LiveMap zoom={14} showMyLocation /></div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*        REQUEST AMBULANCE — REAL GPS     */
/* ═══════════════════════════════════════ */
function RequestAmbulance() {
  const navigate = useNavigate();
  const { addAmbulanceRequest, currentUser, users } = useStore();
  const gps = useGPS();
  const [desc, setDesc] = useState(''); const [landmark, setLandmark] = useState(''); const [hospitalId, setHospitalId] = useState(''); const [locating, setLocating] = useState(false);
  const hospitals = users.filter(u => u.role === 'hospital');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalId) { alert('Please select a hospital — it is required.'); return; }
    const hosp = hospitals.find(h => h.id === hospitalId);
    setLocating(true);
    setTimeout(() => { addAmbulanceRequest({ citizenId: currentUser!.id, location: { lat: gps.lat || 0, lng: gps.lng || 0 }, description: desc, landmark, hospitalId, hospitalName: hosp?.name || '' }); navigate('/citizen'); }, 1500);
  };
  return (
    <div><BackButton />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-3/5 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center"><Ambulance className="w-6 h-6 text-blue-600" /></div><h2 className="text-2xl font-bold text-slate-900">Request Ambulance</h2></div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <GPSBadge />
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Emergency Description *</label><textarea required rows={3} placeholder="Cardiac, accident, bleeding..." className="w-full border border-slate-200 rounded-xl p-4 outline-none bg-slate-50 focus:bg-white" value={desc} onChange={e => setDesc(e.target.value)} /></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Landmark (Optional)</label><input type="text" placeholder="Near any landmark..." className="w-full border border-slate-200 rounded-xl p-4 outline-none bg-slate-50 focus:bg-white" value={landmark} onChange={e => setLandmark(e.target.value)} /></div>
            <div>
              <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-2">Select Hospital (Required) *</label>
              <select required value={hospitalId} onChange={e => setHospitalId(e.target.value)} className="w-full border-2 border-red-200 rounded-xl p-4 outline-none bg-red-50 focus:bg-white focus:border-red-500">
                <option value="">— Choose a hospital —</option>
                {hospitals.map(h => <option key={h.id} value={h.id}>{(h as any).hospitalName || h.name}</option>)}
              </select>
              <p className="text-xs text-red-500 mt-1">Ambulance will navigate: Your Location → Hospital</p>
            </div>
            <button disabled={locating||!desc||!hospitalId||gps.loading} className="w-full h-13 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2"><Ambulance className="w-5 h-5" />{locating?'Dispatching...':'Request Ambulance Now'}</button>
          </form>
        </div>
        <div className="w-full lg:w-2/5 h-[400px] lg:h-auto lg:min-h-[600px] bg-slate-200 rounded-2xl overflow-hidden shadow-sm border border-slate-100"><LiveMap showMyLocation /></div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*        REQUEST FIRE — REAL GPS          */
/* ═══════════════════════════════════════ */
function RequestFire() {
  const navigate = useNavigate();
  const { addFireRequest, currentUser } = useStore();
  const gps = useGPS();
  const [desc, setDesc] = useState(''); const [fireType, setFireType] = useState('Building Fire'); const [floors, setFloors] = useState(1); const [position, setPosition] = useState<'Bottom'|'Middle'|'Top'>('Bottom'); const [locating, setLocating] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]); const [videos, setVideos] = useState<string[]>([]);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setLocating(true); setTimeout(() => { addFireRequest({ citizenId: currentUser!.id, location: { lat: gps.lat || 0, lng: gps.lng || 0 }, description: desc, fireType, floors, position }); navigate('/citizen'); }, 1500); };
  return (
    <div><BackButton />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-3/5 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center"><Flame className="w-6 h-6 text-red-600" /></div><h2 className="text-2xl font-bold text-slate-900">Request Fire Service</h2></div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <GPSBadge />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fire Type</label><select value={fireType} onChange={e => setFireType(e.target.value)} className="w-full border border-slate-200 rounded-xl p-4 outline-none bg-slate-50 focus:bg-white"><option>Building Fire</option><option>Electrical Wire Fire</option><option>Vehicle Fire</option><option>Forest/Bush Fire</option></select></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Floors</label><input type="number" min="1" value={floors} onChange={e => setFloors(parseInt(e.target.value))} className="w-full border border-slate-200 rounded-xl p-4 outline-none bg-slate-50 focus:bg-white" /></div>
            </div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fire Position</label><div className="grid grid-cols-3 gap-2">{(['Bottom','Middle','Top'] as const).map(p => <button key={p} type="button" onClick={() => setPosition(p)} className={`py-3 rounded-xl font-semibold text-sm transition ${position === p ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{p}</button>)}</div></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label><textarea required rows={3} placeholder="People trapped? Gas cylinders?" className="w-full border border-slate-200 rounded-xl p-4 outline-none bg-slate-50 focus:bg-white" value={desc} onChange={e => setDesc(e.target.value)} /></div>
            <FileAttachment photos={photos} videos={videos} onPhotosChange={setPhotos} onVideosChange={setVideos} accent="amber" />
            <button disabled={locating||!desc||gps.loading} className="w-full h-13 py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2"><Flame className="w-5 h-5" />{locating?'Dispatching...':'Request Fire Service Now'}</button>
          </form>
        </div>
        <div className="w-full lg:w-2/5 h-[400px] lg:h-auto lg:min-h-[600px] bg-slate-200 rounded-2xl overflow-hidden shadow-sm border border-slate-100"><LiveMap showMyLocation /></div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*        COMPLAINT                        */
/* ═══════════════════════════════════════ */
function SubmitComplaint() {
  const { addComplaint, currentUser, complaints } = useStore();
  const [title, setTitle] = useState(''); const [desc, setDesc] = useState('');
  const [photos, setPhotos] = useState<string[]>([]); const [videos, setVideos] = useState<string[]>([]);
  const myComplaints = complaints.filter(c => c.citizenId === currentUser?.id);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); addComplaint({ citizenId: currentUser!.id, title, description: desc }); setTitle(''); setDesc(''); setPhotos([]); setVideos([]); alert('Complaint submitted!'); };
  const statusColors: Record<string, string> = { Submitted: 'bg-amber-100 text-amber-700', 'Under Review': 'bg-blue-100 text-blue-700', Assigned: 'bg-purple-100 text-purple-700', 'Action Taken': 'bg-emerald-100 text-emerald-700', Resolved: 'bg-slate-100 text-slate-700' };
  return (
    <div><BackButton />
      <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center"><MessageSquare className="w-6 h-6 text-slate-700" /></div><div><h2 className="text-2xl font-bold text-slate-900">Complaint Box</h2><p className="text-sm text-slate-500">Report non-emergency issues</p></div></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject</label><input required placeholder="Brief title" className="w-full border border-slate-200 rounded-xl p-4 outline-none bg-slate-50 focus:bg-white" value={title} onChange={e => setTitle(e.target.value)} /></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Details</label><textarea required rows={4} placeholder="Describe the issue" className="w-full border border-slate-200 rounded-xl p-4 outline-none bg-slate-50 focus:bg-white" value={desc} onChange={e => setDesc(e.target.value)} /></div>
            <FileAttachment photos={photos} videos={videos} onPhotosChange={setPhotos} onVideosChange={setVideos} accent="slate" />
            <button className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition">Submit Complaint</button>
          </form>
        </div>
        <div><h3 className="text-lg font-bold text-slate-900 mb-4">Your Complaints</h3>{myComplaints.length === 0 ? <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-100 text-center"><MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500 text-sm">No complaints yet.</p></div> : <div className="space-y-3">{myComplaints.map(c => <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"><div className="flex items-center justify-between mb-2"><h4 className="font-bold text-slate-900 text-sm truncate">{c.title}</h4><span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusColors[c.status]}`}>{c.status}</span></div><p className="text-sm text-slate-600 line-clamp-2">{c.description}</p></div>)}</div>}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*        COMMUNITY ALERT — REAL GPS       */
/* ═══════════════════════════════════════ */
function SubmitAlert() {
  const { addCommunityAlert, currentUser, communityAlerts } = useStore();
  const gps = useGPS();
  const [type, setType] = useState('Road Block'); const [desc, setDesc] = useState('');
  const [photos, setPhotos] = useState<string[]>([]); const [videos, setVideos] = useState<string[]>([]);
  const published = communityAlerts.filter(a => a.status === 'Published');
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); addCommunityAlert({ creatorId: currentUser!.id, type, description: desc, location: { lat: gps.lat || 0, lng: gps.lng || 0 } }); setDesc(''); setPhotos([]); setVideos([]); alert('Alert submitted for review'); };
  return (
    <div><BackButton />
      <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-amber-600" /></div><div><h2 className="text-2xl font-bold text-slate-900">Community Alerts</h2><p className="text-sm text-slate-500">Warn your community about hazards</p></div></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Alert Type</label><select value={type} onChange={e => setType(e.target.value)} className="w-full border border-slate-200 rounded-xl p-4 outline-none bg-slate-50 focus:bg-white"><option>Road Block</option><option>Flood</option><option>Accident</option><option>Landslide</option><option>Missing Person</option><option>Emergency Warning</option></select></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label><textarea required rows={4} placeholder="Describe the hazard" className="w-full border border-slate-200 rounded-xl p-4 outline-none bg-slate-50 focus:bg-white" value={desc} onChange={e => setDesc(e.target.value)} /></div>
            <FileAttachment photos={photos} videos={videos} onPhotosChange={setPhotos} onVideosChange={setVideos} accent="amber" />
            <button className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-sm transition">Send Alert</button>
          </form>
        </div>
        <div><h3 className="text-lg font-bold text-slate-900 mb-4">Published Alerts</h3>{published.length === 0 ? <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-100 text-center"><AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500 text-sm">No alerts published.</p></div> : <div className="space-y-3">{published.map(a => <div key={a.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-amber-600" /></div><h4 className="font-bold text-slate-900 text-sm">{a.type}</h4></div><span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Published</span></div><p className="text-sm text-slate-600">{a.description}</p></div>)}</div>}</div>
      </div>
    </div>
  );
}
