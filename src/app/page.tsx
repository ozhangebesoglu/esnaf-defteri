'use client';

import { useState } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { LayoutDashboard, Package, BookUser, ShieldAlert, Banknote } from 'lucide-react';

import Dashboard from '@/components/dashboard';
import Customers from '@/components/customers';
import Monitoring from '@/components/monitoring';
import Inventory from '@/components/inventory';
import Financials from '@/components/financials';
import { Logo } from '@/components/logo';

type View = 'anasayfa' | 'envanter' | 'finansal' | 'cari' | 'uyarilar';

const viewTitles: Record<View, string> = {
  anasayfa: 'Anasayfa',
  envanter: 'Envanter Yönetimi',
  finansal: 'Finansal Durum',
  cari: 'Cari Hesaplar',
  uyarilar: 'Uyarılar',
};

export default function Home() {
  const [activeView, setActiveView] = useState<View>('anasayfa');

  const renderView = () => {
    switch (activeView) {
      case 'anasayfa':
        return <Dashboard />;
      case 'envanter':
        return <Inventory />;
      case 'finansal':
        return <Financials />;
      case 'cari':
        return <Customers />;
      case 'uyarilar':
        return <Monitoring />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="h-16 p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="w-10 h-10 text-primary" />
            <span className="font-headline text-xl font-semibold group-data-[collapsible=icon]:hidden">
              Esnaf Defteri
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('anasayfa')}
                isActive={activeView === 'anasayfa'}
                tooltip="Anasayfa"
              >
                <LayoutDashboard />
                <span>Anasayfa</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('envanter')}
                isActive={activeView === 'envanter'}
                tooltip="Envanter"
              >
                <Package />
                <span>Envanter</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('finansal')}
                isActive={activeView === 'finansal'}
                tooltip="Finansal"
              >
                <Banknote />
                <span>Finansal</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('cari')}
                isActive={activeView === 'cari'}
                tooltip="Cari Hesaplar"
              >
                <BookUser />
                <span>Cari Hesaplar</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('uyarilar')}
                isActive={activeView === 'uyarilar'}
                tooltip="Uyarılar"
              >
                <ShieldAlert />
                <span>Uyarılar</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-xl font-headline font-semibold capitalize">{viewTitles[activeView]}</h1>
        </header>
        <main className="flex-1 p-4 md:p-6">{renderView()}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
