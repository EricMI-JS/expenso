import React, { useState, useEffect } from 'react';
import { Expense, Category, PaymentMethod, TransactionType } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../constants';
import { Button, Input, Select } from './ui/UI';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface ExpenseFormProps {
  initialData?: Expense | null;
  onSave: (expense: Omit<Expense, 'id'> | Expense) => void;
  onCancel: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    type: 'expense' as TransactionType,
    amount: '',
    category: EXPENSE_CATEGORIES[0] as Category,
    date: new Date().toISOString().split('T')[0],
    method: PAYMENT_METHODS[0] as PaymentMethod,
    note: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || 'expense',
        amount: initialData.amount.toString(),
        category: initialData.category,
        date: initialData.date.split('T')[0],
        method: initialData.method,
        note: initialData.note || ''
      });
    }
  }, [initialData]);

  // Update default category when type changes
  const handleTypeChange = (newType: TransactionType) => {
    const newCategory = newType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0];
    setFormData({
      ...formData,
      type: newType,
      category: newCategory as Category
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || isNaN(Number(formData.amount))) return;

    onSave({
      ...initialData,
      id: initialData?.id || '',
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: new Date(formData.date).toISOString(),
      method: formData.method,
      note: formData.note
    });
  };

  const currentCategories = formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const isExpense = formData.type === 'expense';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Type Toggle */}
      <div className="flex bg-slate-100 p-1 rounded-xl mb-2">
        <button
          type="button"
          onClick={() => handleTypeChange('expense')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${isExpense ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <TrendingDown size={16} /> Gasto
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('income')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${!isExpense ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <TrendingUp size={16} /> Ingreso
        </button>
      </div>

      <Input
        label="Monto"
        type="number"
        step="0.01"
        placeholder="0.00"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        required
        autoFocus
        className={`text-lg font-semibold ${!isExpense ? 'text-emerald-600' : 'text-slate-900'}`}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Categoría"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
          options={currentCategories.map(c => ({ value: c, label: c }))}
        />
        
        <Select
          label="Método de Pago"
          value={formData.method}
          onChange={(e) => setFormData({ ...formData, method: e.target.value as PaymentMethod })}
          options={PAYMENT_METHODS.map(m => ({ value: m, label: m }))}
        />
      </div>

      <Input
        label="Fecha"
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        required
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Nota (Opcional)</label>
        <textarea
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm transition-all outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 resize-none h-20"
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          placeholder={isExpense ? "¿En qué gastaste?" : "¿Origen del ingreso?"}
        />
      </div>

      <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button 
          type="submit" 
          className={`flex-1 ${!isExpense ? '!bg-emerald-600 hover:!bg-emerald-700 focus:!ring-emerald-500' : ''}`}
        >
          {initialData ? 'Guardar Cambios' : (isExpense ? 'Registrar Gasto' : 'Registrar Ingreso')}
        </Button>
      </div>
    </form>
  );
};