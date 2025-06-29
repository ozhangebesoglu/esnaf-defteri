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
  type: z.enum(['beef', 'processed', 'chicken', 'dairy'], {
    required_error: "Lütfen bir ürün tipi seçin.",
  }),
  cost: z.preprocess(
    (val) => val === "" ? undefined : val,
    z.coerce.number({invalid_type_error: "Geçerli bir sayı girin.", required_error: "Maliyet fiyatı zorunludur."}).positive("Maliyet pozitif bir sayı olmalıdır.")
  ),
  price: z.preprocess(
    (val) => val === "" ? undefined : val,
    z.coerce.number({invalid_type_error: "Geçerli bir sayı girin.", required_error: "Satış fiyatı zorunludur."}).positive("Satış fiyatı pozitif bir sayı olmalıdır.")
  ),
  lowStockThreshold: z.preprocess(
    (val) => val === "" ? undefined : val,
    z.coerce.number({invalid_type_error: "Geçerli bir sayı girin.", required_error: "Düşük stok eşiği zorunludur."}).int().min(0, "Stok eşiği negatif olamaz.")
  ),
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
    defaultValues: product || { name: "", type: "beef", cost: '' as any, price: '' as any, lowStockThreshold: '' as any },
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
                        <SelectItem value="processed">Şarküteri</SelectItem>
                        <SelectItem value="chicken">Beyaz Et</SelectItem>
                        <SelectItem value="dairy">Süt Ürünleri</SelectItem>
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
                <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
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
                <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
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
                <FormControl><Input type="number" {...field} /></FormControl>
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
