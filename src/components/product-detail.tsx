"use client"

import { useState } from "react"
import type { Product, StockAdjustment } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ProductIcon } from "./product-icons"
import { ArrowLeft, Pencil } from "lucide-react"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ProductForm } from "./product-form"


const categoryColors: { [key in StockAdjustment['category']]: string } = {
  'Bozulma': "bg-yellow-100 text-yellow-800",
  'Hırsızlık': "bg-red-100 text-red-800",
  "Veri Giriş Hatası": "bg-blue-100 text-blue-800",
  "Hatalı Ürün Alımı": "bg-purple-100 text-purple-800",
  'İndirim': "bg-green-100 text-green-800",
  'Diğer': "bg-gray-100 text-gray-800",
};


export default function ProductDetail({ product, adjustments, onBack, onUpdateProduct }: { 
  product: Product | undefined, 
  adjustments: StockAdjustment[], 
  onBack: () => void,
  onUpdateProduct: (data: Product) => void,
}) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
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

  const handleSave = (data: Product) => {
    onUpdateProduct(data);
  }

  return (
    <div className="grid gap-6">
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Ürünü Düzenle</DialogTitle>
              <DialogDescription>
                {product.name} ürününün detaylarını güncelle.
              </DialogDescription>
            </DialogHeader>
            <ProductForm product={product} setOpen={setIsEditDialogOpen} onSave={handleSave} />
          </DialogContent>
        </Dialog>

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
        <div className="ml-auto flex items-center gap-2">
            {product.stock <= product.lowStockThreshold ? (
                <Badge variant="destructive">Düşük Stok</Badge>
            ) : (
                <Badge variant="secondary">Yeterli Stok</Badge>
            )}
            <Button size="sm" variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                <Pencil className="h-4 w-4" />
                Düzenle
            </Button>
        </div>
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
                  <TableCell>{new Date(adj.date).toLocaleString('tr-TR')}</TableCell>
                   <TableCell>
                     <Badge variant="outline" className={`${categoryColors[adj.category]}`}>{adj.category}</Badge>
                   </TableCell>
                  <TableCell>{adj.description}</TableCell>
                  <TableCell className={`text-right font-bold font-mono text-lg ${adj.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
