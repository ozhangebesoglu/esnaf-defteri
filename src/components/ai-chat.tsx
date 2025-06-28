'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, Loader2, Send, User } from 'lucide-react';

import { chatWithAssistant } from '@/ai/flows/assistant-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Customer, Product, Order, Expense, StockAdjustment, CashboxHistory, MonitoringAlert } from '@/lib/types';

interface AiChatProps {
    customers: Customer[];
    products: Product[];
    orders: Order[];
    expenses: Expense[];
    stockAdjustments: StockAdjustment[];
    cashboxHistory: CashboxHistory[];
    alerts: MonitoringAlert[];
    onAddSale: (data: Omit<Order, 'id' | 'customerName' | 'date' | 'status' | 'items'>) => void;
    onAddPayment: (data: { customerId: string, total: number, description: string }) => void;
    onAddExpense: (data: Omit<Expense, 'id' | 'date'>) => void;
    onAddStockAdjustment: (data: Omit<StockAdjustment, 'id' | 'productName' | 'date'>) => void;
    onDeleteCustomer: (id: string) => void;
    onDeleteProduct: (id: string) => void;
    onDeleteSale: (id: string) => void;
    onDeleteExpense: (id: string) => void;
    onDeleteStockAdjustment: (id: string) => void;
}

const formSchema = z.object({
  message: z.string().min(1, 'Mesaj boş olamaz.'),
});

type Message = {
    role: 'user' | 'model';
    content: string;
};

export default function AiChat({
    customers,
    products,
    orders,
    expenses,
    stockAdjustments,
    cashboxHistory,
    alerts,
    onAddSale,
    onAddPayment,
    onAddExpense,
    onAddStockAdjustment,
    onDeleteCustomer,
    onDeleteProduct,
    onDeleteSale,
    onDeleteExpense,
    onDeleteStockAdjustment
}: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: 'Merhaba! Ben Esnaf Defteri asistanınızım. "Ahmet Yılmaz\'a 250 liralık satış ekle" gibi komutlar verebilir veya "En borçlu müşteri kim?" gibi sorular sorabilirsiniz.',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const userMessage: Message = { role: 'user', content: values.message };
    setMessages((current) => [...current, userMessage]);
    setIsLoading(true);
    form.reset();

    try {
      const appData = {
        customers,
        products,
        orders,
        expenses,
        stockAdjustments,
        cashboxHistory,
        alerts,
      };

      const response = await chatWithAssistant({
        userMessage: values.message,
        chatHistory: messages,
        appData,
      });
      
      const modelMessage: Message = { role: 'model', content: response.textResponse };
      setMessages((current) => [...current, modelMessage]);

      if (response.action) {
        switch (response.action.type) {
            case 'addSale':
                onAddSale(response.action.payload);
                break;
            case 'addPayment':
                onAddPayment(response.action.payload);
                break;
            case 'addExpense':
                onAddExpense(response.action.payload);
                break;
            case 'addStockAdjustment':
                onAddStockAdjustment(response.action.payload);
                break;
            case 'deleteCustomer':
                onDeleteCustomer(response.action.payload);
                break;
            case 'deleteProduct':
                onDeleteProduct(response.action.payload);
                break;
            case 'deleteSale':
                onDeleteSale(response.action.payload);
                break;
            case 'deleteExpense':
                onDeleteExpense(response.action.payload);
                break;
            case 'deleteStockAdjustment':
                onDeleteStockAdjustment(response.action.payload);
                break;
        }
      }

    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: Message = {
        role: 'model',
        content: 'Üzgünüm, bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
      };
      setMessages((current) => [...current, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="h-[calc(100vh-8rem)] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Bot /> Yapay Zeka Asistanı</CardTitle>
        <CardDescription>
          İşletmenizle ilgili sorular sorun veya komutlar verin, anında yanıt alın.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4 -mr-4">
            <div className="space-y-6">
                {messages.map((message, index) => (
                    <div key={index} className={cn("flex items-start gap-4", message.role === 'user' && 'justify-end')}>
                        {message.role === 'model' && (
                             <Avatar className="h-9 w-9 border">
                                <AvatarFallback><Bot size={20} /></AvatarFallback>
                             </Avatar>
                        )}
                        <div className={cn("max-w-[75%] rounded-lg p-3 text-sm", message.role === 'model' ? 'bg-muted' : 'bg-primary text-primary-foreground')}>
                            <p>{message.content}</p>
                        </div>
                        {message.role === 'user' && (
                             <Avatar className="h-9 w-9 border">
                                <AvatarFallback><User size={20} /></AvatarFallback>
                             </Avatar>
                        )}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-4">
                        <Avatar className="h-9 w-9 border">
                            <AvatarFallback><Bot size={20} /></AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-lg p-3 flex items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    </div>
                )}
            </div>
        </ScrollArea>
        <div className="mt-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
                    <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormControl>
                                <Input placeholder="Mesajınızı buraya yazın..." {...field} disabled={isLoading} autoComplete="off" />
                            </FormControl>
                        </FormItem>
                    )}
                    />
                    <Button type="submit" disabled={isLoading} size="icon">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </Form>
        </div>
      </CardContent>
    </Card>
  );
}
