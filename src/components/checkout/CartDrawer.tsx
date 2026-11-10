import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  Lock 
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    removeFromCart, 
    updateQuantity, 
    cartTotalEur, 
    formatPrice, 
    openCheckout 
  } = useApp();

  if (!isCartOpen) return null;

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    openCheckout({
      type: 'cart',
      totalEur: cartTotalEur,
      title: `VentVelo pasūtījums (${cart.length} prec${cart.length > 1 ? 'es' : 'e'})`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-stone-200">
        
        {/* Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-white font-heading">Tavs pirkumu grozs ({cart.length})</h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="text-sm font-semibold text-stone-700">Tavs grozs pašlaik ir tukšs</p>
              <p className="text-xs text-stone-500">
                Apskati mūsu velosipēdus vai braukšanas aksesuāru klāstu.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {cart.map((item) => (
                <div key={item.id} className="py-3 flex items-start gap-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-lg object-cover bg-stone-100 shrink-0 border border-stone-200"
                    />
                  )}
                  
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-stone-900 text-xs leading-snug">
                      {item.name}
                    </h4>
                    {item.details && (
                      <p className="text-[11px] text-stone-500">{item.details}</p>
                    )}
                    <div className="font-mono font-bold text-stone-950 text-xs tabular-nums">
                      {formatPrice(item.priceEur)}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-stone-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                      aria-label="Izņemt preci"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center border border-stone-200 rounded-md bg-stone-50">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="px-1.5 py-0.5 text-stone-600 hover:text-stone-950 cursor-pointer"
                        aria-label="Samazināt daudzumu"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-mono font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="px-1.5 py-0.5 text-stone-600 hover:text-stone-950 cursor-pointer"
                        aria-label="Palielināt daudzumu"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer & Checkout */}
        {cart.length > 0 && (
          <div className="p-6 bg-stone-50 border-t border-stone-200 space-y-4 shrink-0">
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Starpsumma:</span>
                <span className="font-mono font-bold text-stone-900 tabular-nums">
                  {formatPrice(cartTotalEur)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Servisa busa piegāde:</span>
                <span className="font-semibold text-emerald-700">
                  {cartTotalEur >= 50 ? 'BEZMAKSAS (slieksnis sasniegts)' : 'Tiks precizēta pie noformēšanas'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
              <span className="text-sm font-bold text-stone-950 font-heading">Kopā apmaksai:</span>
              <span className="text-xl font-bold font-mono text-stone-950 tabular-nums">
                {formatPrice(cartTotalEur)}
              </span>
            </div>

            <button
              onClick={handleProceedCheckout}
              className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md font-heading"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Pāriet uz drošu apmaksu</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
