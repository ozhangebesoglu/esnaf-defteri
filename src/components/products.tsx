"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/hooks/use-toast"
import { PlusCircle, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { products } from "@/lib/data"
import type { Product } from "@/lib/types"
import { ProductIcon } from "./product-icons"

const productSchema = z.object({
  name: z.string().min(2, "Ürün adı en az 2 karakter olmalıdır."),
  type: z.enum(['beef', 'pork', 'chicken'], {
    required_error: "Lütfen bir ürün tipi seçin.",
  }),
  cost: z.coerce.number().positive("Maliyet pozitif bir sayı olmalıdır."),
  price: z.coerce.number().positive("Satış fiyatı pozitif bir sayı olmalıdır."),
  lowStockThreshold: z.coerce.number().int().min(0, "Stok eşiği negatif olamaz."),
})

function ProductForm({ product, setOpen }: { product?: Product, setOpen: (open: boolean) => void }) {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: product || { name: "", type: "beef", cost: 0, price: 0, lowStockThreshold: 0 },
  })

  function onSubmit(values: z.infer<typeof productSchema>) {
    console.log(values)
    toast({
      title: `Ürün ${product ? 'Güncellendi' : 'Eklendi'}`,
      description: `${values.name} adlı ürün kaydedildi.`,
    })
    setOpen(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ürün Adı</FormLabel>
              <FormControl><Input placeholder="örn., Antrikot" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ürün Tipi</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Bir ürün tipi seçin" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="beef">Kırmızı Et</SelectItem>
                        <SelectItem value="pork">Şarküteri</SelectItem>
                        <SelectItem value="chicken">Beyaz Et</SelectItem>
                    </SelectContent>
                </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Maliyet Fiyatı (₺)</FormLabel>
                <FormControl><Input type="number" step="0.01" placeholder="örn., 600.00" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Satış Fiyatı (₺)</FormLabel>
                <FormControl><Input type="number" step="0.01" placeholder="örn., 850.00" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
            control={form.control}
            name="lowStockThreshold"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Düşük Stok Eşiği (Adet/Kg)</FormLabel>
                <FormControl><Input type="number" placeholder="örn., 5" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        <DialogFooter>
          <Button type="submit">Ürünü Kaydet</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

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
