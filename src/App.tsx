import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import { useFirebaseSync } from './firebase/sync';
import { useGPS } from './hooks/useGPS';
import Login from './pages/Login';
import Register from './pages/Register';
import ControlCenter from './pages/ControlCenter';
import CitizenPortal from './pages/CitizenPortal';
import AmbulancePortal from './pages/AmbulancePortal';
import HospitalPortal from './pages/HospitalPortal';
import FireStationPortal from './pages/FireStationPortal';

function App() {
  const { currentUser } = useStore();
  
  useFirebaseSync();
  
  // Initialize GPS on app boot — gets real location once for all pages
  const gpsInit = useGPS(s => s.init);
  useEffect(() => { gpsInit(); }, [gpsInit]);

  const getDashboardPath = () => {
    if (!currentUser) return '/login';
    switch (currentUser.role) {
      case 'controlCenter': return '/control-center';
      case 'citizen': return '/citizen';
      case 'ambulance': return '/ambulance';
      case 'hospital': return '/hospital';
      case 'fireStation': return '/fire-station';
      default: return '/login';
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={currentUser ? <Navigate to={getDashboardPath()} /> : <Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/control-center/*" element={currentUser?.role === 'controlCenter' ? <ControlCenter /> : <Navigate to={getDashboardPath()} />} />
        <Route path="/citizen/*" element={currentUser?.role === 'citizen' ? <CitizenPortal /> : <Navigate to={getDashboardPath()} />} />
        <Route path="/ambulance/*" element={currentUser?.role === 'ambulance' ? <AmbulancePortal /> : <Navigate to={getDashboardPath()} />} />
        <Route path="/hospital/*" element={currentUser?.role === 'hospital' ? <HospitalPortal /> : <Navigate to={getDashboardPath()} />} />
        <Route path="/fire-station/*" element={currentUser?.role === 'fireStation' ? <FireStationPortal /> : <Navigate to={getDashboardPath()} />} />
        
        <Route path="/" element={<Navigate to={getDashboardPath()} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
