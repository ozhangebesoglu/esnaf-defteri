'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, Loader2, Send, User } from 'lucide-react';

import { useAuth } from '@/contexts/auth-context';
import { chatWithAssistant } from '@/ai/flows/assistant-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';


export type Message = {
    role: 'user' | 'model' | 'tool';
    content: any; // Can be string or tool content
};


const formSchema = z.object({
  message: z.string().min(1, 'Mesaj boş olamaz.'),
});


export default function AiChat() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      role: 'model',
      content: 'Merhaba! Ben Esnaf Defteri asistanınızım. "Ahmet Yılmaz\'a 250 liralık satış ekle" gibi komutlar verebilir veya "Yeni müşteri ekle: Adı Canan Güneş" gibi işlemler yapabilirsiniz.',
    },
  ]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });
  
  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }
  }, [chatHistory]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        const errorMessage: Message = {
            role: 'model',
            content: 'Bu özelliği kullanmak için lütfen giriş yapın.',
        };
        setChatHistory(current => [...current, errorMessage]);
        return;
    }

    const userMessage: Message = { role: 'user', content: values.message };
    const newMessages = [...chatHistory, userMessage];
    setChatHistory(newMessages);
    
    setIsLoading(true);
    form.reset();

    try {
      const response = await chatWithAssistant({
        chatHistory: newMessages,
        userId: user.uid,
      });
      
      const modelMessage: Message = { role: 'model', content: response.textResponse };
      setChatHistory((current) => [...current, modelMessage]);

    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: Message = {
        role: 'model',
        content: 'Üzgünüm, bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
      };
      setChatHistory((current) => [...current, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="h-[calc(100vh-8rem)] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Bot /> Yapay Zeka Asistanı</CardTitle>
        <CardDescription>
          İşletmenizle ilgili komutlar verin, anında gerçekleştirilsin.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
            <div className="space-y-6">
                {chatHistory.filter(m => m.role !== 'tool').map((message, index) => (
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
