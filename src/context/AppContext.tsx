import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Currency, 
  CartItem, 
  MaintenanceJob, 
  OrderRecord, 
  EmailNotification, 
  AccessoryProduct 
} from '../types';
import { 
  CURRENCY_RATES, 
  INITIAL_MAINTENANCE_JOBS, 
  INITIAL_ORDERS, 
  INITIAL_NOTIFICATIONS,
  ACCESSORY_INVENTORY 
} from '../data/mockData';

interface AppContextType {
  activeTab: 'services' | 'bikes' | 'rental' | 'van_fleet';
  setActiveTab: (tab: 'services' | 'bikes' | 'rental' | 'van_fleet') => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceEur: number) => string;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotalEur: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  
  // Jobs
  jobs: MaintenanceJob[];
  addJob: (job: MaintenanceJob) => void;
  
  // Orders
  orders: OrderRecord[];
  addOrder: (order: OrderRecord) => void;
  
  // Notifications & Emails
  notifications: EmailNotification[];
  unreadEmailCount: number;
  addNotification: (notif: EmailNotification) => void;
  markNotificationRead: (id: string) => void;
  isEmailDrawerOpen: boolean;
  setIsEmailDrawerOpen: (open: boolean) => void;
  
  // Service Booking Modal
  isBookingModalOpen: boolean;
  setIsBookingModalOpen: (open: boolean) => void;
  preselectedServiceId: string | null;
  setPreselectedServiceId: (id: string | null) => void;
  openBookingWithService: (serviceId?: string) => void;

  // Checkout Modal
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (open: boolean) => void;
  checkoutPayload: {
    type: 'cart' | 'single_bike' | 'service' | 'rental';
    data?: any;
    totalEur: number;
    title: string;
  } | null;
  openCheckout: (payload: { type: 'cart' | 'single_bike' | 'service' | 'rental'; data?: any; totalEur: number; title: string }) => void;
  
  // Security Modal
  isSecurityModalOpen: boolean;
  setIsSecurityModalOpen: (open: boolean) => void;

  // Inventory
  accessories: AccessoryProduct[];
  
  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'services' | 'bikes' | 'rental' | 'van_fleet'>('services');
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [jobs, setJobs] = useState<MaintenanceJob[]>(INITIAL_MAINTENANCE_JOBS);
  const [orders, setOrders] = useState<OrderRecord[]>(INITIAL_ORDERS);
  const [notifications, setNotifications] = useState<EmailNotification[]>(INITIAL_NOTIFICATIONS);
  const [isEmailDrawerOpen, setIsEmailDrawerOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutPayload, setCheckoutPayload] = useState<{
    type: 'cart' | 'single_bike' | 'service' | 'rental';
    data?: any;
    totalEur: number;
    title: string;
  } | null>(null);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [accessories, setAccessories] = useState<AccessoryProduct[]>(ACCESSORY_INVENTORY);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 4000);
  };

  const formatPrice = (priceEur: number): string => {
    const rateInfo = CURRENCY_RATES[currency] || CURRENCY_RATES.EUR;
    const converted = Math.round(priceEur * rateInfo.rate);
    
    if (currency === 'EUR') {
      return `€${converted}`;
    } else if (currency === 'USD') {
      return `$${converted}`;
    } else if (currency === 'GBP') {
      return `£${converted}`;
    } else if (currency === 'PLN') {
      return `${converted} zł`;
    } else if (currency === 'SEK') {
      return `${converted} kr`;
    }
    return `€${Math.round(priceEur)}`;
  };

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    setCart(prev => {
      const existing = prev.find(p => p.productId === item.productId);
      if (existing) {
        return prev.map(p => p.productId === item.productId ? { ...p, quantity: p.quantity + item.quantity } : p);
      }
      return [...prev, { ...item, id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}` }];
    });
    showToast(`Pievienots grozam: ${item.name}`);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalEur = cart.reduce((sum, item) => sum + (item.priceEur * item.quantity), 0);

  const addJob = (job: MaintenanceJob) => {
    setJobs(prev => [job, ...prev]);
    showToast(`Serviss pieteikts! Kods: ${job.trackingCode}`);
  };

  const addOrder = (order: OrderRecord) => {
    setOrders(prev => [order, ...prev]);
    // Deduct stock if accessory
    order.items.forEach(ci => {
      if (ci.type === 'accessory') {
        setAccessories(curr => curr.map(a => a.id === ci.productId ? { ...a, stockCount: Math.max(0, a.stockCount - ci.quantity) } : a));
      }
    });
    showToast(`Pirkums #${order.orderNumber} veiksmīgi apstiprināts!`);
  };

  const addNotification = (notif: EmailNotification) => {
    setNotifications(prev => [notif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadEmailCount = notifications.filter(n => !n.read).length;

  const openBookingWithService = (serviceId?: string) => {
    if (serviceId) {
      setPreselectedServiceId(serviceId);
    }
    setIsBookingModalOpen(true);
  };

  const openCheckout = (payload: { type: 'cart' | 'single_bike' | 'service' | 'rental'; data?: any; totalEur: number; title: string }) => {
    setCheckoutPayload(payload);
    setIsCheckoutModalOpen(true);
  };

  return (
    <AppContext.Provider value={{
      activeTab,
      setActiveTab,
      currency,
      setCurrency,
      formatPrice,
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotalEur,
      isCartOpen,
      setIsCartOpen,
      jobs,
      addJob,
      orders,
      addOrder,
      notifications,
      unreadEmailCount,
      addNotification,
      markNotificationRead,
      isEmailDrawerOpen,
      setIsEmailDrawerOpen,
      isBookingModalOpen,
      setIsBookingModalOpen,
      preselectedServiceId,
      setPreselectedServiceId,
      openBookingWithService,
      isCheckoutModalOpen,
      setIsCheckoutModalOpen,
      checkoutPayload,
      openCheckout,
      isSecurityModalOpen,
      setIsSecurityModalOpen,
      accessories,
      toastMessage,
      showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
