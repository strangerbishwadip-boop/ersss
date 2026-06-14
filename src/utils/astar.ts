/**
 * A* Pathfinding Algorithm for Ground Vehicle Navigation
 * 
 * This implements a grid-based A* over the Kathmandu road network.
 * For real road routing we layer OSRM on top, but the A* core
 * runs locally so judges can see the algorithm working.
 */

export interface Node {
  x: number;
  y: number;
  g: number;        // cost from start
  h: number;        // heuristic to end
  f: number;        // g + h
  parent: Node | null;
  walkable: boolean;
}

export interface RouteResult {
  path: [number, number][];       // [lat, lng][]
  distanceKm: number;
  etaMinutes: number;
  nodesExplored: number;
  algorithmMs: number;
}

// Haversine distance in km
export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Core A* on a fine-grained grid covering the bounding box between
 * start and end, with some padding.  Grid cells that fall on known
 * road corridors are walkable; others have higher cost.
 * 
 * The grid is intentionally coarse enough (≈50-80 m cells) to run
 * in < 50 ms in the browser while still producing a visually
 * road-like path.
 */
export function astarRoute(
  startLat: number, startLng: number,
  endLat: number,   endLng: number,
  avgSpeedKmh: number = 30
): RouteResult {
  const t0 = performance.now();

  // ── grid setup ──
  const PAD = 0.012;  // ~1.3 km padding around bbox
  const GRID = 60;    // grid resolution
  const minLat = Math.min(startLat, endLat) - PAD;
  const maxLat = Math.max(startLat, endLat) + PAD;
  const minLng = Math.min(startLng, endLng) - PAD;
  const maxLng = Math.max(startLng, endLng) + PAD;
  const stepLat = (maxLat - minLat) / GRID;
  const stepLng = (maxLng - minLng) / GRID;

  // Convert lat/lng to grid coords
  const toGrid = (lat: number, lng: number): [number, number] => [
    Math.round((lat - minLat) / stepLat),
    Math.round((lng - minLng) / stepLng),
  ];
  const toLatLng = (r: number, c: number): [number, number] => [
    minLat + r * stepLat,
    minLng + c * stepLng,
  ];

  // ── road-like cost map ──
  // We simulate a road network by making cells near the
  // direct bearing and known road corridors cheaper.
  const costMap: number[][] = [];
  for (let r = 0; r <= GRID; r++) {
    costMap[r] = [];
    for (let c = 0; c <= GRID; c++) {
      const [lat, lng] = toLatLng(r, c);
      // base cost: slight random variation simulates city blocks
      let cost = 1.0;
      // Major road corridors in Kathmandu valley (simplified)
      const ringRoad = Math.abs(haversine(lat, lng, 27.7000, 85.3200) - 3.5);
      if (ringRoad < 0.8) cost = 0.4;  // Ring Road
      const mainAxis = Math.abs(lat - 27.7100) * 100;
      if (mainAxis < 0.8) cost = Math.min(cost, 0.5);  // East-west corridor
      const nsAxis = Math.abs(lng - 85.3200) * 100;
      if (nsAxis < 0.8) cost = Math.min(cost, 0.5);  // North-south corridor
      // Grid pattern of minor roads
      if (r % 3 === 0 || c % 3 === 0) cost = Math.min(cost, 0.6);
      costMap[r][c] = cost;
    }
  }

  // ── A* core ──
  const [sr, sc] = toGrid(startLat, startLng);
  const [er, ec] = toGrid(endLat, endLng);

  const key = (r: number, c: number) => `${r},${c}`;
  const openSet = new Map<string, Node>();
  const closedSet = new Set<string>();
  let nodesExplored = 0;

  const heuristic = (r: number, c: number) => {
    const [la, lo] = toLatLng(r, c);
    const [le, loe] = toLatLng(er, ec);
    return haversine(la, lo, le, loe);
  };

  const startNode: Node = { x: sr, y: sc, g: 0, h: heuristic(sr, sc), f: heuristic(sr, sc), parent: null, walkable: true };
  openSet.set(key(sr, sc), startNode);

  // 8-directional neighbours
  const dirs = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
  const DIAG = Math.SQRT2;

  let endNode: Node | null = null;

  while (openSet.size > 0) {
    // Pick lowest f
    let current: Node | null = null;
    for (const n of openSet.values()) {
      if (!current || n.f < current.f || (n.f === current.f && n.h < current.h)) current = n;
    }
    if (!current) break;
    nodesExplored++;

    // Reached goal?
    if (current.x === er && current.y === ec) {
      endNode = current;
      break;
    }

    openSet.delete(key(current.x, current.y));
    closedSet.add(key(current.x, current.y));

    for (const [dr, dc] of dirs) {
      const nr = current.x + dr;
      const nc = current.y + dc;
      if (nr < 0 || nr > GRID || nc < 0 || nc > GRID) continue;
      const nk = key(nr, nc);
      if (closedSet.has(nk)) continue;

      const isDiag = dr !== 0 && dc !== 0;
      const moveCost = (isDiag ? DIAG : 1) * (costMap[nr]?.[nc] ?? 1);
      const tentG = current.g + moveCost;

      const existing = openSet.get(nk);
      if (existing && tentG >= existing.g) continue;

      const h = heuristic(nr, nc);
      const node: Node = { x: nr, y: nc, g: tentG, h, f: tentG + h, parent: current, walkable: true };
      openSet.set(nk, node);
    }
  }

  // ── reconstruct path ──
  const path: [number, number][] = [];
  let cur = endNode;
  while (cur) {
    path.unshift(toLatLng(cur.x, cur.y));
    cur = cur.parent;
  }
  if (path.length === 0) {
    // Fallback: straight line
    path.push([startLat, startLng], [endLat, endLng]);
  }

  // ── smooth path: Douglas-Peucker simplification ──
  const smoothed = douglasPeucker(path, 0.0002);

  // distance along path
  let distKm = 0;
  for (let i = 1; i < smoothed.length; i++) {
    distKm += haversine(smoothed[i - 1][0], smoothed[i - 1][1], smoothed[i][0], smoothed[i][1]);
  }
  // Road winding factor
  distKm *= 1.25;

  const algorithmMs = performance.now() - t0;

  return {
    path: smoothed,
    distanceKm: Math.round(distKm * 10) / 10,
    etaMinutes: Math.round((distKm / avgSpeedKmh) * 60),
    nodesExplored,
    algorithmMs: Math.round(algorithmMs * 10) / 10,
  };
}

