import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Currency, 
  CartItem, 
  MaintenanceJob, 
  UserBike, 
  OrderRecord, 
  EmailNotification, 
  JobStatus,
  AccessoryProduct 
} from '../types';
import { 
  CURRENCY_RATES, 
  INITIAL_MAINTENANCE_JOBS, 
  INITIAL_USER_GARAGE_BIKES, 
  INITIAL_ORDERS, 
  INITIAL_NOTIFICATIONS,
  ACCESSORY_INVENTORY 
} from '../data/mockData';

interface AppContextType {
  activeTab: 'services' | 'bikes' | 'accessories' | 'van_fleet' | 'dashboard';
  setActiveTab: (tab: 'services' | 'bikes' | 'accessories' | 'van_fleet' | 'dashboard') => void;
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
  
  // Jobs & Tracking
  jobs: MaintenanceJob[];
  addJob: (job: MaintenanceJob) => void;
  updateJobStatus: (jobId: string, status: JobStatus, note?: string) => void;
  selectedTrackingJob: MaintenanceJob | null;
  setSelectedTrackingJob: (job: MaintenanceJob | null) => void;
  
  // User Garage
  garageBikes: UserBike[];
  addGarageBike: (bike: UserBike) => void;
  
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
    type: 'cart' | 'single_bike' | 'service';
    data?: any;
    totalEur: number;
    title: string;
  } | null;
  openCheckout: (payload: { type: 'cart' | 'single_bike' | 'service'; data?: any; totalEur: number; title: string }) => void;
  
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
  const [activeTab, setActiveTab] = useState<'services' | 'bikes' | 'accessories' | 'van_fleet' | 'dashboard'>('services');
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [jobs, setJobs] = useState<MaintenanceJob[]>(INITIAL_MAINTENANCE_JOBS);
  const [selectedTrackingJob, setSelectedTrackingJob] = useState<MaintenanceJob | null>(INITIAL_MAINTENANCE_JOBS[0]);
  const [garageBikes, setGarageBikes] = useState<UserBike[]>(INITIAL_USER_GARAGE_BIKES);
  const [orders, setOrders] = useState<OrderRecord[]>(INITIAL_ORDERS);
  const [notifications, setNotifications] = useState<EmailNotification[]>(INITIAL_NOTIFICATIONS);
  const [isEmailDrawerOpen, setIsEmailDrawerOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutPayload, setCheckoutPayload] = useState<{
    type: 'cart' | 'single_bike' | 'service';
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
    const converted = priceEur * rateInfo.rate;
    
    if (currency === 'EUR') {
      return `€${converted.toFixed(2)}`;
    } else if (currency === 'USD') {
      return `$${converted.toFixed(2)}`;
    } else if (currency === 'GBP') {
      return `£${converted.toFixed(2)}`;
    } else if (currency === 'PLN') {
      return `${converted.toFixed(2)} zł`;
    } else if (currency === 'SEK') {
      return `${Math.round(converted)} kr`;
    }
    return `€${priceEur.toFixed(2)}`;
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
    setSelectedTrackingJob(job);
    showToast(`Serviss pieteikts! Kods: ${job.trackingCode}`);
  };

  const updateJobStatus = (jobId: string, status: JobStatus, note?: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        const statusMap: Record<JobStatus, string> = {
          booked: 'Pieteikums saņemts un iekļauts servisa grafikā',
          van_en_route: 'VentVelo servisa busiņš ir ceļā pēc velosipēda',
          diagnostics: 'Diagnostika darbnīcā pabeigta, mezgli pārbaudīti',
          in_progress: 'Meistars veic tehnisko remontu un ultraskaņas mazgāšanu',
          quality_check: 'Gala drošības pārbaude un meistara testa brauciens',
          ready_for_pickup_or_delivery: 'Ričuks gatavs! Gaida saņemšanu vai piegādi ar busiņu',
          delivered: 'Velosipēds nodots klientam. VentVelo garantija ir aktīva.',
        };
        const statusLabel = statusMap[status];
        const newHistory = [
          ...job.statusHistory,
          {
            status,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            note: note || statusLabel,
          }
        ];
        const updated = { ...job, status, statusHistory: newHistory };
        if (selectedTrackingJob?.id === jobId) {
          setSelectedTrackingJob(updated);
        }

        // Trigger automated email notification in natural Latvian
        const statusEmail: EmailNotification = {
          id: `em_${Date.now()}`,
          recipientEmail: job.customerEmail,
          recipientName: job.customerName,
          subject: `Remonta statuss: ${statusLabel.slice(0, 38)}... [${job.trackingCode}]`,
          previewText: `Jaunumi par Tavu ${job.bikeModel}: ${note || statusLabel}`,
          category: 'status_update',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          referenceId: job.trackingCode,
          read: false,
          htmlContent: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917; line-height: 1.6;">
              <div style="background-color: #1c1917; padding: 24px; color: #ffffff; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0; font-size: 20px; font-weight: 700;">VentVelo darbnīcas progresa ziņojums</h2>
                <p style="margin: 4px 0 0; font-size: 13px; color: #a8a29e;">Pasūtījuma kods: ${job.trackingCode}</p>
              </div>
              <div style="padding: 24px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 8px 8px; background: #ffffff;">
                <h3 style="margin-top: 0; color: #0c0a09;">Statuss atjaunots: ${status.toUpperCase()}</h3>
                <p>Sveiki, ${job.customerName}! Jūsu velosipēds <strong>${job.bikeModel}</strong> ir sasniedzis nākamo darbu posmu:</p>
                <div style="background: #fafaf9; border-left: 4px solid #f59e0b; padding: 14px 16px; margin: 16px 0; border: 1px solid #e7e5e4; border-left-width: 4px;">
                  <p style="margin: 0; font-size: 14px; font-weight: 600; color: #292524;">${note || statusLabel}</p>
                </div>
                <p style="font-size: 13px; color: #78716c;">Atbildīgais meistars: ${job.mechanicName}</p>
              </div>
            </div>
          `,
        };
        setNotifications(n => [statusEmail, ...n]);
        showToast(`Izsūtīts automātisks e-pasts par statusu #${job.trackingCode}`);

        return updated;
      }
      return job;
    }));
  };

  const addGarageBike = (bike: UserBike) => {
    setGarageBikes(prev => [bike, ...prev]);
    showToast(`Velosipēds ${bike.brand} ${bike.model} reģistrēts Tavā garāžā`);
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

  const openCheckout = (payload: { type: 'cart' | 'single_bike' | 'service'; data?: any; totalEur: number; title: string }) => {
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
      updateJobStatus,
      selectedTrackingJob,
      setSelectedTrackingJob,
      garageBikes,
      addGarageBike,
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
