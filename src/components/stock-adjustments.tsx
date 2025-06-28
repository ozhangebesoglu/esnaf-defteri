"use client"

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Loader2 } from "lucide-react";
import { categorizeStockAdjustment } from "@/ai/flows/categorize-stock-adjustment";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { stockAdjustments, products } from "@/lib/data";
import type { StockAdjustment } from "@/lib/types";
import { ProductIcon } from "./product-icons";

const adjustmentSchema = z.object({
  productId: z.string().min(1, "Lütfen bir ürün seçin."),
  quantity: z.coerce.number().int("Miktar tam sayı olmalıdır."),
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

function AdjustmentForm({ setOpen }: { setOpen: (open: boolean) => void }) {
  const { toast } = useToast();
  const [isCategorizing, setIsCategorizing] = useState(false);
  
  const form = useForm<z.infer<typeof adjustmentSchema>>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      quantity: 0,
      description: "",
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
      toast({
        variant: "destructive",
        title: "Yapay Zeka Sınıflandırması Başarısız",
        description: "Bir kategori önerilemedi. Lütfen manuel olarak seçin.",
      });
    } finally {
      setIsCategorizing(false);
    }
  }, [form, toast]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (description) {
        handleCategorize(description);
      }
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [description, handleCategorize]);

  function onSubmit(values: z.infer<typeof adjustmentSchema>) {
    console.log(values);
    toast({
      title: "Hareket Gönderildi",
      description: "Yeni stok hareketi kaydedildi.",
    });
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
              <FormLabel>Miktar</FormLabel>
              <FormControl>
                <Input type="number" placeholder="örn., -5 veya 10" {...field} />
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
                <Textarea placeholder="örn., 'Tedarikçi X'ten 2 kasa fazla geldi'" {...field} />
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

export default function StockAdjustments() {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Stok Hareketleri</CardTitle>
          <CardDescription>Tüm manuel envanter değişikliklerinin kaydı.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Yeni Hareket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Yeni Stok Hareketi</DialogTitle>
              <DialogDescription>
                Ürün envanter seviyelerinde yeni bir değişiklik kaydedin.
              </DialogDescription>
            </DialogHeader>
            <AdjustmentForm setOpen={setOpen} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ürün</TableHead>
              <TableHead className="text-center">Miktar</TableHead>
              <TableHead>Neden</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Tarih</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stockAdjustments.map((adj) => (
              <TableRow key={adj.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <ProductIcon type={products.find(p => p.name === adj.product)?.type || 'beef'} />
                  {adj.product}
                </TableCell>
                <TableCell className={`text-center font-bold ${adj.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {adj.quantity > 0 ? `+${adj.quantity}` : adj.quantity}
                </TableCell>
                <TableCell>{adj.reason}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${categoryColors[adj.category]}`}>{adj.category}</Badge>
                </TableCell>
                <TableCell>{adj.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
