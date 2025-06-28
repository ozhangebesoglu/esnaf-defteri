"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/hooks/use-toast"
import { Wallet, TrendingUp, TrendingDown, Landmark } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cashboxHistory } from "@/lib/data"

const closeDaySchema = z.object({
  actualBalance: z.coerce.number().min(0, "Kasa sayımı negatif olamaz."),
})

function CloseDayForm({ setOpen, expectedBalance }: { setOpen: (open: boolean) => void, expectedBalance: number }) {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof closeDaySchema>>({
    resolver: zodResolver(closeDaySchema),
    defaultValues: { actualBalance: expectedBalance },
  })

  function onSubmit(values: z.infer<typeof closeDaySchema>) {
    const difference = values.actualBalance - expectedBalance;
    console.log(values)
    toast({
      title: "Gün Kapatıldı",
      description: `Kasa sayımı tamamlandı. Fark: ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(difference)}`,
    })
    setOpen(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Sistemdeki Beklenen Bakiye</p>
            <p className="text-2xl font-bold">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(expectedBalance)}</p>
        </div>
        <FormField
          control={form.control}
          name="actualBalance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kasada Sayılan Gerçek Tutar</FormLabel>
              <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit">Günü Kapat ve Kaydet</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}


export default function Cashbox() {
  const [open, setOpen] = useState(false);
  
  const openingBalance = cashboxHistory[0]?.closing || 0;
  const cashIn = 1250.75; // Mock data
  const cashOut = 320.50; // Mock data
  const expectedBalance = openingBalance + cashIn - cashOut;

  return (
    <div className="grid gap-6">
       <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Günlük Kasa Durumu</CardTitle>
                <CardDescription>Mevcut gün için kasa hareketleri özeti.</CardDescription>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                <Wallet className="mr-2 h-4 w-4" />
                Günü Kapat
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Günü Kapat</DialogTitle>
                <DialogDescription>
                    Gün sonu kasa sayımını yaparak günü kapatın.
                </DialogDescription>
                </DialogHeader>
                <CloseDayForm setOpen={setOpen} expectedBalance={expectedBalance} />
            </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Devreden Bakiye</CardTitle>
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(openingBalance)}</div>
                    <p className="text-xs text-muted-foreground">Dünkü kapanış tutarı</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Nakit Girişi</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cashIn)}</div>
                    <p className="text-xs text-muted-foreground">Nakit satışlar ve tahsilatlar</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Nakit Çıkışı</CardTitle>
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-destructive">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cashOut)}</div>
                    <p className="text-xs text-muted-foreground">Nakit ödemeler ve harcamalar</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Beklenen Kasa Bakiyesi</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(expectedBalance)}</div>
                    <p className="text-xs text-muted-foreground">Sistemdeki güncel bakiye</p>
                </CardContent>
            </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kasa Geçmişi</CardTitle>
          <CardDescription>Geçmiş günlere ait kasa kapanış kayıtları.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">Açılış</TableHead>
                <TableHead className="text-right">Giriş</TableHead>
                <TableHead className="text-right">Çıkış</TableHead>
                <TableHead className="text-right">Kapanış</TableHead>
                <TableHead className="text-right">Fark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashboxHistory.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.date}</TableCell>
                  <TableCell className="text-right font-mono">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.opening)}</TableCell>
                  <TableCell className="text-right font-mono text-green-600">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.cashIn)}</TableCell>
                  <TableCell className="text-right font-mono text-destructive">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.cashOut)}</TableCell>
                  <TableCell className="text-right font-mono">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.closing)}</TableCell>
                   <TableCell className={`text-right font-mono ${entry.difference !== 0 ? 'text-amber-600 font-bold' : ''}`}>
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.difference)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
