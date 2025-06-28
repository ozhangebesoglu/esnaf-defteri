"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Wallet, TrendingUp, TrendingDown, Landmark } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { CashboxHistory } from "@/lib/types"

const closeDaySchema = z.object({
  actualBalance: z.coerce.number().min(0, "Kasa sayımı negatif olamaz."),
})

function CloseDayForm({ setOpen, expectedBalance, onDayClose }: { setOpen: (open: boolean) => void, expectedBalance: number, onDayClose: (actualBalance: number) => void }) {
  const form = useForm<z.infer<typeof closeDaySchema>>({
    resolver: zodResolver(closeDaySchema),
    defaultValues: { actualBalance: expectedBalance },
  })

  function onSubmit(values: z.infer<typeof closeDaySchema>) {
    onDayClose(values.actualBalance);
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

interface CashboxProps {
    history: CashboxHistory[];
    openingBalance: number;
    cashIn: number;
    cashOut: number;
    expectedBalance: number;
    onDayClose: (actualBalance: number) => void;
}

export default function Cashbox({ history, openingBalance, cashIn, cashOut, expectedBalance, onDayClose }: CashboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="grid gap-6">
       <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Günlük Kasa Yönetimi</CardTitle>
                <CardDescription>Mevcut gün için nakit hareketleri özeti ve gün sonu işlemi.</CardDescription>
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
                <CloseDayForm setOpen={setOpen} expectedBalance={expectedBalance} onDayClose={onDayClose} />
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
                    <p className="text-xs text-muted-foreground">Bugünkü nakit satışlar ve tahsilatlar</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Nakit Çıkışı</CardTitle>
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-destructive">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cashOut)}</div>
                    <p className="text-xs text-muted-foreground">Bugünkü nakit ödemeler ve harcamalar</p>
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
          <CardTitle>Gün Sonu Kasa Geçmişi</CardTitle>
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
              {history.length > 0 ? history.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{new Date(entry.date).toLocaleDateString('tr-TR')}</TableCell>
                  <TableCell className="text-right font-mono">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.opening)}</TableCell>
                  <TableCell className="text-right font-mono text-green-600">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.cashIn)}</TableCell>
                  <TableCell className="text-right font-mono text-destructive">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.cashOut)}</TableCell>
                  <TableCell className="text-right font-mono">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.closing)}</TableCell>
                   <TableCell className={`text-right font-mono ${entry.difference !== 0 ? 'text-amber-600 font-bold' : ''}`}>
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.difference)}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">Geçmiş kasa kaydı bulunamadı.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
