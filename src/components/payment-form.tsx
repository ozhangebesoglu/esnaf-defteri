"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Customer } from "@/lib/types"

export const paymentSchema = z.object({
  customerId: z.string(),
  total: z.coerce.number().positive("Tutar pozitif bir sayı olmalıdır."),
  description: z.string().optional(),
})

interface PaymentFormProps {
    customer: Customer;
    setOpen: (open: boolean) => void;
    onSave: (data: z.infer<typeof paymentSchema>) => void;
}

export function PaymentForm({ customer, setOpen, onSave }: PaymentFormProps) {
  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
        customerId: customer.id,
        description: "Nakit Ödeme",
        total: customer.balance > 0 ? customer.balance : undefined,
    },
  })

  function onSubmit(values: z.infer<typeof paymentSchema>) {
    onSave(values);
    setOpen(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="total"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ödenen Tutar (₺)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="örn., 150.00" {...field} autoFocus />
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
                <Textarea placeholder="örn., 'Elden nakit alındı'" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit">Ödemeyi Kaydet</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
