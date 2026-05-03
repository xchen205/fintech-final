
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: string;
  merchant: string;
  notes: string;
}

export interface Budget {
  category: string;
  limit: number;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  frequency: 'monthly' | 'weekly';
  autopay: boolean;
  lastPaidDate?: string;
}

export interface CategoryRule {
  merchant: string;
  category: string;
}

export interface Investment {
  id: string;
  name: string;
  amount: number;
  expectedAnnualReturn: number; 
  date: string;
}

export interface FinancialState {
  transactions: Transaction[];
  budgets: Budget[];
  bills: Bill[];
  investments: Investment[]; 
  learnedRules: Record<string, string>;
}

export interface HealthScore {
  score: number;
  details: string[];
}

export interface Alert {
  type: 'warning' | 'info' | 'critical';
  message: string;
}
