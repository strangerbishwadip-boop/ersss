import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useStore } from '../store';
import { useGPS } from '../hooks/useGPS';
import L from 'leaflet';
import { Maximize2, X } from 'lucide-react';
import { fetchRoute, haversine, RouteResult } from '../utils/astar';

function cssIcon(color: string, border: string, label: string, size = 28, pulse = false): L.DivIcon {
  const pr = pulse ? `<div style="position:absolute;inset:-6px;border-radius:50%;border:2px solid ${color};opacity:0.5;animation:mapPulse 1.5s infinite"></div>` : '';
  return L.divIcon({ html: `<div style="position:relative;width:${size}px;height:${size}px;">${pr}<div style="width:${size}px;height:${size}px;background:${color};border:2.5px solid ${border};border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);color:#fff;font-weight:800;font-size:${Math.round(size*0.38)}px;font-family:system-ui,sans-serif;line-height:1;">${label}</div></div>`, className:'', iconSize:[size,size], iconAnchor:[size/2,size/2], popupAnchor:[0,-(size/2+2)] });
}

function blueDotDiv(): L.DivIcon {
  return L.divIcon({ html: `<div style="position:relative;width:40px;height:40px;"><div style="position:absolute;inset:0;border-radius:50%;background:rgba(66,133,244,0.12);"></div><div style="position:absolute;inset:4px;border-radius:50%;background:rgba(66,133,244,0.08);animation:gmBreathe 2s ease-in-out infinite;"></div><div style="position:absolute;top:12px;left:12px;width:16px;height:16px;background:#4285F4;border:3px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div></div>`, className:'', iconSize:[40,40], iconAnchor:[20,20], popupAnchor:[0,-20] });
}

const icons = {
  ambulance: cssIcon('#2563eb','#fff','A',30), fireStation: cssIcon('#dc2626','#fff','F',28),
  hospital: cssIcon('#16a34a','#fff','H',28), uav: cssIcon('#9333ea','#fff','U',26),
  vtol: cssIcon('#4f46e5','#fff','V',26), alert: cssIcon('#f59e0b','#fff','!',26),
  emergency: cssIcon('#dc2626','#fca5a5','E',32,true), myLocation: blueDotDiv(),
};

if (typeof document !== 'undefined' && !document.getElementById('map-pulse-css')) {
  const s = document.createElement('style'); s.id = 'map-pulse-css';
  s.textContent = `@keyframes mapPulse{0%{transform:scale(1);opacity:.5}100%{transform:scale(2.2);opacity:0}}@keyframes gmBreathe{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.3);opacity:.2}}`;
  document.head.appendChild(s);
}

function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap();
  useEffect(() => { if (bounds) map.fitBounds(bounds, { padding: [40,40], maxZoom: 15 }); }, [bounds, map]);
  return null;
}

function MyLocationDot() {
  const { lat, lng, accuracy } = useGPS();
  if (!lat || !lng) return null;
  return <>
    <CircleMarker center={[lat,lng]} radius={Math.min(Math.max(accuracy/4,15),50)} pathOptions={{ color:'transparent', fillColor:'#4285F4', fillOpacity:0.1 }} />
    <Marker position={[lat,lng]} icon={icons.myLocation} zIndexOffset={900}>
      <Popup><strong>Your Location</strong><br/>{lat.toFixed(6)}, {lng.toFixed(6)}</Popup>
    </Marker>
  </>;
}

export interface RouteOverlay { from:[number,number]; to:[number,number]; color:string; label?:string; directLine?:boolean; }

interface LiveMapProps { center?:[number,number]; zoom?:number; showControls?:boolean; routes?:RouteOverlay[]; onRouteComputed?:(r:RouteResult)=>void; showMyLocation?:boolean; }

