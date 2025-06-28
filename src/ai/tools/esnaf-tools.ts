/**
 * @fileOverview AI tools for the Esnaf Defteri application that interact directly with Firestore.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import type { Customer, Product, Order, Expense, StockAdjustment } from '@/lib/types';


// Helper to find a resource by name, used internally by tools
const findResourceByName = async <T extends { name: string, userId: string }>(collectionName: string, name: string, userId: string): Promise<(T & {id: string}) | null> => {
  const lowerCaseName = name.toLowerCase();
  const q = query(
    collection(db, collectionName), 
    where("userId", "==", userId)
  );
  
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;

  // Manual client-side filtering for case-insensitivity
  const foundDoc = querySnapshot.docs.find(doc => doc.data().name.toLowerCase() === lowerCaseName);
  
  if (foundDoc) {
    return { id: foundDoc.id, ...foundDoc.data() } as (T & { id: string });
  }
  
  return null;
};


// Helper to find a resource by ID
const findResourceById = async (collectionName: string, id: string): Promise<any | null> => {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}


// Shared output schema for most tools
const ToolOutputSchema = z.string().describe("İşlemin sonucunu açıklayan, kullanıcıya gösterilecek bir mesaj.");


export const addSaleTool = ai.defineTool(
  {
    name: 'addSale',
    description:
      'Bir müşteriye veresiye (borç) satış ekler. Örneğin: "Ahmet Yılmaz\'a 2kg kıyma satışı ekle, tutarı 500 lira." Bu işlem müşterinin borcunu artırır.',
    inputSchema: z.object({
      customerName: z
        .string()
        .describe('Satışın yapıldığı müşterinin tam adı.'),
      description: z
        .string()
        .describe('Satılan ürünlerin veya hizmetin açıklaması.'),
      total: z.number().describe('Satışın toplam tutarı (Türk Lirası).'),
      userId: z.string().describe("The user's Firebase UID.")
    }),
    outputSchema: ToolOutputSchema,
  },
  async ({ customerName, description, total, userId }) => {
    const customer = await findResourceByName<Customer>('customers', customerName, userId);
    if (!customer) {
      return `"${customerName}" adında bir müşteri bulamadım. Lütfen ismi kontrol edin veya bu isimde yeni bir müşteri eklemek isterseniz belirtin.`;
    }

    const batch = writeBatch(db);
    const newOrderRef = doc(collection(db, 'orders'));
    batch.set(newOrderRef, {
      userId,
      customerId: customer.id,
      customerName: customer.name,
      date: new Date().toISOString(),
      status: 'Tamamlandı',
      items: description.split(',').length,
      description,
      total,
    });

    const customerRef = doc(db, "customers", customer.id);
    batch.update(customerRef, { balance: customer.balance + total });
    
    await batch.commit();
    return `${customer.name} için ${total} TL tutarında satış başarıyla eklendi.`;
  }
);

export const addCashSaleTool = ai.defineTool(
  {
    name: 'addCashSale',
    description: 'Müşteriye bağlı olmayan, tezgahtan yapılan peşin satışları ekler. Örneğin: "Tezgahtan 200 liralık peşin satış yaptım." Bu işlem müşteri borçlarını etkilemez.',
    inputSchema: z.object({
      description: z.string().describe('Satılan ürünlerin veya hizmetin açıklaması.'),
      total: z.number().describe('Satışın toplam tutarı (Türk Lirası).'),
      userId: z.string().describe("The user's Firebase UID.")
    }),
    outputSchema: ToolOutputSchema,
  },
  async ({ description, total, userId }) => {
     await addDoc(collection(db, 'orders'), {
      userId,
      customerId: 'CASH_SALE',
      customerName: 'Peşin Satış',
      date: new Date().toISOString(),
      status: 'Tamamlandı',
      items: description.split(',').length,
      description,
      total,
    });
    return `${total} TL tutarında peşin satış başarıyla eklendi.`;
  }
);

export const addPaymentTool = ai.defineTool(
  {
    name: 'addPayment',
    description:
      'Bir müşteriden gelen ödemeyi kaydeder. Örneğin: "Ayşe Kaya\'dan 100 lira ödeme aldım." Bu işlem müşterinin borcunu azaltır.',
    inputSchema: z.object({
      customerName: z
        .string()
        .describe('Ödemeyi yapan müşterinin tam adı.'),
      description: z
        .string()
        .describe("Ödeme için bir açıklama, örn. 'Nakit Ödeme', 'Elden ödeme'.")
        .optional(),
      total: z.number().describe('Ödenen toplam tutar (Türk Lirası).'),
      userId: z.string().describe("The user's Firebase UID.")
    }),
    outputSchema: ToolOutputSchema,
  },
  async ({ customerName, description, total, userId }) => {
    const customer = await findResourceByName<Customer>('customers', customerName, userId);
    if (!customer) {
      return `"${customerName}" adında bir müşteri bulamadım. Lütfen ismi kontrol edin.`;
    }

    const batch = writeBatch(db);
    const newPaymentRef = doc(collection(db, 'orders'));
    batch.set(newPaymentRef, {
      userId,
      customerId: customer.id,
      customerName: customer.name,
      description: description || 'Nakit Ödeme',
      items: 1,
      total: -total, // Payments are negative
      status: 'Tamamlandı',
      date: new Date().toISOString(),
    });

    const customerRef = doc(db, "customers", customer.id);
    batch.update(customerRef, { balance: customer.balance - total });

    await batch.commit();
    return `${customer.name} adlı müşteriden ${total} TL ödeme başarıyla alındı.`;
  }
);

export const addExpenseTool = ai.defineTool(
  {
    name: 'addExpense',
    description: 'Dükkan için yeni bir masraf (gider) ekler. Örneğin: "Elektrik faturası için 300 lira gider ekle." Kategori otomatik olarak tahmin edilir.',
    inputSchema: z.object({
      description: z.string().describe('Giderin açıklaması.'),
      amount: z.number().describe('Giderin tutarı (Türk Lirası).'),
      category: z
        .enum(['Kira', 'Fatura', 'Malzeme', 'Maaş', 'Diğer'])
        .describe('Giderin kategorisi.'),
       userId: z.string().describe("The user's Firebase UID.")
    }),
    outputSchema: ToolOutputSchema,
  },
  async ({ description, amount, category, userId }) => {
    await addDoc(collection(db, 'expenses'), {
      userId,
      date: new Date().toISOString(),
      description,
      amount,
      category,
    });
    return `"${description}" açıklamasıyla ${amount} TL tutarında yeni bir gider eklendi.`;
  }
);

export const addStockAdjustmentTool = ai.defineTool(
  {
    name: 'addStockAdjustment',
    description: 'Bir ürünün stok miktarını elle değiştirir. Örneğin: "Bozulduğu için 2kg kıymayı stoktan düş." Stok eklemek için pozitif, azaltmak için negatif sayı kullan.',
    inputSchema: z.object({
      productName: z.string().describe('Stoğu ayarlanacak ürünün adı.'),
      quantity: z
        .number()
        .int()
        .describe(
          'Stoktaki değişim miktarı. Stok eklemek için pozitif, azaltmak için negatif bir değer girin.'
        ),
      description: z.string().describe('Stok hareketinin nedeni.'),
      category: z
        .enum([
          'Bozulma',
          'Hırsızlık',
          'Veri Giriş Hatası',
          'Hatalı Ürün Alımı',
          'İndirim',
          'Diğer',
        ])
        .describe('Stok hareketinin kategorisi.'),
       userId: z.string().describe("The user's Firebase UID.")
    }),
    outputSchema: ToolOutputSchema,
  },
  async ({ productName, quantity, description, category, userId }) => {
    const product = await findResourceByName<Product>('products', productName, userId);
    if (!product) {
        return `"${productName}" adında bir ürün bulamadım. Lütfen ürün listesini kontrol edin.`;
    }

    const batch = writeBatch(db);
    const newAdjRef = doc(collection(db, 'stockAdjustments'));
    batch.set(newAdjRef, {
      userId,
      productId: product.id,
      productName: product.name,
      date: new Date().toISOString(),
      quantity,
      description,
      category,
    });

    const productRef = doc(db, "products", product.id);
    batch.update(productRef, { stock: product.stock + quantity });

    await batch.commit();
    return `${product.name} ürünü için stok hareketi başarıyla eklendi.`;
  }
);

export const addCustomerTool = ai.defineTool(
  {
    name: 'addCustomer',
    description: 'Sisteme yeni bir müşteri kaydeder. Örneğin: "Yeni müşteri ekle: Adı Canan Güneş, telefonu 5551234567, başlangıç borcu 150 lira."',
    inputSchema: z.object({
      customerName: z
        .string()
        .describe('Yeni müşterinin tam adı.'),
      email: z
        .string()
        .email()
        .describe("Yeni müşterinin e-posta adresi. Bu alan zorunlu değildir.")
        .optional(),
      initialDebt: z.number().describe("Müşterinin başlangıç borç tutarı. Yoksa belirtme.").optional(),
      userId: z.string().describe("The user's Firebase UID.")
    }),
    outputSchema: ToolOutputSchema,
  },
  async ({ customerName, email, initialDebt, userId }) => {
    const batch = writeBatch(db);
    const newCustomerRef = doc(collection(db, 'customers'));
    batch.set(newCustomerRef, { 
        userId,
        name: customerName, 
        email: email || '', 
        balance: initialDebt || 0 
    });

    if (initialDebt && initialDebt > 0) {
        const newOrderRef = doc(collection(db, 'orders'));
        batch.set(newOrderRef, {
            userId,
            customerId: newCustomerRef.id,
            customerName,
            date: new Date().toISOString(),
            status: 'Tamamlandı',
            items: 1,
            description: 'Başlangıç Bakiyesi / Devir',
            total: initialDebt,
        });
    }
    
    await batch.commit();
    
    let responseMessage = `${customerName} adlı yeni müşteri başarıyla eklendi.`;
    if (initialDebt) {
        responseMessage += ` Başlangıç borcu: ${initialDebt} TL.`;
    }
    return responseMessage;
  }
);

export const deleteCustomerTool = ai.defineTool(
  {
    name: 'deleteCustomer',
    description: 'Bir müşteriyi ve ona ait tüm borç/ödeme kayıtlarını sistemden kalıcı olarak siler.',
    inputSchema: z.object({
      customerName: z.string().describe('Silinecek müşterinin tam adı.'),
      userId: z.string().describe("The user's Firebase UID.")
    }),
    outputSchema: ToolOutputSchema,
  },
  async ({ customerName, userId }) => {
    const customer = await findResourceByName<Customer>('customers', customerName, userId);
    if (!customer) {
        return `"${customerName}" adında bir müşteri bulamadım.`;
    }

    const batch = writeBatch(db);
    batch.delete(doc(db, 'customers', customer.id));

    const ordersQuery = query(collection(db, 'orders'), where("userId", "==", userId), where("customerId", "==", customer.id));
    const ordersSnapshot = await getDocs(ordersQuery);
    ordersSnapshot.forEach(doc => batch.delete(doc.ref));

    await batch.commit();
    return `${customer.name} adlı müşteri ve tüm kayıtları başarıyla silindi.`;
  }
);

export const deleteProductTool = ai.defineTool(
  {
    name: 'deleteProduct',
    description: 'Bir ürünü ürün listesinden kalıcı olarak siler.',
    inputSchema: z.object({
      productName: z.string().describe('Silinecek ürünün adı.'),
      userId: z.string().describe("The user's Firebase UID.")
    }),
    outputSchema: ToolOutputSchema,
  },
  async ({ productName, userId }) => {
     const product = await findResourceByName<Product>('products', productName, userId);
     if (!product) {
        return `"${productName}" adında bir ürün bulamadım.`;
     }
     
     await deleteDoc(doc(db, 'products', product.id));
     // Note: Associated stock adjustments are not deleted to preserve history, but could be.
     return `${product.name} adlı ürün başarıyla silindi.`;
  }
);

export const deleteSaleTool = ai.defineTool(
  {
    name: 'deleteSale',
    description: 'Belirli bir satış veya ödeme işlemini kimliğine (ID) göre siler. Örneğin: "ORD001 numaralı satışı sil."',
    inputSchema: z.object({
      saleId: z.string().describe('Silinecek satış veya ödeme işleminin IDsi, örn., "ORD001" veya "PAY001".'),
      userId: z.string().describe("The user's Firebase UID.")
    }),
    outputSchema: ToolOutputSchema,
  },
  async ({ saleId, userId }) => {
      const saleRef = doc(db, 'orders', saleId);
      const saleSnap = await getDoc(saleRef);

      if (!saleSnap.exists() || saleSnap.data().userId !== userId) {
          return `"${saleId}" numaralı bir satış veya ödeme bulamadım.`;
      }
      const sale = saleSnap.data() as Order;

      const batch = writeBatch(db);
      batch.delete(saleRef);

      if (sale.customerId && sale.customerId !== 'CASH_SALE') {
          const customerRef = doc(db, 'customers', sale.customerId);
          const customerSnap = await getDoc(customerRef);
          if (customerSnap.exists()) {
              const customer = customerSnap.data() as Customer;
              batch.update(customerRef, { balance: customer.balance - sale.total });
          }
      }
      
      await batch.commit();
      return `${saleId} numaralı işlem başarıyla silindi.`;
  }
);

export const deleteExpenseTool = ai.defineTool(
  {
    name: 'deleteExpense',
    description: 'Belirli bir gider kaydını kimliğine (ID) göre siler.',
    inputSchema: z.object({
      expenseId: z.string().describe('Silinecek gider kaydının IDsi, örn., "EXP001".'),
      userId: z.string().describe("The user's Firebase UID.")
    }),
    outputSchema: ToolOutputSchema,
  },
  async ({ expenseId, userId }) => {
      const expenseRef = doc(db, 'expenses', expenseId);
      const expenseSnap = await getDoc(expenseRef);

       if (!expenseSnap.exists() || expenseSnap.data().userId !== userId) {
          return `"${expenseId}" numaralı bir gider bulamadım.`;
      }

      await deleteDoc(expenseRef);
      return `${expenseId} numaralı gider kaydı başarıyla silindi.`;
  }
);

export const deleteStockAdjustmentTool = ai.defineTool(
  {
    name: 'deleteStockAdjustment',
    description: 'Belirli bir stok hareketini kimliğine (ID) göre siler.',
    inputSchema: z.object({
      adjustmentId: z
        .string()
        .describe('Silinecek stok hareketinin IDsi, örn., "ADJ001".'),
      userId: z.string().describe("The user's Firebase UID.")
    }),
    outputSchema: ToolOutputSchema,
  },
  async ({ adjustmentId, userId }) => {
      const adjRef = doc(db, 'stockAdjustments', adjustmentId);
      const adjSnap = await getDoc(adjRef);

       if (!adjSnap.exists() || adjSnap.data().userId !== userId) {
          return `"${adjustmentId}" numaralı bir stok hareketi bulamadım.`;
      }
      const adj = adjSnap.data() as StockAdjustment;

      const batch = writeBatch(db);
      batch.delete(adjRef);

      if (adj.productId) {
          const productRef = doc(db, 'products', adj.productId);
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
              const product = productSnap.data() as Product;
              batch.update(productRef, { stock: product.stock - adj.quantity });
          }
      }

      await batch.commit();
      return `${adjustmentId} numaralı stok hareketi başarıyla silindi.`;
  }
);
