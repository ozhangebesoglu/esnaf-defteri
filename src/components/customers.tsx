"use client"

import { useState } from "react"
import { PlusCircle, Pencil, Trash2, MoreVertical } from "lucide-react"

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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import type { Customer, Order } from "@/lib/types"
import CustomerDetail from "./customer-detail"
import { CustomerForm } from "./customer-form"
import { useIsMobile } from "@/hooks/use-mobile"


interface CustomersProps {
    customers: Customer[];
    orders: Order[];
    onAddCustomer: (data: { name: string, email?: string, initialDebt?: number }) => void;
    onUpdateCustomer: (data: Customer) => void;
    onDeleteCustomer: (id: string) => void;
    onAddPayment: (data: { customerId: string, total: number, description?: string }) => void;
    onAddSale: (data: Omit<Order, 'id'|'customerName'|'date'|'status'|'items'|'userId'>) => void;
}

export default function Customers({ customers, orders, onAddCustomer, onUpdateCustomer, onDeleteCustomer, onAddPayment, onAddSale }: CustomersProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomerForEdit, setSelectedCustomerForEdit] = useState<Customer | undefined>(undefined);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [selectedCustomerIdForDetail, setSelectedCustomerIdForDetail] = useState<string | null>(null);
  const isMobile = useIsMobile();

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
             onAddSale={onAddSale}
           />;
  }

  const renderLoadingSkeleton = () => (
    <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
    </div>
  );

  const renderDesktopView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ad Soyad</TableHead>
          <TableHead className="hidden sm:table-cell">E-posta</TableHead>
          <TableHead className="text-right">Bakiye</TableHead>
          <TableHead className="w-[100px] text-right">İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.length > 0 ? customers.map((customer) => (
          <TableRow key={customer.id} onClick={() => handleRowClick(customer.id)} className="cursor-pointer">
            <TableCell className="font-medium">{customer.name}</TableCell>
            <TableCell className="hidden sm:table-cell">{customer.email || '–'}</TableCell>
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
  );

  const renderMobileView = () => (
    <div className="space-y-3">
        {customers.length > 0 ? customers.map((customer) => (
            <Card key={customer.id} onClick={() => handleRowClick(customer.id)}>
                <CardContent className="p-4 flex justify-between items-start">
                    <div className="flex-1 space-y-1 pr-2">
                        <p className="font-semibold">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.email || 'E-posta yok'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                         <p className={`font-mono font-semibold text-base whitespace-nowrap ${customer.balance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(customer.balance)}
                        </p>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" onClick={(e) => e.stopPropagation()}>
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onClick={() => handleOpenDialog(customer)}>Düzenle</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setCustomerToDelete(customer)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                    Sil
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>
        )) : (
            <div className="h-24 text-center flex items-center justify-center">
                <p className="text-muted-foreground">Kayıtlı müşteri bulunamadı.</p>
            </div>
        )}
    </div>
  );

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
          {isMobile === undefined ? renderLoadingSkeleton() : (isMobile ? renderMobileView() : renderDesktopView())}
        </CardContent>
      </Card>
    </>
  )
}
