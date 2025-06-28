"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ProductIcon } from "./product-icons"
import type { Product } from "@/lib/types"

export default function StockStatus({ products, onProductSelect }: { products: Product[], onProductSelect: (productId: string) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mevcut Stok Durumu</CardTitle>
        <CardDescription>Tüm ürünlerin anlık stok miktarları ve durumları. Detay için bir ürüne tıklayın.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Ürün</TableHead>
              <TableHead></TableHead>
              <TableHead className="text-right">Stok Miktarı (Adet/Kg)</TableHead>
              <TableHead className="text-right">Durum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? products.map((product) => (
              <TableRow key={product.id} onClick={() => onProductSelect(product.id)} className="cursor-pointer">
                <TableCell>
                  <ProductIcon type={product.type} />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-right font-mono font-medium">{product.stock}</TableCell>
                <TableCell className="text-right">
                  {product.stock <= 0 ? (
                     <Badge variant="destructive">Stokta Yok</Badge>
                  ) : product.stock <= product.lowStockThreshold ? (
                    <Badge variant="destructive" className="bg-amber-500 hover:bg-amber-600">Düşük Stok</Badge>
                  ) : (
                    <Badge variant="secondary">Yeterli</Badge>
                  )}
                </TableCell>
              </TableRow>
            )) : (
                 <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">Kayıtlı ürün bulunamadı.</TableCell>
                 </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
