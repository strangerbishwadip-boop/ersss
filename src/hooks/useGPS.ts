/**
 * Global GPS hook — single source of truth for user's real location.
 * Call once at app level, use everywhere via Zustand.
 */

import { create } from 'zustand';

interface GPSState {
  lat: number | null;
  lng: number | null;
  accuracy: number;
  loading: boolean;
  error: string | null;
  cityName: string;
  init: () => void;
}

export const useGPS = create<GPSState>((set, get) => ({
  lat: null,
  lng: null,
  accuracy: 0,
  loading: true,
  error: null,
  cityName: '',

  init: () => {
    if (get().lat !== null) return; // already initialized
    if (!navigator.geolocation) {
      set({ loading: false, error: 'Geolocation not supported' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        set({ lat, lng, accuracy: pos.coords.accuracy, loading: false, error: null });
        // Reverse geocode city name
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`)
          .then(r => r.json())
          .then(data => {
            const city = data.address?.city || data.address?.town || data.address?.county || data.address?.state || '';
            set({ cityName: city });
          })
          .catch(() => {});
      },
      (err) => {
        set({ loading: false, error: err.message });
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );

    // Keep watching
    navigator.geolocation.watchPosition(
      (pos) => {
        set({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  },
}));
