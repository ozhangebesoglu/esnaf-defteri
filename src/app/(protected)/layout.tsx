'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarProvider } from '@/components/ui/sidebar';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    // AuthProvider already shows a loader, but this is a safeguard.
    return null; 
  }
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
      <SidebarProvider>
        {children}
        <div className="absolute top-4 right-6 z-20">
            <Button variant="outline" onClick={handleLogout}>Çıkış Yap</Button>
        </div>
      </SidebarProvider>
  );
}
