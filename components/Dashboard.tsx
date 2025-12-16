import React, { useMemo } from 'react';
import { Expense } from '../types';
import { Card } from './ui/UI';
import { TrendingDown, TrendingUp, Wallet, AlertTriangle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardProps {
  expenses: Expense[];
  currentMonth: Date;
}

export const Dashboard: React.FC<DashboardProps> = ({ expenses, currentMonth }) => {
  const stats = useMemo(() => {
    // Separate expenses and income
    const incomeTransactions = expenses.filter(e => e.type === 'income');
    const expenseTransactions = expenses.filter(e => e.type === 'expense' || !e.type); // Handle legacy without type

    const totalSpent = expenseTransactions.reduce((acc, curr) => acc + curr.amount, 0);
    const totalIncome = incomeTransactions.reduce((acc, curr) => acc + curr.amount, 0);
    
    // Logic: Available funds are purely based on Income
    const totalAvailable = totalIncome;
    const remaining = totalAvailable - totalSpent;
    
    // Progress calculation
    // If no income, any spend is "infinite" progress, but we cap at 100 for UI.
    const progress = totalAvailable > 0 
      ? Math.min((totalSpent / totalAvailable) * 100, 100)
      : totalSpent > 0 ? 100 : 0;

    const isOverBudget = totalSpent > totalAvailable;
    const isNearBudget = progress > 85 && totalAvailable > 0;

    return { totalSpent, totalIncome, totalAvailable, remaining, progress, isOverBudget, isNearBudget };
  }, [expenses]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">
          Resumen de {currentMonth.toLocaleString('es-ES', { month: 'long' })}
        </h2>
      </header>

      {/* Main Budget Card */}
      <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-xl shadow-primary-500/20">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-primary-100 text-sm font-medium">Disponible (Total Ingresos)</p>
              <div className="flex items-baseline gap-2">
                 <h3 className="text-3xl font-bold mt-1">{formatCurrency(stats.totalAvailable)}</h3>
              </div>
            </div>
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-primary-50">
              <span>Gastado: {formatCurrency(stats.totalSpent)}</span>
              <span>Restante: {formatCurrency(stats.remaining)}</span>
            </div>
            
            <div className="h-3 bg-black/20 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full rounded-full ${stats.isOverBudget ? 'bg-red-400' : stats.isNearBudget ? 'bg-amber-400' : 'bg-white'}`}
                initial={{ width: 0 }}
                animate={{ width: `${stats.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            
            {stats.totalAvailable === 0 && stats.totalSpent === 0 ? (
              <div className="text-xs text-primary-100 mt-2 bg-white/10 p-2 rounded-lg inline-block">
                Registra tus ingresos para ver tu balance.
              </div>
            ) : (
              (stats.isNearBudget || stats.isOverBudget) && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-xs bg-black/20 p-2 rounded-lg mt-2 text-white/90"
                >
                  <AlertTriangle size={14} className={stats.isOverBudget ? "text-red-300" : "text-amber-300"} />
                  {stats.isOverBudget 
                    ? "Has gastado más de lo que ingresaste." 
                    : "Estás cerca de agotar tus ingresos."}
                </motion.div>
              )
            )}
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-black/5 rounded-full blur-2xl" />
      </Card>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-xl text-red-500">
            <ArrowDownCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Gastos</p>
            <p className="text-xl font-bold text-slate-800">
              {formatCurrency(stats.totalSpent)}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500">
            <ArrowUpCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Ingresos</p>
            <p className="text-xl font-bold text-slate-800">
               {formatCurrency(stats.totalIncome)}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};