'use client';

import { useState } from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Package, 
  BookUser, 
  ShieldAlert, 
  Banknote, 
  AreaChart, 
  Sparkles, 
  Wallet,
  ShoppingCart,
  Truck,
  Users,
  Megaphone
} from 'lucide-react';

import Dashboard from '@/components/dashboard';
import Customers from '@/components/customers';
import Monitoring from '@/components/monitoring';
import Inventory from '@/components/inventory';
import Financials from '@/components/financials';
import Cashbox from '@/components/cashbox';
import Reports from '@/components/reports';
import AiChat, { type Message } from '@/components/ai-chat';
import { Logo } from '@/components/logo';
import SalesTransactions from '@/components/sales-transactions';
import Suppliers from '@/components/suppliers';
import Staff from '@/components/staff';
import Campaigns from '@/components/campaigns';

import { 
  initialCustomers, 
  initialExpenses, 
  initialOrders, 
  initialProducts, 
  initialStockAdjustments,
  initialCashboxHistory,
  initialAlerts,
  initialSuppliers,
  initialStaff,
  salesData
} from '@/lib/data';
import type { Customer, Order, Product, Expense, StockAdjustment, CashboxHistory, MonitoringAlert, Supplier, Staff as StaffType } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

type View = 
  'anasayfa' | 
  'urun-yonetimi' | 
  'musteri-yonetimi' | 
  'satis-islemleri' |
  'tedarikciler' |
  'personel' |
  'kampanyalar' |
  'mali-isler' | 
  'raporlar' |
  'kasa' | 
  'uyarilar' | 
  'yapay-zeka';

