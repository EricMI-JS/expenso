import React from 'react';
import { SavingsGoal, GoalTransaction } from '../types';
import { Button } from './ui/UI';
import { Trash2, Calendar, TrendingUp, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GoalDetailsProps {
  goal: SavingsGoal;
  onDeleteTransaction: (goalId: string, transactionId: string) => void;
}

export const GoalDetails: React.FC<GoalDetailsProps> = ({ goal, onDeleteTransaction }) => {
  const sortedHistory = [...goal.history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatMXN = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
        <div>
           <p className="text-sm text-slate-500">Progreso actual</p>
           <p className="text-2xl font-bold text-slate-800">
             {formatMXN(goal.currentAmount)}
             <span className="text-sm font-medium text-slate-400 mx-2">/</span>
             <span className="text-base text-slate-500">{formatMXN(goal.targetAmount)}</span>
           </p>
        </div>
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-sm"
          style={{ backgroundColor: goal.color }}
        >
          <TrendingUp size={24} />
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
           Historial de Aportes
           <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
             {goal.history.length}
           </span>
        </h4>
        
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          {sortedHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl">
              No hay movimientos registrados
            </div>
          ) : (
            <AnimatePresence>
              {sortedHistory.map((transaction) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center group"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800">{transaction.note || 'Aporte sin nota'}</span>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar size={10} />
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-emerald-600">
                      +{formatMXN(transaction.amount)}
                    </span>
                    <button
                      onClick={() => onDeleteTransaction(goal.id, transaction.id)}
                      className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Eliminar aporte"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};