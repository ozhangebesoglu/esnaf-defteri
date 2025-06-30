/**
 * @fileOverview AI tools for the Esnaf Defteri application that interact directly with Firestore.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import type { Customer, Product, Order, Expense, StockAdjustment } from '@/lib/types';


// Helper to find a resource by name, used internally by tools
const findResourceByName = async <T extends { name: string, userId: string }>(collectionName: string, name: string, userId: string): Promise<(T & {id: string}) | null> => {
  const lowerCaseName = name.toLowerCase();
  const q = adminDb.collection(collectionName).where("userId", "==", userId);
  
  const querySnapshot = await q.get();
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
    const docRef = adminDb.collection(collectionName).doc(id);
    const docSnap = await docRef.get();
    return docSnap.exists ? { id: docSnap.id, ...docSnap.data() } : null;
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
    }),
    outputSchema: ToolOutputSchema,
  },
  async ({ customerName, description, total, userId }) => {
    const customer = await findResourceByName<Customer>('customers', customerName, userId);
    if (!customer) {
      return `"${customerName}" adında bir müşteri bulamadım. Lütfen ismi kontrol edin veya bu isimde yeni bir müşteri eklemek isterseniz belirtin.`;
    }

    const batch = adminDb.batch();
    const newOrderRef = adminDb.collection('orders').doc();
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

    const customerRef = adminDb.collection("customers").doc(customer.id);
    batch.update(customerRef, { balance: customer.balance + total });
    
    await batch.commit();
    return `${customer.name} için ${total} TL tutarında satış başarıyla eklendi.`;
  }
);

export const addCashSaleTool = ai.defineTool(
  {
    name: 'addCashSale',
    description: 'Müşteriye bağlı olmayan, tezgahtan yapılan peşin satışları ekler. Örneğin: "Tezgahtan 200 liralık nakit satış yaptım." Ödeme yöntemi (nakit veya visa) belirtilmelidir. Bu işlem müşteri borçlarını etkilemez.',
    inputSchema: z.object({
      description: z.string().describe('Satılan ürünlerin veya hizmetin açıklaması.'),
      total: z.number().describe('Satışın toplam tutarı (Türk Lirası).'),
      paymentMethod: z.enum(['cash', 'visa']).describe("Ödeme yöntemi, 'cash' (nakit) veya 'visa' (kredi kartı/POS)."),
    }),
    outputSchema: ToolOutputSchema,
  },
  async ({ description, total, userId, paymentMethod }) => {
     await adminDb.collection('orders').add({
      userId,
      customerId: 'CASH_SALE',
      customerName: 'Peşin Satış',
      date: new Date().toISOString(),
      status: 'Tamamlandı',
      items: description.split(',').length,
      description,
      total,
      paymentMethod,
    });
    return `${total} TL tutarında peşin satış (${paymentMethod === 'cash' ? 'Nakit' : 'Visa'}) başarıyla eklendi.`;
  }
);

export const addPaymentTool = ai.defineTool(
  {
    name: 'addPayment',
    description:
      'Bir müşteriden gelen ödemeyi kaydeder. Örneğin: "Ayşe Kaya\'dan 100 lira nakit ödeme aldım." Ödeme yöntemi (nakit veya visa) belirtilmelidir. Bu işlem müşterinin borcunu azaltır.',
    inputSchema: z.object({
      customerName: z
        .string()
        .describe('Ödemeyi yapan müşterinin tam adı.'),
      description: z
        .string()
        .describe("Ödeme için bir açıklama, örn. 'Nakit Ödeme', 'Elden ödeme'.")
        .optional(),
      total: z.number().describe('Ödenen toplam tutar (Türk Lirası).'),
      paymentMethod: z.enum(['cash', 'visa']).describe("Ödeme yöntemi, 'cash' (nakit) veya 'visa' (kredi kartı/POS)."),
    }),
    outputSchema: ToolOutputSchema,
  },
  async ({ customerName, description, total, userId, paymentMethod }) => {
    const customer = await findResourceByName<Customer>('customers', customerName, userId);
    if (!customer) {
      return `"${customerName}" adında bir müşteri bulamadım. Lütfen ismi kontrol edin.`;
    }

    const batch = adminDb.batch();
    const newPaymentRef = adminDb.collection('orders').doc();
    batch.set(newPaymentRef, {
      userId,
      customerId: customer.id,
      customerName: customer.name,
      description: description || (paymentMethod === 'cash' ? 'Nakit Ödeme' : 'Visa Ödeme'),
      items: 1,
      total: -total, // Payments are negative
      status: 'Tamamlandı',
      date: new Date().toISOString(),
      paymentMethod,
    });

    const customerRef = adminDb.collection("customers").doc(customer.id);
    batch.update(customerRef, { balance: customer.balance - total });

    await batch.commit();
    return `${customer.name} adlı müşteriden ${total} TL ödeme (${paymentMethod === 'cash' ? 'Nakit' : 'Visa'}) başarıyla alındı.`;
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
    }),
    outputSchema: ToolOutputSchema,
  },
  async ({ description, amount, category, userId }) => {
    await adminDb.collection('expenses').add({
      userId,
      date: new Date().toISOString(),
      description,
      amount,
      category,
    });
    return `"${description}" açıklamasıyla ${amount} TL tutarında yeni bir gider başarıyla eklendi.`;
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
          'Yeni Stok Girişi',
          'Bozulma',
          'Hırsızlık',
          'Veri Giriş Hatası',
          'Hatalı Ürün Alımı',
          'İndirim',
          'Diğer',
        ])
        .describe('Stok hareketinin kategorisi.'),
    }),
    outputSchema: ToolOutputSchema,
  },
  async ({ productName, quantity, description, category, userId }) => {
    const product = await findResourceByName<Product>('products', productName, userId);
    if (!product) {
        return `"${productName}" adında bir ürün bulamadım. Lütfen ürün listesini kontrol edin.`;
    }

    const newStock = product.stock + quantity;
    if (newStock < 0) {
        return `İşlem iptal edildi. ${product.name} ürününün mevcut stoğu (${product.stock}) bu işlem için yetersiz. Stoğu ${Math.abs(quantity)} kadar azaltamazsınız.`;
    }

    const batch = adminDb.batch();
    const newAdjRef = adminDb.collection('stockAdjustments').doc();
    batch.set(newAdjRef, {
      userId,
      productId: product.id,
      productName: product.name,
      date: new Date().toISOString(),
      quantity,
      description,
      category,
    });

    const productRef = adminDb.collection("products").doc(product.id);
    batch.update(productRef, { stock: newStock });

    await batch.commit();
    return `${product.name} ürünü için stok hareketi başarıyla eklendi. Yeni stok: ${newStock}.`;
  }
);

export const addCustomerTool = ai.defineTool(
  {
    name: 'addCustomer',
    description: 'Sisteme yeni bir müşteri kaydeder. Örneğin: "Yeni müşteri ekle: Adı Canan Güneş, başlangıç borcu 150 lira." Eğer başlangıç borcu belirtilmezse, borç 0 (sıfır) olarak kabul edilir.',
    inputSchema: z.object({
      customerName: z
        .string()
        .describe('Yeni müşterinin tam adı.'),
      initialDebt: z.number().describe("Müşterinin başlangıç borç tutarı. Belirtilmemişse 0'dır.").optional().default(0),
    }),
    outputSchema: ToolOutputSchema,
  },
  async ({ customerName, initialDebt, userId }) => {
    const existingCustomer = await findResourceByName<Customer>('customers', customerName, userId);
    if (existingCustomer) {
      return `"${customerName}" adında bir müşteri zaten mevcut. Farklı bir isimle tekrar deneyin.`;
    }
    
    const batch = adminDb.batch();
    const newCustomerRef = adminDb.collection('customers').doc();
    batch.set(newCustomerRef, { 
        userId,
        name: customerName, 
        email: '', 
        balance: initialDebt || 0 
    });

    if (initialDebt && initialDebt > 0) {
        const newOrderRef = adminDb.collection('orders').doc();
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
    
    let responseMessage = `"${customerName}" adlı yeni müşteri başarıyla eklendi.`;
    if (initialDebt && initialDebt > 0) {
        responseMessage += ` Başlangıç borcu: ${initialDebt} TL.`;
    } else {
        responseMessage += ` Bakiyesi 0 TL olarak ayarlandı.`
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
    }),
    outputSchema: ToolOutputSchema,
  },
  async ({ customerName, userId }) => {
    const customer = await findResourceByName<Customer>('customers', customerName, userId);
    if (!customer) {
        return `"${customerName}" adında bir müşteri bulamadım.`;
    }

    const batch = adminDb.batch();
    batch.delete(adminDb.collection('customers').doc(customer.id));

    const ordersQuery = adminDb.collection('orders').where("userId", "==", userId).where("customerId", "==", customer.id);
    const ordersSnapshot = await ordersQuery.get();
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
    }),
    outputSchema: ToolOutputSchema,
  },
  async ({ productName, userId }) => {
     const product = await findResourceByName<Product>('products', productName, userId);
     if (!product) {
        return `"${productName}" adında bir ürün bulamadım.`;
     }
     
     await adminDb.collection('products').doc(product.id).delete();
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
    }),
    outputSchema: ToolOutputSchema,
  },
  async ({ saleId, userId }) => {
      const saleRef = adminDb.collection('orders').doc(saleId);
      const saleSnap = await saleRef.get();

      if (!saleSnap.exists || saleSnap.data()!.userId !== userId) {
          return `"${saleId}" numaralı bir satış veya ödeme bulamadım.`;
      }
      const sale = saleSnap.data() as Order;

      const batch = adminDb.batch();
      batch.delete(saleRef);

      if (sale.customerId && sale.customerId !== 'CASH_SALE') {
          const customerRef = adminDb.collection('customers').doc(sale.customerId);
          const customerSnap = await customerRef.get();
          if (customerSnap.exists) {
              const customer = customerSnap.data() as Customer;
              batch.update(customerRef, { balance: customer.balance - sale.total });
          }
      }
      
      await batch.commit();
      return `'${sale.description}' açıklamalı satış/ödeme işlemi başarıyla silindi.`;
  }
);

export const deleteExpenseTool = ai.defineTool(
  {
    name: 'deleteExpense',
    description: 'Belirli bir gider kaydını kimliğine (ID) göre siler.',
    inputSchema: z.object({
      expenseId: z.string().describe('Silinecek gider kaydının IDsi, örn., "EXP001".'),
    }),
    outputSchema: ToolOutputSchema,
  },
  async ({ expenseId, userId }) => {
      const expenseRef = adminDb.collection('expenses').doc(expenseId);
      const expenseSnap = await expenseRef.get();

       if (!expenseSnap.exists || expenseSnap.data()!.userId !== userId) {
          return `"${expenseId}" numaralı bir gider bulamadım.`;
      }
      
      const expense = expenseSnap.data() as Expense;
      await expenseRef.delete();
      return `'${expense.description}' başlıklı gider kaydı başarıyla silindi.`;
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
    }),
    outputSchema: ToolOutputSchema,
  },
  async ({ adjustmentId, userId }) => {
      const adjRef = adminDb.collection('stockAdjustments').doc(adjustmentId);
      const adjSnap = await adjRef.get();

       if (!adjSnap.exists || adjSnap.data()!.userId !== userId) {
          return `"${adjustmentId}" numaralı bir stok hareketi bulamadım.`;
      }
      const adj = adjSnap.data() as StockAdjustment;

      const batch = adminDb.batch();
      batch.delete(adjRef);

      if (adj.productId) {
          const productRef = adminDb.collection('products').doc(adj.productId);
          const productSnap = await productRef.get();
          if (productSnap.exists) {
              const product = productSnap.data() as Product;
              batch.update(productRef, { stock: product.stock - adj.quantity });
          }
      }

      await batch.commit();
      return `'${adj.description}' açıklamalı stok hareketi başarıyla silindi.`;
  }
);
