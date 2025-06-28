"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Product } from "@/lib/types"

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Ürün adı en az 2 karakter olmalıdır."),
  type: z.enum(['beef', 'pork', 'chicken'], {
    required_error: "Lütfen bir ürün tipi seçin.",
  }),
  cost: z.coerce.number().positive("Maliyet pozitif bir sayı olmalıdır."),
  price: z.coerce.number().positive("Satış fiyatı pozitif bir sayı olmalıdır."),
  lowStockThreshold: z.coerce.number().int().min(0, "Stok eşiği negatif olamaz."),
  stock: z.coerce.number().int().optional(),
})

interface ProductFormProps {
    product?: Product;
    setOpen: (open: boolean) => void;
    onSave: (data: any) => void;
}

export function ProductForm({ product, setOpen, onSave }: ProductFormProps) {
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: product || { name: "", type: "beef", cost: 0, price: 0, lowStockThreshold: 10 },
  })

  function onSubmit(values: z.infer<typeof productSchema>) {
    onSave(values);
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
