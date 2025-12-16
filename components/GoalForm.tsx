import React, { useState, useEffect } from 'react';
import { SavingsGoal } from '../types';
import { Button, Input } from './ui/UI';

interface GoalFormProps {
  initialData?: SavingsGoal | null;
  onSave: (goal: Omit<SavingsGoal, 'id'> | SavingsGoal) => void;
  onCancel: () => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export const GoalForm: React.FC<GoalFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: '',
    color: COLORS[0]
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        targetAmount: initialData.targetAmount.toString(),
        currentAmount: initialData.currentAmount.toString(),
        deadline: initialData.deadline ? initialData.deadline.split('T')[0] : '',
        color: initialData.color
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount) return;

    onSave({
      ...initialData,
      id: initialData?.id || '',
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount),
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
      color: formData.color
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nombre de la Meta"
        placeholder="Ej. Viaje a Europa, Auto Nuevo"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        autoFocus
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Monto Objetivo"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.targetAmount}
          onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
          required
        />
        <Input
          label="Ahorro Inicial"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.currentAmount}
          onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
        />
      </div>

      <Input
        label="Fecha Límite (Opcional)"
        type="date"
        value={formData.deadline}
        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">Color Identificativo</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFormData({ ...formData, color: c })}
              className={`w-8 h-8 rounded-full transition-all ${formData.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1">
          {initialData ? 'Guardar Cambios' : 'Crear Meta'}
        </Button>
      </div>
    </form>
  );
};