"use client"

import { products, stockAdjustments } from "@/lib/data"
import type { Product, StockAdjustment } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ProductIcon } from "./product-icons"
import { ArrowLeft } from "lucide-react"
import { Badge } from "./ui/badge"

const categoryColors: { [key in StockAdjustment['category']]: string } = {
  'Bozulma': "bg-yellow-100 text-yellow-800",
  'Hırsızlık': "bg-red-100 text-red-800",
  "Veri Giriş Hatası": "bg-blue-100 text-blue-800",
  "Hatalı Ürün Alımı": "bg-purple-100 text-purple-800",
  'İndirim': "bg-green-100 text-green-800",
  'Diğer': "bg-gray-100 text-gray-800",
};


export default function ProductDetail({ productId, onBack }: { productId: string, onBack: () => void }) {
  const product = products.find(p => p.id === productId)
  const adjustments = stockAdjustments.filter(adj => adj.productId === productId)

  if (!product) {
    return (
      <div className="text-center">
        <p className="mb-4">Ürün bulunamadı.</p>
        <Button onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Listeye Geri Dön
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Geri</span>
        </Button>
        <div className="flex items-center gap-3">
             <ProductIcon type={product.type} />
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                {product.name}
            </h1>
        </div>
        {product.stock <= product.lowStockThreshold ? (
            <Badge variant="destructive" className="ml-auto sm:ml-0">Düşük Stok</Badge>
        ) : (
            <Badge variant="secondary" className="ml-auto sm:ml-0">Yeterli Stok</Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Stok Miktarı</CardDescription>
            <CardTitle className="text-4xl">{product.stock}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">Düşük stok eşiği: {product.lowStockThreshold}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Satış Fiyatı</CardDescription>
            <CardTitle className="text-4xl">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(product.price)}</CardTitle>
          </CardHeader>
           <CardContent><div className="text-xs text-muted-foreground">&nbsp;</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Maliyet Fiyatı</CardDescription>
            <CardTitle className="text-4xl">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(product.cost)}</CardTitle>
          </CardHeader>
           <CardContent><div className="text-xs text-muted-foreground">&nbsp;</div></CardContent>
        </Card>
         <Card>
          <CardHeader className="pb-2">
            <CardDescription>Kâr Marjı</CardDescription>
            <CardTitle className="text-4xl">%{product.cost > 0 ? (((product.price - product.cost) / product.cost) * 100).toFixed(0) : 'N/A'}</CardTitle>
          </CardHeader>
           <CardContent><div className="text-xs text-muted-foreground">Birim başına</div></CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Stok Hareket Geçmişi</CardTitle>
          <CardDescription>Bu ürüne ait tüm stok hareketleri.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead className="text-right">Miktar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjustments.length > 0 ? adjustments.map((adj) => (
                <TableRow key={adj.id}>
                  <TableCell>{adj.date}</TableCell>
                   <TableCell>
                     <Badge variant="outline" className={`${categoryColors[adj.category]}`}>{adj.category}</Badge>
                   </TableCell>
                  <TableCell>{adj.description}</TableCell>
                  <TableCell className={`text-right font-bold font-mono text-lg ${adj.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {adj.quantity > 0 ? `+${adj.quantity}` : adj.quantity}
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">Bu ürün için stok hareketi bulunamadı.</TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