const viewTitles: Record<View, string> = {
  anasayfa: 'Anasayfa',
  'urun-yonetimi': 'Ürün Yönetimi',
  'musteri-yonetimi': 'Müşteri Yönetimi',
  'satis-islemleri': 'Satış İşlemleri',
  tedarikciler: 'Tedarikçiler',
  personel: 'Personel',
  kampanyalar: 'Kampanyalar',
  'mali-isler': 'Mali İşler',
  raporlar: 'Raporlar',
  kasa: 'Kasa Yönetimi',
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

export default function DashboardPage() {
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
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [staff, setStaff] = useState<StaffType[]>(initialStaff);
  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      role: 'model',
      content: 'Merhaba! Ben Esnaf Defteri asistanınızım. "Ahmet Yılmaz\'a 250 liralık satış ekle" gibi komutlar verebilir veya "En borçlu müşteri kim?" gibi sorular sorabilirsiniz.',
    },
  ]);


  // --- Handlers ---
  
  // Customers
  const handleAddCustomer = (data: { name: string; email?: string; initialDebt?: number }) => {
    const newId = generateId('CUS');
    const newCustomer: Customer = { 
        id: newId, 
        name: data.name, 
        email: data.email, 
        balance: data.initialDebt || 0 
    };

    setCustomers(prev => [...prev, newCustomer]);

    if (data.initialDebt && data.initialDebt > 0) {
        const newOrder: Order = {
            id: generateId('ORD'),
            customerId: newId,
            customerName: data.name,
            date: new Date().toISOString(),
            status: 'Tamamlandı',
            items: 1,
            description: 'Başlangıç Bakiyesi / Devir',
            total: data.initialDebt,
        };
        setOrders(prev => [newOrder, ...prev]);
    }
    
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
      total: -data.total,
      status: 'Tamamlandı',
      date: new Date().toISOString(),
    };
    
    setOrders(prev => [newPayment, ...prev]);
    setCustomers(prev => prev.map(c => c.id === data.customerId ? { ...c, balance: c.balance - data.total } : c));
    toast({ title: "Ödeme Alındı", description: `${customer.name} için ödeme kaydedildi.` });
  };
  const handleUpdateSale = (data: Order) => {
    setOrders(prev => prev.map(o => o.id === data.id ? data : o));
    toast({ title: "Satış Güncellendi", description: `${data.id} numaralı satış güncellendi.` });
  };
  const handleDeleteSale = (id: string) => {
    const orderToDelete = orders.find(o => o.id === id);
    if (!orderToDelete) return;

    if(orderToDelete.customerId !== 'CASH_SALE') {
        setCustomers(prev => prev.map(c => c.id === orderToDelete.customerId ? { ...c, balance: c.balance - orderToDelete.total } : c));
    }

    setOrders(prev => prev.filter(o => o.id !== id));
    toast({ title: "İşlem Silindi", description: "Satış veya ödeme kaydı silindi.", variant: "destructive" });
  };

  // Cash Sales
  const handleAddCashSale = (data: { description: string, total: number }) => {
    const newOrder: Order = {
      id: generateId('CSH'),
      customerId: 'CASH_SALE',
      customerName: 'Peşin Satış',
      date: new Date().toISOString(),
      status: 'Tamamlandı',
      items: data.description.split(',').length,
      description: data.description,
      total: data.total,
    };
    
    setOrders(prev => [newOrder, ...prev]);
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
    setProducts(prev => prev.map(p => p.id === data.productId ? { ...p, stock: p.stock + data.quantity } : p));
    toast({ title: "Stok Hareketi Eklendi" });
  };
  const handleUpdateStockAdjustment = (data: StockAdjustment) => {
    setStockAdjustments(prev => prev.map(a => a.id === data.id ? data : a));
    toast({ title: "Stok Hareketi Güncellendi" });
  };
  const handleDeleteStockAdjustment = (id: string) => {
    const adjToDelete = stockAdjustments.find(a => a.id === id);
    if(!adjToDelete) return;

    setProducts(prev => prev.map(p => p.id === adjToDelete.productId ? { ...p, stock: p.stock - adjToDelete.quantity } : p));

    setStockAdjustments(prev => prev.filter(a => a.id !== id));
    toast({ title: "Stok Hareketi Silindi", variant: "destructive" });
  };
  
  // Suppliers
  const handleAddSupplier = (data: Omit<Supplier, 'id'>) => {
    const newSupplier = { ...data, id: generateId('SUP') };
    setSuppliers(prev => [...prev, newSupplier]);
    toast({ title: "Tedarikçi Eklendi", description: `${newSupplier.name} başarıyla eklendi.` });
  };
  const handleUpdateSupplier = (data: Supplier) => {
    setSuppliers(prev => prev.map(s => s.id === data.id ? data : s));
    toast({ title: "Tedarikçi Güncellendi", description: `${data.name} bilgileri güncellendi.` });
  };
  const handleDeleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    toast({ title: "Tedarikçi Silindi", variant: "destructive" });
  };

  // Staff
  const handleAddStaff = (data: Omit<StaffType, 'id'>) => {
    const newStaff = { ...data, id: generateId('STA') };
    setStaff(prev => [...prev, newStaff]);
    toast({ title: "Personel Eklendi", description: `${newStaff.name} başarıyla eklendi.` });
  };
  const handleUpdateStaff = (data: StaffType) => {
    setStaff(prev => prev.map(s => s.id === data.id ? data : s));
    toast({ title: "Personel Güncellendi", description: `${data.name} bilgileri güncellendi.` });
  };
  const handleDeleteStaff = (id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
    toast({ title: "Personel Silindi", variant: "destructive" });
  };


  // Cashbox Logic
  const openingBalance = cashboxHistory[0]?.closing || 0;
  const cashInToday = orders.filter(o => (o.customerId === 'CASH_SALE' || o.total < 0) && isToday(o.date)).reduce((sum, o) => sum + Math.abs(o.total), 0);
  const cashOutToday = expenses.filter(e => isToday(e.date)).reduce((sum, e) => sum + e.amount, 0);
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
  
  const creditSales = orders.filter(o => o.customerId !== 'CASH_SALE');
  const cashSales = orders.filter(o => o.customerId === 'CASH_SALE');


  const renderView = () => {
    switch (activeView) {
      case 'anasayfa':
        return <Dashboard customers={customers} expenses={expenses} salesData={salesData} />;
      case 'urun-yonetimi':
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
      case 'musteri-yonetimi':
        return <Customers 
                  customers={customers}
                  orders={orders}
                  onAddCustomer={handleAddCustomer}
                  onUpdateCustomer={handleUpdateCustomer}
                  onDeleteCustomer={handleDeleteCustomer}
                  onAddPayment={handleAddPayment}
                  onAddSale={handleAddSale}
               />;
      case 'satis-islemleri':
        return <SalesTransactions 
                  creditSales={creditSales}
                  cashSales={cashSales}
                  customers={customers}
                  onAddSale={handleAddSale}
                  onUpdateSale={handleUpdateSale}
                  onDeleteSale={handleDeleteSale}
                  onAddCashSale={handleAddCashSale}
                />;
      case 'tedarikciler':
        return <Suppliers 
                 suppliers={suppliers}
                 onAddSupplier={handleAddSupplier}
                 onUpdateSupplier={handleUpdateSupplier}
                 onDeleteSupplier={handleDeleteSupplier}
                />;
      case 'personel':
        return <Staff 
                  staff={staff}
                  onAddStaff={handleAddStaff}
                  onUpdateStaff={handleUpdateStaff}
                  onDeleteStaff={handleDeleteStaff}
               />;
      case 'kampanyalar':
        return <Campaigns />;
      case 'mali-isler':
        return <Financials 
                  expenses={expenses}
                  onAddExpense={handleAddExpense}
                  onUpdateExpense={handleUpdateExpense}
                  onDeleteExpense={handleDeleteExpense}
                />;
      case 'raporlar':
        return <Reports customers={customers} expenses={expenses} orders={orders} products={products} />;
      case 'kasa':
        return <Cashbox 
                  history={cashboxHistory}
                  openingBalance={openingBalance}
                  cashIn={cashInToday}
                  cashOut={cashOutToday}
                  expectedBalance={expectedBalance}
                  onDayClose={handleDayClose}
               />;
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
                  chatHistory={chatHistory}
                  setChatHistory={setChatHistory}
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
    <>
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
                onClick={() => setActiveView('satis-islemleri')}
                isActive={activeView === 'satis-islemleri'}
                tooltip="Satış İşlemleri"
              >
                <ShoppingCart />
                <span>Satış İşlemleri</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('urun-yonetimi')}
                isActive={activeView === 'urun-yonetimi'}
                tooltip="Ürün Yönetimi"
              >
                <Package />
                <span>Ürün Yönetimi</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('musteri-yonetimi')}
                isActive={activeView === 'musteri-yonetimi'}
                tooltip="Müşteri Yönetimi"
              >
                <BookUser />
                <span>Müşteri Yönetimi</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('mali-isler')}
                isActive={activeView === 'mali-isler'}
                tooltip="Mali İşler (Giderler)"
              >
                <Banknote />
                <span>Mali İşler</span>
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
                onClick={() => setActiveView('tedarikciler')}
                isActive={activeView === 'tedarikciler'}
                tooltip="Tedarikçiler"
              >
                <Truck />
                <span>Tedarikçiler</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('personel')}
                isActive={activeView === 'personel'}
                tooltip="Personel"
              >
                <Users />
                <span>Personel</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('kampanyalar')}
                isActive={activeView === 'kampanyalar'}
                tooltip="Kampanyalar"
              >
                <Megaphone />
                <span>Kampanyalar</span>
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
    </>
  );
}