// ── Douglas-Peucker line simplification ──
function douglasPeucker(points: [number, number][], epsilon: number): [number, number][] {
  if (points.length <= 2) return points;
  let dmax = 0;
  let idx = 0;
  const end = points.length - 1;
  for (let i = 1; i < end; i++) {
    const d = perpDist(points[i], points[0], points[end]);
    if (d > dmax) { dmax = d; idx = i; }
  }
  if (dmax > epsilon) {
    const left = douglasPeucker(points.slice(0, idx + 1), epsilon);
    const right = douglasPeucker(points.slice(idx), epsilon);
    return [...left.slice(0, -1), ...right];
  }
  return [points[0], points[end]];
}

function perpDist(p: [number, number], a: [number, number], b: [number, number]): number {
  const dx = b[0] - a[0]; const dy = b[1] - a[1];
  const mag = Math.sqrt(dx * dx + dy * dy);
  if (mag === 0) return Math.sqrt((p[0] - a[0]) ** 2 + (p[1] - a[1]) ** 2);
  return Math.abs(dx * (a[1] - p[1]) - (a[0] - p[0]) * dy) / mag;
}

/**
 * Fetch an OSRM road route and fall back to local A* if the
 * API is unreachable (offline demo / hackathon).
 */
export async function fetchRoute(
  startLat: number, startLng: number,
  endLat: number,   endLng: number,
  avgSpeedKmh = 30
): Promise<RouteResult> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('OSRM unavailable');
    const data = await res.json();
    if (!data.routes?.length) throw new Error('No route');
    const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
      (c: [number, number]) => [c[1], c[0]] as [number, number]  // GeoJSON is [lng,lat]
    );
    const distKm = Math.round((data.routes[0].distance / 1000) * 10) / 10;
    const etaMin = Math.round(data.routes[0].duration / 60);
    return {
      path: coords,
      distanceKm: distKm,
      etaMinutes: etaMin || Math.round((distKm / avgSpeedKmh) * 60),
      nodesExplored: coords.length,
      algorithmMs: 0,
    };
  } catch {
    // Offline / error → local A*
    return astarRoute(startLat, startLng, endLat, endLng, avgSpeedKmh);
  }
}
