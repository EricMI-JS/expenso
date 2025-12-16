import React, { useState } from 'react';
import { Expense, Category } from '../types';
import { CATEGORIES, CATEGORY_COLORS } from '../constants';
import { Input, Select, Button } from './ui/UI';
import { Search, Filter, Edit2, Trash2, Calendar, ArrowUpRight, ArrowDownLeft, ChevronDown, CreditCard, AlignLeft, CalendarClock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredExpenses = expenses
    .filter(e => {
      const matchesSearch = e.note?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            e.amount.toString().includes(searchTerm);
      const matchesCategory = filterCategory === 'all' || e.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Group by date
  const groupedExpenses = filteredExpenses.reduce((groups, expense) => {
    const date = expense.date.split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(expense);
    return groups;
  }, {} as Record<string, Expense[]>);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Header */}
      <div className="flex flex-col gap-3 sticky top-0 bg-slate-50 z-10 pt-2 pb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar movimientos..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant={showFilters ? 'primary' : 'secondary'} 
            onClick={() => setShowFilters(!showFilters)}
            className="px-3"
          >
            <Filter size={18} />
          </Button>
        </div>
        
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                options={[
                  { value: 'all', label: 'Todas las categorías' },
                  ...CATEGORIES.map(c => ({ value: c, label: c }))
                ]}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* List */}
      <div className="space-y-6 pb-20">
        {Object.keys(groupedExpenses).length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p>No se encontraron movimientos</p>
          </div>
        ) : (
          Object.entries(groupedExpenses).sort((a, b) => b[0].localeCompare(a[0])).map(([date, items]: [string, Expense[]]) => (
            <div key={date} className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                <Calendar size={12} />
                {new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <AnimatePresence initial={false}>
                {items.map((expense) => {
                  const isIncome = expense.type === 'income';
                  const isExpanded = expandedId === expense.id;

                  return (
                    <motion.div
                      key={expense.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => toggleExpand(expense.id)}
                      className={`group bg-white rounded-xl shadow-sm border transition-all cursor-pointer overflow-hidden ${isExpanded ? 'ring-2 ring-primary-100 border-primary-200' : 'border-slate-100 hover:shadow-md'}`}
                    >
                      {/* Main Row */}
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0 relative"
                            style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
                          >
                            {expense.category.charAt(0)}
                            <div className={`absolute -bottom-1 -right-1 rounded-full p-0.5 border-2 border-white ${isIncome ? 'bg-emerald-500' : 'bg-red-400'}`}>
                               {isIncome ? <ArrowUpRight size={10} color="white" /> : <ArrowDownLeft size={10} color="white" />}
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{expense.category}</p>
                            <p className="text-sm text-slate-500 line-clamp-1">
                              {expense.note ? expense.note : <span className="italic opacity-50">Sin nota</span>}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={`font-bold ${isIncome ? 'text-emerald-600' : 'text-slate-800'}`}>
                            {isIncome ? '+' : ''}{expense.amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                          </span>
                          <motion.div 
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            className="text-slate-400"
                          >
                            <ChevronDown size={18} />
                          </motion.div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                          >
                            <div className="px-4 pb-4 pt-0 border-t border-slate-50 bg-slate-50/50">
                              <div className="grid gap-3 pt-4 text-sm text-slate-600">
                                
                                {expense.note && (
                                  <div className="flex gap-3 items-start">
                                    <AlignLeft size={16} className="mt-0.5 text-slate-400 shrink-0" />
                                    <div>
                                      <p className="font-medium text-slate-700 text-xs mb-0.5 uppercase tracking-wide">Nota</p>
                                      <p className="bg-white p-2 rounded-lg border border-slate-100 text-slate-800 leading-relaxed">
                                        {expense.note}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="flex gap-3 items-center">
                                    <CreditCard size={16} className="text-slate-400 shrink-0" />
                                    <div>
                                      <p className="font-medium text-slate-700 text-xs uppercase tracking-wide">Método</p>
                                      <p>{expense.method}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-3 items-center">
                                    <CalendarClock size={16} className="text-slate-400 shrink-0" />
                                    <div>
                                      <p className="font-medium text-slate-700 text-xs uppercase tracking-wide">Fecha</p>
                                      <p>{new Date(expense.date).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Actions Bar */}
                              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-200/50">
                                <Button 
                                  size="sm" 
                                  variant="secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(expense);
                                  }}
                                  className="text-xs h-8"
                                >
                                  <Edit2 size={14} className="mr-1.5" /> Editar
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="danger" // Using danger variant implies red styles
                                  className="text-xs h-8 bg-white text-red-600 border border-red-100 hover:bg-red-50 hover:text-red-700 shadow-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(expense.id);
                                  }}
                                >
                                  <Trash2 size={14} className="mr-1.5" /> Eliminar
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
};