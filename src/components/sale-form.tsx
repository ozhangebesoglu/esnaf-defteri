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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Customer, Order } from "@/lib/types"

export const saleSchema = z.object({
  id: z.string().optional(),
  customerId: z.string().min(1, "Lütfen bir müşteri seçin."),
  description: z.string().min(5, "Açıklama en az 5 karakter olmalıdır."),
  total: z.coerce.number().refine(val => val !== 0, "Tutar 0 olamaz."),
  status: z.enum(['Tamamlandı', 'Bekliyor', 'İptal Edildi']).optional(),
  items: z.number().optional(),
  customerName: z.string().optional(),
  date: z.string().optional(),
  paymentMethod: z.enum(['cash', 'visa']).optional(),
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
    defaultValues: sale ? { ...sale, total: Math.abs(sale.total) } : { description: "", total: '' as any, customerId: undefined },
  })

  function onSubmit(values: z.infer<typeof saleSchema>) {
    // If we are editing, preserve the sign of the original total
    if (sale) {
      values.total = Math.abs(values.total) * Math.sign(sale.total);
    }
    onSave(values);
    setOpen(false)
  }

  const isPayment = sale && sale.total < 0;

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
        {isPayment && (
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Ödeme Yöntemi</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl><RadioGroupItem value="cash" /></FormControl>
                      <FormLabel className="font-normal">Nakit</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl><RadioGroupItem value="visa" /></FormControl>
                      <FormLabel className="font-normal">Visa/POS</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <DialogFooter>
          <Button type="submit">İşlemi Kaydet</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
