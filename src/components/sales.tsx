"use client"

import { useState } from "react"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Order, Customer } from "@/lib/types"
import SaleDetail from "./sale-detail"
import { SaleForm } from "./sale-form"

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

  const handleOpenDialog = (sale?: Order) => {
    setSelectedSaleForEdit(sale);
    setDialogOpen(true);
  };
  
  const handleRowClick = (orderId: string) => {
      setSelectedSaleIdForDetail(orderId);
  }

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'Tamamlandı': return 'default'
      case 'Bekliyor': return 'secondary'
      case 'İptal Edildi': return 'destructive'
      default: return 'outline'
    }
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

  return (
    <>
    <AlertDialog open={!!saleToDelete} onOpenChange={() => setSaleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. #{saleToDelete?.id} numaralı satış kaydı kalıcı olarak silinecektir. Bu işlem ilgili müşterinin bakiyesini de güncelleyecektir.
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
          <CardTitle>Satışlar</CardTitle>
          <CardDescription>İşletmenizin tüm satış işlemlerinin kaydı. Detay için bir satışa tıklayın.</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(isOpen) => { if(!isOpen) setSelectedSaleForEdit(undefined); setDialogOpen(isOpen);}}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Yeni Satış
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedSaleForEdit ? 'Satışı Düzenle' : 'Yeni Satış Ekle'}</DialogTitle>
              <DialogDescription>
                 {selectedSaleForEdit ? `${selectedSaleForEdit.id} numaralı satışı düzenleyin.` : 'Yeni bir satış işlemi oluşturun. Bu işlem müşterinin cari hesabına da işlenecektir.'}
              </DialogDescription>
            </DialogHeader>
            <SaleForm sale={selectedSaleForEdit} setOpen={setDialogOpen} onSave={handleSave} customers={customers} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sipariş No</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead>Müşteri</TableHead>
              <TableHead className="text-right">Tutar</TableHead>
              <TableHead className="text-center">Durum</TableHead>
              <TableHead className="w-[100px] text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? orders.map((order) => (
              <TableRow key={order.id} onClick={() => handleRowClick(order.id)} className="cursor-pointer">
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell className={`text-right font-mono ${order.total < 0 ? 'text-green-600' : ''}`}>
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(order.total)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
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
                    <TableCell colSpan={6} className="h-24 text-center">Kayıtlı satış bulunamadı.</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </>
  )
}
