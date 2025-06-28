"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Sales from "./sales"
import Expenses from "./expenses"

export default function Financials() {
  return (
    <Tabs defaultValue="sales" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="sales">Satışlar (Gelir)</TabsTrigger>
        <TabsTrigger value="expenses">Giderler</TabsTrigger>
      </TabsList>
      <TabsContent value="sales">
        <Sales />
      </TabsContent>
      <TabsContent value="expenses">
        <Expenses />
      </TabsContent>
    </Tabs>
  )
}
