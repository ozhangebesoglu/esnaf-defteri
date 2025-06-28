'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc, writeBatch, getDocs } from "firebase/firestore";

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
  Megaphone,
  Loader2
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

import type { Customer, Order, Product, Expense, StockAdjustment, CashboxHistory, MonitoringAlert, Supplier, Staff as StaffType, Sale } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { initialAlerts, salesData as mockSalesData } from '@/lib/data';

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

const isToday = (date: string | Date) => {
  const today = new Date();
  const someDate = new Date(date);
  return someDate.getDate() === today.getDate() &&
         someDate.getMonth() === today.getMonth() &&
         someDate.getFullYear() === today.getFullYear();
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeView, setActiveView] = useState<View>('anasayfa');
  const [loadingData, setLoadingData] = useState(true);

  // Firestore-backed state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>([]);
  const [cashboxHistory, setCashboxHistory] = useState<CashboxHistory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [staff, setStaff] = useState<StaffType[]>([]);
  const [alerts, setAlerts] = useState<MonitoringAlert[]>(initialAlerts);
  const [salesData, setSalesData] = useState<Sale[]>(mockSalesData);
  
  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      role: 'model',
      content: 'Merhaba! Ben Esnaf Defteri asistanınızım. "Ahmet Yılmaz\'a 250 liralık satış ekle" gibi komutlar verebilir veya "En borçlu müşteri kim?" gibi sorular sorabilirsiniz.',
    },
  ]);

  // --- Firestore Data Fetching ---
  useEffect(() => {
    if (!user) return;
    
    setLoadingData(true);
    const collections = {
        customers: setCustomers,
        products: setProducts,
        orders: setOrders,
        expenses: setExpenses,
        stockAdjustments: setStockAdjustments,
        cashboxHistory: setCashboxHistory,
        suppliers: setSuppliers,
        staff: setStaff,
    };

    const unsubscribes = Object.entries(collections).map(([collectionName, setState]) => {
        const q = query(collection(db, collectionName), where("userId", "==", user.uid));
        return onSnapshot(q, (querySnapshot) => {
            const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
            if (collectionName === 'orders' || collectionName === 'expenses' || collectionName === 'cashboxHistory' || collectionName === 'stockAdjustments') {
              items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            }
            setState(items);
        });
    });
    
    setLoadingData(false);

    // Cleanup listeners on component unmount
    return () => unsubscribes.forEach(unsub => unsub());

  }, [user]);
  
  // --- Handlers ---
  const getCollectionRef = (collectionName: string) => collection(db, collectionName);

  // Customers
  const handleAddCustomer = async (data: { name: string; email?: string; initialDebt?: number }) => {
    if(!user) return;
    const batch = writeBatch(db);
    
    const newCustomerRef = doc(getCollectionRef('customers'));
    const newCustomerData = { 
        userId: user.uid,
        name: data.name, 
        email: data.email || '', 
        balance: data.initialDebt || 0 
    };
    batch.set(newCustomerRef, newCustomerData);

    if (data.initialDebt && data.initialDebt > 0) {
        const newOrderRef = doc(getCollectionRef('orders'));
        const newOrderData = {
            userId: user.uid,
            customerId: newCustomerRef.id,
            customerName: data.name,
            date: new Date().toISOString(),
            status: 'Tamamlandı',
            items: 1,
            description: 'Başlangıç Bakiyesi / Devir',
            total: data.initialDebt,
        };
        batch.set(newOrderRef, newOrderData);
    }
    
    await batch.commit();
    toast({ title: "Müşteri Eklendi", description: `${data.name} başarıyla eklendi.` });
  };
  const handleUpdateCustomer = async (data: Customer) => {
    const { id, ...customerData } = data;
    await updateDoc(doc(db, "customers", id), customerData);
    toast({ title: "Müşteri Güncellendi", description: `${data.name} bilgileri güncellendi.` });
  };
  const handleDeleteCustomer = async (id: string) => {
    if (!user) return;
    const batch = writeBatch(db);

    const customerRef = doc(db, "customers", id);
    batch.delete(customerRef);

    const ordersQuery = query(collection(db, 'orders'), where("userId", "==", user.uid), where("customerId", "==", id));
    const ordersSnapshot = await getDocs(ordersQuery);
    ordersSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    toast({ title: "Müşteri Silindi", description: "Müşteri ve ilgili tüm işlemleri başarıyla silindi.", variant: "destructive" });
  };

  // Products
  const handleAddProduct = async (data: Omit<Product, 'id' | 'stock' | 'userId'>) => {
     if(!user) return;
    const newProduct = { ...data, stock: 0, userId: user.uid };
    await addDoc(getCollectionRef('products'), newProduct);
    toast({ title: "Ürün Eklendi", description: `${newProduct.name} başarıyla eklendi.` });
  };
  const handleUpdateProduct = async (data: Product) => {
    const { id, ...productData } = data;
    await updateDoc(doc(db, "products", id), productData);
    toast({ title: "Ürün Güncellendi", description: `${data.name} bilgileri güncellendi.` });
  };
  const handleDeleteProduct = async (id: string) => {
    if (!user) return;
    const batch = writeBatch(db);

    const productRef = doc(db, "products", id);
    batch.delete(productRef);

    const adjustmentsQuery = query(collection(db, 'stockAdjustments'), where("userId", "==", user.uid), where("productId", "==", id));
    const adjustmentsSnapshot = await getDocs(adjustmentsQuery);
    adjustmentsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    toast({ title: "Ürün Silindi", description: "Ürün ve ilgili stok hareketleri başarıyla silindi.", variant: "destructive" });
  };

  // Sales (Orders)
  const handleAddSale = async (data: Omit<Order, 'id' | 'customerName' | 'date' | 'status' | 'items' | 'userId'>) => {
    if(!user) return;
    const customer = customers.find(c => c.id === data.customerId);
    if (!customer) return;

    const newOrder = {
      ...data,
      userId: user.uid,
      customerName: customer.name,
      date: new Date().toISOString(),
      status: 'Tamamlandı' as const,
      items: data.description.split(',').length,
    };
    
    const batch = writeBatch(db);
    
    const orderRef = doc(getCollectionRef('orders'));
    batch.set(orderRef, newOrder);
    
    const customerRef = doc(db, "customers", customer.id);
    batch.update(customerRef, { balance: customer.balance + data.total });
    
    await batch.commit();
    toast({ title: "Satış Eklendi", description: "Yeni satış kaydı oluşturuldu." });
  };

   const handleAddPayment = async (data: { customerId: string, total: number, description: string }) => {
    if(!user) return;
    const customer = customers.find(c => c.id === data.customerId);
    if (!customer) return;

    const newPayment = {
      userId: user.uid,
      customerId: data.customerId,
      customerName: customer.name,
      description: data.description || 'Nakit Ödeme',
      items: 1,
      total: -data.total,
      status: 'Tamamlandı' as const,
      date: new Date().toISOString(),
    };
    
    const batch = writeBatch(db);
    
    const paymentRef = doc(getCollectionRef('orders'));
    batch.set(paymentRef, newPayment);

    const customerRef = doc(db, "customers", customer.id);
    batch.update(customerRef, { balance: customer.balance - data.total });

    await batch.commit();
    toast({ title: "Ödeme Alındı", description: `${customer.name} için ödeme kaydedildi.` });
  };
  const handleUpdateSale = async (data: Order) => {
    const { id, ...orderData } = data;
    await updateDoc(doc(db, 'orders', id), orderData);
    toast({ title: "Satış Güncellendi", description: `${data.id} numaralı satış güncellendi.` });
  };
  const handleDeleteSale = async (id: string) => {
    const orderToDelete = orders.find(o => o.id === id);
    if (!orderToDelete || !user) return;
    
    const batch = writeBatch(db);
    
    const orderRef = doc(db, 'orders', id);
    batch.delete(orderRef);

    if(orderToDelete.customerId !== 'CASH_SALE') {
        const customer = customers.find(c => c.id === orderToDelete.customerId);
        if (customer) {
            const customerRef = doc(db, "customers", customer.id);
            batch.update(customerRef, { balance: customer.balance - orderToDelete.total });
        }
    }
    
    await batch.commit();
    toast({ title: "İşlem Silindi", description: "Satış veya ödeme kaydı silindi.", variant: "destructive" });
  };

  // Cash Sales
  const handleAddCashSale = async (data: { description: string, total: number }) => {
    if(!user) return;
    const newOrder = {
      userId: user.uid,
      customerId: 'CASH_SALE',
      customerName: 'Peşin Satış',
      date: new Date().toISOString(),
      status: 'Tamamlandı' as const,
      items: data.description.split(',').length,
      description: data.description,
      total: data.total,
    };
    
    await addDoc(getCollectionRef('orders'), newOrder);
    toast({ title: "Peşin Satış Eklendi", description: "Yeni peşin satış kaydı oluşturuldu." });
  };

  // Expenses
  const handleAddExpense = async (data: Omit<Expense, 'id' | 'date' | 'userId'>) => {
    if(!user) return;
    const newExpense = { ...data, date: new Date().toISOString(), userId: user.uid };
    await addDoc(getCollectionRef('expenses'), newExpense);
    toast({ title: "Gider Eklendi", description: "Yeni gider kaydı oluşturuldu." });
  };
  const handleUpdateExpense = async (data: Expense) => {
    const { id, ...expenseData } = data;
    await updateDoc(doc(db, 'expenses', id), expenseData);
    toast({ title: "Gider Güncellendi" });
  };
  const handleDeleteExpense = async (id: string) => {
    await deleteDoc(doc(db, 'expenses', id));
    toast({ title: "Gider Silindi", variant: "destructive" });
  };

  // Stock Adjustments
  const handleAddStockAdjustment = async (data: Omit<StockAdjustment, 'id' | 'productName' | 'date' | 'userId'>) => {
    if(!user) return;
    const product = products.find(p => p.id === data.productId);
    if (!product) return;
    
    const newAdjustment = { 
      ...data,
      userId: user.uid,
      productName: product.name,
      date: new Date().toISOString(),
    };

    const batch = writeBatch(db);
    
    const adjRef = doc(getCollectionRef('stockAdjustments'));
    batch.set(adjRef, newAdjustment);

    const productRef = doc(db, "products", product.id);
    batch.update(productRef, { stock: product.stock + data.quantity });

    await batch.commit();
    toast({ title: "Stok Hareketi Eklendi" });
  };
  const handleUpdateStockAdjustment = async (data: StockAdjustment) => {
    const { id, ...adjData } = data;
    await updateDoc(doc(db, 'stockAdjustments', id), adjData);
    toast({ title: "Stok Hareketi Güncellendi" });
  };
  const handleDeleteStockAdjustment = async (id: string) => {
    const adjToDelete = stockAdjustments.find(a => a.id === id);
    if(!adjToDelete || !user) return;
    
    const batch = writeBatch(db);

    const adjRef = doc(db, 'stockAdjustments', id);
    batch.delete(adjRef);

    const product = products.find(p => p.id === adjToDelete.productId);
    if(product) {
        const productRef = doc(db, "products", product.id);
        batch.update(productRef, { stock: product.stock - adjToDelete.quantity });
    }

    await batch.commit();
    toast({ title: "Stok Hareketi Silindi", variant: "destructive" });
  };
  
  // Suppliers
  const handleAddSupplier = async (data: Omit<Supplier, 'id'|'userId'>) => {
    if(!user) return;
    const newSupplier = { ...data, userId: user.uid };
    await addDoc(getCollectionRef('suppliers'), newSupplier);
    toast({ title: "Tedarikçi Eklendi", description: `${newSupplier.name} başarıyla eklendi.` });
  };
  const handleUpdateSupplier = async (data: Supplier) => {
    const { id, ...supplierData } = data;
    await updateDoc(doc(db, 'suppliers', id), supplierData);
    toast({ title: "Tedarikçi Güncellendi", description: `${data.name} bilgileri güncellendi.` });
  };
  const handleDeleteSupplier = async (id: string) => {
    await deleteDoc(doc(db, 'suppliers', id));
    toast({ title: "Tedarikçi Silindi", variant: "destructive" });
  };

  // Staff
  const handleAddStaff = async (data: Omit<StaffType, 'id'|'userId'>) => {
    if(!user) return;
    const newStaff = { ...data, userId: user.uid };
    await addDoc(getCollectionRef('staff'), newStaff);
    toast({ title: "Personel Eklendi", description: `${newStaff.name} başarıyla eklendi.` });
  };
  const handleUpdateStaff = async (data: StaffType) => {
    const { id, ...staffData } = data;
    await updateDoc(doc(db, 'staff', id), staffData);
    toast({ title: "Personel Güncellendi", description: `${data.name} bilgileri güncellendi.` });
  };
  const handleDeleteStaff = async (id: string) => {
    await deleteDoc(doc(db, 'staff', id));
    toast({ title: "Personel Silindi", variant: "destructive" });
  };

  // Cashbox Logic
  const openingBalance = cashboxHistory[0]?.closing || 0;
  const cashInToday = orders.filter(o => (o.customerId === 'CASH_SALE' || o.total < 0) && isToday(o.date)).reduce((sum, o) => sum + Math.abs(o.total), 0);
  const cashOutToday = expenses.filter(e => isToday(e.date)).reduce((sum, e) => sum + e.amount, 0);
  const expectedBalance = openingBalance + cashInToday - cashOutToday;

  const handleDayClose = async (actualBalance: number) => {
    if(!user) return;
    const difference = actualBalance - expectedBalance;
    const newEntry = {
        userId: user.uid,
        date: new Date().toISOString(),
        opening: openingBalance,
        cashIn: cashInToday,
        cashOut: cashOutToday,
        closing: actualBalance,
        difference: difference
    };
    await addDoc(getCollectionRef('cashboxHistory'), newEntry);
    toast({
      title: "Gün Kapatıldı",
      description: `Kasa sayımı tamamlandı. Fark: ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(difference)}`,
    });
  };
  
  const creditSales = orders.filter(o => o.customerId !== 'CASH_SALE');
  const cashSales = orders.filter(o => o.customerId === 'CASH_SALE');


  const renderView = () => {
    if (loadingData) {
      return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

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
