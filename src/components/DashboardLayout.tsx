import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Bell, Menu, LogOut, MessageSquare, AlertTriangle, Droplet, MapPin, LayoutDashboard, Navigation, Plane, Helicopter, Activity } from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

export default function DashboardLayout({ children, pageTitle }: { children: React.ReactNode; pageTitle?: string }) {
  const { currentUser, logout, ambulanceRequests, fireRequests, communityAlerts, complaints } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  let menuItems: SidebarItem[] = [];
  let defaultTitle = '';
  let userSubtitle = '';
  
  if (currentUser.role === 'citizen') {
    defaultTitle = 'Emergency Response';
    userSubtitle = 'Kathmandu Metro';
    menuItems = [
      { name: 'Home', path: '/citizen', icon: <LayoutDashboard className="w-5 h-5" /> },
      { name: 'Live Tracking', path: '/citizen/tracking', icon: <Navigation className="w-5 h-5" /> },
      { name: 'Blood Requests', path: '/citizen/blood', icon: <Droplet className="w-5 h-5" /> },
      { name: 'Nearby Services', path: '/citizen/nearby', icon: <MapPin className="w-5 h-5" /> },
      { name: 'Community Alerts', path: '/citizen/alerts', icon: <AlertTriangle className="w-5 h-5" /> },
      { name: 'Complaint Box', path: '/citizen/complaint', icon: <MessageSquare className="w-5 h-5" /> },
    ];
  } else if (currentUser.role === 'controlCenter') {
    defaultTitle = 'Command Center';
    userSubtitle = 'National Control Center';
    menuItems = [
      { name: 'Command Center', path: '/control-center', icon: <LayoutDashboard className="w-5 h-5" /> },
      { name: 'Live Map', path: '/control-center/map', icon: <MapPin className="w-5 h-5" /> },
      { name: 'UAV Missions', path: '/control-center/uav', icon: <Plane className="w-5 h-5" /> },
      { name: 'VTOL Tracking', path: '/control-center/vtol', icon: <Helicopter className="w-5 h-5" /> },
      { name: 'Community Alerts', path: '/control-center/alerts', icon: <AlertTriangle className="w-5 h-5" />, badge: communityAlerts.filter(a => a.status === 'Pending').length },
      { name: 'Complaints', path: '/control-center/complaints', icon: <MessageSquare className="w-5 h-5" />, badge: complaints.length },
    ];
  } else if (currentUser.role === 'hospital') {
    defaultTitle = 'Hospital Dashboard';
    userSubtitle = (currentUser as any).hospitalName || 'Hospital';
    menuItems = [
      { name: 'Dashboard', path: '/hospital', icon: <LayoutDashboard className="w-5 h-5" /> },
      { name: 'Blood Requests', path: '/hospital/blood', icon: <Droplet className="w-5 h-5" /> },
      { name: 'UAV Requests', path: '/hospital/uav', icon: <Plane className="w-5 h-5" /> },
      { name: 'Alerts', path: '/hospital/alerts', icon: <AlertTriangle className="w-5 h-5" /> },
    ];
  } else if (currentUser.role === 'ambulance') {
    defaultTitle = 'Ambulance Dashboard';
    userSubtitle = 'Driver • NPB-2021';
    menuItems = [
      { name: 'Dashboard', path: '/ambulance', icon: <LayoutDashboard className="w-5 h-5" /> },
      { name: 'Navigation', path: '/ambulance/nav', icon: <Navigation className="w-5 h-5" /> },
    ];
  } else if (currentUser.role === 'fireStation') {
    defaultTitle = 'Fire Station Dashboard';
    userSubtitle = (currentUser as any).stationName || 'Fire Station';
    menuItems = [
      { name: 'Dashboard', path: '/fire-station', icon: <LayoutDashboard className="w-5 h-5" /> },
      { name: 'Navigation', path: '/fire-station/nav', icon: <Navigation className="w-5 h-5" /> },
      { name: 'Community Alerts', path: '/fire-station/alerts', icon: <AlertTriangle className="w-5 h-5" /> },
    ];
  }

  const activeEmergencies = [...ambulanceRequests, ...fireRequests].filter(
    r => r.status !== 'Completed' && r.status !== 'Resolved'
  ).length;

  const getInitial = () => currentUser.name.charAt(0).toUpperCase();
  
  // Avatar color per role
  const avatarColor = {
    citizen: 'bg-blue-500',
    ambulance: 'bg-red-500',
    hospital: 'bg-emerald-500',
    fireStation: 'bg-rose-500',
    controlCenter: 'bg-purple-500',
  }[currentUser.role] || 'bg-blue-500';

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar - Dark Navy */}
      <aside className={`fixed inset-y-0 left-0 w-[260px] bg-slate-900 text-white z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="px-5 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-tight">NISERS</h1>
              <p className="text-[11px] text-slate-400 leading-tight">Emergency Response</p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-white">
            <Shield className="w-4 h-4" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
          <div className={`w-10 h-10 ${avatarColor} rounded-full flex items-center justify-center text-white font-bold shrink-0`}>
            {getInitial()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-white truncate">{currentUser.name}</p>
            <p className="text-xs text-slate-400 truncate">{userSubtitle}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-5 px-3">
          <h3 className="text-[11px] uppercase text-slate-500 font-bold tracking-widest px-3 mb-3">Navigation</h3>
          <nav className="space-y-1">
            {menuItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-sm ${
                    isActive 
                      ? 'bg-slate-800 text-white font-semibold' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  {item.badge ? (
                    <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-[70px] bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="p-2 lg:hidden text-slate-600">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-bold text-slate-900 text-lg">{pageTitle || defaultTitle}</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm font-semibold text-slate-600 tabular-nums">{time.toLocaleTimeString()}</span>
            
            <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider">Live</span>
            </div>

            <button className="relative w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center transition">
              <Bell className="w-5 h-5 text-slate-600" />
              {activeEmergencies > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            
            <button className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center transition">
              <Activity className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1400px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
