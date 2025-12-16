import React from 'react';
import { SavingsGoal } from '../types';
import { Card, Button } from './ui/UI';
import { Edit2, Trash2, Plus, Target, CheckCircle, AlertCircle, Clock, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (id: string) => void;
  onAddFunds: (goal: SavingsGoal) => void;
  onViewDetails: (goal: SavingsGoal) => void;
}

export const SavingsGoals: React.FC<SavingsGoalsProps> = ({ goals, onEdit, onDelete, onAddFunds, onViewDetails }) => {
  
  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center p-6 animate-in fade-in">
        <div className="bg-primary-50 p-6 rounded-full mb-4">
          <Target size={48} className="text-primary-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">No tienes metas de ahorro</h3>
        <p className="text-slate-500 max-w-xs mb-8">
          Define objetivos financieros y rastrea tu progreso. ¡Empieza a ahorrar hoy!
        </p>
        <div className="text-sm text-slate-400">
          Usa el botón <span className="inline-block bg-primary-600 text-white rounded-full p-1 mx-1"><Plus size={10} /></span> para crear una meta.
        </div>
      </div>
    );
  }

  const getDaysRemaining = (deadline?: string) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days;
  };

  const formatMXN = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="grid grid-cols-1 gap-4">
        {goals.map((goal) => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          const isCompleted = progress >= 100;
          const isNear = progress >= 90 && !isCompleted;
          const daysLeft = getDaysRemaining(goal.deadline);
          const isOverdue = daysLeft !== null && daysLeft < 0;

          return (
            <motion.div
              key={goal.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="relative overflow-hidden group">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewDetails(goal)}>
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: goal.color }}
                    >
                      <Target size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg hover:text-primary-600 transition-colors">{goal.name}</h3>
                      {goal.deadline && (
                        <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500' : 'text-slate-500'}`}>
                          <Clock size={12} />
                          {isOverdue 
                            ? `Venció hace ${Math.abs(daysLeft!)} días` 
                            : `${daysLeft} días restantes`}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onViewDetails(goal)}
                      className="p-2 text-slate-400 hover:text-primary-600 hover:bg-slate-50 rounded-lg"
                      title="Ver Detalles"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => onEdit(goal)}
                      className="p-2 text-slate-400 hover:text-primary-600 hover:bg-slate-50 rounded-lg"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(goal.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Amounts */}
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-2xl font-bold text-slate-800">
                    {formatMXN(goal.currentAmount)}
                  </span>
                  <span className="text-sm font-medium text-slate-500">
                    de {formatMXN(goal.targetAmount)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden mb-4 border border-slate-50">
                  <motion.div 
                    className="h-full rounded-full relative"
                    style={{ backgroundColor: isCompleted ? '#10b981' : goal.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  >
                     <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </motion.div>
                </div>

                {/* Status & Actions */}
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">
                    {isCompleted ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle size={14} /> ¡Meta completada!
                      </span>
                    ) : isNear ? (
                      <span className="text-amber-500 flex items-center gap-1">
                        <AlertCircle size={14} /> ¡Casi lo logras!
                      </span>
                    ) : (
                      <span className="text-slate-400">{Math.round(progress)}% completado</span>
                    )}
                  </div>

                  {!isCompleted && (
                    <Button 
                      size="sm" 
                      onClick={() => onAddFunds(goal)}
                      className="bg-slate-800 hover:bg-slate-900 text-white shadow-none"
                    >
                      <Plus size={16} className="mr-1" />
                      Ahorrar
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};