"use client"

import { useState } from "react"
import { PlusCircle, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { products } from "@/lib/data"
import type { Product } from "@/lib/types"
import { ProductIcon } from "./product-icons"
import { ProductForm } from "./product-form"

export default function Products() {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

  const handleOpenDialog = (product?: Product) => {
    setSelectedProduct(product);
    setOpen(true);
  }

  const getProductTypeName = (type: Product['type']) => {
    switch (type) {
        case 'beef': return 'Kırmızı Et';
        case 'pork': return 'Şarküteri';
        case 'chicken': return 'Beyaz Et';
        default: return 'Bilinmeyen';
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Ürünler</CardTitle>
          <CardDescription>İşletmenizdeki ürünleri, fiyatlarını ve stok bilgilerini yönetin.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => { if(!isOpen) setSelectedProduct(undefined); setOpen(isOpen);}}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ürün Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</DialogTitle>
              <DialogDescription>
                {selectedProduct ? `${selectedProduct.name} ürününün detaylarını güncelle.` : 'Kayıtlarınıza yeni bir ürün ekleyin.'}
              </DialogDescription>
            </DialogHeader>
            <ProductForm product={selectedProduct} setOpen={setOpen} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">İkon</TableHead>
              <TableHead>Ürün Adı</TableHead>
              <TableHead>Tipi</TableHead>
              <TableHead className="text-right">Satış Fiyatı</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <ProductIcon type={product.type} />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{getProductTypeName(product.type)}</TableCell>
                <TableCell className="text-right font-mono">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(product.price)}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(product)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
