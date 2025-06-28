"use client"

import { useState } from "react"
import { PlusCircle, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { recentOrders } from "@/lib/data"
import type { Order } from "@/lib/types"
import SaleDetail from "./sale-detail"
import { SaleForm } from "./sale-form"

export default function Sales() {
  const [open, setOpen] = useState(false)
  const [selectedSaleForEdit, setSelectedSaleForEdit] = useState<Order | undefined>(undefined);
  const [selectedSaleIdForDetail, setSelectedSaleIdForDetail] = useState<string | null>(null);

  const handleOpenDialog = (sale?: Order) => {
    setSelectedSaleForEdit(sale);
    setOpen(true);
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
  
  if (selectedSaleIdForDetail) {
      return <SaleDetail orderId={selectedSaleIdForDetail} onBack={() => setSelectedSaleIdForDetail(null)} />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Satışlar</CardTitle>
          <CardDescription>İşletmenizin tüm satış işlemlerinin kaydı. Detay için bir satışa tıklayın.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => { if(!isOpen) setSelectedSaleForEdit(undefined); setOpen(isOpen);}}>
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
            <SaleForm sale={selectedSaleForEdit} setOpen={setOpen} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sipariş No</TableHead>
              <TableHead>Müşteri</TableHead>
              <TableHead className="text-right">Tutar</TableHead>
              <TableHead className="text-center">Durum</TableHead>
              <TableHead className="w-[50px] text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.map((order) => (
              <TableRow key={order.id} onClick={() => handleRowClick(order.id)} className="cursor-pointer">
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell className="text-right font-mono">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(order.total)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                </TableCell>
                 <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleOpenDialog(order)}}>
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
