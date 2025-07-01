
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DollarSign, Users, TrendingUp, TrendingDown, ShoppingCart, BookUser, Banknote, Package, Wallet } from "lucide-react"
import type { Customer, Expense, Sale } from "@/lib/types"
import { Button } from "./ui/button"

type View = 
  'anasayfa' | 
  'urun-yonetimi' | 
  'musteri-yonetimi' | 
  'satis-islemleri' |
  'tedarikciler' |
  'personel' |
  'kampanyalar' |
  'mali-isler' | 
  'raporlar' |
  'kasa' | 
  'uyarilar' | 
  'yapay-zeka';

interface DashboardProps {
    customers: Customer[];
    expenses: Expense[];
    salesData: Sale[];
    isMobile?: boolean;
    onNavigate: (view: View) => void;
}

export default function Dashboard({ customers, expenses, salesData, isMobile, onNavigate }: DashboardProps) {
  const totalReceivables = customers.filter(c => c.balance > 0).reduce((acc, c) => acc + c.balance, 0);
  const totalDebts = customers.filter(c => c.balance < 0).reduce((acc, c) => acc + c.balance, 0);
  const receivablesCount = customers.filter(c => c.balance > 0).length;
  const debtsCount = customers.filter(c => c.balance < 0).length;

  const totalRevenue = salesData.reduce((acc, sale) => acc + sale.revenue, 0);


  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 md:p-6 md:pb-2">
            <CardTitle className="text-sm font-medium">Toplam Ciro (Son {isMobile ? 4 : 6} Ay)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <div className="text-lg font-bold sm:text-xl lg:text-2xl">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Tüm tamamlanmış satışlar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 md:p-6 md:pb-2">
            <CardTitle className="text-sm font-medium">Toplam Alacak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <div className="text-lg font-bold text-destructive sm:text-xl lg:text-2xl">
              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalReceivables)}
            </div>
            <p className="text-xs text-muted-foreground">{receivablesCount} müşteriden</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 md:p-6 md:pb-2">
            <CardTitle className="text-sm font-medium">Toplam Borç</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <div className="text-lg font-bold text-green-600 sm:text-xl lg:text-2xl">
             {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Math.abs(totalDebts))}
            </div>
            <p className="text-xs text-muted-foreground">{debtsCount} müşteriye</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 md:p-6 md:pb-2">
            <CardTitle className="text-sm font-medium">Müşteri Sayısı</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <div className="text-lg font-bold sm:text-xl lg:text-2xl">{customers.length}</div>
            <p className="text-xs text-muted-foreground">toplam kayıtlı müşteri</p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
          <CardDescription>Sık kullandığınız işlemlere buradan hızlıca erişin.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <Button variant="outline" className="h-24 flex-col gap-2 text-base" onClick={() => onNavigate('satis-islemleri')}>
            <ShoppingCart className="h-6 w-6" />
            <span>Yeni Satış</span>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2 text-base" onClick={() => onNavigate('musteri-yonetimi')}>
            <BookUser className="h-6 w-6" />
            <span>Yeni Müşteri</span>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2 text-base" onClick={() => onNavigate('mali-isler')}>
            <Banknote className="h-6 w-6" />
            <span>Gider Ekle</span>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2 text-base" onClick={() => onNavigate('urun-yonetimi')}>
            <Package className="h-6 w-6" />
            <span>Stok Hareketi</span>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2 text-base" onClick={() => onNavigate('kasa')}>
            <Wallet className="h-6 w-6" />
            <span>Kasa Yönetimi</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
