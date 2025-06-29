"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { PlusCircle, Trash2, MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useIsMobile } from "@/hooks/use-mobile"
import type { Order } from "@/lib/types"


const cashSaleSchema = z.object({
  description: z.string().min(3, "Açıklama en az 3 karakter olmalıdır."),
  total: z.coerce.number().positive("Tutar pozitif bir sayı olmalıdır."),
});

function CashSaleForm({ setOpen, onSave }: { setOpen: (open: boolean) => void, onSave: (data: z.infer<typeof cashSaleSchema>) => void }) {
  const form = useForm<z.infer<typeof cashSaleSchema>>({
    resolver: zodResolver(cashSaleSchema),
    defaultValues: {
      description: "",
      total: '' as any,
    },
  });

  function onSubmit(values: z.infer<typeof cashSaleSchema>) {
    onSave(values);
    setOpen(false);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Açıklama / Satılan Ürünler</FormLabel>
              <FormControl>
                <Textarea placeholder="örn., Öğle yemeği, 1kg sucuk" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="total"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Toplam Tutar (₺)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="örn., 120.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit">Peşin Satışı Kaydet</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

interface RestaurantProps {
    cashSales: Order[];
    onAddCashSale: (data: { description: string, total: number }) => void;
    onDeleteSale: (id: string) => void;
}

export default function Restaurant({ cashSales, onAddCashSale, onDeleteSale }: RestaurantProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<Order | null>(null);
  const isMobile = useIsMobile();

  const handleDelete = () => {
    if (saleToDelete) {
        onDeleteSale(saleToDelete.id);
        setSaleToDelete(null);
    }
  }
  
  const renderLoadingSkeleton = () => (
    <div className="space-y-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
    </div>
  );

  const renderDesktopView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>İşlem No</TableHead>
          <TableHead>Tarih</TableHead>
          <TableHead>Açıklama</TableHead>
          <TableHead className="text-right">Tutar</TableHead>
          <TableHead className="w-[100px] text-right">İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cashSales.length > 0 ? cashSales.map((sale) => (
          <TableRow key={sale.id}>
            <TableCell className="font-medium">{sale.id}</TableCell>
            <TableCell>{new Date(sale.date).toLocaleString('tr-TR')}</TableCell>
            <TableCell>{sale.description}</TableCell>
            <TableCell className="text-right font-mono">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(sale.total)}</TableCell>
            <TableCell className="text-right space-x-1">
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setSaleToDelete(sale)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        )) : (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">Bugün peşin satış yapılmadı.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const renderMobileView = () => (
    <div className="space-y-3">
        {cashSales.length > 0 ? cashSales.map((sale) => (
            <Card key={sale.id}>
                <CardContent className="p-4 flex justify-between items-start">
                    <div className="flex-1 space-y-1 pr-2">
                        <p className="font-semibold">{sale.description}</p>
                        <p className="text-xs text-muted-foreground pt-1">{new Date(sale.date).toLocaleString('tr-TR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <p className="font-mono font-semibold text-base whitespace-nowrap">
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(sale.total)}
                        </p>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" onClick={(e) => e.stopPropagation()}>
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onClick={() => setSaleToDelete(sale)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                    Sil
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>
        )) : (
            <div className="h-24 text-center flex items-center justify-center">
                <p className="text-muted-foreground">Bugün peşin satış yapılmadı.</p>
            </div>
        )}
    </div>
  );

  return (
    <>
      <AlertDialog open={!!saleToDelete} onOpenChange={() => setSaleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Seçilen peşin satış kaydı kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
            <CardTitle>Peşin Satışlar</CardTitle>
            <CardDescription>Bir müşteriye bağlanmayan, tezgah veya restorandan yapılan anlık satışlar.</CardDescription>
            </div>
             <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Peşin Satış Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Yeni Peşin Satış Ekle</DialogTitle>
                <DialogDescription>
                  Kasaya doğrudan giren bir satışı kaydedin. Bu işlem müşteri bakiyelerini etkilemez.
                </DialogDescription>
              </DialogHeader>
              <CashSaleForm setOpen={setDialogOpen} onSave={onAddCashSale} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isMobile === undefined ? renderLoadingSkeleton() : (isMobile ? renderMobileView() : renderDesktopView())}
        </CardContent>
      </Card>
    </>
  )
}
