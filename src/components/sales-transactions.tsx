"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Sales from "./sales"
import Restaurant from "./restaurant"
import type { Order, Customer } from "@/lib/types"

interface SalesTransactionsProps {
  creditSales: Order[];
  cashSales: Order[];
  customers: Customer[];
  onAddSale: (data: Omit<Order, 'id'|'customerName'|'date'|'status'|'items'|'userId'>) => void;
  onUpdateSale: (data: Order) => void;
  onDeleteSale: (id: string) => void;
  onAddCashSale: (data: { description: string, total: number }) => void;
}

export default function SalesTransactions({
  creditSales,
  cashSales,
  customers,
  onAddSale,
  onUpdateSale,
  onDeleteSale,
  onAddCashSale
}: SalesTransactionsProps) {
  return (
    <Tabs defaultValue="credit" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="credit">Veresiye İşlemleri</TabsTrigger>
        <TabsTrigger value="cash">Peşin Satışlar (Tezgah)</TabsTrigger>
      </TabsList>
      <TabsContent value="credit">
        <Sales 
          orders={creditSales}
          customers={customers}
          onAddSale={onAddSale}
          onUpdateSale={onUpdateSale}
          onDeleteSale={onDeleteSale}
        />
      </TabsContent>
      <TabsContent value="cash">
        <Restaurant 
          cashSales={cashSales}
          onAddCashSale={onAddCashSale}
          onDeleteSale={onDeleteSale}
        />
      </TabsContent>
    </Tabs>
  )
}
