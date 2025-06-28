"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Sales from "./sales"
import Expenses from "./expenses"
import type { Order, Customer, Expense } from "@/lib/types"

interface FinancialsProps {
  orders: Order[];
  customers: Customer[];
  expenses: Expense[];
  onAddSale: (data: Omit<Order, 'id'|'customerName'|'date'|'status'|'items'>) => void;
  onUpdateSale: (data: Order) => void;
  onDeleteSale: (id: string) => void;
  onAddExpense: (data: Omit<Expense, 'id'|'date'>) => void;
  onUpdateExpense: (data: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export default function Financials(props: FinancialsProps) {
  return (
    <Tabs defaultValue="sales" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="sales">Veresiye Satışlar (Gelir)</TabsTrigger>
        <TabsTrigger value="expenses">Giderler</TabsTrigger>
      </TabsList>
      <TabsContent value="sales">
        <Sales 
          orders={props.orders}
          customers={props.customers}
          onAddSale={props.onAddSale}
          onUpdateSale={props.onUpdateSale}
          onDeleteSale={props.onDeleteSale}
        />
      </TabsContent>
      <TabsContent value="expenses">
        <Expenses 
          expenses={props.expenses}
          onAddExpense={props.onAddExpense}
          onUpdateExpense={props.onUpdateExpense}
          onDeleteExpense={props.onDeleteExpense}
        />
      </TabsContent>
    </Tabs>
  )
}
