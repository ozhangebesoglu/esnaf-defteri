"use client"

import Expenses from "./expenses"
import type { Expense } from "@/lib/types"

interface FinancialsProps {
  expenses: Expense[];
  onAddExpense: (data: Omit<Expense, 'id'|'date'>) => void;
  onUpdateExpense: (data: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export default function Financials(props: FinancialsProps) {
  return (
    <Expenses 
      expenses={props.expenses}
      onAddExpense={props.onAddExpense}
      onUpdateExpense={props.onUpdateExpense}
      onDeleteExpense={props.onDeleteExpense}
    />
  )
}
