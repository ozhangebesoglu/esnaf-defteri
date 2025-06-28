"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { products } from "@/lib/data"
import { ProductIcon } from "./product-icons"

export default function StockStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mevcut Stok Durumu</CardTitle>
        <CardDescription>Tüm ürünlerin anlık stok miktarları ve durumları.</CardDescription>
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
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <ProductIcon type={product.type} />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-right font-mono font-medium">{product.stock}</TableCell>
                <TableCell className="text-right">
                  {product.stock <= product.lowStockThreshold ? (
                    <Badge variant="destructive">Düşük Stok</Badge>
                  ) : (
                    <Badge variant="secondary">Yeterli</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
