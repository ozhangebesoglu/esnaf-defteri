"use client"

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Loader2, Pencil } from "lucide-react";
import { categorizeExpense } from "@/ai/flows/categorize-expense-flow";
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
import { expenses } from "@/lib/data";
import type { Expense } from "@/lib/types";

const expenseSchema = z.object({
  description: z.string().min(5, "Açıklama en az 5 karakter olmalıdır."),
  amount: z.coerce.number().positive("Tutar pozitif bir sayı olmalıdır."),
  category: z.enum(['Kira', 'Fatura', 'Malzeme', 'Maaş', 'Diğer']),
  date: z.string().optional(),
});

const categoryColors: { [key in Expense['category']]: string } = {
  'Kira': "bg-sky-100 text-sky-800",
  'Fatura': "bg-amber-100 text-amber-800",
  "Malzeme": "bg-lime-100 text-lime-800",
  "Maaş": "bg-violet-100 text-violet-800",
  'Diğer': "bg-gray-100 text-gray-800",
};

function ExpenseForm({ expense, setOpen }: { expense?: Expense, setOpen: (open: boolean) => void }) {
  const { toast } = useToast();
  const [isCategorizing, setIsCategorizing] = useState(false);
  
  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense || {
      description: "",
    },
  });

  const description = form.watch("description");

  const handleCategorize = useCallback(async (desc: string) => {
    if (desc.trim().length < 5) return;
    setIsCategorizing(true);
    try {
      const result = await categorizeExpense({ description: desc });
      if (result.category && expenseSchema.shape.category.safeParse(result.category).success) {
        form.setValue("category", result.category as Expense['category'], { shouldValidate: true });
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
    if (expense) return; // Don't auto-categorize on edit.
    
    const handler = setTimeout(() => {
      if (description) {
        handleCategorize(description);
      }
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [description, handleCategorize, expense]);

  function onSubmit(values: z.infer<typeof expenseSchema>) {
    console.log(values);
    toast({
      title: `Gider ${expense ? 'Güncellendi' : 'Kaydedildi'}`,
      description: "Gider bilgileri başarıyla kaydedildi.",
    });
    setOpen(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Açıklama</FormLabel>
              <FormControl>
                <Textarea placeholder="örn., 'Ekim ayı dükkan kirası' veya 'Tedarikçi A ödemesi'" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tutar (₺)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="örn., 250.50" {...field} />
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
                  {expenseSchema.shape.category.options.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit">Gideri Kaydet</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export default function Expenses() {
  const [open, setOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>(undefined);

  const handleOpenDialog = (expense?: Expense) => {
    setSelectedExpense(expense);
    setOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Giderler</CardTitle>
          <CardDescription>İşletmenizin tüm harcamalarının kaydı.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => { if(!isOpen) setSelectedExpense(undefined); setOpen(isOpen);}}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Yeni Gider
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedExpense ? 'Gideri Düzenle' : 'Yeni Gider Ekle'}</DialogTitle>
              <DialogDescription>
                {selectedExpense ? 'Mevcut giderin bilgilerini güncelleyin.' : 'İşletmenizle ilgili yeni bir harcamayı kaydedin.'}
              </DialogDescription>
            </DialogHeader>
            <ExpenseForm expense={selectedExpense} setOpen={setOpen} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Açıklama</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Tutar</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{expense.date}</TableCell>
                <TableCell className="font-medium">{expense.description}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${categoryColors[expense.category]}`}>{expense.category}</Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-destructive">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(expense.amount)}
                </TableCell>
                 <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(expense)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
