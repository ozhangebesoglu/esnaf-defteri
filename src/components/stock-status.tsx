"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ProductIcon } from "./product-icons"
import { PlusCircle } from "lucide-react"
import type { Product, StockAdjustment } from "@/lib/types"
import { useIsMobile } from "@/hooks/use-mobile"
import { Skeleton } from "./ui/skeleton"


const stockEntrySchema = z.object({
  quantity: z.coerce.number().positive("Giriş miktarı pozitif bir sayı olmalıdır."),
  description: z.string().optional(),
})

function StockEntryForm({ product, setOpen, onSave }: {
  product: Product,
  setOpen: (open: boolean) => void,
  onSave: (data: Omit<StockAdjustment, 'id' | 'productName' | 'date' | 'userId'>) => void
}) {
  const form = useForm<z.infer<typeof stockEntrySchema>>({
    resolver: zodResolver(stockEntrySchema),
    defaultValues: {
      quantity: '' as any,
      description: "Tedarikçiden mal alımı",
    },
  })

  function onSubmit(values: z.infer<typeof stockEntrySchema>) {
    onSave({
      productId: product.id,
      quantity: values.quantity,
      description: values.description || "Stok Girişi",
      category: 'Yeni Stok Girişi',
    });
    setOpen(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Eklenecek Miktar (Adet/Kg)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder="örn., 10" {...field} autoFocus />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Açıklama (İsteğe Bağlı)</FormLabel>
              <FormControl>
                <Textarea placeholder="örn., 'Yeni mal geldi'" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit">Stok Ekle</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

interface StockStatusProps {
    products: Product[];
    onProductSelect: (productId: string) => void;
    onAddStockAdjustment: (data: Omit<StockAdjustment, 'id' | 'productName' | 'date' | 'userId'>) => void;
}

export default function StockStatus({ products, onProductSelect, onAddStockAdjustment }: StockStatusProps) {
    const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
    const [selectedProductForEntry, setSelectedProductForEntry] = useState<Product | null>(null);
    const isMobile = useIsMobile();

    const handleOpenDialog = (product: Product) => {
        setSelectedProductForEntry(product);
        setIsEntryDialogOpen(true);
    }
    
    const renderLoadingSkeleton = () => (
      <div className="space-y-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );

    const renderDesktopView = () => (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Ürün</TableHead>
            <TableHead></TableHead>
            <TableHead className="text-right">Stok Miktarı (Adet/Kg)</TableHead>
            <TableHead className="text-center">Durum</TableHead>
            <TableHead className="text-right w-[120px]">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length > 0 ? products.map((product) => (
            <TableRow key={product.id} className="group">
              <TableCell onClick={() => onProductSelect(product.id)} className="cursor-pointer">
                <ProductIcon type={product.type} />
              </TableCell>
              <TableCell onClick={() => onProductSelect(product.id)} className="font-medium cursor-pointer">{product.name}</TableCell>
              <TableCell onClick={() => onProductSelect(product.id)} className="text-right font-mono font-medium cursor-pointer">{product.stock}</TableCell>
              <TableCell onClick={() => onProductSelect(product.id)} className="text-center cursor-pointer">
                {product.stock <= 0 ? (
                   <Badge variant="destructive">Stokta Yok</Badge>
                ) : product.stock <= product.lowStockThreshold ? (
                  <Badge variant="destructive" className="bg-amber-500 hover:bg-amber-600">Düşük Stok</Badge>
                ) : (
                  <Badge variant="secondary">Yeterli</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={() => handleOpenDialog(product)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Stok Ekle
                </Button>
              </TableCell>
            </TableRow>
          )) : (
               <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">Kayıtlı ürün bulunamadı.</TableCell>
               </TableRow>
          )}
        </TableBody>
      </Table>
    );

    const renderMobileView = () => (
        <div className="space-y-3">
            {products.length > 0 ? products.map((product) => (
                <Card key={product.id}>
                    <CardContent className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => onProductSelect(product.id)}>
                            <ProductIcon type={product.type} />
                            <div className="space-y-1">
                                <p className="font-semibold">{product.name}</p>
                                <div className="text-sm">
                                    {product.stock <= 0 ? (
                                       <Badge variant="destructive">Stokta Yok</Badge>
                                    ) : product.stock <= product.lowStockThreshold ? (
                                      <Badge variant="destructive" className="bg-amber-500">Düşük Stok</Badge>
                                    ) : (
                                      <Badge variant="secondary">Yeterli</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                             <p className="font-mono font-bold text-lg">{product.stock}</p>
                             <Button size="sm" variant="outline" onClick={() => handleOpenDialog(product)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Stok Ekle
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )) : (
                <div className="h-24 text-center flex items-center justify-center">
                    <p className="text-muted-foreground">Kayıtlı ürün bulunamadı.</p>
                </div>
            )}
        </div>
    );

  return (
    <>
      <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedProductForEntry?.name} - Stok Girişi</DialogTitle>
            <DialogDescription>
              Bu ürüne yeni stok ekleyin. Bu işlem, stok hareketlerine 'Yeni Stok Girişi' olarak kaydedilecektir.
            </DialogDescription>
          </DialogHeader>
          {selectedProductForEntry && (
            <StockEntryForm
              product={selectedProductForEntry}
              setOpen={setIsEntryDialogOpen}
              onSave={onAddStockAdjustment}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <Card>
        <CardHeader>
          <CardTitle>Mevcut Stok Durumu</CardTitle>
          <CardDescription>Tüm ürünlerin anlık stok miktarları. Detay için bir ürüne, stok eklemek için butona tıklayın.</CardDescription>
        </CardHeader>
        <CardContent>
          {isMobile === undefined ? renderLoadingSkeleton() : (isMobile ? renderMobileView() : renderDesktopView())}
        </CardContent>
      </Card>
    </>
  )
}
