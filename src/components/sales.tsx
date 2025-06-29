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
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import type { Order, Customer } from "@/lib/types"
import SaleDetail from "./sale-detail"
import { SaleForm } from "./sale-form"
import { useIsMobile } from "@/hooks/use-mobile"
import { Skeleton } from "./ui/skeleton"

interface SalesProps {
    orders: Order[];
    customers: Customer[];
    onAddSale: (data: Omit<Order, 'id'|'customerName'|'date'|'status'|'items'>) => void;
    onUpdateSale: (data: Order) => void;
    onDeleteSale: (id: string) => void;
}

export default function Sales({ orders, customers, onAddSale, onUpdateSale, onDeleteSale }: SalesProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedSaleForEdit, setSelectedSaleForEdit] = useState<Order | undefined>(undefined);
  const [saleToDelete, setSaleToDelete] = useState<Order | null>(null);
  const [selectedSaleIdForDetail, setSelectedSaleIdForDetail] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleOpenDialog = (sale?: Order) => {
    setSelectedSaleForEdit(sale);
    setDialogOpen(true);
  };
  
  const handleRowClick = (orderId: string) => {
      setSelectedSaleIdForDetail(orderId);
  }

  const handleSave = (data: any) => {
      if (selectedSaleForEdit) {
          onUpdateSale(data);
      } else {
          onAddSale(data);
      }
  }

  const handleDelete = () => {
      if (saleToDelete) {
          onDeleteSale(saleToDelete.id);
          setSaleToDelete(null);
      }
  }
  
  if (selectedSaleIdForDetail) {
      const order = orders.find(o => o.id === selectedSaleIdForDetail);
      const customer = customers.find(c => c.id === order?.customerId);
      return <SaleDetail 
                order={order} 
                customer={customer} 
                onBack={() => setSelectedSaleIdForDetail(null)}
                onUpdateSale={onUpdateSale}
             />;
  }

  const renderDesktopView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden lg:table-cell">İşlem No</TableHead>
          <TableHead className="hidden sm:table-cell">Tarih</TableHead>
          <TableHead>Müşteri</TableHead>
          <TableHead>Açıklama</TableHead>
          <TableHead className="text-right">Tutar</TableHead>
          <TableHead className="w-[100px] text-right">İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length > 0 ? orders.map((order) => (
          <TableRow key={order.id} onClick={() => handleRowClick(order.id)} className="cursor-pointer">
            <TableCell className="hidden lg:table-cell font-medium truncate max-w-[150px]">{order.id}</TableCell>
            <TableCell className="hidden sm:table-cell">{new Date(order.date).toLocaleString('tr-TR')}</TableCell>
            <TableCell>{order.customerName}</TableCell>
            <TableCell className="truncate max-w-xs">{order.description}</TableCell>
            <TableCell className={`text-right font-mono ${order.total < 0 ? 'text-green-600' : 'text-destructive'}`}>
              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(order.total)}
            </TableCell>
             <TableCell className="text-right space-x-1">
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleOpenDialog(order)}}>
                <Pencil className="h-4 w-4" />
              </Button>
               <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setSaleToDelete(order)}}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        )) : (
            <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">Kayıtlı veresiye işlemi bulunamadı.</TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const renderMobileView = () => (
    <div className="space-y-3">
        {orders.length > 0 ? orders.map((order) => (
            <Card key={order.id} onClick={() => handleRowClick(order.id)}>
                <CardContent className="p-4 flex justify-between items-start">
                    <div className="flex-1 space-y-1 pr-2">
                        <p className="font-semibold">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">{order.description}</p>
                        <p className="text-xs text-muted-foreground pt-1">{new Date(order.date).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                    </div>
                    <div className="flex flex-col items-end">
                         <p className={`font-mono font-semibold text-base whitespace-nowrap ${order.total < 0 ? 'text-green-600' : 'text-destructive'}`}>
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(order.total)}
                        </p>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" onClick={(e) => e.stopPropagation()}>
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onClick={() => handleOpenDialog(order)}>Düzenle</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSaleToDelete(order)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                    Sil
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>
        )) : (
            <div className="h-24 text-center flex items-center justify-center">
                <p>Kayıtlı veresiye işlemi bulunamadı.</p>
            </div>
        )}
    </div>
  );

  const renderLoadingSkeleton = () => (
    <div className="space-y-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
    </div>
  );

  return (
    <>
    <AlertDialog open={!!saleToDelete} onOpenChange={() => setSaleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. #{saleToDelete?.id} numaralı işlem kaydı kalıcı olarak silinecektir. Bu işlem ilgili müşterinin bakiyesini de güncelleyecektir.
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
          <CardTitle>Veresiye İşlemleri</CardTitle>
          <CardDescription>Müşterilerin borç ve ödeme kayıtları. Detay için bir işleme tıklayın.</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(isOpen) => { if(!isOpen) setSelectedSaleForEdit(undefined); setDialogOpen(isOpen);}}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Yeni Veresiye Satış
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedSaleForEdit ? 'İşlemi Düzenle' : 'Yeni Veresiye Satış'}</DialogTitle>
              <DialogDescription>
                 {selectedSaleForEdit ? `${selectedSaleForEdit.id} numaralı işlemi düzenleyin.` : 'Yeni bir satış/borç işlemi oluşturun. Bu işlem müşterinin cari hesabına da işlenecektir.'}
              </DialogDescription>
            </DialogHeader>
            <SaleForm sale={selectedSaleForEdit} setOpen={setDialogOpen} onSave={handleSave} customers={customers} />
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
