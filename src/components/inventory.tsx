"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StockStatus from "./stock-status"
import StockAdjustments from "./stock-adjustments"
import Products from "./products"

export default function Inventory() {
  return (
    <Tabs defaultValue="status" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="status">Stok Durumu</TabsTrigger>
        <TabsTrigger value="movements">Stok Hareketleri</TabsTrigger>
        <TabsTrigger value="products">Ürünler</TabsTrigger>
      </TabsList>
      <TabsContent value="status">
        <StockStatus />
      </TabsContent>
      <TabsContent value="movements">
        <StockAdjustments />
      </TabsContent>
      <TabsContent value="products">
        <Products />
      </TabsContent>
    </Tabs>
  )
}
