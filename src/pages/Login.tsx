import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { Shield, Lock, User, Ambulance, Flame, Building2, ShieldAlert } from 'lucide-react';

type Role = 'citizen' | 'ambulance' | 'hospital' | 'fireStation' | 'controlCenter';

const roleConfig: Record<Role, { label: string; icon: any; color: string; bgColor: string; defaultPhone: string }> = {
  citizen: { label: 'Citizen', icon: User, color: 'text-blue-600', bgColor: 'bg-blue-50', defaultPhone: '123' },
  ambulance: { label: 'Ambulance', icon: Ambulance, color: 'text-red-600', bgColor: 'bg-red-50', defaultPhone: '234' },
  hospital: { label: 'Hospital', icon: Building2, color: 'text-green-600', bgColor: 'bg-green-50', defaultPhone: '345' },
  fireStation: { label: 'Fire Station', icon: Flame, color: 'text-red-600', bgColor: 'bg-red-50', defaultPhone: '456' },
  controlCenter: { label: 'Control Center', icon: ShieldAlert, color: 'text-slate-700', bgColor: 'bg-slate-100', defaultPhone: '000' },
};

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<Role>('citizen');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const login = useStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneToUse = phone || roleConfig[selectedRole].defaultPhone;
    if (login(phoneToUse)) {
      navigate('/');
    } else {
      alert('User not found or pending approval. Try the demo phone for the role.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">NISERS</h1>
          <p className="text-sm text-slate-500 mt-1">National Integrated Safety & Emergency Response</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
          {/* Sign In / Register Tabs */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex mb-6">
            <button className="flex-1 py-3 px-4 bg-white rounded-xl font-semibold text-slate-900 shadow-sm">
              Sign In
            </button>
            <Link to="/register" className="flex-1 py-3 px-4 text-center font-semibold text-slate-500 hover:text-slate-700 transition">
              Register
            </Link>
          </div>

          {/* Role Selection Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(['citizen', 'ambulance', 'hospital', 'fireStation'] as Role[]).map(role => {
              const cfg = roleConfig[role];
              const Icon = cfg.icon;
              const isSelected = selectedRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2 ${cfg.bgColor}`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className={`text-sm font-bold ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                    {cfg.label}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Control Center - Full Width */}
          <button
            type="button"
            onClick={() => setSelectedRole('controlCenter')}
            className={`w-full p-4 rounded-2xl border-2 transition-all mb-6 ${
              selectedRole === 'controlCenter'
                ? 'border-blue-600 bg-blue-50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${roleConfig.controlCenter.bgColor}`}>
                <ShieldAlert className={`w-5 h-5 ${roleConfig.controlCenter.color}`} />
              </div>
              <span className={`text-sm font-bold ${selectedRole === 'controlCenter' ? 'text-blue-700' : 'text-slate-700'}`}>
                Control Center
              </span>
            </div>
          </button>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={`+977 98XXXXXXXX (demo: ${roleConfig[selectedRole].defaultPhone})`}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-slate-50 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full h-13 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <Lock className="w-5 h-5" />
              Sign In Securely
            </button>
          </form>

          <p className="text-xs text-center text-slate-500 mt-6 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" /> 256-bit AES encrypted • Secure government infrastructure
          </p>
        </div>
      </div>
    </div>
  );
}
