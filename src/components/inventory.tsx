"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StockStatus from "./stock-status"
import StockAdjustments from "./stock-adjustments"
import Products from "./products"
import ProductDetail from "./product-detail"

export default function Inventory() {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  if (selectedProductId) {
    return <ProductDetail productId={selectedProductId} onBack={() => setSelectedProductId(null)} />
  }

  return (
    <Tabs defaultValue="status" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="status">Stok Durumu</TabsTrigger>
        <TabsTrigger value="movements">Stok Hareketleri</TabsTrigger>
        <TabsTrigger value="products">Ürünler</TabsTrigger>
      </TabsList>
      <TabsContent value="status">
        <StockStatus onProductSelect={setSelectedProductId} />
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
