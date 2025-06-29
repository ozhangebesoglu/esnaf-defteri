"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Customer, Order } from "@/lib/types"

export const saleSchema = z.object({
  id: z.string().optional(),
  customerId: z.string().min(1, "Lütfen bir müşteri seçin."),
  description: z.string().min(5, "Açıklama en az 5 karakter olmalıdır."),
  total: z.coerce.number().positive("Tutar pozitif bir sayı olmalıdır."),
  status: z.enum(['Tamamlandı', 'Bekliyor', 'İptal Edildi']).optional(),
  items: z.number().optional(),
  customerName: z.string().optional(),
  date: z.string().optional(),
})

interface SaleFormProps {
    sale?: Order;
    setOpen: (open: boolean) => void;
    onSave: (data: any) => void;
    customers: Customer[];
}

export function SaleForm({ sale, setOpen, onSave, customers }: SaleFormProps) {
  const form = useForm<z.infer<typeof saleSchema>>({
    resolver: zodResolver(saleSchema),
    defaultValues: sale || { description: "", total: '' as any, customerId: undefined },
  })

  function onSubmit(values: z.infer<typeof saleSchema>) {
    onSave(values);
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
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!sale}>
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
