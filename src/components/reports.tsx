"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Scale } from "lucide-react"
import { ProductIcon } from "./product-icons"
import type { Customer, Expense, Order, Product } from "@/lib/types"

interface ReportsProps {
    customers: Customer[];
    expenses: Expense[];
    orders: Order[];
    products: Product[];
}

export default function Reports({ customers, expenses, orders, products }: ReportsProps) {

    const totalRevenue = orders.filter(o => o.status === 'Tamamlandı' && o.total > 0).reduce((sum, order) => sum + order.total, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    
    // Mock data for more realistic reports
    const productSales = [
        { productId: 'PROD002', name: 'Kıyma', unitsSold: 120, totalSales: 36000 },
        { productId: 'PROD001', name: 'Antrikot', unitsSold: 80, totalSales: 40000 },
        { productId: 'PROD005', name: 'Sucuk', unitsSold: 75, totalSales: 15000 },
        { productId: 'PROD007', name: 'Tavuk But', unitsSold: 60, totalSales: 9000 },
        { productId: 'PROD003', name: 'Kuzu Pirzola', unitsSold: 40, totalSales: 24000 },
    ]
    
    const customerPurchases = [
        { customerId: 'CUS001', name: 'Ahmet Yılmaz', totalSpent: 2850.50 },
        { customerId: 'CUS004', name: 'Fatma Şahin', totalSpent: 1750.00 },
        { customerId: 'CUS003', name: 'Mehmet Demir', totalSpent: 1200.25 },
        { customerId: 'CUS006', name: 'Zeynep Aydın', totalSpent: 980.75 },
        { customerId: 'CUS002', name: 'Ayşe Kaya', totalSpent: 850.00 },
    ]


  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="summary">Kâr/Zarar Özeti</TabsTrigger>
        <TabsTrigger value="products">Ürün Raporları</TabsTrigger>
        <TabsTrigger value="customers">Müşteri Raporları</TabsTrigger>
      </TabsList>
      <TabsContent value="summary">
        <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">Tamamlanan satışlardan</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalExpenses)}</div>
                        <p className="text-xs text-muted-foreground">Kaydedilen tüm harcamalar</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Kâr</CardTitle>
                        <Scale className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(netProfit)}
                        </div>
                        <p className="text-xs text-muted-foreground">Gelirler - Giderler</p>
                    </CardContent>
                </Card>
            </div>
            {/* More detailed charts and tables can go here */}
        </div>
      </TabsContent>
      <TabsContent value="products">
         <Card>
            <CardHeader>
                <CardTitle>Çok Satan Ürünler</CardTitle>
                <CardDescription>Belirtilen dönemde en çok ciro getiren ürünler.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[80px]">Ürün</TableHead>
                    <TableHead></TableHead>
                    <TableHead className="text-right">Satış Adedi</TableHead>
                    <TableHead className="text-right">Toplam Ciro</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {productSales.length > 0 ? productSales.map((p) => {
                        const productDetails = products.find(prod => prod.id === p.productId);
                        return (
                            <TableRow key={p.productId}>
                                <TableCell>
                                    {productDetails && <ProductIcon type={productDetails.type} />}
                                </TableCell>
                                <TableCell className="font-medium">{p.name}</TableCell>
                                <TableCell className="text-right font-mono">{p.unitsSold}</TableCell>
                                <TableCell className="text-right font-mono font-medium">
                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p.totalSales)}
                                </TableCell>
                            </TableRow>
                        )
                    }) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">Rapor oluşturmak için yeterli veri yok.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            </CardContent>
            </Card>
      </TabsContent>
      <TabsContent value="customers">
         <Card>
            <CardHeader>
                <CardTitle>En İyi Müşteriler</CardTitle>
                <CardDescription>Belirtilen dönemde en çok harcama yapan müşteriler.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Müşteri</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead className="text-right">Toplam Harcama</TableHead>
                    <TableHead className="text-right">Bakiye</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customerPurchases.length > 0 ? customerPurchases.map((c) => {
                         const customerDetails = customers.find(cust => cust.id === c.customerId);
                        return (
                        <TableRow key={c.customerId}>
                            <TableCell className="font-medium">{c.name}</TableCell>
                            <TableCell>{customerDetails?.email}</TableCell>
                            <TableCell className="text-right font-mono font-medium">
                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(c.totalSpent)}
                            </TableCell>
                             <TableCell className={`text-right font-mono ${customerDetails && customerDetails.balance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                                {customerDetails && new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(customerDetails.balance)}
                            </TableCell>
                        </TableRow>
                        )
                    }) : (
                         <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">Rapor oluşturmak için yeterli veri yok.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            </CardContent>
            </Card>
      </TabsContent>
    </Tabs>
  )
}
