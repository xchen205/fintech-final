import React, { useState } from 'react';
import { User, Trash2 } from 'lucide-react';

const ProfileManager: React.FC<{ 
  onReset: () => void;
}> = ({ onReset }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
          <User size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Account Management</h2>
          <p className="text-slate-500">Manage your system and data</p>
        </div>
      </div>

      <div className="space-y-6">
     
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Privacy Control</h3>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-black">Local Storage only</p>
          </div>
          <button 
            onClick={onReset}
            className="w-full md:w-auto px-8 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 size={14} />
            Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileManager;
