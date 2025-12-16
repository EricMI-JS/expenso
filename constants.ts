import { Category, PaymentMethod } from "./types";

export const EXPENSE_CATEGORIES: Category[] = [
  'Alimentación',
  'Transporte',
  'Vivienda',
  'Servicios',
  'Entretenimiento',
  'Salud',
  'Compras',
  'Otros'
];

export const INCOME_CATEGORIES: Category[] = [
  'Salario',
  'Inversión',
  'Ventas',
  'Regalo',
  'Extra'
];

export const CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Efectivo',
  'Tarjeta Débito',
  'Tarjeta Crédito',
  'Transferencia'
];

export const CATEGORY_COLORS: Record<Category, string> = {
  // Expenses
  'Alimentación': '#F87171', // Red
  'Transporte': '#60A5FA', // Blue
  'Vivienda': '#34D399', // Emerald
  'Entretenimiento': '#A78BFA', // Violet
  'Salud': '#F472B6', // Pink
  'Servicios': '#FBBF24', // Amber
  'Compras': '#2DD4BF', // Teal
  'Otros': '#9CA3AF', // Gray
  
  // Income
  'Salario': '#10B981', // Green
  'Inversión': '#059669', // Dark Green
  'Ventas': '#34D399', // Emerald
  'Regalo': '#6EE7B7', // Light Emerald
  'Extra': '#A7F3D0' // Pale Emerald
};