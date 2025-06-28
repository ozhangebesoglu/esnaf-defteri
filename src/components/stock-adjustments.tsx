"use client"

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Loader2, Pencil, Trash2 } from "lucide-react";
import { categorizeStockAdjustment } from "@/ai/flows/categorize-stock-adjustment";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { StockAdjustment, Product } from "@/lib/types";
import { ProductIcon } from "./product-icons";

const adjustmentSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1, "Lütfen bir ürün seçin."),
  quantity: z.coerce.number().int("Miktar tam sayı olmalıdır.").refine(val => val !== 0, "Miktar 0 olamaz."),
  description: z.string().min(10, "Açıklama en az 10 karakter olmalıdır."),
  category: z.enum(['Bozulma', 'Hırsızlık', 'Veri Giriş Hatası', 'Hatalı Ürün Alımı', 'İndirim', 'Diğer']),
});

const categoryColors: { [key in StockAdjustment['category']]: string } = {
  'Bozulma': "bg-yellow-100 text-yellow-800",
  'Hırsızlık': "bg-red-100 text-red-800",
  "Veri Giriş Hatası": "bg-blue-100 text-blue-800",
  "Hatalı Ürün Alımı": "bg-purple-100 text-purple-800",
  'İndirim': "bg-green-100 text-green-800",
  'Diğer': "bg-gray-100 text-gray-800",
};

function AdjustmentForm({ adjustment, setOpen, onSave, products }: { 
  adjustment?: StockAdjustment, 
  setOpen: (open: boolean) => void,
  onSave: (data: any) => void,
  products: Product[],
}) {
  const [isCategorizing, setIsCategorizing] = useState(false);
  
  const form = useForm<z.infer<typeof adjustmentSchema>>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: adjustment || {
      quantity: undefined,
      description: "",
      category: undefined,
      productId: undefined,
    },
  });

  const description = form.watch("description");

  const handleCategorize = useCallback(async (desc: string) => {
    if (desc.trim().length < 10) return;
    setIsCategorizing(true);
    try {
      const result = await categorizeStockAdjustment({ description: desc });
      if (result.category && adjustmentSchema.shape.category.safeParse(result.category).success) {
        form.setValue("category", result.category as StockAdjustment['category'], { shouldValidate: true });
      }
    } catch (error) {
        console.error("AI categorization failed:", error);
    } finally {
      setIsCategorizing(false);
    }
  }, [form]);

  useEffect(() => {
    if (adjustment) return; // Don't auto-categorize on edit

    const handler = setTimeout(() => {
      if (description) {
        handleCategorize(description);
      }
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [description, handleCategorize, adjustment]);

  function onSubmit(values: z.infer<typeof adjustmentSchema>) {
    onSave(values);
    setOpen(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ürün</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Bir ürün seçin" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Miktar (Adet/Kg)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Stok artışı için pozitif (örn: 10), azalışı için negatif (örn: -5)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Neden / Açıklama</FormLabel>
              <FormControl>
                <Textarea placeholder="örn., 'Tedarikçi X'ten 2 kasa fazla geldi' veya 'Son kullanma tarihi geçti'" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Kategori
                {isCategorizing && <Loader2 className="h-4 w-4 animate-spin" />}
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Yapay zeka bir kategori önerecek..." /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {adjustmentSchema.shape.category.options.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit">Hareketi Kaydet</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

interface StockAdjustmentsProps {
    stockAdjustments: StockAdjustment[];
    products: Product[];
    onAddStockAdjustment: (data: Omit<StockAdjustment, 'id' | 'productName' | 'date'>) => void;
    onUpdateStockAdjustment: (data: StockAdjustment) => void;
    onDeleteStockAdjustment: (id: string) => void;
}

export default function StockAdjustments({ stockAdjustments, products, onAddStockAdjustment, onUpdateStockAdjustment, onDeleteStockAdjustment }: StockAdjustmentsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<StockAdjustment | undefined>(undefined);
  const [adjustmentToDelete, setAdjustmentToDelete] = useState<StockAdjustment | null>(null);

  const handleOpenDialog = (adjustment?: StockAdjustment) => {
    setSelectedAdjustment(adjustment);
    setDialogOpen(true);
  };
  
  const handleSave = (data: any) => {
      if(selectedAdjustment) {
          onUpdateStockAdjustment(data);
      } else {
          onAddStockAdjustment(data);
      }
  }

  const handleDelete = () => {
    if (adjustmentToDelete) {
        onDeleteStockAdjustment(adjustmentToDelete.id);
        setAdjustmentToDelete(null);
    }
  }

  return (
    <>
      <AlertDialog open={!!adjustmentToDelete} onOpenChange={() => setAdjustmentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Seçilen stok hareketi kalıcı olarak silinecektir. Bu işlem ilgili ürünün stok miktarını da güncelleyecektir.
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
            <CardTitle>Stok Hareketleri</CardTitle>
            <CardDescription>Tüm manuel envanter değişikliklerinin kaydı.</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(isOpen) => { if(!isOpen) setSelectedAdjustment(undefined); setDialogOpen(isOpen);}}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Yeni Hareket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{selectedAdjustment ? 'Hareketi Düzenle' : 'Yeni Stok Hareketi'}</DialogTitle>
                <DialogDescription>
                  {selectedAdjustment ? 'Mevcut stok hareketini düzenleyin.' : 'Ürün envanter seviyelerinde yeni bir değişiklik kaydedin.'}
                </DialogDescription>
              </DialogHeader>
              <AdjustmentForm adjustment={selectedAdjustment} setOpen={setDialogOpen} onSave={handleSave} products={products} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ürün</TableHead>
                <TableHead className="text-center">Miktar</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="w-[100px] text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockAdjustments.length > 0 ? stockAdjustments.map((adj) => {
                const product = products.find(p => p.id === adj.productId);
                return (
                <TableRow key={adj.id}>
                  <TableCell className="font-medium flex items-center gap-3">
                    {product && <ProductIcon type={product.type} />}
                    <span>{adj.productName}</span>
                  </TableCell>
                  <TableCell className={`text-center font-bold font-mono text-lg ${adj.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {adj.quantity > 0 ? `+${adj.quantity}` : adj.quantity}
                  </TableCell>
                  <TableCell>{adj.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${categoryColors[adj.category]}`}>{adj.category}</Badge>
                  </TableCell>
                  <TableCell>{adj.date}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(adj)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setAdjustmentToDelete(adj)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )}) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">Kayıtlı stok hareketi bulunamadı.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
