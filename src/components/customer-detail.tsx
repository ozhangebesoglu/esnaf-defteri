"use client"

import { useState } from "react"
import type { Customer, Order } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, TrendingUp, TrendingDown, Scale, Pencil, CircleDollarSign, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { CustomerForm } from "./customer-form"
import { PaymentForm } from "./payment-form"
import { SaleForm } from "./sale-form"

export default function CustomerDetail({ customer, orders, onBack, onUpdateCustomer, onAddPayment, onAddSale }: { 
  customer: Customer | undefined, 
  orders: Order[],
  onBack: () => void,
  onUpdateCustomer: (data: Customer) => void,
  onAddPayment: (data: { customerId: string, total: number, description: string }) => void,
  onAddSale: (data: Omit<Order, 'id' | 'customerName' | 'date' | 'status' | 'items'>) => void;
}) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);
  const customerOrders = orders.filter(o => o.customerId === customer?.id)

  if (!customer) {
    return (
      <div className="text-center">
        <p className="mb-4">Müşteri bulunamadı.</p>
        <Button onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Listeye Geri Dön
        </Button>
      </div>
    )
  }
  
  const getStatusVariant = (status: Order['status']) => {
    if (status === 'İptal Edildi') return 'destructive';
    if (status === 'Bekliyor') return 'secondary';
    return 'default';
  }

  const totalSpent = customerOrders
    .filter(o => o.status === 'Tamamlandı' && o.total > 0)
    .reduce((sum, order) => sum + order.total, 0)

  return (
    <div className="grid gap-6">
        {/* Edit Customer Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Müşteriyi Düzenle</DialogTitle>
              <DialogDescription>
                Detayları {customer.name} için güncelle.
              </DialogDescription>
            </DialogHeader>
            <CustomerForm customer={customer} setOpen={setIsEditDialogOpen} onSave={onUpdateCustomer} />
          </DialogContent>
        </Dialog>
        
        {/* Add Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Müşteriden Ödeme Al</DialogTitle>
              <DialogDescription>
                {customer.name} adlı müşteriden alınan ödemeyi kaydedin. Bu işlem müşterinin bakiyesini güncelleyecektir.
              </DialogDescription>
            </DialogHeader>
            <PaymentForm customer={customer} setOpen={setIsPaymentDialogOpen} onSave={onAddPayment} />
          </DialogContent>
        </Dialog>

        {/* Add Sale Dialog */}
        <Dialog open={isSaleDialogOpen} onOpenChange={setIsSaleDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Yeni Satış Ekle (Veresiye)</DialogTitle>
              <DialogDescription>
                {customer.name} adlı müşteriye yeni bir borç ekleyin. Bu işlem müşterinin bakiyesini artıracaktır.
              </DialogDescription>
            </DialogHeader>
            <SaleForm 
              customers={[customer]}
              sale={{ customerId: customer.id } as Order}
              setOpen={setIsSaleDialogOpen} 
              onSave={onAddSale}
            />
          </DialogContent>
        </Dialog>

      <div className="flex items-start gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Geri</span>
        </Button>
        <div className="flex items-center gap-4 flex-1">
            <Avatar className="hidden h-11 w-11 sm:flex">
                <AvatarImage src={`https://avatar.vercel.sh/${customer.email || customer.id}.png`} alt={customer.name} />
                <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    {customer.name}
                </h1>
                {customer.email ? (
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                ) : (
                    <p className="text-sm text-muted-foreground italic">E-posta belirtilmemiş</p>
                )}
            </div>
        </div>
         <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsSaleDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Yeni Satış
            </Button>
            <Button size="sm" onClick={() => setIsPaymentDialogOpen(true)}>
                <CircleDollarSign className="h-4 w-4" />
                Ödeme Al
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                <Pencil className="h-4 w-4" />
                Düzenle
            </Button>
        </div>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mevcut Bakiye</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${customer.balance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(customer.balance)}
            </div>
            <p className="text-xs text-muted-foreground">{customer.balance > 0 ? 'Müşterinin borcu var' : (customer.balance < 0 ? 'Müşteriye borcunuz var' : 'Bakiye sıfır')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Harcama</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalSpent)}
            </div>
             <p className="text-xs text-muted-foreground">Tamamlanan siparişler</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">İşlem Sayısı</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerOrders.length}</div>
            <p className="text-xs text-muted-foreground">Toplam sipariş ve ödemeler</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>İşlem Geçmişi</CardTitle>
          <CardDescription>Bu müşteriye ait tüm satış ve ödemeler.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                 <TableHead>İşlem No</TableHead>
                 <TableHead>Tarih</TableHead>
                 <TableHead>Açıklama</TableHead>
                 <TableHead className="text-center">Durum</TableHead>
                 <TableHead className="text-right">Tutar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerOrders.length > 0 ? customerOrders.map((order) => (
                <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleString('tr-TR')}</TableCell>
                    <TableCell>{order.description}</TableCell>
                    <TableCell className="text-center">
                        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className={`text-right font-mono ${order.total < 0 ? 'text-green-600' : 'text-destructive'}`}>
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(order.total < 0 ? order.total : order.total)}
                    </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">Bu müşteri için işlem bulunamadı.</TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
