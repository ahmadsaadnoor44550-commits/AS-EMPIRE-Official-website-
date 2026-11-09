import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  query,
  where
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product, Order, StoreSettings, CartItem, OrderStatus } from '../types';
import { DEFAULT_STORE_SETTINGS } from '../data/constants';
import { useAuth } from './AuthContext';

interface StoreContextType {
  products: Product[];
  orders: Order[]; // All orders for owner
  customerOrders: Order[]; // Customer's own order history
  settings: StoreSettings;
  cart: CartItem[];
  wishlist: string[];
  loadingProducts: boolean;
  loadingOrders: boolean;
  loadingSettings: boolean;
  
  // Cart Actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTotalCount: number;
  deliveryFee: number;
  cartFinalTotal: number;
  
  // Wishlist Actions
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Order Actions
  createOrder: (orderData: {
    customerName: string;
    phone: string;
    address: string;
    city: string;
    notes?: string;
  }) => Promise<{ orderId: string; whatsappUrl: string; message: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  getOrderById: (orderId: string) => Promise<Order | null>;

  // Admin Product Actions
  addProduct: (productData: Omit<Product, 'id'>) => Promise<string>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Settings Actions
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  addBusinessCategory: (categoryName: string) => Promise<void>;
  removeBusinessCategory: (categoryName: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'as_empire_cart_clean_v2';
const WISHLIST_STORAGE_KEY = 'as_empire_wishlist_clean_v2';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOwner, currentUser } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true);

  // Save cart
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Save wishlist
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // Real-time Settings Listener
  useEffect(() => {
    const settingsDocRef = doc(db, 'settings', 'website');
    const unsubscribe = onSnapshot(
      settingsDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings({ ...DEFAULT_STORE_SETTINGS, ...docSnap.data() } as StoreSettings);
        } else {
          setSettings(DEFAULT_STORE_SETTINGS);
        }
        setLoadingSettings(false);
      },
      (error) => {
        console.warn('Settings load error (falling back to defaults):', error);
        setSettings(DEFAULT_STORE_SETTINGS);
        setLoadingSettings(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time Products Listener (starts with 0 products until owner adds them)
  useEffect(() => {
    const productsRef = collection(db, 'products');
    const unsubscribe = onSnapshot(
      productsRef,
      (snapshot) => {
        const loaded: Product[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Product, 'id'>)
          });
        });
        setProducts(loaded);
        setLoadingProducts(false);
      },
      (error) => {
        console.error('Products listener error:', error);
        setLoadingProducts(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time Orders Listener for Owner Dashboard
  useEffect(() => {
    if (!isOwner) {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }

    setLoadingOrders(true);
    const ordersRef = collection(db, 'orders');
    const unsubscribe = onSnapshot(
      ordersRef,
      (snapshot) => {
        const loaded: Order[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Order, 'id'>)
          });
        });
        loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(loaded);
        setLoadingOrders(false);
      },
      (error) => {
        console.warn('Orders listener error (owner):', error);
        setLoadingOrders(false);
      }
    );

    return () => unsubscribe();
  }, [isOwner]);

  // Real-time Customer Orders (Order History for logged-in Customer)
  useEffect(() => {
    if (!currentUser || isOwner) {
      setCustomerOrders([]);
      return;
    }

    const q = query(collection(db, 'orders'), where('customerId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: Order[] = [];
        snapshot.forEach((d) => {
          loaded.push({ id: d.id, ...(d.data() as Omit<Order, 'id'>) });
        });
        loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setCustomerOrders(loaded);
      },
      (err) => {
        console.warn('Customer orders history note:', err);
      }
    );

    return () => unsubscribe();
  }, [currentUser, isOwner]);

