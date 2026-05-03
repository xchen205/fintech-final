
import React, { useMemo } from 'react';
import { FinancialState } from '../types';
import { calculateHealthScore } from '../utils/financeLogic';
import { Wallet, TrendingDown, TrendingUp, CheckCircle2, PieChart, CalendarCheck } from 'lucide-react';

interface DashboardProps {
  state: FinancialState;
  onNavigate: (view: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onNavigate }) => {
  const health = useMemo(() => calculateHealthScore(state), [state]);
  
  const totalBalance = state.transactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
  
  const now = new Date();
  const currentMonthTx = state.transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const monthlyIncome = currentMonthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = currentMonthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  // Simple Trend Data (Last 3 months)
  const getMonthlyTotal = (monthOffset: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() - monthOffset);
    const m = d.getMonth();
    const y = d.getFullYear();
    const txs = state.transactions.filter(t => {
      const td = new Date(t.date);
      return td.getMonth() === m && td.getFullYear() === y && t.type === 'expense';
    });
    return {
      month: d.toLocaleString('default', { month: 'short' }),
      total: txs.reduce((sum, t) => sum + t.amount, 0)
    };
  };

  const trends = [getMonthlyTotal(2), getMonthlyTotal(1), getMonthlyTotal(0)];
  const maxTrend = Math.max(...trends.map(t => t.total), 1);

  return (
    <div className="space-y-8">
  
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Financial Summary
          </h2>
          <p className="text-slate-500">
            Real-time health monitoring & insights
          </p>
        </div>
        <div className="flex gap-2">
        </div>
      </div>

    
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Balance</p>
            <p className="text-2xl font-bold text-slate-900">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Monthly Income</p>
            <p className="text-2xl font-bold text-slate-900">${monthlyIncome.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Monthly Spending</p>
            <p className="text-2xl font-bold text-slate-900">${monthlyExpenses.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       
        <div 
          className="bg-emerald-700 p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center gap-10"
        >
          <div className="flex flex-col items-center justify-center bg-white/10 w-40 h-40 rounded-full border-4 border-white/20">
              <span className="text-5xl font-black">{health.score}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Score</span>
          </div>
          <div className="flex-1 space-y-4">
            <h3 className="text-xl font-bold">Automated Insights</h3>
            <ul className="space-y-3">
              {health.details.slice(0, 3).map((detail, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-medium bg-white/10 p-2 rounded-lg">
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </div>

      
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Spending Trends</h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last 3 Months</span>
          </div>
          <div className="flex-1 flex items-end justify-between gap-4 pb-4">
            {trends.map((t, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                <div 
                  style={{ height: `${(t.total / maxTrend) * 160}px` }}
                  className="w-full bg-slate-100 rounded-t-xl group-hover:bg-emerald-100 transition-all duration-300 relative min-h-[10px]"
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ${t.total.toFixed(0)}
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-500 uppercase">{t.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
