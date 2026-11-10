import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BIKES_FOR_SALE } from '../../data/mockData';
import { BikeProduct } from '../../types';
import { 
  ShieldCheck, 
  Check, 
  Sparkles, 
  Filter, 
  X, 
  Truck, 
  Wrench, 
  ArrowRight,
  Info
} from 'lucide-react';

export const BikesShowcase: React.FC = () => {
  const { formatPrice, openCheckout, addToCart } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('Visi');
  const [selectedBike, setSelectedBike] = useState<BikeProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');

  const categories = [
    { id: 'Visi', label: 'Visi velosipēdi' },
    { id: 'Gravel & Road', label: 'Grants un šosejas' },
    { id: 'City & Commuter', label: 'Pilsētas un tūrisma' },
    { id: 'E-Bikes', label: 'Elektrovelosipēdi' },
    { id: 'Pre-Owned Certified', label: 'Pārbaudīti lietotie' },
  ];

  const filteredBikes = selectedCategory === 'Visi'
    ? BIKES_FOR_SALE
    : BIKES_FOR_SALE.filter(b => b.category === selectedCategory);

  const handleOpenBikeDetails = (bike: BikeProduct) => {
    setSelectedBike(bike);
    setSelectedSize(bike.sizesAvailable[0] || 'M');
  };

  const handleDirectBuy = (bike: BikeProduct) => {
    openCheckout({
      type: 'single_bike',
      data: { ...bike, selectedSize: selectedSize || bike.sizesAvailable[0] },
      totalEur: bike.priceEur,
      title: `${bike.name} (Izmērs: ${selectedSize || bike.sizesAvailable[0]})`,
    });
    setSelectedBike(null);
  };

  const handleAddToCart = (bike: BikeProduct) => {
    addToCart({
      type: 'bike',
      productId: bike.id,
      name: `${bike.name} – Izmērs: ${selectedSize || bike.sizesAvailable[0]}`,
      priceEur: bike.priceEur,
      quantity: 1,
      image: bike.image,
      details: `${bike.condition === 'Brand New' ? 'Jauns' : 'Pārlasīts'} · ${bike.guaranteeMonths} mēn. garantija`,
    });
    setSelectedBike(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      
      {/* Header Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-8 sm:p-10 border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-3 py-1 rounded-md">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>12 – 24 mēnešu oficiālā darbnīcas garantija visiem velosipēdiem</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-heading">
            VentVelo velosipēdu salons un noliktava
          </h1>
          <p className="text-stone-300 text-sm leading-relaxed">
            Katrs jauns un atjaunots velosipēds pirms pārdošanas tiek pilnībā salikts, noregulēts un pārbaudīts uz darbnīcas statīviem. Saņem uz vietas darbnīcā vai ar piegādi līdz namdurvīm ar mūsu servisa busiņu Kurzemē.
          </p>
        </div>

        <div className="bg-stone-800/80 border border-stone-700/80 rounded-xl p-4 text-xs space-y-2 shrink-0 md:w-72">
          <div className="font-semibold text-stone-100 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-amber-400" />
            <span>Reģionālā piegāde iekļauta</span>
          </div>
          <p className="text-stone-400 leading-relaxed">
            Atvedam velosipēdu 100% gatavu braukšanai līdz namdurvīm Ventspilī, Usmā vai Talsos.
          </p>
          <div className="text-amber-400 font-semibold pt-1">
            + Bezmaksas 1. apkope pēc 300 km
          </div>
        </div>
      </div>

      {/* Category Filter Tabs (Zero-pill, functional buttons) */}
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
          Pieejami {filteredBikes.length} modeļi noliktavā
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBikes.map((bike) => (
          <div
            key={bike.id}
            className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            {/* Image container */}
            <div className="relative aspect-4/3 bg-stone-100 overflow-hidden cursor-pointer" onClick={() => handleOpenBikeDetails(bike)}>
              <img
                src={bike.image}
                alt={bike.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
              {/* Guarantee badge */}
              <div className="absolute top-3 left-3 bg-stone-950/85 backdrop-blur-md text-stone-100 text-[11px] font-medium px-2.5 py-1 rounded border border-stone-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{bike.guaranteeMonths} mēn. garantija</span>
              </div>

              {bike.originalPriceEur && (
                <div className="absolute top-3 right-3 bg-amber-500 text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                  Ietaupi {formatPrice(bike.originalPriceEur - bike.priceEur)}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>{bike.category}</span>
                  <span className="font-semibold text-stone-700">
                    {bike.condition === 'Brand New' ? 'Pilnīgi jauns' : 'Pārlasīts ar garantiju'}
                  </span>
                </div>

                <h3 
                  onClick={() => handleOpenBikeDetails(bike)}
                  className="font-bold text-stone-900 text-lg leading-snug cursor-pointer hover:text-amber-600 transition-colors"
                >
                  {bike.name}
                </h3>

                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {bike.groupset} · {bike.frameMaterial}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] text-stone-500">
                  <span>Izmēri:</span>
                  {bike.sizesAvailable.map((s, idx) => (
                    <span key={idx} className="text-stone-700 font-medium">
                      {s}{idx < bike.sizesAvailable.length - 1 ? ' · ' : ''}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div className="space-y-0.5">
                    <div className="text-2xl font-bold text-stone-950 font-mono tabular-nums">
                      {formatPrice(bike.priceEur)}
                    </div>
                    {bike.originalPriceEur && (
                      <div className="text-xs text-stone-400 line-through font-mono">
                        {formatPrice(bike.originalPriceEur)}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Noliktavā ({bike.inStockCount} gab.)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleOpenBikeDetails(bike)}
                    className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
                  >
                    Specifikācija un garantija
                  </button>
                  <button
                    onClick={() => handleDirectBuy(bike)}
                    className="py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
                  >
                    Pirkt / Rezervēt
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Bike Modal */}
      {selectedBike && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-mono text-xs">{selectedBike.category}</span>
                <span className="text-stone-500">·</span>
                <span className="text-xs text-stone-300">
                  {selectedBike.condition === 'Brand New' ? 'Pilnīgi jauns' : 'Darbnīcā restaurēts un pārbaudīts'}
                </span>
              </div>
              <button 
                onClick={() => setSelectedBike(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Image */}
                <div className="md:col-span-6 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 aspect-4/3 relative">
                  <img
                    src={selectedBike.image}
                    alt={selectedBike.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-stone-950/90 text-white text-xs px-2.5 py-1 rounded backdrop-blur-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{selectedBike.guaranteeMonths} mēnešu VentVelo garantija</span>
                  </div>
                </div>

                {/* Main Information */}
                <div className="md:col-span-6 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-stone-900 font-heading leading-tight">{selectedBike.name}</h2>
                    <div className="mt-2 text-2xl font-bold text-stone-950 font-mono tabular-nums">
                      {formatPrice(selectedBike.priceEur)}
                    </div>
                  </div>

                  {/* Size Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">Izvēlies rāmja izmēru:</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedBike.sizesAvailable.map(size => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer transition-colors ${
                            selectedSize === size
                              ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                              : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Workshop Inspection Sheet */}
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2">
                    <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-amber-500" />
                      <span>Pārbaudes lapa (24 punkti pirms nodošanas sekmīgi):</span>
                    </div>
                    <ul className="text-xs text-stone-600 space-y-1">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Pārslēdzēja auss iztaisnota ar lāzera mērinstrumentu</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Hidrauliskās bremzes atgaisotas un kluči pieslīpēti</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Spieķu nospriegojums kalibrēts ar tensiometru</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-3 pt-2 border-t border-stone-200">
                <h4 className="font-bold text-stone-900 text-sm font-heading">Tehniskā specifikācija</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-stone-50 rounded-lg">
                    <span className="text-stone-500 block text-[11px]">Ātrumu sistēma</span>
                    <span className="font-semibold text-stone-800">{selectedBike.groupset}</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-lg">
                    <span className="text-stone-500 block text-[11px]">Bremzes</span>
                    <span className="font-semibold text-stone-800">{selectedBike.brakes}</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-lg">
                    <span className="text-stone-500 block text-[11px]">Rāmja materiāls</span>
                    <span className="font-semibold text-stone-800">{selectedBike.frameMaterial}</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-lg">
                    <span className="text-stone-500 block text-[11px]">Svars</span>
                    <span className="font-semibold text-stone-800">{selectedBike.specs.weightKg} kg</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-lg">
                    <span className="text-stone-500 block text-[11px]">Ratu un riepu izmērs</span>
                    <span className="font-semibold text-stone-800">{selectedBike.specs.wheelSize}</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-lg">
                    <span className="text-stone-500 block text-[11px]">Krāsa</span>
                    <span className="font-semibold text-stone-800">{selectedBike.specs.color}</span>
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-2">
                <h4 className="font-bold text-stone-900 text-sm font-heading">Galvenās priekšrocības</h4>
                <ul className="space-y-1.5 text-xs text-stone-600">
                  {selectedBike.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex items-center justify-between shrink-0">
              <button
                onClick={() => setSelectedBike(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Aizvērt
              </button>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleAddToCart(selectedBike)}
                  className="px-4 py-2.5 text-xs font-semibold text-stone-800 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg transition-colors cursor-pointer"
                >
                  Ielikt grozā
                </button>
                <button
                  onClick={() => handleDirectBuy(selectedBike)}
                  className="px-6 py-2.5 text-xs font-semibold text-stone-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors cursor-pointer shadow-md font-heading"
                >
                  Pāriet uz drošu apmaksu ({formatPrice(selectedBike.priceEur)})
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
