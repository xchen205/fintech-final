import React, { useState } from 'react';
import { TrendingUp, PlusCircle, Trash2, DollarSign, LineChart } from 'lucide-react';
import { Investment } from '../types';

interface Props {
  investments: Investment[];
  onAdd: (investment: Omit<Investment, 'id'>) => void;
  onDelete: (id: string) => void;
}

const InvestmentManager: React.FC<Props> = ({ investments = [], onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    expectedAnnualReturn: '7',
    date: new Date().toISOString().split('T')[0]
  });

  const safeInvestments = Array.isArray(investments) ? investments : [];
  const totalInvested = safeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  
 
  const calculateCurrentValue = (inv: Investment) => {
    const years = (new Date().getTime() - new Date(inv.date).getTime()) / (1000 * 60 * 60 * 24 * 365);
    return (inv.amount || 0) * Math.pow(1 + (inv.expectedAnnualReturn || 0) / 100, Math.max(0, years));
  };

  const totalValue = safeInvestments.reduce((sum, inv) => sum + calculateCurrentValue(inv), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name: formData.name,
      amount: parseFloat(formData.amount),
      expectedAnnualReturn: parseFloat(formData.expectedAnnualReturn),
      date: formData.date
    });
    setFormData({ name: '', amount: '', expectedAnnualReturn: '7', date: new Date().toISOString().split('T')[0] });
    setIsAdding(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Investment Tracking</h2>
          <p className="text-slate-500 text-sm">Monitor your wealth growth and compound interest</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-700 transition-all"
        >
          <PlusCircle size={20} />
          Add Investment
        </button>
      </div>

   
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Invested</p>
          <p className="text-2xl font-bold text-slate-800">${totalInvested.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-sm">
          <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Current Estimated Value</p>
          <p className="text-2xl font-bold text-emerald-700">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase mb-1">Growth</p>
          <p className={`text-2xl font-bold ${totalValue >= totalInvested ? 'text-emerald-600' : 'text-red-600'}`}>
            {totalInvested > 0 ? (((totalValue - totalInvested) / totalInvested) * 100).toFixed(2) : '0.00'}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Asset</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Invested</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Est. Annual Return</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {safeInvestments.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{inv.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{inv.date}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">${inv.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-100">
                        {inv.expectedAnnualReturn}% APR
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onDelete(inv.id)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {safeInvestments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      <LineChart size={40} className="mx-auto mb-3 opacity-20" />
                      <p>No investments recorded yet.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

    
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
            <h3 className="font-bold text-slate-800 mb-6">Growth Projection</h3>
            <div className="w-full aspect-square relative flex items-end justify-center gap-12 pb-8">
          
              <div className="flex flex-col items-center gap-3 group">
                <div 
                  className="w-16 bg-slate-200 rounded-lg transition-all duration-500 h-32 group-hover:bg-slate-300"
                ></div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Invested</p>
                <p className="text-xs font-bold text-slate-700">${totalInvested.toLocaleString()}</p>
              </div>
              <div className="flex flex-col items-center gap-3 group">
                <div 
                  className="w-16 bg-emerald-500 rounded-lg transition-all duration-500 h-48 group-hover:bg-emerald-600"
                ></div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase">Received (Proj)</p>
                <p className="text-xs font-bold text-emerald-700">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
            </div>

        </div>
      </div>


      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Track New Asset</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Asset Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. S&P 500 ETF, Bitcoin, Bond A"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Initial Amount</label>
                  <input 
                    type="number" 
                    required
                    placeholder="0.00"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Exp. Return (%)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.expectedAnnualReturn}
                    onChange={e => setFormData({...formData, expectedAnnualReturn: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Date of Purchase</label>
                <input 
                  type="date" 
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors"
                >
                  Start Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentManager;
