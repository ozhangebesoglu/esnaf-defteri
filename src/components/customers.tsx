"use client"

import { useState } from "react"
import { PlusCircle, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { customers } from "@/lib/data"
import type { Customer } from "@/lib/types"
import CustomerDetail from "./customer-detail"
import { CustomerForm } from "./customer-form"

export default function Customers() {
  const [open, setOpen] = useState(false);
  const [selectedCustomerForEdit, setSelectedCustomerForEdit] = useState<Customer | undefined>(undefined);
  const [selectedCustomerIdForDetail, setSelectedCustomerIdForDetail] = useState<string | null>(null);

  const handleOpenDialog = (customer?: Customer) => {
    setSelectedCustomerForEdit(customer);
    setOpen(true);
  }

  const handleRowClick = (customerId: string) => {
    setSelectedCustomerIdForDetail(customerId);
  }

  if (selectedCustomerIdForDetail) {
    return <CustomerDetail customerId={selectedCustomerIdForDetail} onBack={() => setSelectedCustomerIdForDetail(null)} />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Cari Hesaplar</CardTitle>
          <CardDescription>Müşteri borç ve alacaklarını yönetin. Detay için bir müşteriye tıklayın.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => { if(!isOpen) setSelectedCustomerForEdit(undefined); setOpen(isOpen);}}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Müşteri Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedCustomerForEdit ? 'Müşteriyi Düzenle' : 'Yeni Müşteri Ekle'}</DialogTitle>
              <DialogDescription>
                {selectedCustomerForEdit ? `Detayları ${selectedCustomerForEdit.name} için güncelle.` : 'Kayıtlarınıza yeni bir müşteri ekleyin.'}
              </DialogDescription>
            </DialogHeader>
            <CustomerForm customer={selectedCustomerForEdit} setOpen={setOpen} />
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
              <TableHead className="w-[50px] text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id} onClick={() => handleRowClick(customer.id)} className="cursor-pointer">
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell className={`text-right font-mono ${customer.balance < 0 ? 'text-destructive' : ''}`}>
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(customer.balance)}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleOpenDialog(customer); }}>
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
