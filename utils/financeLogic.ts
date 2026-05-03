
import { Transaction, Budget, Bill, HealthScore, Alert, FinancialState } from '../types';


export const calculateHealthScore = (state: FinancialState): HealthScore => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTx = state.transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const income = monthlyTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const spending = monthlyTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  let score = 0;
  const details: string[] = [];


  const budgetLimits = state.budgets.reduce((sum, b) => sum + b.limit, 0);
  if (budgetLimits > 0) {
    const budgetUsage = spending / budgetLimits;
    if (budgetUsage <= 0.8) {
      score += 30;
      details.push("Great job! You're well within your budget limits.");
    } else if (budgetUsage <= 1.0) {
      score += 15;
      details.push("You're nearing your budget limits. Be careful.");
    } else {
      details.push("You've exceeded your planned budget for this month.");
    }
  } else {
    score += 15;
    details.push("Tip: Set some category budgets to improve your score tracking.");
  }

 
  if (income > 0) {
    const savingsRate = (income - spending) / income;
    if (savingsRate >= 0.2) {
      score += 30;
      details.push("Strong savings rate! You're saving over 20% of your income.");
    } else if (savingsRate > 0) {
      score += 15;
      details.push("You're saving money, but try to reach for a 20% savings goal.");
    } else {
      details.push("Your spending exceeds your income. Watch your cash flow.");
    }
  }


  const unpaidBills = state.bills.filter(b => !b.lastPaidDate || new Date(b.lastPaidDate).getMonth() !== currentMonth);
  if (unpaidBills.length === 0) {
    score += 20;
    details.push("All your bills for this month are accounted for.");
  } else {
    score += 10;
    details.push(`${unpaidBills.length} upcoming bills remaining this month.`);
  }


  const totalBalance = state.transactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
  if (totalBalance > 500) {
    score += 20;
    details.push("Healthy cash cushion detected.");
  } else if (totalBalance > 0) {
    score += 10;
    details.push("Low cash cushion. Try to build an emergency fund.");
  }

  return { score: Math.min(100, score), details };
};


export const getAutomatedAlerts = (state: FinancialState): Alert[] => {
  const alerts: Alert[] = [];
  const now = new Date();
  
 
  const categoryAverages: Record<string, number> = {};
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  
  const recentTx = state.transactions.filter(t => new Date(t.date) >= sixtyDaysAgo && t.type === 'expense');
  
  recentTx.forEach(t => {
    categoryAverages[t.category] = (categoryAverages[t.category] || 0) + t.amount;
  });


  Object.keys(categoryAverages).forEach(cat => {
    const count = recentTx.filter(t => t.category === cat).length;
    categoryAverages[cat] = categoryAverages[cat] / count;
  });


  if (state.transactions.length > 0) {
    const last = state.transactions[state.transactions.length - 1];
    if (last.type === 'expense' && last.amount > (categoryAverages[last.category] * 3)) {
      alerts.push({
        type: 'warning',
        message: `Unusual spending: Your ${last.amount} at ${last.merchant} is much higher than your average for ${last.category}.`
      });
    }
  }

  const currentBalance = state.transactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
  const next7DaysBills = state.bills.filter(b => {
    const dueDay = b.dueDay;
    const currentDay = now.getDate();
    return dueDay > currentDay && dueDay <= currentDay + 7;
  }).reduce((sum, b) => sum + b.amount, 0);

  if (currentBalance - next7DaysBills < 0) {
    alerts.push({
      type: 'critical',
      message: `Low Balance Risk: Upcoming bills ($${next7DaysBills}) may exceed your current balance ($${currentBalance.toFixed(2)}) within 7 days.`
    });
  }


  state.budgets.forEach(b => {
    const spent = state.transactions
      .filter(t => t.category === b.category && t.type === 'expense' && new Date(t.date).getMonth() === now.getMonth())
      .reduce((sum, t) => sum + t.amount, 0);
    
    if (spent >= b.limit) {
      alerts.push({ type: 'warning', message: `Budget alert: You've exceeded your ${b.category} limit!` });
    } else if (spent >= b.limit * 0.8) {
      alerts.push({ type: 'info', message: `Budget warning: You've used 80% of your ${b.category} budget.` });
    }
  });

  return alerts;
};


export const autoCategorize = (merchant: string, learnedRules: Record<string, string>): string => {
  const mLower = merchant.toLowerCase();
  
  
  if (learnedRules[merchant]) return learnedRules[merchant];
  
  
  if (mLower.includes('starbucks') || mLower.includes('mcdonalds') || mLower.includes('restaurant')) return 'Food & Drink';
  if (mLower.includes('uber') || mLower.includes('lyft') || mLower.includes('gas') || mLower.includes('shell')) return 'Transportation';
  if (mLower.includes('netflix') || mLower.includes('spotify') || mLower.includes('amzn') || mLower.includes('amazon')) return 'Entertainment';
  if (mLower.includes('rent') || mLower.includes('mortgage')) return 'Housing';
  if (mLower.includes('salary') || mLower.includes('paycheck')) return 'Income';
  
  return 'Uncategorized';
};
