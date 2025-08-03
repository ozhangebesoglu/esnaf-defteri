'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, addDoc, setDoc, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';

export default function DebugPanel() {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isCreatingTestData, setIsCreatingTestData] = useState(false);

  const testFirebaseConnection = async () => {
    setIsLoading(true);
    setErrors([]);
    const info: any = {};

    try {
      // Test 1: User authentication
      info.user = {
        uid: user?.uid,
        email: user?.email,
        isAuthenticated: !!user,
      };

      // Test 2: Basic Firestore connection
      try {
        const testQuery = query(collection(db, 'users'));
        const snapshot = await getDocs(testQuery);
        info.firestoreConnection = {
          success: true,
          collectionsFound: snapshot.size,
        };
      } catch (error: any) {
        info.firestoreConnection = {
          success: false,
          error: error.message,
          code: error.code,
        };
        setErrors(prev => [...prev, `Firestore bağlantı hatası: ${error.message}`]);
      }

      // Test 3: User-specific collections
      if (user?.uid) {
        const collections = ['customers', 'products', 'orders', 'expenses'];
        info.userCollections = {};

        for (const colName of collections) {
          try {
            const colQuery = query(collection(db, 'users', user.uid, colName));
            const colSnapshot = await getDocs(colQuery);
            info.userCollections[colName] = {
              success: true,
              documentCount: colSnapshot.size,
              documents: colSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            };
          } catch (error: any) {
            info.userCollections[colName] = {
              success: false,
              error: error.message,
              code: error.code,
            };
            setErrors(prev => [...prev, `${colName} koleksiyonu hatası: ${error.message}`]);
          }
        }
      }

      // Test 4: Security rules test
      if (user?.uid) {
        try {
          const testDoc = await getDocs(query(collection(db, 'users', user.uid, 'customers')));
          info.securityRules = {
            success: true,
            message: 'Güvenlik kuralları çalışıyor',
          };
        } catch (error: any) {
          info.securityRules = {
            success: false,
            error: error.message,
            code: error.code,
          };
          setErrors(prev => [...prev, `Güvenlik kuralları hatası: ${error.message}`]);
        }
      }

    } catch (error: any) {
      setErrors(prev => [...prev, `Genel hata: ${error.message}`]);
    }

    setDebugInfo(info);
    setIsLoading(false);
  };

  const createTestData = async () => {
    if (!user?.uid) return;
    
    setIsCreatingTestData(true);
    try {
      // Test müşterileri
      const testCustomers = [
        { name: 'Ahmet Yılmaz', email: 'ahmet@example.com', balance: 0 },
        { name: 'Fatma Şahin', email: 'fatma@example.com', balance: 150 },
        { name: 'Mehmet Demir', email: 'mehmet@example.com', balance: 0 },
      ];

      for (const customer of testCustomers) {
        await addDoc(collection(db, 'users', user.uid, 'customers'), customer);
      }

      // Test ürünleri
      const testProducts = [
        { name: 'Kıyma', type: 'beef', stock: 50, price: 300, cost: 250, lowStockThreshold: 10 },
        { name: 'Antrikot', type: 'beef', stock: 30, price: 500, cost: 400, lowStockThreshold: 5 },
        { name: 'Tavuk But', type: 'chicken', stock: 40, price: 150, cost: 120, lowStockThreshold: 8 },
        { name: 'Sucuk', type: 'processed', stock: 25, price: 200, cost: 160, lowStockThreshold: 5 },
      ];

      for (const product of testProducts) {
        await addDoc(collection(db, 'users', user.uid, 'products'), product);
      }

      // Test satışları
      const testOrders = [
        {
          customerId: 'test-customer-1',
          customerName: 'Ahmet Yılmaz',
          description: '2kg kıyma, 1kg antrikot',
          items: 2,
          total: 1100,
          status: 'Tamamlandı',
          date: new Date().toISOString(),
          paymentMethod: 'cash'
        },
        {
          customerId: 'test-customer-2',
          customerName: 'Fatma Şahin',
          description: '1kg tavuk but, 500gr sucuk',
          items: 2,
          total: 350,
          status: 'Tamamlandı',
          date: new Date().toISOString(),
          paymentMethod: 'visa'
        }
      ];

      for (const order of testOrders) {
        await addDoc(collection(db, 'users', user.uid, 'orders'), order);
      }

      // Test giderleri
      const testExpenses = [
        {
          description: 'Ekim ayı elektrik faturası',
          amount: 450,
          category: 'Fatura',
          date: new Date().toISOString()
        },
        {
          description: 'Dükkan kirası',
          amount: 2000,
          category: 'Kira',
          date: new Date().toISOString()
        }
      ];

      for (const expense of testExpenses) {
        await addDoc(collection(db, 'users', user.uid, 'expenses'), expense);
      }

      alert('Test verileri başarıyla oluşturuldu!');
      testFirebaseConnection(); // Debug bilgilerini yenile
    } catch (error: any) {
      console.error('Test data creation error:', error);
      alert(`Test verisi oluşturulurken hata: ${error.message}`);
    } finally {
      setIsCreatingTestData(false);
    }
  };

  useEffect(() => {
    if (user) {
      testFirebaseConnection();
    }
  }, [user]);

  if (!user) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Debug Panel - Kullanıcı Girişi Yok
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Kullanıcı girişi yapılmamış. Debug bilgileri için giriş yapın.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Firebase Debug Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Button onClick={testFirebaseConnection} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Bağlantıyı Test Et
            </Button>
            <Button onClick={createTestData} disabled={isCreatingTestData} variant="outline">
              {isCreatingTestData && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Plus className="mr-2 h-4 w-4" />
              Test Verisi Oluştur
            </Button>
            <Badge variant={errors.length > 0 ? "destructive" : "default"}>
              {errors.length} Hata
            </Badge>
          </div>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <h4 className="font-semibold">Kullanıcı Bilgileri:</h4>
            <pre className="bg-muted p-2 rounded text-sm overflow-auto">
              {JSON.stringify(debugInfo.user, null, 2)}
            </pre>
          </div>

          {debugInfo.firestoreConnection && (
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                Firestore Bağlantısı:
                {debugInfo.firestoreConnection.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </h4>
              <pre className="bg-muted p-2 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo.firestoreConnection, null, 2)}
              </pre>
            </div>
          )}

          {debugInfo.securityRules && (
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                Güvenlik Kuralları:
                {debugInfo.securityRules.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </h4>
              <pre className="bg-muted p-2 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo.securityRules, null, 2)}
              </pre>
            </div>
          )}

          {debugInfo.userCollections && (
            <div className="space-y-2">
              <h4 className="font-semibold">Kullanıcı Koleksiyonları:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(debugInfo.userCollections).map(([colName, colInfo]: [string, any]) => (
                  <div key={colName} className="border rounded p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{colName}:</span>
                      {colInfo.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <pre className="text-xs bg-muted p-1 rounded overflow-auto">
                      {JSON.stringify(colInfo, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}