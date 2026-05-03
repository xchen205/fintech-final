
import React, { useState } from 'react';
import { Budget } from '../types';
import { Target, Pencil, Plus } from 'lucide-react';

interface BudgetManagerProps {
  budgets: Budget[];
  onUpdate: (budgets: Budget[]) => void;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ budgets, onUpdate }) => {
  const [editing, setEditing] = useState<string | null>(null);
  const [newValue, setNewValue] = useState<number>(0);

  const handleEdit = (category: string, limit: number) => {
    setEditing(category);
    setNewValue(limit);
  };

  const saveEdit = () => {
    const updated = budgets.map(b => b.category === editing ? { ...b, limit: newValue } : b);
    onUpdate(updated);
    setEditing(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Monthly Budgets</h2>
          <p className="text-slate-500">Plan your spending and track limits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((b) => (
          <div key={b.category} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                  <Target size={20} />
                </div>
                <h3 className="font-bold text-slate-800">{b.category}</h3>
              </div>
              {editing === b.category ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    className="w-24 p-1.5 border border-slate-200 rounded-lg text-sm"
                    value={newValue}
                    onChange={e => setNewValue(parseFloat(e.target.value) || 0)}
                  />
                  <button onClick={saveEdit} className="text-xs font-bold text-emerald-600 px-2 py-1 bg-emerald-50 rounded hover:bg-emerald-100">Save</button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-900">${b.limit.toLocaleString()}</span>
                  <button onClick={() => handleEdit(b.category, b.limit)} className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors">
                    <Pencil size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
               <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                  <span>Usage</span>
                  <span>Set Limit: ${b.limit}</span>
               </div>
               
               <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-emerald-500 rounded-full transition-all duration-500`} style={{ width: '45%' }}></div>
               </div>
            </div>
          </div>
        ))}

        <button className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all">
          <Plus size={32} />
          <span className="font-bold">Add Category Budget</span>
        </button>
      </div>
    </div>
  );
};

export default BudgetManager;
