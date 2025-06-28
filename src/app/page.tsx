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
import { LayoutDashboard, Package, BookUser, ShieldAlert, Banknote, UtensilsCrossed, AreaChart, Sparkles, Wallet } from 'lucide-react';

import Dashboard from '@/components/dashboard';
import Customers from '@/components/customers';
import Monitoring from '@/components/monitoring';
import Inventory from '@/components/inventory';
import Financials from '@/components/financials';
import Cashbox from '@/components/cashbox';
import Restaurant from '@/components/restaurant';
import Reports from '@/components/reports';
import AiChat from '@/components/ai-chat';
import { Logo } from '@/components/logo';

import { 
  initialCustomers, 
  initialExpenses, 
  initialOrders, 
  initialProducts, 
  initialStockAdjustments,
  initialCashboxHistory,
  initialAlerts,
  salesData
} from '@/lib/data';
import type { Customer, Order, Product, Expense, StockAdjustment, CashboxHistory, MonitoringAlert } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

type View = 'anasayfa' | 'envanter' | 'finansal' | 'cari' | 'restoran' | 'kasa' | 'raporlar' | 'uyarilar' | 'yapay-zeka';

const viewTitles: Record<View, string> = {
  anasayfa: 'Anasayfa',
  envanter: 'Envanter Yönetimi',
  finansal: 'Finansal Durum',
  cari: 'Müşteriler',
  restoran: 'Restoran Satışları',
  kasa: 'Kasa Yönetimi',
  raporlar: 'Raporlar',
  uyarilar: 'Uyarılar',
  'yapay-zeka': 'Yapay Zeka Asistanı'
};

// A simple ID generator
const generateId = (prefix: string) => `${prefix}${Math.random().toString(36).substr(2, 9)}`;

// Date helper
const isToday = (date: string | Date) => {
  const today = new Date();
  const someDate = new Date(date);
  return someDate.getDate() === today.getDate() &&
         someDate.getMonth() === today.getMonth() &&
         someDate.getFullYear() === today.getFullYear();
}

