'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, Loader2, Send, User } from 'lucide-react';

import { useAuth } from '@/contexts/auth-context';
import { chatWithAssistant, getChatHistory } from '@/ai/flows/assistant-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';


const formSchema = z.object({
  message: z.string().min(1, 'Mesaj boş olamaz.'),
});

const welcomeMessage: Message = {
    role: 'model',
    content: 'Merhaba! Ben Esnaf Defteri asistanınızım. "Ahmet Yılmaz\'a 250 liralık satış ekle" gibi komutlar verebilir veya "Yeni müşteri ekle: Adı Canan Güneş" gibi işlemler yapabilirsiniz.',
};

export default function AiChat() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([welcomeMessage]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  // Load chat history using the server action on component mount
  useEffect(() => {
    if (!user) {
        setIsHistoryLoading(false);
        return;
    };
    
    const loadHistory = async () => {
      setIsHistoryLoading(true);
      try {
        const history = await getChatHistory(user.uid);
        if (history.length > 0) {
            setChatHistory(history);
        } else {
            setChatHistory([welcomeMessage]);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
        const errorMessage: Message = {
            role: 'model',
            content: 'Sohbet geçmişi yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.',
        };
        setChatHistory([errorMessage]);
      } finally {
        setIsHistoryLoading(false);
      }
    };

    loadHistory();
  }, [user]);
  
  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        // This should not happen if the component is rendered, but it's good practice
        return;
    }

    const userMessage: Message = { role: 'user', content: values.message };

    const isFirstMessage = chatHistory.length === 1 && chatHistory[0].content === welcomeMessage.content;
    
    if (isFirstMessage) {
        setChatHistory([userMessage]);
    } else {
        setChatHistory(current => [...current, userMessage]);
    }
    
    setIsLoading(true);
    form.reset();

    try {
      const response = await chatWithAssistant({
        newMessage: userMessage.content,
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

  // Filter history to only show renderable messages (user and model text responses)
  const renderableHistory = chatHistory.filter(m => typeof m.content === 'string');

  return (
    <Card className="h-[calc(100vh-8rem)] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Bot /> Yapay Zeka Asistanı</CardTitle>
        <CardDescription>
          İşletmenizle ilgili komutlar verin, anında gerçekleştirilsin. Konuşmalarınız hatırlanacaktır.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4 -mr-4">
            <div className="space-y-6">
                {isHistoryLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : renderableHistory.map((message, index) => (
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
                 <div ref={messagesEndRef} />
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
                                <Input placeholder="Mesajınızı buraya yazın..." {...field} disabled={isLoading || isHistoryLoading} autoComplete="off" />
                            </FormControl>
                        </FormItem>
                    )}
                    />
                    <Button type="submit" disabled={isLoading || isHistoryLoading} size="icon">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </Form>
        </div>
      </CardContent>
    </Card>
  );
}
