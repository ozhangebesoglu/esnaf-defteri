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
  productId: z.string().min(1, "Please select a product."),
  quantity: z.coerce.number().int("Quantity must be a whole number."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  category: z.enum(['Spoilage', 'Theft', 'Data Entry Error', 'Received Product Error', 'Discount', 'Other']),
});

const categoryColors: { [key in StockAdjustment['category']]: string } = {
  Spoilage: "bg-yellow-100 text-yellow-800",
  Theft: "bg-red-100 text-red-800",
  "Data Entry Error": "bg-blue-100 text-blue-800",
  "Received Product Error": "bg-purple-100 text-purple-800",
  Discount: "bg-green-100 text-green-800",
  Other: "bg-gray-100 text-gray-800",
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
        title: "AI Categorization Failed",
        description: "Could not suggest a category. Please select one manually.",
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
      title: "Adjustment Submitted",
      description: "The new stock adjustment has been recorded.",
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
              <FormLabel>Product</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select a product" /></SelectTrigger>
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
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., -5 or 10" {...field} />
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
              <FormLabel>Reason / Description</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., 'Received 2 extra cases in shipment from supplier X'" {...field} />
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
                Category
                {isCategorizing && <Loader2 className="h-4 w-4 animate-spin" />}
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="AI will suggest a category..." /></SelectTrigger>
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
          <Button type="submit">Save Adjustment</Button>
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
          <CardTitle>Stock Adjustments</CardTitle>
          <CardDescription>A log of all manual inventory changes.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Adjustment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Stock Adjustment</DialogTitle>
              <DialogDescription>
                Record a new change to product inventory levels.
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
              <TableHead>Product</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
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
