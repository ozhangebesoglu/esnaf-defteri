"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StockStatus from "./stock-status"
import StockAdjustments from "./stock-adjustments"
import Products from "./products"
import ProductDetail from "./product-detail"
import type { Product, StockAdjustment } from "@/lib/types"

interface InventoryProps {
    products: Product[];
    stockAdjustments: StockAdjustment[];
    onAddProduct: (data: Omit<Product, 'id' | 'stock'>) => void;
    onUpdateProduct: (data: Product) => void;
    onDeleteProduct: (id: string) => void;
    onAddStockAdjustment: (data: Omit<StockAdjustment, 'id' | 'productName' | 'date'>) => void;
    onUpdateStockAdjustment: (data: StockAdjustment) => void;
    onDeleteStockAdjustment: (id: string) => void;
}


export default function Inventory(props: InventoryProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  if (selectedProductId) {
    const product = props.products.find(p => p.id === selectedProductId);
    const adjustments = props.stockAdjustments.filter(a => a.productId === selectedProductId);
    return <ProductDetail 
              product={product} 
              adjustments={adjustments} 
              onBack={() => setSelectedProductId(null)}
              onUpdateProduct={props.onUpdateProduct}
           />
  }

  return (
    <Tabs defaultValue="status" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="status">Stok Durumu</TabsTrigger>
        <TabsTrigger value="movements">Stok Hareketleri</TabsTrigger>
        <TabsTrigger value="products">Ürünler</TabsTrigger>
      </TabsList>
      <TabsContent value="status">
        <StockStatus products={props.products} onProductSelect={setSelectedProductId} />
      </TabsContent>
      <TabsContent value="movements">
        <StockAdjustments 
            stockAdjustments={props.stockAdjustments}
            products={props.products}
            onAddStockAdjustment={props.onAddStockAdjustment}
            onUpdateStockAdjustment={props.onUpdateStockAdjustment}
            onDeleteStockAdjustment={props.onDeleteStockAdjustment}
        />
      </TabsContent>
      <TabsContent value="products">
        <Products 
            products={props.products}
            onAddProduct={props.onAddProduct}
            onUpdateProduct={props.onUpdateProduct}
            onDeleteProduct={props.onDeleteProduct}
        />
      </TabsContent>
    </Tabs>
  )
}
