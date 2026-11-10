import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ServiceCatalog } from './components/services/ServiceCatalog';
import { ServiceBookingModal } from './components/services/ServiceBookingModal';
import { BikesShowcase } from './components/shop/BikesShowcase';
import { AccessoriesInventory } from './components/shop/AccessoriesInventory';
import { MobileVanFleet } from './components/van/MobileVanFleet';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { CartDrawer } from './components/checkout/CartDrawer';
import { PaymentGatewayModal } from './components/checkout/PaymentGatewayModal';
import { EmailNotificationDrawer } from './components/notifications/EmailNotificationDrawer';
import { SupportChat } from './components/chat/SupportChat';
import { SecurityModal } from './components/security/SecurityModal';
import { Bell, CheckCircle } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, toastMessage } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans text-stone-900 selection:bg-amber-500 selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-18 right-4 sm:right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-stone-700 flex items-center gap-2.5 text-xs">
            <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Primary Top Bar */}
      <Header />

      {/* Main Routed Content Based on Active Tab */}
      <main className="flex-1">
        {activeTab === 'services' && <ServiceCatalog />}
        {activeTab === 'bikes' && <BikesShowcase />}
        {activeTab === 'accessories' && <AccessoriesInventory />}
        {activeTab === 'van_fleet' && <MobileVanFleet />}
        {activeTab === 'dashboard' && <UserDashboard />}
      </main>

      {/* Interactive Modals and Slide-over Drawers */}
      <ServiceBookingModal />
      <CartDrawer />
      <PaymentGatewayModal />
      <EmailNotificationDrawer />
      <SecurityModal />
      <SupportChat />

      {/* Primary Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
