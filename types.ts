export type Category = 
  // Expense Categories
  | 'Alimentación'
  | 'Transporte'
  | 'Vivienda'
  | 'Entretenimiento'
  | 'Salud'
  | 'Servicios'
  | 'Compras'
  | 'Otros'
  // Income Categories
  | 'Salario'
  | 'Inversión'
  | 'Regalo'
  | 'Ventas'
  | 'Extra';

export type PaymentMethod = 
  | 'Efectivo'
  | 'Tarjeta Crédito'
  | 'Tarjeta Débito'
  | 'Transferencia';

export type TransactionType = 'expense' | 'income';

export interface Expense {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  date: string; // ISO String
  method: PaymentMethod;
  note?: string;
}

export interface GoalTransaction {
  id: string;
  date: string; // ISO String
  amount: number;
  note: string; // Source of funds
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string; // ISO String
  color: string;
  history: GoalTransaction[];
}

export interface AppState {
  expenses: Expense[];
  goals: SavingsGoal[];
}

export type ViewType = 'dashboard' | 'history' | 'analytics' | 'goals';