import React, { useState } from 'react';
import { DataManager } from '../utils/dataManager';
import { 
  Save, 
  Trash2, 
  Download, 
  User, 
  Target, 
  Lock, 
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { logout } = useAuth();
  const [targets, setTargets] = useState(DataManager.getTargets());
  const [profile, setProfile] = useState(DataManager.getProfile());
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleSaveTargets = (e) => {
    e.preventDefault();
    DataManager.saveTargets(targets);
    triggerToast();
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    DataManager.saveProfile(profile);
    triggerToast();
  };

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleExport = () => {
    const data = DataManager.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salex_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleReset = () => {
    if (resetConfirm === 'RESET') {
      DataManager.resetAll();
      logout();
      window.location.href = '/login';
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Manager Settings</h1>
          <p className="text-sm text-text-secondary">Configure targets and manage system data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Targets Section */}
        <div className="card">
          <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4 text-primary">
            <Target size={18} />
            <h2 className="text-sm font-bold uppercase tracking-widest">Monthly Targets</h2>
          </div>
          <form onSubmit={handleSaveTargets} className="space-y-4">
            <div>
              <label className="label">Daily Calls Target</label>
              <input 
                type="number" className="input-field w-full"
                value={targets.dailyCalls}
                onChange={e => setTargets({...targets, dailyCalls: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="label">Daily Leads Target</label>
              <input 
                type="number" className="input-field w-full"
                value={targets.dailyLeads}
                onChange={e => setTargets({...targets, dailyLeads: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="label">Weekly Meetings Target</label>
              <input 
                type="number" className="input-field w-full"
                value={targets.weeklyMeetings}
                onChange={e => setTargets({...targets, weeklyMeetings: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="label">Monthly Meetings Target</label>
              <input 
                type="number" className="input-field w-full"
                value={targets.monthlyMeetings}
                onChange={e => setTargets({...targets, monthlyMeetings: parseInt(e.target.value)})}
              />
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 mt-4">
              <Save size={16} /> Save Targets
            </button>
          </form>
        </div>

        {/* Rep Profile Section */}
        <div className="card">
          <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4 text-primary">
            <User size={18} />
            <h2 className="text-sm font-bold uppercase tracking-widest">Rep Profile</h2>
          </div>
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-zinc-800 border border-white/5 flex items-center justify-center overflow-hidden">
                {profile.photo ? (
                  <img src={profile.photo} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User size={32} className="text-zinc-700" />
                )}
              </div>
              <div className="flex-1">
                <label className="label">Profile Photo</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="text-xs text-zinc-500 file:mr-4 file:py-1 file:px-2 file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-primary/10 file:text-primary hover:file:bg-primary hover:file:text-white"
                />
              </div>
            </div>
            <div>
              <label className="label">Representative Name</label>
              <input 
                type="text" className="input-field w-full"
                value={profile.name}
                onChange={e => setProfile({...profile, name: e.target.value})}
              />
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              <Save size={16} /> Update Profile
            </button>
          </form>
        </div>
      </div>

      {/* Advanced Section */}
      <div className="card border-danger/20">
        <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4 text-danger">
          <AlertTriangle size={18} />
          <h2 className="text-sm font-bold uppercase tracking-widest">System Management</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold mb-2">Data Backup</h3>
            <p className="text-xs text-text-secondary mb-4">Export all leads, meetings, and activity logs to a JSON file for local backup.</p>
            <button 
              onClick={handleExport}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Download size={16} /> Export Data (JSON)
            </button>
          </div>
          <div>
            <h3 className="font-bold mb-2 text-danger">Factory Reset</h3>
            <p className="text-xs text-text-secondary mb-4">Permanently delete all data from localStorage. This action cannot be undone.</p>
            <button 
              onClick={() => setIsResetModalOpen(true)}
              className="bg-danger/10 border border-danger/20 text-danger hover:bg-danger hover:text-white transition-colors w-full py-2 font-bold uppercase text-xs"
            >
              Reset All System Data
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
          <div className="w-full max-w-md bg-[#111] border border-danger/30 p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-danger mb-2">CRITICAL ACTION</h2>
            <p className="text-sm text-text-secondary mb-6">
              You are about to delete all system data. This includes all leads, meetings, audits, and performance logs.
            </p>
            <div className="mb-6">
              <label className="label text-danger">Type "RESET" to confirm</label>
              <input 
                type="text" 
                className="input-field w-full border-danger/30 focus:ring-danger focus:border-danger"
                placeholder="RESET"
                value={resetConfirm}
                onChange={e => setResetConfirm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleReset}
                disabled={resetConfirm !== 'RESET'}
                className="flex-1 py-3 bg-danger text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed"
              >
                CONFIRM RESET
              </button>
              <button 
                onClick={() => setIsResetModalOpen(false)}
                className="flex-1 py-3 bg-zinc-800 text-white font-bold"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-success text-white px-6 py-3 shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300">
          <CheckCircle2 size={20} />
          <span className="font-bold uppercase tracking-wider text-xs">Settings Updated Successfully</span>
        </div>
      )}
    </div>
  );
};

export default Settings;
