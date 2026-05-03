
import React, { useState } from 'react';
import { FinancialState, Bill } from '../types';
import { CalendarCheck, CheckCircle, Clock, Zap, PlusCircle, X } from 'lucide-react';

interface BillManagerProps {
  state: FinancialState;
  setState: React.Dispatch<React.SetStateAction<FinancialState>>;
}

const BillManager: React.FC<BillManagerProps> = ({ state, setState }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDay: '1',
    autopay: false
  });

  const toggleAutopay = (id: string) => {
    setState(prev => ({
      ...prev,
      bills: prev.bills.map(b => b.id === id ? { ...b, autopay: !b.autopay } : b)
    }));
  };

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) return;

    const newBill: Bill = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      amount: parseFloat(formData.amount),
      dueDay: parseInt(formData.dueDay),
      frequency: 'monthly',
      autopay: formData.autopay
    };

    setState(prev => ({
      ...prev,
      bills: [...prev.bills, newBill]
    }));

    setFormData({ name: '', amount: '', dueDay: '1', autopay: false });
    setIsAdding(false);
  };

  const markAsPaid = (id: string) => {
    const bill = state.bills.find(b => b.id === id);
    if (!bill) return;

    const newTx = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      amount: bill.amount,
      type: 'expense' as const,
      category: 'Bills',
      merchant: bill.name,
      notes: `Manual bill payment for ${bill.name}`
    };

    setState(prev => ({
      ...prev,
      transactions: [...prev.transactions, newTx],
      bills: prev.bills.map(b => b.id === id ? { ...b, lastPaidDate: new Date().toISOString().split('T')[0] } : b)
    }));
  };

  const isPaidThisMonth = (bill: Bill) => {
    if (!bill.lastPaidDate) return false;
    const last = new Date(bill.lastPaidDate);
    const now = new Date();
    return last.getMonth() === now.getMonth() && last.getFullYear() === now.getFullYear();
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Recurring Bills</h2>
          <p className="text-slate-500">Manage subscriptions and automated payments</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-700 transition-all"
        >
          <PlusCircle size={20} />
          Add Bill
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Add Recurring Bill</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddBill} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Bill Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Netflix, Rent, Electricity"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Amount ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required
                    placeholder="0.00"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Due Day (1-31)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="31"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.dueDay}
                    onChange={e => setFormData({...formData, dueDay: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <input 
                  type="checkbox" 
                  id="autopay-toggle"
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  checked={formData.autopay}
                  onChange={e => setFormData({...formData, autopay: e.target.checked})}
                />
                <label htmlFor="autopay-toggle" className="text-sm font-bold text-emerald-900 cursor-pointer">
                  Enable Autopay Simulation
                  <span className="block text-[10px] font-medium text-emerald-600 mt-0.5">Will automatically mark as paid on due date</span>
                </label>
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
              >
                Create Recurring Bill
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {state.bills.map((bill) => {
          const paid = isPaidThisMonth(bill);
          return (
            <div key={bill.id} className={`bg-white p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${paid ? 'border-emerald-100 opacity-75' : 'border-slate-200'}`}>
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${paid ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'}`}>
                  {paid ? <CheckCircle size={28} /> : <CalendarCheck size={28} />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{bill.name}</h3>
                  <p className="text-sm font-medium text-slate-500">Due every month on the {bill.dueDay}{bill.dueDay === 1 ? 'st' : bill.dueDay === 2 ? 'nd' : bill.dueDay === 3 ? 'rd' : 'th'}</p>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-1">
                <p className="text-2xl font-extrabold text-slate-900">${bill.amount.toFixed(2)}</p>
                <div className="flex items-center gap-4 mt-2">
                   <button 
                    onClick={() => toggleAutopay(bill.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                      bill.autopay ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <Zap size={12} className={bill.autopay ? 'fill-white' : ''} />
                    Autopay: {bill.autopay ? 'ON' : 'OFF'}
                  </button>
                  {!paid && (
                    <button 
                      onClick={() => markAsPaid(bill.id)}
                      className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      <Clock size={14} />
                      Mark as Paid
                    </button>
                  )}
                  {paid && <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle size={14} /> Paid</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BillManager;
