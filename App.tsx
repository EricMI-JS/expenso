import React, { useState, useEffect, useMemo } from 'react';
import { Toaster, toast } from 'sonner';
import { loadState, saveState } from './services/storage';
import { apiService } from './services/api';
import { AppState, Expense, ViewType, SavingsGoal, GoalTransaction } from './types';
import { Dashboard } from './components/Dashboard';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseForm } from './components/ExpenseForm';
import { Analytics } from './components/Analytics';
import { SavingsGoals } from './components/SavingsGoals';
import { GoalDetails } from './components/GoalDetails';
import { GoalForm } from './components/GoalForm';
import { Button, Modal, Input } from './components/ui/UI';
import { Plus, LayoutDashboard, List, PieChart, Target } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({ expenses: [], goals: [] });
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  
  // Modal States - Expenses
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  // Modal States - Goals
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  
  // Modal States - Goal Deposit
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositSource, setDepositSource] = useState('');

  // Modal States - Goal Details
  const [isGoalDetailsOpen, setIsGoalDetailsOpen] = useState(false);
  const [viewingGoal, setViewingGoal] = useState<SavingsGoal | null>(null);

  // Date Filtering State
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Load initial data
  useEffect(() => {
    const initializeData = async () => {
      try {
        const initialState = await loadState();
        setState(initialState);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, []);

  // Persist state on change (only for localStorage mode)
  useEffect(() => {
    if (!loading) {
      saveState(state);
    }
  }, [state, loading]);

  // Derived state for current month expenses
  const currentMonthExpenses = useMemo(() => {
    return state.expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === selectedMonth.getMonth() && 
             d.getFullYear() === selectedMonth.getFullYear();
    });
  }, [state.expenses, selectedMonth]);

  // --- Actions: Expenses ---
  const handleSaveExpense = async (expenseData: Expense | Omit<Expense, 'id'>) => {
    try {
      if ('id' in expenseData && expenseData.id) {
        // Edit
        const updatedExpense = await apiService.updateExpense(expenseData.id, expenseData as Expense);
        setState(prev => ({
          ...prev,
          expenses: prev.expenses.map(e => e.id === expenseData.id ? updatedExpense : e)
        }));
      } else {
        // Add
        const newExpense = await apiService.createExpense(expenseData);
        setState(prev => ({
          ...prev,
          expenses: [newExpense, ...prev.expenses]
        }));
      }
      setIsFormOpen(false);
      setEditingExpense(null);
    } catch (error) {
      console.error('Failed to save expense:', error);
      toast.error('Error al guardar el gasto. Inténtalo de nuevo.');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    toast.custom((t) => (
      <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col gap-3 border border-slate-200">
        <p className="font-semibold text-slate-900">¿Estás seguro de eliminar este gasto?</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t)}
            className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={async () => {
              try {
                await apiService.deleteExpense(id);
                setState(prev => ({
                  ...prev,
                  expenses: prev.expenses.filter(e => e.id !== id)
                }));
                toast.dismiss(t);
                toast.success('Gasto eliminado correctamente');
              } catch (error) {
                console.error('Failed to delete expense:', error);
                toast.error('Error al eliminar el gasto. Inténtalo de nuevo.');
              }
            }}
            className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    ));
  };

  // --- Actions: Goals ---
  const handleSaveGoal = async (goalData: SavingsGoal | Omit<SavingsGoal, 'id'>) => {
    try {
      if ('id' in goalData && goalData.id) {
        // Edit
        const updatedGoal = await apiService.updateGoal(goalData.id, goalData as Omit<SavingsGoal, 'history'>);
        setState(prev => ({
          ...prev,
          goals: prev.goals.map(g => g.id === goalData.id ? updatedGoal : g)
        }));
      } else {
        // Add
        const newGoal = await apiService.createGoal(goalData);
        setState(prev => ({
          ...prev,
          goals: [...prev.goals, newGoal]
        }));
      }
      setIsGoalFormOpen(false);
      setEditingGoal(null);
    } catch (error) {
      console.error('Failed to save goal:', error);
      toast.error('Error al guardar la meta. Inténtalo de nuevo.');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    toast.custom((t) => (
      <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col gap-3 border border-slate-200">
        <p className="font-semibold text-slate-900">¿Eliminar esta meta de ahorro?</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t)}
            className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={async () => {
              try {
                await apiService.deleteGoal(id);
                setState(prev => ({
                  ...prev,
                  goals: prev.goals.filter(g => g.id !== id)
                }));
                toast.dismiss(t);
                toast.success('Meta eliminada correctamente');
              } catch (error) {
                console.error('Failed to delete goal:', error);
                toast.error('Error al eliminar la meta. Inténtalo de nuevo.');
              }
            }}
            className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    ));
  };

  const openDepositModal = (goal: SavingsGoal) => {
    setSelectedGoalId(goal.id);
    setDepositAmount('');
    setDepositSource('');
    setIsDepositModalOpen(true);
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (selectedGoalId && !isNaN(amount) && amount > 0) {
      try {
        const newTransaction = await apiService.addGoalDeposit(selectedGoalId, {
          amount,
          note: depositSource || 'Aporte manual'
        });

        setState(prev => ({
          ...prev,
          goals: prev.goals.map(g => {
            if (g.id === selectedGoalId) {
              return {
                ...g,
                currentAmount: g.currentAmount + amount,
                history: [...(g.history || []), newTransaction]
              };
            }
            return g;
          })
        }));
        setIsDepositModalOpen(false);
        setSelectedGoalId(null);
      } catch (error) {
        console.error('Failed to add deposit:', error);
        toast.error('Error al agregar el depósito. Inténtalo de nuevo.');
      }
    }
  };

  const handleViewGoalDetails = (goal: SavingsGoal) => {
    setViewingGoal(goal);
    setIsGoalDetailsOpen(true);
  };

  const handleDeleteGoalTransaction = async (goalId: string, transactionId: string) => {
    toast.custom((t) => (
      <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col gap-3 border border-slate-200">
        <p className="font-semibold text-slate-900">¿Eliminar este aporte? Se restará el monto del total acumulado.</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t)}
            className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={async () => {
              try {
                await apiService.deleteGoalDeposit(goalId, transactionId);

                setState(prev => {
                  const updatedGoals = prev.goals.map(g => {
                    if (g.id !== goalId) return g;
                    
                    const txToDelete = g.history.find(t => t.id === transactionId);
                    if (!txToDelete) return g;

                    return {
                      ...g,
                      currentAmount: g.currentAmount - txToDelete.amount,
                      history: g.history.filter(t => t.id !== transactionId)
                    };
                  });

                  // Update the currently viewed goal so the modal updates immediately
                  const updatedViewingGoal = updatedGoals.find(g => g.id === goalId);
                  if (updatedViewingGoal) setViewingGoal(updatedViewingGoal);

                  return { ...prev, goals: updatedGoals };
                });
                toast.dismiss(t);
                toast.success('Aporte eliminado correctamente');
              } catch (error) {
                console.error('Failed to delete goal transaction:', error);
                toast.error('Error al eliminar el aporte. Inténtalo de nuevo.');
              }
            }}
            className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    ));
  };

  // --- General ---
  const changeMonth = (offset: number) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + offset);
    setSelectedMonth(newDate);
  };

  const handleFloatingAction = () => {
    if (currentView === 'goals') {
      setEditingGoal(null);
      setIsGoalFormOpen(true);
    } else {
      setEditingExpense(null);
      setIsFormOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-0 md:pl-64">
      <Toaster position="top-right" richColors />
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando datos...</p>
          </div>
        </div>
      ) : (
        <>
      
      {/* Desktop Sidebar / Mobile Hidden */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-20">
        <div className="p-6">
          <h1 className="text-2xl font-extrabold text-primary-600 flex items-center gap-2">
            <span className="w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center text-lg">E</span>
            Expenso
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <NavButton 
            active={currentView === 'dashboard'} 
            onClick={() => setCurrentView('dashboard')} 
            icon={<LayoutDashboard size={20} />} 
            label="Resumen" 
          />
          <NavButton 
            active={currentView === 'history'} 
            onClick={() => setCurrentView('history')} 
            icon={<List size={20} />} 
            label="Movimientos" 
          />
          <NavButton 
            active={currentView === 'goals'} 
            onClick={() => setCurrentView('goals')} 
            icon={<Target size={20} />} 
            label="Metas de Ahorro" 
          />
          <NavButton 
            active={currentView === 'analytics'} 
            onClick={() => setCurrentView('analytics')} 
            icon={<PieChart size={20} />} 
            label="Análisis" 
          />
        </nav>
        <div className="p-4 border-t border-slate-100">
           <div className="text-xs text-slate-400 text-center">v1.3.0</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6">
           <h1 className="text-xl font-bold text-slate-800">Expenso</h1>
           {/* Date Navigator for Mobile */}
           {currentView !== 'goals' && (
             <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-100">
                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-50 rounded"><List size={16} className="rotate-180" /></button>
                <span className="text-xs font-medium w-24 text-center">{selectedMonth.toLocaleString('es-ES', { month: 'short', year: 'numeric' })}</span>
                <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-50 rounded"><List size={16} /></button>
             </div>
           )}
        </div>

        {/* Date Navigator Desktop (Hide on Goals view) */}
        {currentView !== 'goals' && (
          <div className="hidden md:flex justify-end mb-4">
            <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                <button onClick={() => changeMonth(-1)} className="text-slate-400 hover:text-primary-600 transition-colors">Anterior</button>
                <span className="font-semibold text-slate-700 w-32 text-center capitalize">
                  {selectedMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => changeMonth(1)} className="text-slate-400 hover:text-primary-600 transition-colors">Siguiente</button>
            </div>
          </div>
        )}

        {/* Headers for specific views */}
        {currentView === 'goals' && (
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-slate-800">Metas de Ahorro</h2>
          </div>
        )}

        {/* Views */}
        <div className="min-h-[60vh]">
          {currentView === 'dashboard' && (
            <Dashboard 
              expenses={currentMonthExpenses} 
              currentMonth={selectedMonth}
            />
          )}
          {currentView === 'history' && (
            <ExpenseList 
              expenses={currentMonthExpenses} 
              onEdit={(expense) => {
                setEditingExpense(expense);
                setIsFormOpen(true);
              }}
              onDelete={handleDeleteExpense}
            />
          )}
          {currentView === 'goals' && (
            <SavingsGoals 
              goals={state.goals || []}
              onEdit={(goal) => {
                setEditingGoal(goal);
                setIsGoalFormOpen(true);
              }}
              onDelete={handleDeleteGoal}
              onAddFunds={openDepositModal}
              onViewDetails={handleViewGoalDetails}
            />
          )}
          {currentView === 'analytics' && (
            <Analytics expenses={currentMonthExpenses} />
          )}
        </div>
      </main>

      {/* Floating Action Button (Mobile & Desktop) */}
      <div className="fixed bottom-24 md:bottom-10 right-4 md:right-10 z-30">
        <button 
          onClick={handleFloatingAction}
          className="bg-primary-600 text-white p-4 rounded-full shadow-lg shadow-primary-600/40 hover:bg-primary-700 hover:scale-110 transition-all duration-200"
          aria-label={currentView === 'goals' ? "Nueva Meta" : "Nuevo Gasto"}
        >
          {currentView === 'goals' ? <Target size={28} /> : <Plus size={28} />}
        </button>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 p-2 grid grid-cols-4 gap-1 z-20 pb-safe">
        <MobileNavButton 
          active={currentView === 'dashboard'} 
          onClick={() => setCurrentView('dashboard')} 
          icon={<LayoutDashboard size={24} />} 
          label="Inicio" 
        />
        <MobileNavButton 
          active={currentView === 'history'} 
          onClick={() => setCurrentView('history')} 
          icon={<List size={24} />} 
          label="Movimientos" 
        />
        <MobileNavButton 
          active={currentView === 'goals'} 
          onClick={() => setCurrentView('goals')} 
          icon={<Target size={24} />} 
          label="Metas" 
        />
        <MobileNavButton 
          active={currentView === 'analytics'} 
          onClick={() => setCurrentView('analytics')} 
          icon={<PieChart size={24} />} 
          label="Gráficos" 
        />
      </div>

      {/* --- Modals --- */}
      
      {/* Expense Form */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title={editingExpense ? "Editar Movimiento" : "Nuevo Movimiento"}
      >
        <ExpenseForm 
          initialData={editingExpense} 
          onSave={handleSaveExpense}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* Goal Form */}
      <Modal
        isOpen={isGoalFormOpen}
        onClose={() => setIsGoalFormOpen(false)}
        title={editingGoal ? "Editar Meta" : "Nueva Meta de Ahorro"}
      >
        <GoalForm
          initialData={editingGoal}
          onSave={handleSaveGoal}
          onCancel={() => setIsGoalFormOpen(false)}
        />
      </Modal>

      {/* Add Funds Modal */}
      <Modal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        title="Añadir Fondos a Meta"
      >
        <form onSubmit={handleDeposit} className="space-y-4">
          <Input 
            label="Monto a depositar"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            required
            autoFocus
          />
          <Input 
            label="Origen / Nota"
            placeholder="Ej. Ahorro quincenal, Venta extra..."
            value={depositSource}
            onChange={(e) => setDepositSource(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="ghost" onClick={() => setIsDepositModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Añadir Fondos</Button>
          </div>
        </form>
      </Modal>

      {/* Goal Details Modal */}
      <Modal
        isOpen={isGoalDetailsOpen}
        onClose={() => setIsGoalDetailsOpen(false)}
        title={viewingGoal?.name || "Detalles de Meta"}
      >
        {viewingGoal && (
          <GoalDetails 
            goal={viewingGoal} 
            onDeleteTransaction={handleDeleteGoalTransaction} 
          />
        )}
      </Modal>

        </>
      )}
    </div>
  );
};

// Subcomponents for Navigation
const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const MobileNavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${active ? 'text-primary-600' : 'text-slate-400'}`}
  >
    {icon}
    <span className="text-[10px] mt-1 font-medium">{label}</span>
  </button>
);

export default App;