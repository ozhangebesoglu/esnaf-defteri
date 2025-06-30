'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/logo';

const formSchema = z.object({
  email: z.string().email({ message: 'Lütfen geçerli bir e-posta adresi girin.' }),
  password: z.string().min(6, { message: 'Şifre en az 6 karakter olmalıdır.' }),
  confirmPassword: z.string().optional(),
}).refine((data) => {
    // If confirmPassword is not provided (login form), skip validation.
    if (data.confirmPassword === undefined) {
        return true;
    }
    // If it is provided (signup form), it must match the password.
    return data.password === data.confirmPassword;
}, {
  message: "Şifreler eşleşmiyor.",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

const getFirebaseAuthErrorMessage = (errorCode: string) => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Lütfen geçerli bir e-posta adresi girin.';
    case 'auth/user-disabled':
      return 'Bu kullanıcı hesabı devre dışı bırakılmıştır.';
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'E-posta adresi veya şifre hatalı.';
    case 'auth/wrong-password':
      return 'Girilen şifre yanlış.';
    case 'auth/email-already-in-use':
      return 'Bu e-posta adresi zaten başka bir hesap tarafından kullanılıyor.';
    case 'auth/weak-password':
      return 'Şifre çok zayıf. Lütfen en az 6 karakterli daha güçlü bir şifre seçin.';
    case 'auth/too-many-requests':
        return 'Çok fazla başarısız giriş denemesi yapıldı. Lütfen daha sonra tekrar deneyin.';
    default:
      return 'Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.';
  }
};


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const handleLogin = async (data: FormData) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({ title: 'Giriş Başarılı', description: 'Yönlendiriliyorsunuz...' });
      router.replace('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Giriş Başarısız',
        description: getFirebaseAuthErrorMessage(error.code),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (data: FormData) => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      toast({ title: 'Kayıt Başarılı', description: 'Hesabınız oluşturuldu. Yönlendiriliyorsunuz...' });
      router.replace('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Kayıt Başarısız',
        description: getFirebaseAuthErrorMessage(error.code),
      });
    } finally {
      setLoading(false);
    }
  };

  // We use a separate handler to decide which function to call based on the active tab.
  const onSubmit = (tab: 'login' | 'signup') => {
    return (data: FormData) => {
      if (tab === 'login') {
        handleLogin(data);
      } else {
        handleSignUp(data);
      }
    };
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Tabs defaultValue="login" className="w-full max-w-md">
         <div className="flex justify-center mb-4 items-center gap-2">
             <Logo className="w-12 h-12 text-primary" />
             <h1 className="text-3xl font-headline font-bold">Esnaf Defteri</h1>
         </div>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Giriş Yap</TabsTrigger>
          <TabsTrigger value="signup">Kayıt Ol</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <form onSubmit={handleSubmit(onSubmit('login'))}>
            <Card>
              <CardHeader>
                <CardTitle>Giriş Yap</CardTitle>
                <CardDescription>Hesabınıza erişmek için bilgilerinizi girin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-posta</Label>
                  <Input id="login-email" type="email" placeholder="ornek@mail.com" {...register('email')} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Şifre</Label>
                  <Input id="login-password" type="password" {...register('password')} />
                  {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Giriş Yap
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
        <TabsContent value="signup">
          <form onSubmit={handleSubmit(onSubmit('signup'))}>
            <Card>
              <CardHeader>
                <CardTitle>Kayıt Ol</CardTitle>
                <CardDescription>Yeni bir hesap oluşturmak için bilgilerinizi girin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">E-posta</Label>
                  <Input id="signup-email" type="email" placeholder="ornek@mail.com" {...register('email')} />
                   {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Şifre</Label>
                  <Input id="signup-password" type="password" {...register('password')} />
                  {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Şifre Tekrarı</Label>
                  <Input id="signup-confirm-password" type="password" {...register('confirmPassword')} />
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Kayıt Ol
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
