"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { Customer } from "@/lib/types"

export const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır."),
  email: z.string().email("Geçersiz e-posta adresi.").optional().or(z.literal('')),
  balance: z.coerce.number().optional(), // Make balance optional for new customer form
  initialDebt: z.coerce.number().optional(), // Add a field for initial debt
})

interface CustomerFormProps {
    customer?: Customer;
    setOpen: (open: boolean) => void;
    onSave: (data: any) => void;
}

export function CustomerForm({ customer, setOpen, onSave }: CustomerFormProps) {
  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer || { name: "", email: "", balance: 0, initialDebt: 0 },
  })

  function onSubmit(values: z.infer<typeof customerSchema>) {
    const dataToSave = {
      ...values,
      initialDebt: values.initialDebt || 0,
      balance: customer ? values.balance : values.initialDebt,
    };
    onSave(dataToSave);
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
              <FormLabel>Ad Soyad</FormLabel>
              <FormControl><Input placeholder="Ahmet Yılmaz" {...field} /></FormControl>
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
              <FormControl><Input type="email" placeholder="ahmet.y@ornek.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {customer ? (
          <FormField
            control={form.control}
            name="balance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mevcut Bakiye</FormLabel>
                <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
           <FormField
            control={form.control}
            name="initialDebt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Başlangıç Bakiyesi / Devir Borcu (İsteğe Bağlı)</FormLabel>
                <FormControl><Input type="number" step="0.01" placeholder="Müşterinin size borcu varsa girin" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <DialogFooter>
          <Button type="submit">Müşteriyi Kaydet</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
