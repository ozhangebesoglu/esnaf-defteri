"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Wallet, TrendingUp, TrendingDown, Landmark, Pencil, MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { CashboxHistory } from "@/lib/types"
import { useIsMobile } from "@/hooks/use-mobile"
import { Skeleton } from "./ui/skeleton"

const closeDaySchema = z.object({
  countedCash: z.coerce.number().min(0, "Nakit sayımı negatif olamaz."),
  countedVisa: z.coerce.number().min(0, "Visa sayımı negatif olamaz."),
})

function CloseDayForm({ setOpen, expectedCash, onDayClose }: { 
    setOpen: (open: boolean) => void, 
    expectedCash: number, 
    onDayClose: (data: { countedCash: number, countedVisa: number }) => void 
}) {
  const form = useForm<z.infer<typeof closeDaySchema>>({
    resolver: zodResolver(closeDaySchema),
    defaultValues: { countedCash: expectedCash > 0 ? expectedCash : 0, countedVisa: 0 },
  })

  function onSubmit(values: z.infer<typeof closeDaySchema>) {
    onDayClose(values);
    setOpen(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Sistemdeki Beklenen Nakit Bakiye</p>
            <p className="text-2xl font-bold">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(expectedCash)}</p>
        </div>
        <FormField
          control={form.control}
          name="countedCash"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kasada Sayılan Nakit Tutar</FormLabel>
              <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="countedVisa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visa POS Cihazı Toplam Tutar</FormLabel>
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

const editHistorySchema = z.object({
  countedCash: z.coerce.number().min(0, "Nakit sayımı negatif olamaz."),
  countedVisa: z.coerce.number().min(0, "Visa sayımı negatif olamaz."),
});

function EditHistoryForm({ 
    entry,
    setOpen, 
    onUpdateHistory 
}: { 
    entry: CashboxHistory,
    setOpen: (open: boolean) => void, 
    onUpdateHistory: (data: CashboxHistory) => void 
}) {
  const form = useForm<z.infer<typeof editHistorySchema>>({
    resolver: zodResolver(editHistorySchema),
    defaultValues: { 
        countedCash: entry.countedCash ?? 0, 
        countedVisa: entry.countedVisa ?? 0 
    },
  });

  function onSubmit(values: z.infer<typeof editHistorySchema>) {
    const updatedEntry = {
        ...entry,
        countedCash: values.countedCash,
        countedVisa: values.countedVisa,
    };
    onUpdateHistory(updatedEntry);
    setOpen(false)
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Sistemdeki Beklenen Nakit Bakiye (Referans)</p>
            <p className="text-2xl font-bold">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.expectedCash ?? 0)}</p>
        </div>
        <FormField
          control={form.control}
          name="countedCash"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kasada Sayılan Nakit Tutar</FormLabel>
              <FormControl><Input type="number" step="0.01" {...field} autoFocus /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="countedVisa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visa POS Cihazı Toplam Tutar</FormLabel>
              <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit">Değişiklikleri Kaydet</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

interface CashboxProps {
    history: CashboxHistory[];
    openingCash: number;
    cashIn: number;
    visaIn: number;
    totalIn: number;
    cashOut: number;
    expectedCash: number;
    onDayClose: (data: { countedCash: number; countedVisa: number }) => void;
    onUpdateHistory: (data: CashboxHistory) => void;
}

export default function Cashbox({ history, openingCash, cashIn, visaIn, totalIn, cashOut, expectedCash, onDayClose, onUpdateHistory }: CashboxProps) {
  const [dayCloseOpen, setDayCloseOpen] = useState(false);
  const [editHistoryOpen, setEditHistoryOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<CashboxHistory | undefined>(undefined);
  const isMobile = useIsMobile();

  const handleOpenEditDialog = (entry: CashboxHistory) => {
    setSelectedEntry(entry);
    setEditHistoryOpen(true);
  }

  const renderLoadingSkeleton = () => (
    <div className="space-y-3">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );

  const renderDesktopView = () => (
     <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarih</TableHead>
            <TableHead className="text-right">Devreden Nakit</TableHead>
            <TableHead className="text-right">Nakit Girişi</TableHead>
            <TableHead className="text-right">Visa Girişi</TableHead>
            <TableHead className="text-right">Nakit Çıkışı</TableHead>
            <TableHead className="text-right">Kapanış Nakit</TableHead>
            <TableHead className="text-right">Kapanış Visa</TableHead>
            <TableHead className="text-right">Nakit Fark</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.length > 0 ? history.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">{new Date(entry.date).toLocaleDateString('tr-TR')}</TableCell>
              <TableCell className="text-right font-mono">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.openingCash ?? 0)}</TableCell>
              <TableCell className="text-right font-mono text-green-600">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.cashIn ?? 0)}</TableCell>
              <TableCell className="text-right font-mono text-blue-600">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.visaIn ?? 0)}</TableCell>
              <TableCell className="text-right font-mono text-destructive">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.cashOut ?? 0)}</TableCell>
              <TableCell className="text-right font-mono">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.countedCash ?? 0)}</TableCell>
              <TableCell className="text-right font-mono">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.countedVisa ?? 0)}</TableCell>
                <TableCell className={`text-right font-mono ${(entry.cashDifference ?? 0) !== 0 ? 'text-amber-600 font-bold' : ''}`}>
                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.cashDifference ?? 0)}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(entry)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">Geçmiş kasa kaydı bulunamadı.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
  );

  const renderMobileView = () => (
    <div className="space-y-3">
        {history.length > 0 ? history.map((entry) => (
            <Card key={entry.id}>
                <CardHeader className="flex flex-row items-start justify-between p-4">
                    <div>
                        <CardTitle className="text-lg">{new Date(entry.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}</CardTitle>
                        <CardDescription>Toplam Kapanış: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format((entry.countedCash ?? 0) + (entry.countedVisa ?? 0))}</CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className={`text-right ${(entry.cashDifference ?? 0) !== 0 ? 'text-amber-600' : ''}`}>
                        <p className="text-xs">Nakit Fark</p>
                        <p className="font-bold font-mono">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.cashDifference ?? 0)}</p>
                      </div>
                       <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" onClick={(e) => e.stopPropagation()}>
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onClick={() => handleOpenEditDialog(entry)}>Düzenle</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">İşlem Detayları</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <span>Açılış Nakit:</span><span className="text-right font-mono">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.openingCash ?? 0)}</span>
                            <span>Nakit Giriş:</span><span className="text-right font-mono text-green-600">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.cashIn ?? 0)}</span>
                            <span>Visa Giriş:</span><span className="text-right font-mono text-blue-600">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.visaIn ?? 0)}</span>
                            <span>Nakit Çıkış:</span><span className="text-right font-mono text-destructive">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.cashOut ?? 0)}</span>
                        </div>
                    </div>
                     <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Kapanış Detayları</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <span className="font-semibold">Kapanış Nakit:</span><span className="text-right font-mono font-semibold">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.countedCash ?? 0)}</span>
                            <span className="font-semibold">Kapanış Visa:</span><span className="text-right font-mono font-semibold">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.countedVisa ?? 0)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )) : (
            <div className="h-24 text-center flex items-center justify-center">
                <p className="text-muted-foreground">Geçmiş kasa kaydı bulunamadı.</p>
            </div>
        )}
    </div>
  );

  return (
    <div className="grid gap-6">
       <Dialog open={editHistoryOpen} onOpenChange={setEditHistoryOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Kasa Kaydını Düzenle</DialogTitle>
                {selectedEntry && (
                    <DialogDescription>
                        {new Date(selectedEntry.date).toLocaleDateString('tr-TR')} tarihli kaydı düzenleyin.
                    </DialogDescription>
                )}
            </DialogHeader>
            {selectedEntry && <EditHistoryForm entry={selectedEntry} setOpen={setEditHistoryOpen} onUpdateHistory={onUpdateHistory} />}
          </DialogContent>
        </Dialog>

       <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Günlük Kasa Özeti</CardTitle>
                <CardDescription>Nakit, Visa ve gider hareketleri özeti.</CardDescription>
            </div>
            <Dialog open={dayCloseOpen} onOpenChange={setDayCloseOpen}>
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
                <CloseDayForm setOpen={setDayCloseOpen} expectedCash={expectedCash} onDayClose={onDayClose} />
            </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Devreden Nakit</CardTitle>
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(openingCash)}</div>
                    <p className="text-xs text-muted-foreground">Dünkü kapanış tutarı</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Günlük Ciro</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalIn)}</div>
                    <p className="text-xs text-muted-foreground">
                        Nakit: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cashIn)}
                    </p>
                     <p className="text-xs text-muted-foreground">
                        Visa: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(visaIn)}
                    </p>
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
                    <CardTitle className="text-sm font-medium">Beklenen Nakit Bakiyesi</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(expectedCash)}</div>
                    <p className="text-xs text-muted-foreground">Sistemdeki güncel nakit bakiye</p>
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
           {isMobile === undefined ? renderLoadingSkeleton() : (isMobile ? renderMobileView() : renderDesktopView())}
        </CardContent>
      </Card>
    </div>
  )
}
