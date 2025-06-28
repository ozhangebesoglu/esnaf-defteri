"use client"

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Loader2, Pencil, Trash2 } from "lucide-react";
import { categorizeExpense } from "@/ai/flows/categorize-expense-flow";

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
import type { Expense } from "@/lib/types";

const expenseSchema = z.object({
  id: z.string().optional(),
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

function ExpenseForm({ expense, setOpen, onSave }: { expense?: Expense, setOpen: (open: boolean) => void, onSave: (data: any) => void }) {
  const [isCategorizing, setIsCategorizing] = useState(false);
  
  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense || {
      description: "",
      category: undefined,
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
      console.error("AI categorization failed:", error);
    } finally {
      setIsCategorizing(false);
    }
  }, [form]);

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
    onSave(values);
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

interface ExpensesProps {
    expenses: Expense[];
    onAddExpense: (data: Omit<Expense, 'id' | 'date'>) => void;
    onUpdateExpense: (data: Expense) => void;
    onDeleteExpense: (id: string) => void;
}

export default function Expenses({ expenses, onAddExpense, onUpdateExpense, onDeleteExpense }: ExpensesProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>(undefined);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const handleOpenDialog = (expense?: Expense) => {
    setSelectedExpense(expense);
    setDialogOpen(true);
  };
  
  const handleSave = (data: any) => {
    if (selectedExpense) {
      onUpdateExpense(data);
    } else {
      onAddExpense(data);
    }
  }

  const handleDelete = () => {
      if(expenseToDelete) {
          onDeleteExpense(expenseToDelete.id);
          setExpenseToDelete(null);
      }
  }

  return (
    <>
      <AlertDialog open={!!expenseToDelete} onOpenChange={() => setExpenseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Seçilen gider kaydı kalıcı olarak silinecektir.
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
            <CardTitle>Giderler</CardTitle>
            <CardDescription>İşletmenizin tüm harcamalarının kaydı.</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(isOpen) => { if(!isOpen) setSelectedExpense(undefined); setDialogOpen(isOpen);}}>
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
              <ExpenseForm expense={selectedExpense} setOpen={setDialogOpen} onSave={handleSave} />
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
                <TableHead className="w-[100px] text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length > 0 ? expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${categoryColors[expense.category]}`}>{expense.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-destructive">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(expense.amount)}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(expense)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setExpenseToDelete(expense)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">Kayıtlı gider bulunamadı.</TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
