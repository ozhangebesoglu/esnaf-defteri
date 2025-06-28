"use client"

import { useState } from "react"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import type { Customer, Order } from "@/lib/types"
import CustomerDetail from "./customer-detail"
import { CustomerForm } from "./customer-form"

interface CustomersProps {
    customers: Customer[];
    orders: Order[];
    onAddCustomer: (data: { name: string, email: string, initialDebt?: number }) => void;
    onUpdateCustomer: (data: Customer) => void;
    onDeleteCustomer: (id: string) => void;
    onAddPayment: (data: { customerId: string, total: number, description: string }) => void;
}

export default function Customers({ customers, orders, onAddCustomer, onUpdateCustomer, onDeleteCustomer, onAddPayment }: CustomersProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomerForEdit, setSelectedCustomerForEdit] = useState<Customer | undefined>(undefined);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [selectedCustomerIdForDetail, setSelectedCustomerIdForDetail] = useState<string | null>(null);

  const handleOpenDialog = (customer?: Customer) => {
    setSelectedCustomerForEdit(customer);
    setDialogOpen(true);
  }
  
  const closeDialog = () => {
      setSelectedCustomerForEdit(undefined);
      setDialogOpen(false);
  }

  const handleRowClick = (customerId: string) => {
    setSelectedCustomerIdForDetail(customerId);
  }
  
  const handleSave = (data: any) => {
    if (selectedCustomerForEdit) {
      onUpdateCustomer(data);
    } else {
      onAddCustomer(data);
    }
  }

  const handleDelete = () => {
    if (customerToDelete) {
      onDeleteCustomer(customerToDelete.id);
      setCustomerToDelete(null);
    }
  }

  if (selectedCustomerIdForDetail) {
    const customer = customers.find(c => c.id === selectedCustomerIdForDetail);
    return <CustomerDetail 
             customer={customer} 
             orders={orders}
             onBack={() => setSelectedCustomerIdForDetail(null)}
             onUpdateCustomer={onUpdateCustomer}
             onAddPayment={onAddPayment}
           />;
  }

  return (
    <>
      <AlertDialog open={!!customerToDelete} onOpenChange={() => setCustomerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. {customerToDelete?.name} adlı müşteri kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Müşteriler</CardTitle>
            <CardDescription>Müşteri borç ve alacaklarını yönetin. Detay için bir müşteriye tıklayın.</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Müşteri Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => { e.preventDefault(); }} onEscapeKeyDown={closeDialog}>
              <DialogHeader>
                <DialogTitle>{selectedCustomerForEdit ? 'Müşteriyi Düzenle' : 'Yeni Müşteri Ekle'}</DialogTitle>
                <DialogDescription>
                  {selectedCustomerForEdit ? `Detayları ${selectedCustomerForEdit.name} için güncelle.` : 'Kayıtlarınıza yeni bir müşteri ekleyin.'}
                </DialogDescription>
              </DialogHeader>
              <CustomerForm customer={selectedCustomerForEdit} setOpen={setDialogOpen} onSave={handleSave} />
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
                <TableHead className="w-[100px] text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length > 0 ? customers.map((customer) => (
                <TableRow key={customer.id} onClick={() => handleRowClick(customer.id)} className="cursor-pointer">
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell className={`text-right font-mono ${customer.balance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(customer.balance)}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleOpenDialog(customer); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                     <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setCustomerToDelete(customer); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">Kayıtlı müşteri bulunamadı.</TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
