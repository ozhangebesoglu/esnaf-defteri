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
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { recentOrders, customers } from "@/lib/data"
import type { Order } from "@/lib/types"

const saleSchema = z.object({
  customerId: z.string().min(1, "Lütfen bir müşteri seçin."),
  description: z.string().min(5, "Açıklama en az 5 karakter olmalıdır."),
  total: z.coerce.number().positive("Tutar pozitif bir sayı olmalıdır."),
})

function SaleForm({ sale, setOpen }: { sale?: Order, setOpen: (open: boolean) => void }) {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof saleSchema>>({
    resolver: zodResolver(saleSchema),
    defaultValues: sale || { description: "" },
  })

  function onSubmit(values: z.infer<typeof saleSchema>) {
    console.log(values)
    toast({
      title: `Satış ${sale ? 'Güncellendi' : 'Eklendi'}`,
      description: "Satış işlemi başarıyla kaydedildi.",
    })
    setOpen(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Müşteri</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Bir müşteri seçin" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Açıklama / Satılan Ürünler</FormLabel>
              <FormControl>
                <Textarea placeholder="örn., 2kg kıyma, 1kg antrikot" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="total"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Toplam Tutar (₺)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="örn., 350.75" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit">Satışı Kaydet</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export default function Sales() {
  const [open, setOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Order | undefined>(undefined);

  const handleOpenDialog = (sale?: Order) => {
    setSelectedSale(sale);
    setOpen(true);
  };

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'Tamamlandı': return 'default'
      case 'Bekliyor': return 'secondary'
      case 'İptal Edildi': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Satışlar</CardTitle>
          <CardDescription>İşletmenizin tüm satış işlemlerinin kaydı.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => { if(!isOpen) setSelectedSale(undefined); setOpen(isOpen);}}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Yeni Satış
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedSale ? 'Satışı Düzenle' : 'Yeni Satış Ekle'}</DialogTitle>
              <DialogDescription>
                 {selectedSale ? `${selectedSale.id} numaralı satışı düzenleyin.` : 'Yeni bir satış işlemi oluşturun. Bu işlem müşterinin cari hesabına da işlenecektir.'}
              </DialogDescription>
            </DialogHeader>
            <SaleForm sale={selectedSale} setOpen={setOpen} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sipariş No</TableHead>
              <TableHead>Müşteri</TableHead>
              <TableHead className="text-right">Tutar</TableHead>
              <TableHead className="text-center">Durum</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell className="text-right font-mono">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(order.total)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                </TableCell>
                 <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(order)}>
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
