import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Currency } from '../../types';
import { 
  Wrench, 
  ShoppingBag, 
  Mail, 
  Menu, 
  X, 
  ShieldCheck, 
  Truck
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    currency, 
    setCurrency, 
    cartCount, 
    setIsCartOpen, 
    unreadEmailCount, 
    setIsEmailDrawerOpen,
    openBookingWithService,
    setIsSecurityModalOpen
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currencies: Currency[] = ['EUR', 'USD', 'GBP', 'PLN', 'SEK'];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Top Announcement Bar */}
      <div className="bg-stone-900 text-stone-200 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <Truck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-semibold text-amber-300">Izbraukuma servisa buss:</span>
            <span className="text-stone-300">Savācam un atvedam velosipēdu Ventspilī, Usmā un Talsos tieši pie durvīm</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 shrink-0 text-stone-400">
            <span>Darbnīca: Rindas iela 44, Ventspils</span>
            <button 
              onClick={() => setIsSecurityModalOpen(true)}
              className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Droši norēķini un GDPR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Top Bar Contract: 3 zones separated by gap-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => { setActiveTab('services'); }}
          className="text-2xl font-bold tracking-tight text-stone-950 font-heading whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <span className="text-amber-500">Vent</span>Velo
        </button>

        {/* Zone 2: Navigation Links (Single-line, unboxed, authentic Latvian) */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-stone-600">
          <button
            onClick={() => setActiveTab('services')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'services' 
                ? 'text-stone-950 font-semibold border-b-2 border-stone-950' 
                : 'hover:text-stone-950'
            }`}
          >
            Apkopes un remonts
          </button>

          <button
            onClick={() => setActiveTab('bikes')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'bikes' 
                ? 'text-stone-950 font-semibold border-b-2 border-stone-950' 
                : 'hover:text-stone-950'
            }`}
          >
            Velosipēdi pārdošanā
          </button>

          <button
            onClick={() => setActiveTab('accessories')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'accessories' 
                ? 'text-stone-950 font-semibold border-b-2 border-stone-950' 
                : 'hover:text-stone-950'
            }`}
          >
            Aksesuāri un detaļas
          </button>

          <button
            onClick={() => setActiveTab('van_fleet')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'van_fleet' 
                ? 'text-stone-950 font-semibold border-b-2 border-stone-950' 
                : 'hover:text-stone-950'
            }`}
          >
            Servisa busa maršruti
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'dashboard' 
                ? 'text-stone-950 font-semibold border-b-2 border-stone-950' 
                : 'hover:text-stone-950'
            }`}
          >
            Mana garāža un statuss
          </button>
        </nav>

        {/* Zone 3: Actions (Currency selector, email inbox, cart, primary CTA) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Multi-Currency Selector */}
          <div className="relative">
            <label htmlFor="currency-select" className="sr-only">Valūta</label>
            <select
              id="currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              aria-label="Izvēlēties valūtu"
              className="text-xs font-semibold bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-md px-2.5 py-1.5 text-stone-800 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-stone-900"
            >
              {currencies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Email Notifications Drawer Trigger */}
          <button
            onClick={() => setIsEmailDrawerOpen(true)}
            className="relative p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            title="E-pastu un paziņojumu žurnāls"
            aria-label="E-pastu un paziņojumu žurnāls"
          >
            <Mail className="w-5 h-5" />
            {unreadEmailCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            title="Pirkumu grozs"
            aria-label="Pirkumu grozs"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-stone-900 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Primary CTA Button */}
          <button
            onClick={() => openBookingWithService()}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Pieteikt servisu</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-stone-700 hover:text-stone-950 rounded-lg cursor-pointer"
            aria-label="Atvērt izvēlni"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2 text-sm font-medium text-stone-800">
            <button
              onClick={() => { setActiveTab('services'); setMobileMenuOpen(false); }}
              className={`text-left py-2 px-3 rounded-md transition-colors ${activeTab === 'services' ? 'bg-stone-100 font-semibold' : 'hover:bg-stone-50'}`}
            >
              Apkopes un remonts
            </button>
            <button
              onClick={() => { setActiveTab('bikes'); setMobileMenuOpen(false); }}
              className={`text-left py-2 px-3 rounded-md transition-colors ${activeTab === 'bikes' ? 'bg-stone-100 font-semibold' : 'hover:bg-stone-50'}`}
            >
              Velosipēdi pārdošanā
            </button>
            <button
              onClick={() => { setActiveTab('accessories'); setMobileMenuOpen(false); }}
              className={`text-left py-2 px-3 rounded-md transition-colors ${activeTab === 'accessories' ? 'bg-stone-100 font-semibold' : 'hover:bg-stone-50'}`}
            >
              Aksesuāri un detaļas
            </button>
            <button
              onClick={() => { setActiveTab('van_fleet'); setMobileMenuOpen(false); }}
              className={`text-left py-2 px-3 rounded-md transition-colors ${activeTab === 'van_fleet' ? 'bg-stone-100 font-semibold' : 'hover:bg-stone-50'}`}
            >
              Servisa busa maršruti (Ventspils, Usma, Talsi)
            </button>
            <button
              onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              className={`text-left py-2 px-3 rounded-md transition-colors ${activeTab === 'dashboard' ? 'bg-stone-100 font-semibold' : 'hover:bg-stone-50'}`}
            >
              Mana garāža un remonta statuss
            </button>
          </div>

          <div className="pt-2 border-t border-stone-100">
            <button
              onClick={() => { openBookingWithService(); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors"
            >
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Pieteikt velosipēda servisu</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
