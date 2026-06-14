import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { Shield, User, Ambulance, Building2, Flame } from 'lucide-react';

type Role = 'citizen' | 'ambulance' | 'fireStation' | 'hospital';

const roleConfig: Record<Role, { label: string; icon: any; color: string; bgColor: string }> = {
  citizen: { label: 'Citizen', icon: User, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  ambulance: { label: 'Ambulance', icon: Ambulance, color: 'text-red-600', bgColor: 'bg-red-50' },
  hospital: { label: 'Hospital', icon: Building2, color: 'text-green-600', bgColor: 'bg-green-50' },
  fireStation: { label: 'Fire Station', icon: Flame, color: 'text-red-600', bgColor: 'bg-red-50' },
};

export default function Register() {
  const [role, setRole] = useState<Role>('citizen');
  const [formData, setFormData] = useState<any>({});
  const register = useStore(state => state.register);
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    register({ ...formData, role });
    alert(role === 'citizen' ? 'Registration successful. You can now sign in.' : 'Registration submitted. Pending approval by Control Center.');
    navigate('/login');
  };

  const renderFields = () => {
    const inputClass = "w-full px-4 py-3.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-slate-50 focus:bg-white";
    
    switch (role) {
      case 'citizen':
        return (
          <>
            <input className={inputClass} placeholder="Full Name" onChange={e => setFormData({...formData, name: e.target.value})} required />
            <input className={inputClass} placeholder="Phone Number" onChange={e => setFormData({...formData, phone: e.target.value})} required />
            <input className={inputClass} placeholder="Citizen Number" onChange={e => setFormData({...formData, citizenNumber: e.target.value})} required />
            <input type="password" className={inputClass} placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} required />
          </>
        );
      case 'ambulance':
        return (
          <>
            <input className={inputClass} placeholder="Driver Name" onChange={e => setFormData({...formData, driverName: e.target.value, name: e.target.value})} required />
            <input className={inputClass} placeholder="Phone Number" onChange={e => setFormData({...formData, phone: e.target.value})} required />
            <input className={inputClass} placeholder="License Number" onChange={e => setFormData({...formData, licenseNumber: e.target.value})} required />
            <input className={inputClass} placeholder="Vehicle Number" onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} required />
            <select className={inputClass} onChange={e => setFormData({...formData, vehicleType: e.target.value})} required>
              <option value="">Vehicle Type</option>
              <option value="ALS">Advanced Life Support (ALS)</option>
              <option value="BLS">Basic Life Support (BLS)</option>
              <option value="Patient Transport">Patient Transport</option>
            </select>
            <input type="password" className={inputClass} placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} required />
          </>
        );
      case 'fireStation':
        return (
          <>
            <input className={inputClass} placeholder="Station Name" onChange={e => setFormData({...formData, stationName: e.target.value, name: e.target.value})} required />
            <input className={inputClass} placeholder="Contact Number" onChange={e => setFormData({...formData, phone: e.target.value})} required />
            <input type="password" className={inputClass} placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} required />
          </>
        );
      case 'hospital':
        return (
          <>
            <input className={inputClass} placeholder="Hospital Name" onChange={e => setFormData({...formData, hospitalName: e.target.value, name: e.target.value})} required />
            <input className={inputClass} placeholder="Address" onChange={e => setFormData({...formData, address: e.target.value})} required />
            <input className={inputClass} placeholder="Contact Number" onChange={e => setFormData({...formData, phone: e.target.value})} required />
            <input className={inputClass} placeholder="Emergency Contact" onChange={e => setFormData({...formData, emergencyContact: e.target.value})} required />
            <select className={inputClass} onChange={e => setFormData({...formData, hospitalType: e.target.value})} required>
              <option value="">Hospital Type</option>
              <option value="General">General Hospital</option>
              <option value="Specialty">Specialty Hospital</option>
              <option value="Trauma">Trauma Center</option>
            </select>
            <input type="password" className={inputClass} placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} required />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">NISERS</h1>
          <p className="text-sm text-slate-500 mt-1">Create Account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex mb-6">
            <Link to="/login" className="flex-1 py-3 px-4 text-center font-semibold text-slate-500 hover:text-slate-700 transition">
              Sign In
            </Link>
            <button className="flex-1 py-3 px-4 bg-white rounded-xl font-semibold text-slate-900 shadow-sm">
              Register
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {(Object.keys(roleConfig) as Role[]).map(r => {
              const cfg = roleConfig[r];
              const Icon = cfg.icon;
              const isSelected = role === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRole(r); setFormData({}); }}
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

          <form onSubmit={handleRegister} className="space-y-4">
            {renderFields()}
            
            <button type="submit" className="w-full h-13 py-4 mt-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition">
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
