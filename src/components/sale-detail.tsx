"use client"

import { recentOrders, customers, products } from "@/lib/data"
import type { Order } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function SaleDetail({ orderId, onBack }: { orderId: string, onBack: () => void }) {
  const order = recentOrders.find(o => o.id === orderId)
  
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

  const customer = customers.find(c => c.id === order.customerId);
  
  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'Tamamlandı': return 'default'
      case 'Bekliyor': return 'secondary'
      case 'İptal Edildi': return 'destructive'
      default: return 'outline'
    }
  }
  
  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Geri</span>
        </Button>
        <div>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Sipariş #{order.id}
          </h1>
          <p className="text-sm text-muted-foreground">Tarih: 23.10.2023</p>
        </div>
        <Badge variant={getStatusVariant(order.status)} className="ml-auto sm:ml-0">{order.status}</Badge>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Müşteri Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
                {customer ? (
                    <div className="flex items-center gap-4">
                         <Avatar className="hidden h-11 w-11 sm:flex">
                            <AvatarImage src={`https://avatar.vercel.sh/${customer.email}.png`} alt={customer.name} />
                            <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                        </div>
                    </div>
                ) : (
                    <p>Müşteri bilgisi bulunamadı.</p>
                )}
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Sipariş Özeti</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Ürün Sayısı</span>
                    <span>{order.items}</span>
                </div>
                 <div className="flex justify-between font-semibold text-lg mt-2">
                    <span className="text-muted-foreground">Toplam Tutar</span>
                    <span>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(order.total)}</span>
                </div>
            </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Satılan Ürünler/Açıklama</CardTitle>
        </CardHeader>
        <CardContent>
            <p>{order.description}</p>
        </CardContent>
       </Card>
    </div>
  )
}
