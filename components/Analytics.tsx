import React, { useMemo, useState } from 'react';
import { Expense } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, TooltipProps } from 'recharts';
import { Card } from './ui/UI';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalyticsProps {
  expenses: Expense[];
}

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl text-sm">
        <p className="font-semibold text-slate-800 mb-1">{label || payload[0].name}</p>
        <p className="text-slate-600 font-medium">
          {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(payload[0].value as number)}
        </p>
      </div>
    );
  }
  return null;
};

export const Analytics: React.FC<AnalyticsProps> = ({ expenses }) => {
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');

  // Filter expenses and income
  const expenseDataOnly = useMemo(() => expenses.filter(e => e.type === 'expense' || !e.type), [expenses]);
  const incomeDataOnly = useMemo(() => expenses.filter(e => e.type === 'income'), [expenses]);

  // Helper to process chart data
  const getCategoryData = (data: Expense[]) => {
    const counts: Record<string, number> = {};
    data.forEach(e => {
      counts[e.category] = (counts[e.category] || 0) + e.amount;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const getDailyData = (data: Expense[]) => {
    const counts: Record<string, number> = {};
    const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sorted.forEach(e => {
      const day = new Date(e.date).getDate();
      const key = `Día ${day}`;
      counts[key] = (counts[key] || 0) + e.amount;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const chartData = useMemo(() => {
    const sourceData = activeTab === 'expense' ? expenseDataOnly : incomeDataOnly;
    return {
      category: getCategoryData(sourceData),
      daily: getDailyData(sourceData),
      total: sourceData.reduce((acc, curr) => acc + curr.amount, 0)
    };
  }, [activeTab, expenseDataOnly, incomeDataOnly]);

  const isEmpty = chartData.total === 0;
  const barColor = activeTab === 'expense' ? '#ef4444' : '#10b981';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Tabs */}
      <div className="flex bg-slate-200/50 p-1 rounded-xl mb-6">
        <button
          onClick={() => setActiveTab('expense')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'expense' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Gastos
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'income' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Ingresos
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isEmpty ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-64 text-slate-400"
          >
            <p>No hay {activeTab === 'expense' ? 'gastos' : 'ingresos'} registrados.</p>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <Card>
              <h3 className="text-lg font-bold text-slate-800 mb-6">
                {activeTab === 'expense' ? 'Gastos' : 'Ingresos'} por Categoría
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.category}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.category.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] || '#9CA3AF'} 
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {chartData.category.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-md">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] || '#9CA3AF' }}
                    />
                    {entry.name} ({Math.round((entry.value / chartData.total) * 100)}%)
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-bold text-slate-800 mb-6">Evolución Diaria</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.daily} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 10, fill: '#64748b' }} 
                      axisLine={false} 
                      tickLine={false}
                      interval={Math.floor(chartData.daily.length / 5)} 
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: '#64748b' }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                    <Bar 
                      dataKey="value" 
                      fill={barColor} 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};