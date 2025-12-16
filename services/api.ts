import { Expense, SavingsGoal, GoalTransaction } from '../types';
import { API_CONFIG } from '../config/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Expenses
  async getExpenses(filters?: {
    month?: string;
    year?: string;
    type?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<Expense[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await this.request<{ expenses: Expense[] }>(`/expenses${query}`);
    return data.expenses;
  }

  async createExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    return this.request<Expense>('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
  }

  async updateExpense(id: string, expense: Expense): Promise<Expense> {
    return this.request<Expense>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expense),
    });
  }

  async deleteExpense(id: string): Promise<void> {
    await this.request(`/expenses/${id}`, {
      method: 'DELETE',
    });
  }

  // Goals
  async getGoals(): Promise<SavingsGoal[]> {
    const data = await this.request<{ goals: SavingsGoal[] }>('/goals');
    return data.goals;
  }

  async createGoal(goal: Omit<SavingsGoal, 'id' | 'history'>): Promise<SavingsGoal> {
    return this.request<SavingsGoal>('/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  }

  async updateGoal(id: string, goal: Omit<SavingsGoal, 'history'>): Promise<SavingsGoal> {
    return this.request<SavingsGoal>(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goal),
    });
  }

  async deleteGoal(id: string): Promise<void> {
    await this.request(`/goals/${id}`, {
      method: 'DELETE',
    });
  }

  // Goal Transactions
  async addGoalDeposit(goalId: string, deposit: { amount: number; note?: string }): Promise<GoalTransaction> {
    return this.request<GoalTransaction>(`/goals/${goalId}/deposits`, {
      method: 'POST',
      body: JSON.stringify(deposit),
    });
  }

  async deleteGoalDeposit(goalId: string, transactionId: string): Promise<void> {
    await this.request(`/goals/${goalId}/deposits/${transactionId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();