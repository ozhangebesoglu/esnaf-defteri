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
import { LayoutDashboard, Boxes, Users, ShieldAlert } from 'lucide-react';

import Dashboard from '@/components/dashboard';
import StockAdjustments from '@/components/stock-adjustments';
import Customers from '@/components/customers';
import Monitoring from '@/components/monitoring';
import { Logo } from '@/components/logo';

type View = 'dashboard' | 'stock' | 'customers' | 'monitoring';

export default function Home() {
  const [activeView, setActiveView] = useState<View>('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'stock':
        return <StockAdjustments />;
      case 'customers':
        return <Customers />;
      case 'monitoring':
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
              ButcherTrack
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('dashboard')}
                isActive={activeView === 'dashboard'}
                tooltip="Dashboard"
              >
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('stock')}
                isActive={activeView === 'stock'}
                tooltip="Stock"
              >
                <Boxes />
                <span>Stock Adjustments</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('customers')}
                isActive={activeView === 'customers'}
                tooltip="Customers"
              >
                <Users />
                <span>Customers</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('monitoring')}
                isActive={activeView === 'monitoring'}
                tooltip="Monitoring"
              >
                <ShieldAlert />
                <span>Monitoring</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-xl font-headline font-semibold capitalize">{activeView === 'stock' ? 'Stock Adjustments' : activeView}</h1>
        </header>
        <main className="flex-1 p-4 md:p-6">{renderView()}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
