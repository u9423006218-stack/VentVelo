import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RENTAL_BIKES } from '../../data/mockData';
import { BikeRentalItem } from '../../types';
import {
  Calendar,
  Check,
  Clock,
  MapPin,
  ShieldCheck,
  Truck,
  X,
  Users,
  Award,
  ArrowRight,
} from 'lucide-react';

type RentalDurationKey = '3h' | 'day' | 'weekend' | 'week';
type RentalDeliveryZone = 'rindas44' | 'ventspils_van' | 'usma_van' | 'talsi_van';

export const BikeRentalShowcase: React.FC = () => {
  const { formatPrice, openCheckout, addToCart } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('Visi');
  const [selectedBike, setSelectedBike] = useState<BikeRentalItem | null>(null);

  // Interactive Rental Booking State
  const [durationType, setDurationType] = useState<RentalDurationKey>('day');
  const [daysCount, setDaysCount] = useState<number>(1);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [deliveryZone, setDeliveryZone] = useState<RentalDeliveryZone>('rindas44');
  const [addChildSeat, setAddChildSeat] = useState<boolean>(false);

  const categories = ['Visi', 'Kalnu (MTB)', 'Gravel', 'Pilsētas', 'Bērnu', 'E-Velosipēdi'];

  const filteredRentalBikes =
    selectedCategory === 'Visi'
      ? RENTAL_BIKES
      : RENTAL_BIKES.filter((b) => b.category === selectedCategory);

  const handleOpenBooking = (bike: BikeRentalItem) => {
    setSelectedBike(bike);
    setSelectedSize(bike.sizesAvailable[0] || 'M');
    setDurationType('day');
    setDaysCount(1);
    setQuantity(1);
    setDeliveryZone('rindas44');
    setAddChildSeat(false);
  };

  const getDeliveryFeeEur = (zone: RentalDeliveryZone) => {
    if (zone === 'ventspils_van') return 8;
    if (zone === 'usma_van') return 18;
    if (zone === 'talsi_van') return 22;
    return 0;
  };

  const getDeliveryLabel = (zone: RentalDeliveryZone) => {
    if (zone === 'ventspils_van') return 'Piegāde ar busiņu Ventspilī (+€8)';
    if (zone === 'usma_van') return 'Piegāde ar busiņu uz Usmas ezeru (+€18)';
    if (zone === 'talsi_van') return 'Piegāde ar busiņu Talsu novadā (+€22)';
    return 'Saņemšana Rindas ielā 44, Ventspilī (€0)';
  };

  const getUnitRentalPriceEur = (bike: BikeRentalItem) => {
    if (durationType === '3h') return bike.price3hEur;
    if (durationType === 'weekend') return bike.priceWeekendEur;
    if (durationType === 'week') return bike.priceWeekEur;
    return bike.priceDayEur * daysCount;
  };

  const getDurationLabel = () => {
    if (durationType === '3h') return '3 stundas';
    if (durationType === 'weekend') return 'Nedēļas nogale (Piektd.–Pirmd.)';
    if (durationType === 'week') return '1 nedēļa (7 dienas)';
    return `${daysCount} ${daysCount === 1 ? 'diena (24h)' : 'dienas'}`;
  };

  const calculateTotalEur = (bike: BikeRentalItem) => {
    const unitRate = getUnitRentalPriceEur(bike);
    const extrasEur = addChildSeat ? 5 : 0;
    const deliveryEur = getDeliveryFeeEur(deliveryZone);
    return Math.round(unitRate * quantity + extrasEur + deliveryEur);
  };

  const handleReserveCheckout = (bike: BikeRentalItem) => {
    const totalEur = calculateTotalEur(bike);
    const extrasText = addChildSeat ? ' · + Bērnu sēdeklītis' : '';
    const title = `Noma: ${bike.name} (${quantity} gab., ${selectedSize}) · ${getDurationLabel()} · ${startDate}${extrasText}`;

    openCheckout({
      type: 'rental',
      data: {
        ...bike,
        selectedSize,
        quantity,
        durationLabel: getDurationLabel(),
        startDate,
        deliveryLabel: getDeliveryLabel(deliveryZone),
      },
      totalEur,
      title,
    });
    setSelectedBike(null);
  };

  const handleAddRentalToCart = (bike: BikeRentalItem) => {
    const totalEur = calculateTotalEur(bike);
    addToCart({
      type: 'rental',
      productId: `${bike.id}_${durationType}_${daysCount}_${deliveryZone}_${startDate}`,
      name: `Noma: ${bike.name} (${quantity} gab.)`,
      priceEur: totalEur,
      quantity: 1,
      image: bike.image,
      details: `${getDurationLabel()} no ${startDate} · ${selectedSize} · ${getDeliveryLabel(deliveryZone)}`,
    });
    setSelectedBike(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Header Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-8 sm:p-10 border border-stone-800 space-y-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="text-xs font-semibold text-amber-400 tracking-wide">
              VentVelo Noma · Rindas iela 44, Ventspils · 18 gadu pieredze
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-heading">
              Velosipēdu noma Ventspilī, Usmā un Talsos
            </h1>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Izbaudi Būšnieku ezera takas, Ventspils veloceliņus vai Usmas ezera apkārtni ar koptiem un tehniski pārbaudītiem velosipēdiem. Pieejami kalnu, gravel, pilsētas, bērnu un elektrovelosipēdi.
            </p>
          </div>

          <div className="bg-stone-800/80 border border-stone-700/80 rounded-xl p-5 text-xs space-y-2 shrink-0 lg:w-80">
            <div className="font-bold text-stone-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Ķivere un slēdzene bez maksas</span>
            </div>
            <p className="text-stone-300 leading-relaxed">
              Katrai nomai bez papildu samaksas dodam līdzi pielāgotu aizsargķiveri, slēdzeni un lukturus. Vari rezervēt arī piegādi ar busiņu uz viesu namu vai kempingu!
            </p>
          </div>
        </div>

        {/* 3 Rental Info Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-stone-800 text-xs">
          <div className="space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Elastīgi nomas termiņi no €5</span>
            </div>
            <p className="text-stone-400 leading-relaxed">
              Izvēlies 3 stundu izbraucienu, pilnu diennakti, nedēļas nogali vai veselu atvaļinājuma nedēļu.
            </p>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Piegāde ar busiņu uz galamērķi</span>
            </div>
            <p className="text-stone-400 leading-relaxed">
              Izņem velosipēdu Rindas ielā 44 (€0) vai pasūti piegādi Ventspilī (+€8), pie Usmas ezera (+€18) vai Talsos (+€22).
            </p>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Ģimenēm un draugu grupām</span>
            </div>
            <p className="text-stone-400 leading-relaxed">
              Noliktavā vairāk nekā 30 nomas velosipēdi dažādos augumos, tostarp bērnu modeļi un bērnu sēdeklīši.
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter Strip */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <span className="text-xs text-stone-500 font-medium tabular-nums">
          Pieejamas {filteredRentalBikes.length} nomas kategorijas
        </span>
      </div>

      {/* Rental Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRentalBikes.map((bike) => (
          <div
            key={bike.id}
            className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div
                onClick={() => handleOpenBooking(bike)}
                className="relative aspect-4/3 bg-stone-100 overflow-hidden cursor-pointer"
              >
                <img
                  src={bike.image}
                  alt={bike.name}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
                <div className="absolute bottom-3 left-3 bg-stone-950/85 text-amber-400 text-[11px] font-bold px-2.5 py-1 rounded border border-stone-700">
                  {bike.category}
                </div>
                <div className="absolute bottom-3 right-3 bg-white/95 text-stone-900 text-[11px] font-semibold px-2.5 py-1 rounded shadow-xs tabular-nums">
                  Brīvi {bike.availableCount} gab.
                </div>
              </div>

              <div className="p-6 space-y-3">
                <h3
                  onClick={() => handleOpenBooking(bike)}
                  className="text-lg font-bold text-stone-900 leading-snug cursor-pointer hover:text-amber-600 transition-colors"
                >
                  {bike.name}
                </h3>
                <p className="text-xs text-stone-500 font-medium">{bike.specs}</p>
                <p className="text-xs text-stone-600 leading-relaxed">{bike.description}</p>
              </div>
            </div>

            <div className="p-6 pt-0 space-y-4">
              {/* Pricing Matrix */}
              <div className="grid grid-cols-4 gap-1.5 text-center bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs tabular-nums">
                <div>
                  <span className="block text-[10px] text-stone-500">3 st.</span>
                  <span className="font-bold text-stone-900 font-mono">{formatPrice(bike.price3hEur)}</span>
                </div>
                <div className="border-l border-stone-200">
                  <span className="block text-[10px] text-stone-500">1 diena</span>
                  <span className="font-bold text-amber-700 font-mono">{formatPrice(bike.priceDayEur)}</span>
                </div>
                <div className="border-l border-stone-200">
                  <span className="block text-[10px] text-stone-500">Ned. nog.</span>
                  <span className="font-bold text-stone-900 font-mono">{formatPrice(bike.priceWeekendEur)}</span>
                </div>
                <div className="border-l border-stone-200">
                  <span className="block text-[10px] text-stone-500">Nedēļa</span>
                  <span className="font-bold text-stone-900 font-mono">{formatPrice(bike.priceWeekEur)}</span>
                </div>
              </div>

              <div className="text-[11px] text-stone-500 flex items-center justify-between">
                <span>Izmēri: {bike.sizesAvailable.map((s) => s.split(' ')[0]).join(' · ')}</span>
                <span>Ķivere un slēdzene €0</span>
              </div>

              <button
                onClick={() => handleOpenBooking(bike)}
                className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Rezervēt nomu</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Rental Booking Modal */}
      {selectedBike && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-base text-white font-heading">Velosipēda nomas rezervācija</h3>
              </div>
              <button
                onClick={() => setSelectedBike(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="flex items-center gap-4 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <img
                  src={selectedBike.image}
                  alt={selectedBike.name}
                  className="w-20 h-16 object-cover rounded-lg border border-stone-200 shrink-0"
                />
                <div className="flex-1">
                  <div className="text-[11px] font-semibold text-amber-700">{selectedBike.category}</div>
                  <div className="font-bold text-stone-900 text-sm">{selectedBike.name}</div>
                  <div className="text-stone-500 mt-0.5">{selectedBike.specs}</div>
                </div>
              </div>

              {/* Duration selector */}
              <div>
                <label className="block font-semibold text-stone-800 mb-2">Izvēlies nomas ilgumu:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: '3h' as const, label: '3 stundas', price: selectedBike.price3hEur },
                    { key: 'day' as const, label: 'Dienas noma', price: selectedBike.priceDayEur },
                    { key: 'weekend' as const, label: 'Nedēļas nogale', price: selectedBike.priceWeekendEur },
                    { key: 'week' as const, label: '1 nedēļa (7 d.)', price: selectedBike.priceWeekEur },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setDurationType(opt.key)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                        durationType === opt.key
                          ? 'border-amber-500 bg-amber-50 text-stone-950 font-semibold shadow-xs'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div className="font-bold">{opt.label}</div>
                      <div className="font-mono text-amber-700 font-bold mt-0.5 tabular-nums">
                        {formatPrice(opt.price)}
                      </div>
                    </button>
                  ))}
                </div>

                {durationType === 'day' && (
                  <div className="flex items-center gap-3 mt-3 bg-stone-50 p-3 rounded-lg border border-stone-200">
                    <span className="font-medium text-stone-700">Dienu skaits:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDaysCount((d) => Math.max(1, d - 1))}
                        className="w-7 h-7 rounded border border-stone-300 bg-white font-bold cursor-pointer hover:bg-stone-100"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold w-8 text-center">{daysCount}</span>
                      <button
                        type="button"
                        onClick={() => setDaysCount((d) => Math.min(14, d + 1))}
                        className="w-7 h-7 rounded border border-stone-300 bg-white font-bold cursor-pointer hover:bg-stone-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Date, Size & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1.5">Sākuma datums</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1.5">Rāmja izmērs</label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white text-xs"
                  >
                    {selectedBike.sizesAvailable.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1.5">Velosipēdu skaits</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white text-xs"
                  >
                    {Array.from({ length: selectedBike.availableCount }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'velosipēds' : 'velosipēdi'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pickup / Delivery Location */}
              <div>
                <label className="block font-semibold text-stone-800 mb-2">Saņemšanas vai piegādes vieta:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: 'rindas44' as const, title: 'Rindas iela 44, Ventspils', fee: 0 },
                    { key: 'ventspils_van' as const, title: 'Piegāde ar busiņu Ventspilī', fee: 8 },
                    { key: 'usma_van' as const, title: 'Piegāde uz Usmas ezeru', fee: 18 },
                    { key: 'talsi_van' as const, title: 'Piegāde uz Talsu novadu', fee: 22 },
                  ].map((loc) => (
                    <button
                      key={loc.key}
                      type="button"
                      onClick={() => setDeliveryZone(loc.key)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer ${
                        deliveryZone === loc.key
                          ? 'border-stone-900 bg-stone-100 font-semibold text-stone-900'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{loc.title}</span>
                      </span>
                      <span className="font-mono font-bold">
                        {loc.fee === 0 ? '€0' : `+${formatPrice(loc.fee)}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Extra child seat & free gear summary */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2.5">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-stone-800">
                    Pievienot bērnu sēdeklīti uz bagāžnieka (līdz 22 kg)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-stone-900">+{formatPrice(5)}</span>
                    <input
                      type="checkbox"
                      checked={addChildSeat}
                      onChange={(e) => setAddChildSeat(e.target.checked)}
                      className="w-4 h-4 accent-amber-600 cursor-pointer"
                    />
                  </div>
                </label>

                <div className="pt-2 border-t border-stone-200 flex flex-wrap gap-3 text-[11px] text-emerald-700 font-medium">
                  {selectedBike.includedGear.map((g, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              {/* Deposit note */}
              <div className="flex items-center gap-2 text-[11px] text-stone-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Drošības depozīts uz vietas vai kartē: {formatPrice(selectedBike.depositEur)} par velosipēdu (tiek atgriezts uzreiz pēc nodošanas).
                </span>
              </div>
            </div>

            <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div>
                <span className="text-[11px] text-stone-500 block">Kopā par nomu:</span>
                <span className="text-2xl font-bold font-mono text-stone-950 tabular-nums">
                  {formatPrice(calculateTotalEur(selectedBike))}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleAddRentalToCart(selectedBike)}
                  className="px-4 py-2.5 text-xs font-semibold text-stone-800 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg cursor-pointer"
                >
                  Ielikt grozā
                </button>
                <button
                  type="button"
                  onClick={() => handleReserveCheckout(selectedBike)}
                  className="px-5 py-2.5 text-xs font-bold text-stone-950 bg-amber-500 hover:bg-amber-400 rounded-lg cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <span>Rezervēt un apmaksāt</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
