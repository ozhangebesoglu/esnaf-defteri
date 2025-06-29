"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { Staff } from "@/lib/types"

export const staffSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır."),
  position: z.string().min(3, "Pozisyon en az 3 karakter olmalıdır."),
  salary: z.coerce.number().positive("Maaş pozitif bir sayı olmalıdır."),
  phone: z.string().optional(),
})

interface StaffFormProps {
    staff?: Staff;
    setOpen: (open: boolean) => void;
    onSave: (data: any) => void;
}

export function StaffForm({ staff, setOpen, onSave }: StaffFormProps) {
  const form = useForm<z.infer<typeof staffSchema>>({
    resolver: zodResolver(staffSchema),
    defaultValues: staff || { name: "", position: "", salary: '' as any, phone: "" },
  })

  function onSubmit(values: z.infer<typeof staffSchema>) {
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
              <FormLabel>Ad Soyad</FormLabel>
              <FormControl><Input placeholder="Ali Veli" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pozisyon</FormLabel>
              <FormControl><Input placeholder="Kasap Ustası" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="salary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maaş (Aylık, ₺)</FormLabel>
              <FormControl><Input type="number" placeholder="25000" {...field} /></FormControl>
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
        <DialogFooter>
          <Button type="submit">Personeli Kaydet</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