export default function LiveMap({ center, zoom=13, showControls=true, routes=[], onRouteComputed, showMyLocation=false }: LiveMapProps) {
  const { users, liveLocations, ambulanceRequests, fireRequests, communityAlerts } = useStore();
  const gps = useGPS();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [routePaths, setRoutePaths] = useState<{coords:[number,number][];color:string;label?:string}[]>([]);

  const mapCenter:[number,number] = center || (gps.lat && gps.lng ? [gps.lat,gps.lng] : [27.7,85.3]);
  const hospitals = users.filter(u => u.role==='hospital' && (u as any).location);
  const fireStations = users.filter(u => u.role==='fireStation' && (u as any).location);
  const activeEmergencies = [...ambulanceRequests,...fireRequests].filter(r => r.status!=='Completed' && r.status!=='Resolved');

  useEffect(() => {
    if (routes.length===0) { setRoutePaths([]); return; }
    let cancelled = false;
    (async () => {
      const results: typeof routePaths = [];
      for (const r of routes) {
        if (r.directLine) {
          results.push({coords:[r.from,r.to],color:r.color,label:r.label});
          if (onRouteComputed) { const d=Math.round(haversine(r.from[0],r.from[1],r.to[0],r.to[1])*10)/10; onRouteComputed({path:[r.from,r.to],distanceKm:d,etaMinutes:Math.max(1,Math.round(d/1.2)),nodesExplored:2,algorithmMs:0}); }
        } else {
          const result = await fetchRoute(r.from[0],r.from[1],r.to[0],r.to[1]);
          if (cancelled) return;
          results.push({coords:result.path,color:r.color,label:r.label});
          if (onRouteComputed) onRouteComputed(result);
        }
      }
      setRoutePaths(results);
    })();
    return () => { cancelled=true; };
  }, [routes.map(r=>`${r.from}-${r.to}-${r.directLine}`).join('|')]);

  let fitBounds:L.LatLngBoundsExpression|null = null;
  if (routePaths.length>0) { const pts=routePaths.flatMap(r=>r.coords); if (pts.length>1) fitBounds=L.latLngBounds(pts.map(p=>[p[0],p[1]] as [number,number])); }

  const mc = (
    <MapContainer center={mapCenter} zoom={zoom} style={{height:'100%',width:'100%'}} zoomControl>
      <TileLayer attribution='&copy; OSM' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
      {fitBounds && <FitBounds bounds={fitBounds} />}
      {showMyLocation && <MyLocationDot />}
      {routePaths.map((rp,i) => <Polyline key={`s${i}`} positions={rp.coords} pathOptions={{color:'#000',weight:8,opacity:0.12}} />)}
      {routePaths.map((rp,i) => <Polyline key={i} positions={rp.coords} pathOptions={{color:rp.color,weight:5,opacity:0.85}} />)}
      {hospitals.map((h:any) => <Marker key={h.id} position={[h.location!.lat,h.location!.lng]} icon={icons.hospital}><Popup><strong>{h.hospitalName||h.name}</strong><br/>Hospital</Popup></Marker>)}
      {fireStations.map((f:any) => <Marker key={f.id} position={[f.location!.lat,f.location!.lng]} icon={icons.fireStation}><Popup><strong>{f.stationName||f.name}</strong><br/>Fire Station</Popup></Marker>)}
      {liveLocations.map(loc => { let ic=icons.ambulance; if(loc.entityType==='uav')ic=icons.uav; if(loc.entityType==='vtol')ic=icons.vtol; if(loc.entityType==='fireVehicle')ic=icons.fireStation; return <Marker key={loc.entityId} position={[loc.location.lat,loc.location.lng]} icon={ic}><Popup><strong>{loc.entityId.toUpperCase()}</strong><br/>{loc.entityType}{loc.speed!=null&&<><br/>Speed: {loc.speed} km/h</>}{loc.altitude!=null&&<><br/>Alt: {loc.altitude} m</>}</Popup></Marker>; })}
      {activeEmergencies.map(e => <Marker key={e.id} position={[e.location.lat,e.location.lng]} icon={icons.emergency}><Popup><strong>Emergency</strong><br/>{e.status} — {e.description}</Popup></Marker>)}
      {communityAlerts.filter(a=>a.status==='Published').map(a => <Marker key={a.id} position={[a.location.lat,a.location.lng]} icon={icons.alert}><Popup><strong>{a.type}</strong><br/>{a.description}</Popup></Marker>)}
    </MapContainer>
  );

  if (isFullscreen) return <>
    <div className="w-full h-full min-h-[300px] bg-slate-100 rounded-xl flex items-center justify-center border border-dashed border-slate-300"><p className="text-slate-500 text-sm font-semibold">Map is in fullscreen mode</p></div>
    <div className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col">
      <div className="h-12 bg-slate-900 flex items-center justify-between px-4 shrink-0 border-b border-slate-700"><div className="flex items-center gap-2 text-white"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span><span className="text-sm font-bold">NISERS — Live Map</span></div><button onClick={()=>setIsFullscreen(false)} className="w-8 h-8 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center"><X className="w-4 h-4" /></button></div>
      <div className="flex-1">{mc}</div>
    </div>
  </>;

  return <div className="w-full h-full min-h-[300px] z-0 relative rounded-xl overflow-hidden">{mc}{showControls && <div className="absolute top-3 right-3 z-[400]"><button onClick={()=>setIsFullscreen(true)} className="w-9 h-9 bg-white hover:bg-slate-50 rounded-lg shadow-md border border-slate-200 flex items-center justify-center transition" title="Fullscreen"><Maximize2 className="w-4 h-4 text-slate-700" /></button></div>}</div>;
}
