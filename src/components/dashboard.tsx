"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell } from "recharts"
import { DollarSign, Users, TrendingUp, TrendingDown } from "lucide-react"
import type { Customer, Expense, Order, Sale } from "@/lib/types"

interface DashboardProps {
    customers: Customer[];
    expenses: Expense[];
    salesData: Sale[];
    isMobile?: boolean;
}

const barChartConfig = {
  revenue: {
    label: "Ciro",
    color: "hsl(var(--primary))",
  },
}

const pieChartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export default function Dashboard({ customers, expenses, salesData, isMobile }: DashboardProps) {
  const totalReceivables = customers.filter(c => c.balance > 0).reduce((acc, c) => acc + c.balance, 0);
  const totalDebts = customers.filter(c => c.balance < 0).reduce((acc, c) => acc + c.balance, 0);
  const receivablesCount = customers.filter(c => c.balance > 0).length;
  const debtsCount = customers.filter(c => c.balance < 0).length;

  const expenseByCategory = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const expenseChartData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));
  
  const pieChartConfig = expenseChartData.reduce((acc, data, index) => {
    acc[data.name] = { label: data.name, color: pieChartColors[index % pieChartColors.length] };
    return acc;
  }, {} as any);

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
            <p className="text-xs text-muted-foreground">Grafikteki verilere göre</p>
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Satış Özeti</CardTitle>
            <CardDescription>Son {isMobile ? '4' : '6'} aydaki cironun grafiği.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig} className="h-56 md:h-64">
              <BarChart accessibilityLayer data={salesData} maxBarSize={60}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gider Dağılımı</CardTitle>
            <CardDescription>Harcamaların kategorilere göre dağılımı.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pieChartConfig} className="h-56 md:h-64">
                <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="value" hideLabel />} />
                    <Pie data={expenseChartData} dataKey="value" nameKey="name" innerRadius={50}>
                        {expenseChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={pieChartColors[index % pieChartColors.length]} />
                        ))}
                    </Pie>
                </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
