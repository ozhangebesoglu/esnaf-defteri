"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { Supplier } from "@/lib/types"

export const supplierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Firma adı en az 2 karakter olmalıdır."),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Geçersiz e-posta adresi.").optional().or(z.literal('')),
})

interface SupplierFormProps {
    supplier?: Supplier;
    setOpen: (open: boolean) => void;
    onSave: (data: any) => void;
}

export function SupplierForm({ supplier, setOpen, onSave }: SupplierFormProps) {
  const form = useForm<z.infer<typeof supplierSchema>>({
    resolver: zodResolver(supplierSchema),
    defaultValues: supplier || { name: "", contactPerson: "", phone: "", email: "" },
  })

  function onSubmit(values: z.infer<typeof supplierSchema>) {
    onSave(values);
    setOpen(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Firma Adı</FormLabel>
              <FormControl><Input placeholder="Merkez Et A.Ş." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactPerson"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Yetkili Kişi (İsteğe Bağlı)</FormLabel>
              <FormControl><Input placeholder="Hakan Güçlü" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefon (İsteğe Bağlı)</FormLabel>
              <FormControl><Input placeholder="0555 123 4567" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-posta Adresi (İsteğe Bağlı)</FormLabel>
              <FormControl><Input type="email" placeholder="iletisim@firma.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit">Tedarikçiyi Kaydet</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
