import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AccessoryProduct } from '../../types';
import { 
  ShoppingBag, 
  Check, 
  AlertTriangle, 
  Star, 
  Plus, 
  Minus, 
  Sparkles, 
  Tag, 
  Filter 
} from 'lucide-react';

export const AccessoriesInventory: React.FC = () => {
  const { accessories, formatPrice, addToCart, setIsCartOpen } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('Visi');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const categories = [
    { id: 'Visi', label: 'Visas preces' },
    { id: 'Maintenance & Lubes', label: 'Kopšana un eļļas' },
    { id: 'Pumps & Tools', label: 'Pumpji un instrumenti' },
    { id: 'Lights & Electronics', label: 'Lukturi un elektronika' },
    { id: 'Locks & Security', label: 'Slēdzenes un drošība' },
    { id: 'Helmets & Apparel', label: 'Ķiveres un aprīkojums' },
    { id: 'Tires & Tubes', label: 'Riepas un kameras' },
  ];

  const filteredItems = selectedCategory === 'Visi'
    ? accessories
    : accessories.filter(a => a.category === selectedCategory);

  const getQty = (id: string) => quantities[id] || 1;

  const handleQtyChange = (id: string, delta: number, maxStock: number) => {
    setQuantities(prev => {
      const current = prev[id] || 1;
      const next = Math.max(1, Math.min(maxStock, current + delta));
      return { ...prev, [id]: next };
    });
  };

  const handleAdd = (item: AccessoryProduct) => {
    const qty = getQty(item.id);
    addToCart({
      type: 'accessory',
      productId: item.id,
      name: item.name,
      priceEur: item.priceEur,
      quantity: qty,
      image: item.image,
      details: `Artikuls: ${item.sku} · ${item.brand}`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      
      {/* Accessories Hero Header */}
      <div className="bg-stone-900 text-white rounded-2xl p-8 sm:p-10 border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-3 py-1 rounded-md">
            <Tag className="w-3.5 h-3.5" />
            <span>Reāls atlikums Ventspils noliktavā un darbnīcā</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-heading">
            Velodetaļas un kvalitatīvs aprīkojums
          </h1>
          <p className="text-stone-300 text-sm leading-relaxed">
            Pārbaudītas ķēžu eļļas un vaski, augsta spiediena rokas pumpji, jaudīgi priekšējie lukturi un vācu drošības slēdzenes. Visas preces atrodas mūsu Ventspils darbnīcas plauktos un ir pieejamas saņemšanai uzreiz vai piegādei ar servisa busiņu.
          </p>
        </div>

        <div className="bg-stone-800/80 border border-stone-700/80 rounded-xl p-4 text-xs space-y-2 shrink-0 md:w-72">
          <div className="font-semibold text-stone-100 flex items-center justify-between">
            <span>Noliktavas statuss</span>
            <span className="text-emerald-400 text-[11px] font-mono">Tiešsaistes uzskaite</span>
          </div>
          <p className="text-stone-400 leading-relaxed">
            Zema atlikuma brīdinājumi parādās automātiski. Rezervācija notiek uzreiz pēc groza apstiprināšanas.
          </p>
        </div>
      </div>

      {/* Categories Filter Tabs (Zero-pill, functional buttons) */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4 flex-wrap gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-stone-500 font-medium">
          Katalogā {filteredItems.length} preces
        </div>
      </div>

      {/* Inventory Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => {
          const isLowStock = item.stockCount <= item.lowStockThreshold && item.stockCount > 0;
          const isOutOfStock = item.stockCount === 0;
          const qty = getQty(item.id);

          return (
            <div
              key={item.id}
              className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Product Image */}
              <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                
                {/* Real-time stock status badge */}
                <div className="absolute top-2.5 left-2.5">
                  {isOutOfStock ? (
                    <span className="bg-red-950/90 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm border border-red-800">
                      Izpārdots
                    </span>
                  ) : isLowStock ? (
                    <span className="bg-amber-950/90 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm border border-amber-800 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      Palikuši tikai {item.stockCount} gab.!
                    </span>
                  ) : (
                    <span className="bg-stone-950/85 text-emerald-300 text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur-sm border border-stone-700">
                      Noliktavā ({item.stockCount} gab.)
                    </span>
                  )}
                </div>

                <div className="absolute bottom-2.5 right-2.5 bg-stone-950/80 text-stone-300 text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-sm">
                  {item.sku}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span className="font-semibold text-stone-700">{item.brand}</span>
                    <span className="flex items-center gap-0.5 text-amber-600 font-medium">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {item.rating} ({item.reviewsCount})
                    </span>
                  </div>

                  <h3 className="font-bold text-stone-900 text-sm leading-snug line-clamp-2">
                    {item.name}
                  </h3>

                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div className="text-xl font-bold text-stone-950 font-mono tabular-nums">
                      {formatPrice(item.priceEur)}
                    </div>
                    <span className="text-[11px] text-stone-500">
                      PVN 21% iekļauts
                    </span>
                  </div>

                  {/* Quantity Stepper & Add to Cart */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item.id, -1, item.stockCount)}
                        disabled={qty <= 1 || isOutOfStock}
                        className="px-2 py-1.5 text-stone-600 hover:text-stone-950 disabled:opacity-40 cursor-pointer"
                        aria-label="Samazināt daudzumu"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-mono font-semibold text-stone-800">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item.id, 1, item.stockCount)}
                        disabled={qty >= item.stockCount || isOutOfStock}
                        className="px-2 py-1.5 text-stone-600 hover:text-stone-950 disabled:opacity-40 cursor-pointer"
                        aria-label="Palielināt daudzumu"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAdd(item)}
                      disabled={isOutOfStock}
                      className="flex-1 py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isOutOfStock ? 'Izpārdots' : 'Ielikt grozā'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