  // Cart Management
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, Math.max(1, quantity)) }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const max = item.product.stock || 999;
          return { ...item, quantity: Math.min(max, quantity) };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const cartSubtotal = cart.reduce((sum, item) => {
    const itemPrice = item.product.discountPrice ?? item.product.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  const cartTotalCount = cart.reduce((count, item) => count + item.quantity, 0);

  const deliveryFee = cartSubtotal >= (settings.freeDeliveryThreshold || 5000) || cartSubtotal === 0 
    ? 0 
    : (settings.deliveryFee || 250);

  const cartFinalTotal = cartSubtotal + deliveryFee;

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => 
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Order creation and WhatsApp message generator
  const createOrder = async (orderData: {
    customerName: string;
    phone: string;
    address: string;
    city: string;
    notes?: string;
  }) => {
    if (cart.length === 0) {
      throw new Error('Your shopping cart is empty.');
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ASE-${new Date().getFullYear()}-${randomSuffix}`;

    const orderItems = cart.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.discountPrice ?? item.product.price,
      quantity: item.quantity,
      image: item.product.images?.[0] || '',
      category: item.product.category || 'Mobile Spare'
    }));

    const finalOrder: Order = {
      id: orderId,
      ...(currentUser?.uid ? { customerId: currentUser.uid } : {}),
      customerName: orderData.customerName.trim(),
      phone: orderData.phone.trim(),
      address: orderData.address.trim(),
      city: orderData.city.trim(),
      items: orderItems,
      subtotal: cartSubtotal,
      deliveryCharges: deliveryFee,
      totalAmount: cartFinalTotal,
      status: 'Pending Confirmation',
      notes: orderData.notes?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Clean all undefined values to ensure Firestore compatibility
    const orderPayload = Object.fromEntries(
      Object.entries(finalOrder).filter(([_, v]) => v !== undefined)
    );

    // Save order directly into Firestore
    try {
      const orderDocRef = doc(db, 'orders', orderId);
      await setDoc(orderDocRef, orderPayload);
      
      // Update local state immediately for instant feedback
      setOrders((prev) => [finalOrder, ...prev.filter((o) => o.id !== orderId)]);
      if (currentUser?.uid) {
        setCustomerOrders((prev) => [finalOrder, ...prev.filter((o) => o.id !== orderId)]);
      }
    } catch (error) {
      console.error('Order creation error:', error);
      handleFirestoreError(error, OperationType.WRITE, `orders/${orderId}`);
    }

    // Format WhatsApp message for owner
    const itemsFormatted = orderItems
      .map(
        (it, idx) =>
          `${idx + 1}. *${it.name}* (${it.category || 'Product'})\n   Quantity: ${it.quantity} | Price: Rs. ${(it.price * it.quantity).toLocaleString('en-PK')}`
      )
      .join('\n');

    const whatsappMessage = 
`📱 *NEW ORDER – AS EMPIRE*
*Order Tracking ID:* #${orderId}
─────────────────────
*Customer Information:*
• Name: ${finalOrder.customerName}
• WhatsApp / Mobile: ${finalOrder.phone}
• City: ${finalOrder.city}
• Delivery Address: ${finalOrder.address}
${finalOrder.notes ? `• Special Notes: ${finalOrder.notes}\n` : ''}─────────────────────
*Ordered Displays / Products:*
${itemsFormatted}
─────────────────────
*Total Amount (PKR):*
• Subtotal: Rs. ${finalOrder.subtotal.toLocaleString('en-PK')}
• Delivery Charges: ${finalOrder.deliveryCharges === 0 ? 'FREE' : `Rs. ${finalOrder.deliveryCharges.toLocaleString('en-PK')}`}
• *GRAND TOTAL: Rs. ${finalOrder.totalAmount.toLocaleString('en-PK')} PKR*
─────────────────────
*Payment Status:*
• Direct payment discussion via EasyPaisa / JazzCash / Bank Transfer

_Assalam-o-Alaikum AS Empire! I have placed this order on your website. Please confirm availability and share payment details._`;

    // Clean phone number for WhatsApp link
    let cleanPhone = (settings.whatsappNumber || '03330916398').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('03')) {
      cleanPhone = '92' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('92') && cleanPhone.length === 10) {
      cleanPhone = '92' + cleanPhone;
    }
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;

    clearCart();

    return { orderId, whatsappUrl, message: whatsappMessage };
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const getOrderById = async (orderId: string): Promise<Order | null> => {
    try {
      const orderRef = doc(db, 'orders', orderId.trim());
      const snap = await getDoc(orderRef);
      if (snap.exists()) {
        return { id: snap.id, ...(snap.data() as Omit<Order, 'id'>) };
      }
      return null;
    } catch (error) {
      console.warn('Error fetching order by ID:', error);
      return null;
    }
  };

  // Product Admin Operations
  const addProduct = async (productData: Omit<Product, 'id'>): Promise<string> => {
    const newId = `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const fullProduct: Product = {
      ...productData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'products', newId), fullProduct);
      return newId;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${newId}`);
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const prodRef = doc(db, 'products', id);
      await updateDoc(prodRef, {
        ...productData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  // Settings update
  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    try {
      const settingsRef = doc(db, 'settings', 'website');
      await setDoc(settingsRef, {
        ...settings,
        ...newSettings,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/website');
    }
  };

  const addBusinessCategory = async (categoryName: string) => {
    const trimmed = categoryName.trim();
    if (!trimmed || settings.categories?.includes(trimmed)) return;
    const updated = [...(settings.categories || []), trimmed];
    await updateSettings({ categories: updated });
  };

  const removeBusinessCategory = async (categoryName: string) => {
    const updated = (settings.categories || []).filter((c) => c !== categoryName);
    await updateSettings({ categories: updated });
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        customerOrders,
        settings,
        cart,
        wishlist,
        loadingProducts,
        loadingOrders,
        loadingSettings,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        cartTotalCount,
        deliveryFee,
        cartFinalTotal,
        toggleWishlist,
        isInWishlist,
        createOrder,
        updateOrderStatus,
        getOrderById,
        addProduct,
        updateProduct,
        deleteProduct,
        updateSettings,
        addBusinessCategory,
        removeBusinessCategory,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