export default function Home() {
  const [activeView, setActiveView] = useState<View>('anasayfa');
  const { toast } = useToast();

  // In-memory state management
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(initialStockAdjustments);
  const [cashboxHistory, setCashboxHistory] = useState<CashboxHistory[]>(initialCashboxHistory);
  const [alerts, setAlerts] = useState<MonitoringAlert[]>(initialAlerts);


  // --- Handlers ---
  
  // Customers
  const handleAddCustomer = (data: Omit<Customer, 'id' | 'balance'>) => {
    const newCustomer: Customer = { id: generateId('CUS'), name: data.name, email: data.email, balance: 0 };
    setCustomers(prev => [...prev, newCustomer]);
    toast({ title: "Müşteri Eklendi", description: `${newCustomer.name} başarıyla eklendi.` });
  };
  const handleUpdateCustomer = (data: Customer) => {
    setCustomers(prev => prev.map(c => c.id === data.id ? data : c));
    toast({ title: "Müşteri Güncellendi", description: `${data.name} bilgileri güncellendi.` });
  };
  const handleDeleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    toast({ title: "Müşteri Silindi", description: "Müşteri başarıyla silindi.", variant: "destructive" });
  };

  // Products
  const handleAddProduct = (data: Omit<Product, 'id' | 'stock'>) => {
    const newProduct: Product = { ...data, id: generateId('PROD'), stock: 0 };
    setProducts(prev => [...prev, newProduct]);
    toast({ title: "Ürün Eklendi", description: `${newProduct.name} başarıyla eklendi.` });
  };
  const handleUpdateProduct = (data: Product) => {
    setProducts(prev => prev.map(p => p.id === data.id ? data : p));
    toast({ title: "Ürün Güncellendi", description: `${data.name} bilgileri güncellendi.` });
  };
  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    toast({ title: "Ürün Silindi", description: "Ürün başarıyla silindi.", variant: "destructive" });
  };

  // Sales (Orders)
  const handleAddSale = (data: Omit<Order, 'id' | 'customerName' | 'date' | 'status' | 'items'>) => {
    const customer = customers.find(c => c.id === data.customerId);
    if (!customer) return;

    const newOrder: Order = {
      ...data,
      id: generateId('ORD'),
      customerName: customer.name,
      date: new Date().toISOString(),
      status: 'Tamamlandı',
      items: data.description.split(',').length,
    };
    
    setOrders(prev => [newOrder, ...prev]);
    // Update customer balance
    setCustomers(prev => prev.map(c => c.id === data.customerId ? { ...c, balance: c.balance + data.total } : c));
    toast({ title: "Satış Eklendi", description: "Yeni satış kaydı oluşturuldu." });
  };
   const handleAddPayment = (data: { customerId: string, total: number, description: string }) => {
    const customer = customers.find(c => c.id === data.customerId);
    if (!customer) return;

    const newPayment: Order = {
      id: generateId('PAY'),
      customerId: data.customerId,
      customerName: customer.name,
      description: data.description || 'Nakit Ödeme',
      items: 1,
      total: -data.total, // Payment is a negative total
      status: 'Tamamlandı',
      date: new Date().toISOString(),
    };
    
    setOrders(prev => [newPayment, ...prev]);
    // Update customer balance
    setCustomers(prev => prev.map(c => c.id === data.customerId ? { ...c, balance: c.balance - data.total } : c));
    toast({ title: "Ödeme Alındı", description: `${customer.name} için ödeme kaydedildi.` });
  };
  const handleUpdateSale = (data: Order) => {
    // This is complex because it might affect old and new customer balances.
    // For this version, we will just update the order details.
    setOrders(prev => prev.map(o => o.id === data.id ? data : o));
    toast({ title: "Satış Güncellendi", description: `${data.id} numaralı satış güncellendi.` });
  };
  const handleDeleteSale = (id: string) => {
    const orderToDelete = orders.find(o => o.id === id);
    if (!orderToDelete) return;

    // Revert customer balance if it's a credit sale
    if(orderToDelete.customerId !== 'CASH_SALE') {
        setCustomers(prev => prev.map(c => c.id === orderToDelete.customerId ? { ...c, balance: c.balance - orderToDelete.total } : c));
    }

    setOrders(prev => prev.filter(o => o.id !== id));
    toast({ title: "Satış Silindi", description: "Satış kaydı silindi.", variant: "destructive" });
  };

  // Cash Sales
  const handleAddCashSale = (data: { description: string, total: number }) => {
    const newOrder: Order = {
      id: generateId('CSH'),
      customerId: 'CASH_SALE', // Special ID for non-customer sales
      customerName: 'Peşin Satış',
      date: new Date().toISOString(),
      status: 'Tamamlandı',
      items: data.description.split(',').length,
      description: data.description,
      total: data.total,
    };
    
    setOrders(prev => [newOrder, ...prev]);
    // Note: This does not affect any customer's balance.
    toast({ title: "Peşin Satış Eklendi", description: "Yeni peşin satış kaydı oluşturuldu." });
  };

  // Expenses
  const handleAddExpense = (data: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = { ...data, id: generateId('EXP'), date: new Date().toISOString() };
    setExpenses(prev => [newExpense, ...prev]);
    toast({ title: "Gider Eklendi", description: "Yeni gider kaydı oluşturuldu." });
  };
  const handleUpdateExpense = (data: Expense) => {
    setExpenses(prev => prev.map(e => e.id === data.id ? data : e));
    toast({ title: "Gider Güncellendi" });
  };
  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    toast({ title: "Gider Silindi", variant: "destructive" });
  };

  // Stock Adjustments
  const handleAddStockAdjustment = (data: Omit<StockAdjustment, 'id' | 'productName' | 'date'>) => {
    const product = products.find(p => p.id === data.productId);
    if (!product) return;

    const newAdjustment: StockAdjustment = { 
      ...data, 
      id: generateId('ADJ'), 
      productName: product.name,
      date: new Date().toISOString(),
    };
    setStockAdjustments(prev => [newAdjustment, ...prev]);
    // Update product stock
    setProducts(prev => prev.map(p => p.id === data.productId ? { ...p, stock: p.stock + data.quantity } : p));
    toast({ title: "Stok Hareketi Eklendi" });
  };
  const handleUpdateStockAdjustment = (data: StockAdjustment) => {
    // Logic for reverting old stock and applying new one would be needed for full accuracy
    setStockAdjustments(prev => prev.map(a => a.id === data.id ? data : a));
    toast({ title: "Stok Hareketi Güncellendi" });
  };
  const handleDeleteStockAdjustment = (id: string) => {
    const adjToDelete = stockAdjustments.find(a => a.id === id);
    if(!adjToDelete) return;

    // Revert product stock
    setProducts(prev => prev.map(p => p.id === adjToDelete.productId ? { ...p, stock: p.stock - adjToDelete.quantity } : p));

    setStockAdjustments(prev => prev.filter(a => a.id !== id));
    toast({ title: "Stok Hareketi Silindi", variant: "destructive" });
  };

  // Cashbox Logic
  const openingBalance = cashboxHistory[0]?.closing || 0;
  const cashInToday = orders.filter(o => (o.customerId === 'CASH_SALE' || o.total < 0) && isToday(o.date)).reduce((sum, o) => sum + Math.abs(o.total), 0);
  const cashOutToday = expenses.filter(e => isToday(e.date)).reduce((sum, e) => sum + e.amount, 0); // Assuming all expenses are cash
  const expectedBalance = openingBalance + cashInToday - cashOutToday;

  const handleDayClose = (actualBalance: number) => {
    const difference = actualBalance - expectedBalance;
    const newEntry: CashboxHistory = {
        id: `CBH${cashboxHistory.length + 1}`,
        date: new Date().toISOString(),
        opening: openingBalance,
        cashIn: cashInToday,
        cashOut: cashOutToday,
        closing: actualBalance,
        difference: difference
    };
    setCashboxHistory([newEntry, ...cashboxHistory]);
    toast({
      title: "Gün Kapatıldı",
      description: `Kasa sayımı tamamlandı. Fark: ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(difference)}`,
    });
  };

  const renderView = () => {
    switch (activeView) {
      case 'anasayfa':
        return <Dashboard customers={customers} expenses={expenses} salesData={salesData} />;
      case 'envanter':
        return <Inventory 
                  products={products} 
                  stockAdjustments={stockAdjustments}
                  onAddProduct={handleAddProduct}
                  onUpdateProduct={handleUpdateProduct}
                  onDeleteProduct={handleDeleteProduct}
                  onAddStockAdjustment={handleAddStockAdjustment}
                  onUpdateStockAdjustment={handleUpdateStockAdjustment}
                  onDeleteStockAdjustment={handleDeleteStockAdjustment}
                />;
      case 'finansal':
        return <Financials 
                  orders={orders.filter(o => o.customerId !== 'CASH_SALE')}
                  customers={customers}
                  expenses={expenses}
                  onAddSale={handleAddSale}
                  onUpdateSale={handleUpdateSale}
                  onDeleteSale={handleDeleteSale}
                  onAddExpense={handleAddExpense}
                  onUpdateExpense={handleUpdateExpense}
                  onDeleteExpense={handleDeleteExpense}
                />;
      case 'cari':
        return <Customers 
                  customers={customers}
                  orders={orders}
                  onAddCustomer={handleAddCustomer}
                  onUpdateCustomer={handleUpdateCustomer}
                  onDeleteCustomer={handleDeleteCustomer}
                  onAddPayment={handleAddPayment}
               />;
      case 'restoran':
        return <Restaurant cashSales={orders.filter(o => o.customerId === 'CASH_SALE')} />;
      case 'kasa':
        return <Cashbox 
                  history={cashboxHistory}
                  openingBalance={openingBalance}
                  cashIn={cashInToday}
                  cashOut={cashOutToday}
                  expectedBalance={expectedBalance}
                  onDayClose={handleDayClose}
               />;
      case 'raporlar':
        return <Reports customers={customers} expenses={expenses} orders={orders} products={products} />;
      case 'uyarilar':
        return <Monitoring alerts={alerts} />;
      case 'yapay-zeka':
        return <AiChat 
                  customers={customers}
                  products={products}
                  orders={orders}
                  expenses={expenses}
                  stockAdjustments={stockAdjustments}
                  cashboxHistory={cashboxHistory}
                  alerts={alerts}
                  onAddSale={handleAddSale}
                  onAddPayment={handleAddPayment}
                  onAddExpense={handleAddExpense}
                  onAddStockAdjustment={handleAddStockAdjustment}
                  onAddCustomer={handleAddCustomer}
                  onAddCashSale={handleAddCashSale}
                  onDeleteCustomer={handleDeleteCustomer}
                  onDeleteProduct={handleDeleteProduct}
                  onDeleteSale={handleDeleteSale}
                  onDeleteExpense={handleDeleteExpense}
                  onDeleteStockAdjustment={handleDeleteStockAdjustment}
               />;
      default:
        return <Dashboard customers={customers} expenses={expenses} salesData={salesData} />;
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
                tooltip="Müşteriler"
              >
                <BookUser />
                <span>Müşteriler</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('restoran')}
                isActive={activeView === 'restoran'}
                tooltip="Restoran"
              >
                <UtensilsCrossed />
                <span>Restoran</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('kasa')}
                isActive={activeView === 'kasa'}
                tooltip="Kasa"
              >
                <Wallet />
                <span>Kasa</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('raporlar')}
                isActive={activeView === 'raporlar'}
                tooltip="Raporlar"
              >
                <AreaChart />
                <span>Raporlar</span>
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
             <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('yapay-zeka')}
                isActive={activeView === 'yapay-zeka'}
                tooltip="Yapay Zeka"
              >
                <Sparkles />
                <span>Yapay Zeka</span>
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
