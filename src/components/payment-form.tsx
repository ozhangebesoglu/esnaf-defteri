"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Customer } from "@/lib/types"

export const paymentSchema = z.object({
  customerId: z.string(),
  total: z.coerce.number().positive("Tutar pozitif bir sayı olmalıdır."),
  description: z.string().optional(),
  paymentMethod: z.enum(['cash', 'visa'], { required_error: "Lütfen bir ödeme yöntemi seçin." }),
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
        description: "",
        total: customer.balance > 0 ? customer.balance : ('' as any),
        paymentMethod: 'cash',
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
        <DialogFooter>
          <Button type="submit">Ödemeyi Kaydet</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
