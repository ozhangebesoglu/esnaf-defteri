"use client"

import { useState } from "react"
import type { Customer, Order } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Pencil } from "lucide-react"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { SaleForm } from "./sale-form"

export default function SaleDetail({ order, customer, onBack, onUpdateSale }: { 
  order: Order | undefined, 
  customer: Customer | undefined, 
  onBack: () => void,
  onUpdateSale: (data: Order) => void,
}) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  if (!order) {
    return (
      <div className="text-center">
        <p className="mb-4">Satış kaydı bulunamadı.</p>
        <Button onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Listeye Geri Dön
        </Button>
      </div>
    )
  }

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'Tamamlandı': return 'default'
      case 'Bekliyor': return 'secondary'
      case 'İptal Edildi': return 'destructive'
      default: return 'outline'
    }
  }

  const handleSave = (data: Order) => {
    onUpdateSale(data);
  }
  
  return (
    <div className="grid gap-6">
       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>İşlemi Düzenle</DialogTitle>
              <DialogDescription>
                 #{order.id} numaralı işlemi düzenleyin. Bu işlem müşterinin bakiyesini de etkileyebilir.
              </DialogDescription>
            </DialogHeader>
            <SaleForm sale={order} setOpen={setIsEditDialogOpen} onSave={handleSave} customers={customer ? [customer] : []} />
          </DialogContent>
        </Dialog>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-7 w-7 flex-shrink-0" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Geri</span>
            </Button>
            <div className="flex-1">
                <h1 className="text-xl font-semibold tracking-tight">
                    Sipariş #{order.id}
                </h1>
                <p className="text-sm text-muted-foreground">Tarih: {new Date(order.date).toLocaleString('tr-TR')}</p>
            </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
            <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
            <Button size="sm" variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                <Pencil className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Düzenle</span>
            </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Müşteri Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
                {customer ? (
                    <div className="flex items-center gap-4">
                         <Avatar className="h-11 w-11 flex-shrink-0">
                            <AvatarImage src={`https://avatar.vercel.sh/${customer.email || customer.name}.png`} alt={customer.name} />
                            <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold truncate">{customer.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{customer.email || 'E-posta belirtilmemiş'}</p>
                        </div>
                    </div>
                ) : (
                    <p>Müşteri bilgisi bulunamadı.</p>
                )}
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Sipariş Özeti</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                    <span className="text-muted-foreground">Ürün/Hizmet Sayısı</span>
                    <span className="font-medium">{order.items}</span>
                </div>
                 <div className="flex items-baseline justify-between font-semibold">
                    <span className="text-muted-foreground">Toplam Tutar</span>
                    <span className="text-lg">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(order.total)}</span>
                </div>
            </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle className="text-lg">Satılan Ürünler/Açıklama</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm">{order.description}</p>
        </CardContent>
       </Card>
    </div>
  )
}
