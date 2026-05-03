
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  PieChart, 
  CalendarCheck, 
  Download, 
  PlusCircle, 
  AlertTriangle,
  Info,
  TrendingUp,
  MessageSquare,
  User
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import TransactionManager from './components/TransactionManager';
import BudgetManager from './components/BudgetManager';
import BillManager from './components/BillManager';
import InvestmentManager from './components/InvestmentManager';
import FeedbackManager from './components/FeedbackManager';
import ProfileManager from './components/ProfileManager';
import { FinancialState, Transaction, Budget, Bill, Investment } from './types';
import { autoCategorize, getAutomatedAlerts } from './utils/financeLogic';

const SEED_DATA: FinancialState = {
  transactions: [
    { id: '1', date: '2025-05-01', amount: 3500, type: 'income', category: 'Income', merchant: 'Tech Corp Salary', notes: 'Monthly salary' },
    { id: '2', date: '2025-05-02', amount: 1200, type: 'expense', category: 'Housing', merchant: 'Grand View Apts', notes: 'Rent' },
    { id: '3', date: '2025-05-05', amount: 45.50, type: 'expense', category: 'Food & Drink', merchant: 'Starbucks', notes: '' },
    { id: '4', date: '2025-05-07', amount: 65.00, type: 'expense', category: 'Transportation', merchant: 'Shell Gas', notes: '' },
    { id: '5', date: '2025-05-10', amount: 15.99, type: 'expense', category: 'Entertainment', merchant: 'Netflix', notes: '' },
  ],
  budgets: [
    { category: 'Food & Drink', limit: 400 },
    { category: 'Transportation', limit: 200 },
    { category: 'Entertainment', limit: 150 },
    { category: 'Housing', limit: 1200 },
  ],
  bills: [
    { id: 'b1', name: 'Rent', amount: 1200, dueDay: 1, frequency: 'monthly', autopay: true, lastPaidDate: '2025-05-01' },
    { id: 'b2', name: 'Electricity', amount: 85, dueDay: 15, frequency: 'monthly', autopay: false },
    { id: 'b3', name: 'Internet', amount: 60, dueDay: 20, frequency: 'monthly', autopay: true },
  ],
  investments: [
    { id: 'i1', name: 'S&P 500 ETF', amount: 5000, expectedAnnualReturn: 8, date: '2025-01-15' },
    { id: 'i2', name: 'Bitcoin', amount: 500, expectedAnnualReturn: 15, date: '2025-03-10' }
  ],
  learnedRules: {
    'Starbucks': 'Food & Drink',
    'Shell Gas': 'Transportation',
    'Netflix': 'Entertainment'
  }
};

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'transactions' | 'budgets' | 'bills' | 'investments' | 'account'>('dashboard');
  const [state, setState] = useState<FinancialState>(() => {
    const saved = localStorage.getItem('finintel_data');
    if (!saved) return SEED_DATA;
    try {
      const parsed = JSON.parse(saved);
     
      
      return {
        ...SEED_DATA,
        ...parsed,
        investments: parsed.investments || SEED_DATA.investments,
        learnedRules: parsed.learnedRules || SEED_DATA.learnedRules
      };
    } catch (e) {
      return SEED_DATA;
    }
  });

  useEffect(() => {
    localStorage.setItem('finintel_data', JSON.stringify(state));
  }, [state]);


  useEffect(() => {
    const today = new Date().getDate();
    const currentMonthStr = new Date().toISOString().slice(0, 7); 
    
    const billsToPay = state.bills.filter(b => 
      b.autopay && 
      b.dueDay <= today && 
      (!b.lastPaidDate || !b.lastPaidDate.startsWith(currentMonthStr))
    );

    if (billsToPay.length > 0) {
      const newTransactions: Transaction[] = billsToPay.map(b => ({
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString().split('T')[0],
        amount: b.amount,
        type: 'expense',
        category: 'Bills',
        merchant: b.name,
        notes: 'Automatic payment processed'
      }));

      const updatedBills = state.bills.map(b => {
        const matching = billsToPay.find(bp => bp.id === b.id);
        return matching ? { ...b, lastPaidDate: new Date().toISOString().split('T')[0] } : b;
      });

      setState(prev => ({
        ...prev,
        transactions: [...prev.transactions, ...newTransactions],
        bills: updatedBills
      }));
    }
  }, [state.bills]);

  const alerts = useMemo(() => getAutomatedAlerts(state), [state]);

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const category = tx.category === 'Uncategorized' ? autoCategorize(tx.merchant, state.learnedRules) : tx.category;
    const newTx = { ...tx, category, id: Math.random().toString(36).substr(2, 9) };
    
   
    const updatedRules = { ...state.learnedRules };
    if (tx.category !== 'Uncategorized') {
      updatedRules[tx.merchant] = tx.category;
    }

    setState(prev => ({
      ...prev,
      transactions: [...prev.transactions, newTx],
      learnedRules: updatedRules
    }));
  };

  const deleteTransaction = (id: string) => {
    setState(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
  };

  const updateBudget = (newBudgets: Budget[]) => {
    setState(prev => ({ ...prev, budgets: newBudgets }));
  };

  const addInvestment = (inv: Omit<Investment, 'id'>) => {
    const newInv = { ...inv, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ ...prev, investments: [...prev.investments, newInv] }));
  };

  const deleteInvestment = (id: string) => {
    setState(prev => ({ ...prev, investments: prev.investments.filter(i => i.id !== id) }));
  };

  const resetData = () => {
    if (confirm("Are you sure you want to delete all your data? This cannot be undone.")) {
      setState(SEED_DATA);
      setView('dashboard');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'bills', label: 'Bills', icon: CalendarCheck },
    { id: 'investments', label: 'Investments', icon: TrendingUp },
    { id: 'account', label: 'Account', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar */}
      <nav className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 md:h-screen z-10">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">F</div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg">FinIntel</h1>
          </div>
        </div>

        <div className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`w-full flex items-center gap-3 px-6 py-3.5 text-sm font-medium transition-colors ${
                view === item.id 
                  ? 'text-emerald-600 bg-emerald-50 border-r-4 border-emerald-600' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </div>
      </nav>


      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        
        {alerts.length > 0 && (
          <div className="mb-8 space-y-3">
            {alerts.map((alert, idx) => (
              <div key={idx} className={`p-4 rounded-xl border flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500 ${
                alert.type === 'critical' ? 'bg-red-50 border-red-100 text-red-800' :
                alert.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                'bg-blue-50 border-blue-100 text-blue-800'
              }`}>
                {alert.type === 'critical' || alert.type === 'warning' ? <AlertTriangle size={20} className="mt-0.5 shrink-0" /> : <Info size={20} className="mt-0.5 shrink-0" />}
                <p className="text-sm font-medium">{alert.message}</p>
              </div>
            ))}
          </div>
        )}

        <div className="transition-all duration-300">
          {view === 'dashboard' && (
            <Dashboard 
              state={state} 
              onNavigate={setView} 
            />
          )}
          {view === 'transactions' && (
            <TransactionManager 
              transactions={state.transactions} 
              onAdd={addTransaction} 
              onDelete={deleteTransaction}
            />
          )}
          {view === 'budgets' && <BudgetManager budgets={state.budgets} onUpdate={updateBudget} />}
          {view === 'bills' && <BillManager state={state} setState={setState} />}
          {view === 'investments' && (
            <InvestmentManager 
              investments={state.investments} 
              onAdd={addInvestment} 
              onDelete={deleteInvestment} 
            />
          )}
          {view === 'account' && (
            <ProfileManager 
              onReset={resetData} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
