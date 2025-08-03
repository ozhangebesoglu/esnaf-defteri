
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc, writeBatch, getDocs, getDoc, where } from "firebase/firestore";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
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
import AiChat from '@/components/ai-chat';
import { Logo } from '@/components/logo';
import SalesTransactions from '@/components/sales-transactions';
import Suppliers from '@/components/suppliers';
import Staff from '@/components/staff';
import Campaigns from '@/components/campaigns';

import type { Customer, Order, Product, Expense, StockAdjustment, CashboxHistory, MonitoringAlert, Supplier, Staff as StaffType, Sale } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

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
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  
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
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  
  const salesData: Sale[] = useMemo(() => {
    const monthNames = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
    const monthlyData: { month: string; revenue: number }[] = [];
    const today = new Date();
    const monthsToShow = isMobile ? 4 : 6;

    // Initialize the last months in order
    for (let i = monthsToShow - 1; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        monthlyData.push({ month: monthNames[d.getMonth()], revenue: 0 });
    }

    const startDate = new Date(today.getFullYear(), today.getMonth() - (monthsToShow - 1), 1);
    startDate.setHours(0, 0, 0, 0);

    orders.forEach(order => {
        if (order.status === 'Tamamlandı' && order.total > 0) {
            const orderDate = new Date(order.date);
            if (orderDate >= startDate) {
                const monthName = monthNames[orderDate.getMonth()];
                const monthEntry = monthlyData.find(m => m.month === monthName);
                if (monthEntry) {
                    monthEntry.revenue += order.total;
                }
            }
        }
    });

    return monthlyData;
  }, [orders, isMobile]);


  // --- Firestore Data Fetching ---
  useEffect(() => {
    if (!user) return;
    
    console.log('Starting data fetch for user:', user.uid);
    setLoadingData(true);

    const setupDataListeners = async () => {
      try {
        // First, try to create sample data if user has no data
        const customersQuery = query(collection(db, 'users', user.uid, 'customers'));
        const customersSnapshot = await getDocs(customersQuery);
        
        if (customersSnapshot.empty) {
          console.log('User has no data, creating sample data...');
          await createSampleData();
        } else {
          console.log(`User has ${customersSnapshot.docs.length} customers`);
        }

        // Now set up real-time listeners
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

        const unsubscribes: (() => void)[] = [];
        let loadedCollections = 0;
        const totalCollections = Object.keys(collections).length;

        const checkAllLoaded = () => {
          loadedCollections++;
          console.log(`Loaded ${loadedCollections}/${totalCollections} collections`);
          if (loadedCollections === totalCollections) {
            setLoadingData(false);
            console.log('All collections loaded successfully');
          }
        };

        Object.entries(collections).forEach(([collectionName, setState]) => {
            try {
                console.log(`Setting up listener for ${collectionName}`);
                const q = query(collection(db, 'users', user.uid, collectionName));
                const unsubscribe = onSnapshot(q, (querySnapshot) => {
                    console.log(`${collectionName}: Got ${querySnapshot.docs.length} documents`);
                    const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
                    if (collectionName === 'orders' || collectionName === 'expenses' || collectionName === 'cashboxHistory' || collectionName === 'stockAdjustments') {
                      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    }
                    setState(items);
                    checkAllLoaded();
                }, (error) => {
                    console.error(`Error fetching ${collectionName}: `, error);
                    toast({
                        variant: "destructive",
                        title: "Veri Yükleme Hatası",
                        description: `"${collectionName}" verileri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.`,
                    });
                    checkAllLoaded();
                });
                unsubscribes.push(unsubscribe);
            } catch (error) {
                console.error(`Error setting up listener for ${collectionName}: `, error);
                toast({
                    variant: "destructive",
                    title: "Bağlantı Hatası",
                    description: `"${collectionName}" için bağlantı kurulamadı. Lütfen internet bağlantınızı kontrol edin.`,
                });
                checkAllLoaded();
            }
        });

        // Return cleanup function
        return () => {
          console.log('Cleaning up listeners');
          unsubscribes.forEach(unsub => unsub());
        };

      } catch (error) {
        console.error('Error in setupDataListeners:', error);
        setLoadingData(false);
        toast({
          variant: "destructive",
          title: "Veri Yükleme Hatası",
          description: "Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.",
        });
        return () => {};
      }
    };

    const createSampleData = async () => {
      try {
        console.log('Creating sample data...');
        const batch = writeBatch(db);
        
        // Add sample customer
        const customerRef = doc(collection(db, 'users', user.uid, 'customers'));
        batch.set(customerRef, {
          name: 'Örnek Müşteri',
          email: 'ornek@musteri.com',
          balance: 0
        });

        // Add sample product
        const productRef = doc(collection(db, 'users', user.uid, 'products'));
        batch.set(productRef, {
          name: 'Kıyma',
          type: 'beef',
          stock: 10,
          price: 150,
          cost: 120,
          lowStockThreshold: 5
        });

        // Add sample expense
        const expenseRef = doc(collection(db, 'users', user.uid, 'expenses'));
        batch.set(expenseRef, {
          date: new Date().toISOString(),
          description: 'Örnek Gider',
          amount: 100,
          category: 'Diğer'
        });

        await batch.commit();
        console.log('Sample data created successfully');
      } catch (error) {
        console.error('Error creating sample data:', error);
        throw error;
      }
    };

    // Start the data setup process
    const cleanup = setupDataListeners();
    
    // Return cleanup function
    return () => {
      cleanup.then(cleanupFn => cleanupFn());
    };

  }, [user, toast]);

  // --- Alerts Generation ---
  useEffect(() => {
    if (!user) return;

    const generatedAlerts: MonitoringAlert[] = [];

    // 1. Negative & Low Stock Alerts
    products.forEach(product => {
      if (product.stock < 0) {
        generatedAlerts.push({
          id: `neg-stock-${product.id}`,
          severity: 'high',
          title: `Negatif Stok: ${product.name}`,
          description: `${product.name} stok adedi ${product.stock}. Lütfen hemen inceleyin.`,
          timestamp: new Date().toISOString()
        });
      } else if (product.stock > 0 && product.stock <= product.lowStockThreshold) {
        generatedAlerts.push({
          id: `low-stock-${product.id}`,
          severity: 'medium',
          title: `Düşük Stok: ${product.name}`,
          description: `${product.name} stok adedi ${product.stock}, düşük stok eşiği olan ${product.lowStockThreshold}'e ulaştı.`,
          timestamp: new Date().toISOString()
        });
      }
    });

    // 2. Overdue Balance Alert
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    customers.forEach(customer => {
      if (customer.balance > 0) {
        const customerTransactions = orders.filter(o => o.customerId === customer.id);
        if (customerTransactions.length > 0) {
          const lastTransactionDate = new Date(customerTransactions[0].date); // Orders are sorted by date desc
          if (lastTransactionDate < thirtyDaysAgo) {
            generatedAlerts.push({
              id: `overdue-${customer.id}`,
              severity: 'low',
              title: `Gecikmiş Bakiye: ${customer.name}`,
              description: `${customer.name} adlı müşterinin ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(customer.balance)} borcu var ve 30 günden uzun süredir işlem yapmadı.`,
              timestamp: new Date().toISOString()
            });
          }
        }
      }
    });
    
    // Sort alerts by severity
    const severityOrder = { high: 0, medium: 1, low: 2 };
    generatedAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    setAlerts(generatedAlerts);

  }, [products, customers, orders, user]);
  
  // --- Handlers ---
  const handleViewChange = (view: View) => {
    setActiveView(view);
    setOpenMobile(false);
  };

  const getCollectionRef = (collectionName: string) => collection(db, 'users', user!.uid, collectionName);

  const showGenericErrorToast = () => {
    toast({
      variant: "destructive",
      title: "Hata",
      description: "Bir hata oluştu. Lütfen tekrar deneyin.",
    });
  };

  // Test Firebase connection
  const testFirebaseConnection = async () => {
    try {
      console.log('Testing Firebase connection...');
      const testRef = doc(db, 'users', user!.uid, 'test', 'connection');
      await updateDoc(testRef, { timestamp: new Date().toISOString() });
      console.log('Firebase connection successful');
      return true;
    } catch (error) {
      console.error('Firebase connection failed:', error);
      return false;
    }
  };

  // Test function to check if collections exist
  const testCollections = async () => {
    try {
      const collections = ['customers', 'products', 'orders', 'expenses'];
      for (const collectionName of collections) {
        const q = query(collection(db, 'users', user!.uid, collectionName));
        const snapshot = await getDocs(q);
        console.log(`${collectionName}: ${snapshot.docs.length} documents`);
      }
    } catch (error) {
      console.error('Error testing collections:', error);
    }
  };

  // Customers
  const handleAddCustomer = async (data: { name: string; email?: string; initialDebt?: number }) => {
    if(!user) return;
    try {
        const batch = writeBatch(db);
        
        const newCustomerRef = doc(getCollectionRef('customers'));
        const newCustomerData = { 
            name: data.name, 
            email: data.email || '', 
            balance: data.initialDebt || 0 
        };
        batch.set(newCustomerRef, newCustomerData);

        if (data.initialDebt && data.initialDebt > 0) {
            const newOrderRef = doc(getCollectionRef('orders'));
            const newOrderData = {
                customerId: newCustomerRef.id,
                customerName: data.name,
                date: new Date().toISOString(),
                status: 'Tamamlandı' as const,
                items: 1,
                description: 'Başlangıç Bakiyesi / Devir',
                total: data.initialDebt,
            };
            batch.set(newOrderRef, newOrderData);
        }
        
        await batch.commit();
        toast({ title: "Müşteri Eklendi", description: `${data.name} başarıyla eklendi.` });
    } catch(error) {
        console.error("Error adding customer: ", error);
        showGenericErrorToast();
    }
  };
  const handleUpdateCustomer = async (data: Customer) => {
    if(!user) return;
    try {
        const { id, ...customerData } = data;
        await updateDoc(doc(db, "users", user.uid, "customers", id), customerData);
        toast({ title: "Müşteri Güncellendi", description: `${data.name} bilgileri güncellendi.` });
    } catch (error) {
        console.error("Error updating customer: ", error);
        showGenericErrorToast();
    }
  };
  const handleDeleteCustomer = async (id: string) => {
    if (!user) return;
    try {
        const batch = writeBatch(db);

        const customerRef = doc(db, "users", user.uid, "customers", id);
        batch.delete(customerRef);

        const ordersQuery = query(getCollectionRef('orders'), where("customerId", "==", id));
        const ordersSnapshot = await getDocs(ordersQuery);
        ordersSnapshot.forEach(doc => {
          batch.delete(doc.ref);
        });

        await batch.commit();
        toast({ title: "Müşteri Silindi", description: "Müşteri ve ilgili tüm işlemleri başarıyla silindi.", variant: "destructive" });
    } catch (error) {
        console.error("Error deleting customer: ", error);
        showGenericErrorToast();
    }
  };

  // Products
  const handleAddProduct = async (data: Omit<Product, 'id' | 'stock'>) => {
    if(!user) return;
    try {
        const newProduct = { ...data, stock: 0 };
        await addDoc(getCollectionRef('products'), newProduct);
        toast({ title: "Ürün Eklendi", description: `${newProduct.name} başarıyla eklendi.` });
    } catch (error) {
        console.error("Error adding product: ", error);
        showGenericErrorToast();
    }
  };
  const handleUpdateProduct = async (data: Product) => {
    if(!user) return;
    try {
        const { id, ...productData } = data;
        await updateDoc(doc(db, "users", user.uid, "products", id), productData);
        toast({ title: "Ürün Güncellendi", description: `${data.name} bilgileri güncellendi.` });
    } catch (error) {
        console.error("Error updating product: ", error);
        showGenericErrorToast();
    }
  };
  const handleDeleteProduct = async (id: string) => {
    if (!user) return;
    try {
        const batch = writeBatch(db);

        const productRef = doc(db, "users", user.uid, "products", id);
        batch.delete(productRef);

        const adjustmentsQuery = query(getCollectionRef('stockAdjustments'), where("productId", "==", id));
        const adjustmentsSnapshot = await getDocs(adjustmentsQuery);
        adjustmentsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        toast({ title: "Ürün Silindi", description: "Ürün ve ilgili stok hareketleri başarıyla silindi.", variant: "destructive" });
    } catch (error) {
        console.error("Error deleting product: ", error);
        showGenericErrorToast();
    }
  };

  // Sales (Orders)
  const handleAddSale = async (data: Omit<Order, 'id' | 'customerName' | 'date' | 'status' | 'items' | 'paymentMethod'>) => {
    if(!user) return;
    const customer = customers.find(c => c.id === data.customerId);
    if (!customer) return;

    try {
        const newOrder = {
          ...data,
          customerName: customer.name,
          date: new Date().toISOString(),
          status: 'Tamamlandı' as const,
          items: data.description.split(',').length,
        };
        
        const batch = writeBatch(db);
        
        const orderRef = doc(getCollectionRef('orders'));
        batch.set(orderRef, newOrder);
        
        const customerRef = doc(db, "users", user.uid, "customers", customer.id);
        batch.update(customerRef, { balance: customer.balance + data.total });
        
        await batch.commit();
        toast({ title: "Satış Eklendi", description: "Yeni satış kaydı oluşturuldu." });
    } catch (error) {
        console.error("Error adding sale: ", error);
        showGenericErrorToast();
    }
  };

   const handleAddPayment = async (data: { customerId: string, total: number, description?: string, paymentMethod: 'cash' | 'visa' }) => {
    if(!user) return;
    const customer = customers.find(c => c.id === data.customerId);
    if (!customer) return;
    
    try {
        const newPayment = {
          customerId: data.customerId,
          customerName: customer.name,
          description: data.description || `${data.paymentMethod === 'cash' ? 'Nakit' : 'Visa'} Ödeme`,
          items: 1,
          total: -data.total,
          status: 'Tamamlandı' as const,
          date: new Date().toISOString(),
          paymentMethod: data.paymentMethod,
        };
        
        const batch = writeBatch(db);
        
        const paymentRef = doc(getCollectionRef('orders'));
        batch.set(paymentRef, newPayment);

        const customerRef = doc(db, "users", user.uid, "customers", customer.id);
        batch.update(customerRef, { balance: customer.balance - data.total });

        await batch.commit();
        toast({ title: "Ödeme Alındı", description: `${customer.name} için ödeme kaydedildi.` });
    } catch(error) {
        console.error("Error adding payment: ", error);
        showGenericErrorToast();
    }
  };

  const handleUpdateSale = async (data: Order) => {
    if(!user) return;
    
    try {
        const { id, ...orderData } = data;
        
        const orderRef = doc(db, "users", user.uid, 'orders', id);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            toast({ title: "Hata", description: "Güncellenecek işlem bulunamadı.", variant: "destructive" });
            return;
        }

        const oldOrder = orderSnap.data() as Order;
        
        const batch = writeBatch(db);
        
        batch.update(orderRef, orderData);

        if (oldOrder.customerId && oldOrder.customerId !== 'CASH_SALE') {
            const totalDifference = orderData.total - oldOrder.total;
            if (totalDifference !== 0) {
                const customerRef = doc(db, "users", user.uid, 'customers', oldOrder.customerId);
                const customerSnap = await getDoc(customerRef);
                if (customerSnap.exists()) {
                    const customer = customerSnap.data() as Customer;
                    batch.update(customerRef, { balance: customer.balance + totalDifference });
                }
            }
        }
        
        await batch.commit();
        toast({ title: "İşlem Güncellendi", description: `#${id} numaralı işlem güncellendi.` });
    } catch (error) {
        console.error("Error updating sale: ", error);
        showGenericErrorToast();
    }
  };

  const handleDeleteSale = async (id: string) => {
    if (!user) return;
    
    try {
        const orderToDeleteRef = doc(db, "users", user.uid, 'orders', id);
        const orderToDeleteSnap = await getDoc(orderToDeleteRef);

        if (!orderToDeleteSnap.exists()) return;
        
        const orderToDelete = orderToDeleteSnap.data() as Order;
        
        const batch = writeBatch(db);
        
        batch.delete(orderToDeleteRef);

        if(orderToDelete.customerId !== 'CASH_SALE') {
            const customerRef = doc(db, "users", user.uid, "customers", orderToDelete.customerId);
            const customerSnap = await getDoc(customerRef);
            if (customerSnap.exists()) {
                const customer = customerSnap.data() as Customer;
                batch.update(customerRef, { balance: customer.balance - orderToDelete.total });
            }
        }
        
        await batch.commit();
        toast({ title: "İşlem Silindi", description: "Satış veya ödeme kaydı silindi.", variant: "destructive" });
    } catch (error) {
        console.error("Error deleting sale: ", error);
        showGenericErrorToast();
    }
  };

  // Cash Sales
  const handleAddCashSale = async (data: { description: string, total: number, paymentMethod: 'cash' | 'visa' }) => {
    if(!user) return;
    try {
        const newOrder = {
          customerId: 'CASH_SALE',
          customerName: 'Peşin Satış',
          date: new Date().toISOString(),
          status: 'Tamamlandı' as const,
          items: data.description.split(',').length,
          description: data.description,
          total: data.total,
          paymentMethod: data.paymentMethod,
        };
        
        await addDoc(getCollectionRef('orders'), newOrder);
        toast({ title: "Peşin Satış Eklendi", description: "Yeni peşin satış kaydı oluşturuldu." });
    } catch (error) {
        console.error("Error adding cash sale: ", error);
        showGenericErrorToast();
    }
  };

  // Expenses
  const handleAddExpense = async (data: Omit<Expense, 'id' | 'date'>) => {
    if(!user) return;
    try {
        const newExpense = { ...data, date: new Date().toISOString() };
        await addDoc(getCollectionRef('expenses'), newExpense);
        toast({ title: "Gider Eklendi", description: "Yeni gider kaydı oluşturuldu." });
    } catch (error) {
        console.error("Error adding expense: ", error);
        showGenericErrorToast();
    }
  };
  const handleUpdateExpense = async (data: Expense) => {
    if(!user) return;
    try {
        const { id, ...expenseData } = data;
        await updateDoc(doc(db, 'users', user.uid, 'expenses', id), expenseData);
        toast({ title: "Gider Güncellendi" });
    } catch (error) {
        console.error("Error updating expense: ", error);
        showGenericErrorToast();
    }
  };
  const handleDeleteExpense = async (id: string) => {
    if(!user) return;
    try {
        await deleteDoc(doc(db, 'users', user.uid, 'expenses', id));
        toast({ title: "Gider Silindi", variant: "destructive" });
    } catch (error) {
        console.error("Error deleting expense: ", error);
        showGenericErrorToast();
    }
  };

  // Stock Adjustments
  const handleAddStockAdjustment = async (data: Omit<StockAdjustment, 'id' | 'productName' | 'date'>) => {
    if(!user) return;
    const product = products.find(p => p.id === data.productId);
    if (!product) return;
    
    try {
        const newAdjustment = { 
          ...data,
          productName: product.name,
          date: new Date().toISOString(),
        };

        const batch = writeBatch(db);
        
        const adjRef = doc(getCollectionRef('stockAdjustments'));
        batch.set(adjRef, newAdjustment);

        const productRef = doc(db, "users", user.uid, "products", product.id);
        batch.update(productRef, { stock: product.stock + data.quantity });

        await batch.commit();
        toast({ title: "Stok Hareketi Eklendi" });
    } catch (error) {
        console.error("Error adding stock adjustment: ", error);
        showGenericErrorToast();
    }
  };
  const handleUpdateStockAdjustment = async (data: StockAdjustment) => {
    if(!user) return;
    // Note: Updating a stock adjustment's quantity after creation is complex
    // as it can break the stock integrity. This is intentionally left simple.
    try {
        const { id, ...adjData } = data;
        await updateDoc(doc(db, 'users', user.uid, 'stockAdjustments', id), adjData);
        toast({ title: "Stok Hareketi Güncellendi" });
    } catch (error) {
        console.error("Error updating stock adjustment: ", error);
        showGenericErrorToast();
    }
  };
  const handleDeleteStockAdjustment = async (id: string) => {
    if(!user) return;
    try {
        const adjToDeleteRef = doc(db, 'users', user.uid, 'stockAdjustments', id);
        const adjToDeleteSnap = await getDoc(adjToDeleteRef);
        if(!adjToDeleteSnap.exists()) return;
        
        const adjToDelete = adjToDeleteSnap.data() as StockAdjustment;

        const batch = writeBatch(db);
        batch.delete(adjToDeleteRef);

        const product = products.find(p => p.id === adjToDelete.productId);
        if(product) {
            const productRef = doc(db, "users", user.uid, "products", product.id);
            batch.update(productRef, { stock: product.stock - adjToDelete.quantity });
        }

        await batch.commit();
        toast({ title: "Stok Hareketi Silindi", variant: "destructive" });
    } catch (error) {
        console.error("Error deleting stock adjustment: ", error);
        showGenericErrorToast();
    }
  };
  
  // Suppliers
  const handleAddSupplier = async (data: Omit<Supplier, 'id'>) => {
    if(!user) return;
    try {
        await addDoc(getCollectionRef('suppliers'), data);
        toast({ title: "Tedarikçi Eklendi", description: `${data.name} başarıyla eklendi.` });
    } catch (error) {
        console.error("Error adding supplier: ", error);
        showGenericErrorToast();
    }
  };
  const handleUpdateSupplier = async (data: Supplier) => {
    if(!user) return;
    try {
        const { id, ...supplierData } = data;
        await updateDoc(doc(db, 'users', user.uid, 'suppliers', id), supplierData);
        toast({ title: "Tedarikçi Güncellendi", description: `${data.name} bilgileri güncellendi.` });
    } catch (error) {
        console.error("Error updating supplier: ", error);
        showGenericErrorToast();
    }
  };
  const handleDeleteSupplier = async (id: string) => {
    if(!user) return;
    try {
        await deleteDoc(doc(db, 'users', user.uid, 'suppliers', id));
        toast({ title: "Tedarikçi Silindi", variant: "destructive" });
    } catch (error) {
        console.error("Error deleting supplier: ", error);
        showGenericErrorToast();
    }
  };

  // Staff
  const handleAddStaff = async (data: Omit<StaffType, 'id'>) => {
    if(!user) return;
    try {
        await addDoc(getCollectionRef('staff'), data);
        toast({ title: "Personel Eklendi", description: `${data.name} başarıyla eklendi.` });
    } catch (error) {
        console.error("Error adding staff: ", error);
        showGenericErrorToast();
    }
  };
  const handleUpdateStaff = async (data: StaffType) => {
    if(!user) return;
    try {
        const { id, ...staffData } = data;
        await updateDoc(doc(db, 'users', user.uid, 'staff', id), staffData);
        toast({ title: "Personel Güncellendi", description: `${data.name} bilgileri güncellendi.` });
    } catch (error) {
        console.error("Error updating staff: ", error);
        showGenericErrorToast();
    }
  };
  const handleDeleteStaff = async (id: string) => {
    if(!user) return;
    try {
        await deleteDoc(doc(db, 'users', user.uid, 'staff', id));
        toast({ title: "Personel Silindi", variant: "destructive" });
    } catch (error) {
        console.error("Error deleting staff: ", error);
        showGenericErrorToast();
    }
  };

  // Cashbox Logic
  const openingCash = cashboxHistory[0]?.countedCash || 0;

  const todaysTransactions = orders.filter(o => isToday(o.date));

  const cashInToday = todaysTransactions
    .filter(o => o.paymentMethod === 'cash')
    .reduce((sum, o) => sum + Math.abs(o.total), 0);
  
  const visaInToday = todaysTransactions
    .filter(o => o.paymentMethod === 'visa')
    .reduce((sum, o) => sum + Math.abs(o.total), 0);

  const totalInToday = cashInToday + visaInToday;

  const cashOutToday = expenses.filter(e => isToday(e.date)).reduce((sum, e) => sum + e.amount, 0);
  const expectedCash = openingCash + cashInToday - cashOutToday;

  const handleDayClose = async (data: { countedCash: number; countedVisa: number }) => {
    if(!user) return;
    try {
        const cashDifference = data.countedCash - expectedCash;
        const newEntry = {
            date: new Date().toISOString(),
            openingCash,
            cashIn: cashInToday,
            visaIn: visaInToday,
            cashOut: cashOutToday,
            expectedCash,
            countedCash: data.countedCash,
            countedVisa: data.countedVisa,
            cashDifference,
        };
        await addDoc(getCollectionRef('cashboxHistory'), newEntry);
        toast({
          title: "Gün Kapatıldı",
          description: `Kasa sayımı tamamlandı. Nakit Fark: ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cashDifference)}`,
        });
    } catch (error) {
        console.error("Error closing day: ", error);
        showGenericErrorToast();
    }
  };

  const handleUpdateCashboxHistory = async (data: CashboxHistory) => {
    if (!user) return;
    try {
        const { id, ...historyData } = data;
        
        // Recalculate difference based on potentially updated counted cash
        const cashDifference = (historyData.countedCash ?? 0) - (historyData.expectedCash ?? 0);
        const updatedData = { ...historyData, cashDifference };

        await updateDoc(doc(db, "users", user.uid, "cashboxHistory", id), updatedData);
        toast({
          title: "Kasa Kaydı Güncellendi",
          description: `${new Date(data.date).toLocaleDateString('tr-TR')} tarihli kasa kaydı güncellendi.`,
        });
    } catch (error) {
        console.error("Error updating cashbox history: ", error);
        showGenericErrorToast();
    }
  };
  
  const creditSales = orders.filter(o => o.customerId !== 'CASH_SALE');
  const cashSales = orders.filter(o => o.customerId === 'CASH_SALE');


  const renderView = () => {
    if (loadingData) {
      return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    switch (activeView) {
      case 'anasayfa':
        return <Dashboard 
                  customers={customers} 
                  expenses={expenses} 
                  salesData={salesData} 
                  isMobile={isMobile}
                  onNavigate={handleViewChange} 
                />;
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
                  openingCash={openingCash}
                  cashIn={cashInToday}
                  visaIn={visaInToday}
                  totalIn={totalInToday}
                  cashOut={cashOutToday}
                  expectedCash={expectedCash}
                  onDayClose={handleDayClose}
                  onUpdateHistory={handleUpdateCashboxHistory}
               />;
      case 'uyarilar':
        return <Monitoring alerts={alerts} />;
      case 'yapay-zeka':
        return <AiChat />;
      default:
        return <Dashboard 
                  customers={customers} 
                  expenses={expenses} 
                  salesData={salesData} 
                  isMobile={isMobile}
                  onNavigate={handleViewChange}
                />;
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
                onClick={() => handleViewChange('anasayfa')}
                isActive={activeView === 'anasayfa'}
                tooltip="Anasayfa"
              >
                <LayoutDashboard />
                <span>Anasayfa</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleViewChange('satis-islemleri')}
                isActive={activeView === 'satis-islemleri'}
                tooltip="Satış İşlemleri"
              >
                <ShoppingCart />
                <span>Satış İşlemleri</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleViewChange('urun-yonetimi')}
                isActive={activeView === 'urun-yonetimi'}
                tooltip="Ürün Yönetimi"
              >
                <Package />
                <span>Ürün Yönetimi</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleViewChange('musteri-yonetimi')}
                isActive={activeView === 'musteri-yonetimi'}
                tooltip="Müşteri Yönetimi"
              >
                <BookUser />
                <span>Müşteri Yönetimi</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleViewChange('mali-isler')}
                isActive={activeView === 'mali-isler'}
                tooltip="Mali İşler (Giderler)"
              >
                <Banknote />
                <span>Mali İşler</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleViewChange('kasa')}
                isActive={activeView === 'kasa'}
                tooltip="Kasa"
              >
                <Wallet />
                <span>Kasa</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleViewChange('tedarikciler')}
                isActive={activeView === 'tedarikciler'}
                tooltip="Tedarikçiler"
              >
                <Truck />
                <span>Tedarikçiler</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleViewChange('personel')}
                isActive={activeView === 'personel'}
                tooltip="Personel"
              >
                <Users />
                <span>Personel</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleViewChange('kampanyalar')}
                isActive={activeView === 'kampanyalar'}
                tooltip="Kampanyalar"
              >
                <Megaphone />
                <span>Kampanyalar</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleViewChange('raporlar')}
                isActive={activeView === 'raporlar'}
                tooltip="Raporlar"
              >
                <AreaChart />
                <span>Raporlar</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleViewChange('uyarilar')}
                isActive={activeView === 'uyarilar'}
                tooltip="Uyarılar"
              >
                <ShieldAlert />
                <span>Uyarılar</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleViewChange('yapay-zeka')}
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
        <main className="flex-1 p-4 md:p-6">
          {loadingData ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-muted-foreground">Veriler yükleniyor...</p>
                <div className="text-xs text-muted-foreground">
                  Kullanıcı ID: {user?.uid}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Debug Panel - Remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">Debug Bilgileri</h3>
                  <div className="text-sm text-yellow-700 space-y-1 mb-3">
                    <div>Kullanıcı ID: {user?.uid}</div>
                    <div>Müşteri Sayısı: {customers.length}</div>
                    <div>Ürün Sayısı: {products.length}</div>
                    <div>Satış Sayısı: {orders.length}</div>
                    <div>Gider Sayısı: {expenses.length}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={testFirebaseConnection}
                    >
                      Firebase Bağlantısını Test Et
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={testCollections}
                    >
                      Koleksiyonları Test Et
                    </Button>
                  </div>
                </div>
              )}
              {renderView()}
            </>
          )}
        </main>
      </SidebarInset>
    </>
  );
}
