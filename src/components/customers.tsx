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
import { customers } from "@/lib/data"
import type { Customer } from "@/lib/types"

const customerSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır."),
  email: z.string().email("Geçersiz e-posta adresi."),
  balance: z.coerce.number().optional(),
})

function CustomerForm({ customer, setOpen }: { customer?: Customer, setOpen: (open: boolean) => void }) {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer || { name: "", email: "", balance: 0 },
  })

  function onSubmit(values: z.infer<typeof customerSchema>) {
    console.log(values)
    toast({
      title: `Müşteri ${customer ? 'Güncellendi' : 'Eklendi'}`,
      description: `${values.name} adlı müşteri kaydedildi.`,
    })
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
              <FormLabel>E-posta Adresi</FormLabel>
              <FormControl><Input type="email" placeholder="ahmet.y@ornek.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="balance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mevcut Bakiye</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit">Müşteriyi Kaydet</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}


export default function Customers() {
  const [open, setOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);

  const handleOpenDialog = (customer?: Customer) => {
    setSelectedCustomer(customer);
    setOpen(true);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Cari Hesaplar</CardTitle>
          <CardDescription>Müşteri borç ve alacaklarını yönetin.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Müşteri Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedCustomer ? 'Müşteriyi Düzenle' : 'Yeni Müşteri Ekle'}</DialogTitle>
              <DialogDescription>
                {selectedCustomer ? `Detayları ${selectedCustomer.name} için güncelle.` : 'Kayıtlarınıza yeni bir müşteri ekleyin.'}
              </DialogDescription>
            </DialogHeader>
            <CustomerForm customer={selectedCustomer} setOpen={setOpen} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad Soyad</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead className="text-right">Bakiye</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell className={`text-right font-mono ${customer.balance < 0 ? 'text-destructive' : ''}`}>
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(customer.balance)}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(customer)}>
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
