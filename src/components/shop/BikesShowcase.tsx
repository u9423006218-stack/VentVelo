import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { BIKES_FOR_SALE } from '../../data/mockData';
import { BikeProduct } from '../../types';
import {
  ShieldCheck,
  Check,
  X,
  Truck,
  Wrench,
  ChevronDown,
  RotateCcw,
  Package,
  RefreshCw,
  Award,
  CreditCard,
} from 'lucide-react';
import catMtbImg from '../../assets/images/cat_mtb_bike_1795451175318.jpg';
import catGravelImg from '../../assets/images/cat_gravel_bike_1795451176389.jpg';
import catCityImg from '../../assets/images/cat_city_bike_1795451176543.jpg';
import catKidsImg from '../../assets/images/cat_kids_bike_1795451176116.jpg';

type FilterDropdownKey =
  | 'category'
  | 'size'
  | 'availability'
  | 'brand'
  | 'suspension'
  | 'material'
  | 'gears'
  | 'wheelSize'
  | 'brakes'
  | 'price';

export const BikesShowcase: React.FC = () => {
  const { formatPrice, openCheckout, addToCart } = useApp();

  // Filter states matching veloprofs.lv style adapted for VentVelo
  const [selectedCategory, setSelectedCategory] = useState<string>('Visi');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('Visi');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('Visi');
  const [selectedBrand, setSelectedBrand] = useState<string>('Visi');
  const [selectedSuspension, setSelectedSuspension] = useState<string>('Visi');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('Visi');
  const [selectedGears, setSelectedGears] = useState<string>('Visi');
  const [selectedWheelSize, setSelectedWheelSize] = useState<string>('Visi');
  const [selectedBrakeType, setSelectedBrakeType] = useState<string>('Visi');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('Visi');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'name'>('price_asc');

  const [openDropdown, setOpenDropdown] = useState<FilterDropdownKey | null>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);
  const catalogGridRef = useRef<HTMLDivElement>(null);

  // Modal & purchase option states
  const [selectedBike, setSelectedBike] = useState<BikeProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [assemblyOption, setAssemblyOption] = useState<'assembled' | 'box'>('assembled');
  const [useTradeIn, setUseTradeIn] = useState<boolean>(false);
  const [tradeInModel, setTradeInModel] = useState<string>('');
  const [tradeInEstimateEur, setTradeInEstimateEur] = useState<number>(100);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterBarRef.current && !filterBarRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mainCategories = [
    {
      id: 'KALNU VELOSIPĒDI (MTB)',
      title: 'KALNU VELOSIPĒDI (MTB)',
      subtitle: 'DRAG Hardy, Fuji Nevada · 27.5" un 29"',
      image: catMtbImg,
    },
    {
      id: 'GRAVEL VELOSIPĒDI',
      title: 'GRAVEL VELOSIPĒDI',
      subtitle: 'DRAG Sterrato, VentVelo Baltic · GRX / Claris',
      image: catGravelImg,
    },
    {
      id: 'PILSĒTAS VELOSIPĒDI',
      title: 'PILSĒTAS VELOSIPĒDI',
      subtitle: 'DRAG Grand Canyon, Cruiser, Urban CDX',
      image: catCityImg,
    },
    {
      id: 'BĒRNU VELOSIPĒDI',
      title: 'BĒRNU VELOSIPĒDI',
      subtitle: 'DRAG Hardy Jr, Yuki, Adriatica · 20" un 24"',
      image: catKidsImg,
    },
  ];

  const hasActiveFilters =
    selectedCategory !== 'Visi' ||
    selectedSizeFilter !== 'Visi' ||
    selectedAvailability !== 'Visi' ||
    selectedBrand !== 'Visi' ||
    selectedSuspension !== 'Visi' ||
    selectedMaterial !== 'Visi' ||
    selectedGears !== 'Visi' ||
    selectedWheelSize !== 'Visi' ||
    selectedBrakeType !== 'Visi' ||
    selectedPriceRange !== 'Visi';

  const resetAllFilters = () => {
    setSelectedCategory('Visi');
    setSelectedSizeFilter('Visi');
    setSelectedAvailability('Visi');
    setSelectedBrand('Visi');
    setSelectedSuspension('Visi');
    setSelectedMaterial('Visi');
    setSelectedGears('Visi');
    setSelectedWheelSize('Visi');
    setSelectedBrakeType('Visi');
    setSelectedPriceRange('Visi');
    setOpenDropdown(null);
  };

  const filteredBikes = useMemo(() => {
    return BIKES_FOR_SALE.filter((bike) => {
      if (selectedCategory !== 'Visi' && bike.category !== selectedCategory) return false;
      if (
        selectedSizeFilter !== 'Visi' &&
        !bike.sizesAvailable.some((s) => s.startsWith(selectedSizeFilter))
      ) {
        return false;
      }
      if (selectedAvailability !== 'Visi' && bike.availabilityStatus !== selectedAvailability) return false;
      if (selectedBrand !== 'Visi' && bike.brand !== selectedBrand) return false;
      if (selectedSuspension !== 'Visi' && bike.suspension !== selectedSuspension) return false;
      if (selectedMaterial !== 'Visi' && bike.frameMaterialShort !== selectedMaterial) return false;
      if (selectedWheelSize !== 'Visi' && bike.specs.wheelSizeCategory !== selectedWheelSize) return false;
      if (selectedBrakeType !== 'Visi' && bike.brakeType !== selectedBrakeType) return false;

      if (selectedGears !== 'Visi') {
        if (selectedGears === 'Līdz 8 ātrumiem' && bike.specs.gears > 8) return false;
        if (selectedGears === '9–16 ātrumi' && (bike.specs.gears < 9 || bike.specs.gears > 16)) return false;
        if (selectedGears === '18–24 ātrumi' && bike.specs.gears < 18) return false;
      }

      if (selectedPriceRange !== 'Visi') {
        if (selectedPriceRange === 'Līdz €400' && bike.priceEur > 400) return false;
        if (selectedPriceRange === '€400 – €800' && (bike.priceEur < 400 || bike.priceEur > 800)) return false;
        if (selectedPriceRange === '€800 – €1300' && (bike.priceEur < 800 || bike.priceEur > 1300)) return false;
        if (selectedPriceRange === 'Virs €1300' && bike.priceEur <= 1300) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.priceEur - b.priceEur;
      if (sortBy === 'price_desc') return b.priceEur - a.priceEur;
      return a.name.localeCompare(b.name);
    });
  }, [
    selectedCategory,
    selectedSizeFilter,
    selectedAvailability,
    selectedBrand,
    selectedSuspension,
    selectedMaterial,
    selectedGears,
    selectedWheelSize,
    selectedBrakeType,
    selectedPriceRange,
    sortBy,
  ]);

  const handleOpenBikeDetails = (bike: BikeProduct) => {
    setSelectedBike(bike);
    setSelectedSize(bike.sizesAvailable[0] || 'M');
    setAssemblyOption('assembled');
    setUseTradeIn(false);
    setTradeInModel('');
    setTradeInEstimateEur(100);
  };

  const getAssemblyFee = () => (assemblyOption === 'assembled' ? 35 : 0);

  const getFinalPrice = (bike: BikeProduct) => {
    const baseWithAssembly = bike.priceEur + getAssemblyFee();
    if (useTradeIn) {
      return Math.max(50, baseWithAssembly - tradeInEstimateEur);
    }
    return baseWithAssembly;
  };

  const handleDirectBuyFromModal = (bike: BikeProduct) => {
    const finalTotal = getFinalPrice(bike);
    const assemblyLabel =
      assemblyOption === 'assembled'
        ? 'Meistara salikts ar garantiju (+€35)'
        : 'Oriģinālajā kastē (pašu montāžai, bez garantijas)';
    const tradeInLabel = useTradeIn
      ? ` · Vecais ritenis pirmajai iemaksai (-€${tradeInEstimateEur}${tradeInModel ? `: ${tradeInModel}` : ''})`
      : '';

    openCheckout({
      type: 'single_bike',
      data: {
        ...bike,
        selectedSize: selectedSize || bike.sizesAvailable[0],
        assemblyOption,
        assemblyFeeEur: getAssemblyFee(),
        useTradeIn,
        tradeInModel,
        tradeInEstimateEur: useTradeIn ? tradeInEstimateEur : 0,
      },
      totalEur: finalTotal,
      title: `${bike.name} (${selectedSize || bike.sizesAvailable[0]}) · ${assemblyLabel}${tradeInLabel}`,
    });
    setSelectedBike(null);
  };

  const handleAddToCartFromModal = (bike: BikeProduct) => {
    const finalTotal = getFinalPrice(bike);
    const assemblyLabel =
      assemblyOption === 'assembled'
        ? 'Meistara salikts (+€35) ar garantiju'
        : 'Kastē (bez garantijas)';
    const tradeInNote = useTradeIn ? ` · Pirmā iemaksa vecais velo (-€${tradeInEstimateEur})` : '';

    addToCart({
      type: 'bike',
      productId: `${bike.id}_${assemblyOption}_${useTradeIn ? tradeInEstimateEur : 0}`,
      name: `${bike.name} – ${selectedSize || bike.sizesAvailable[0]}`,
      priceEur: finalTotal,
      quantity: 1,
      image: bike.image,
      details: `${assemblyLabel}${tradeInNote}`,
    });
    setSelectedBike(null);
  };

  const handleCategoryTileClick = (catId: string) => {
    setSelectedCategory((prev) => (prev === catId ? 'Visi' : catId));
    catalogGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const monthlyEstimate = (priceEur: number) => Math.max(12, Math.round(priceEur / 24));

  const filterConfigs: {
    key: FilterDropdownKey;
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: string[];
  }[] = [
    {
      key: 'category',
      label: 'Sadaļas',
      value: selectedCategory,
      onChange: setSelectedCategory,
      options: [
        'Visi',
        'KALNU VELOSIPĒDI (MTB)',
        'GRAVEL VELOSIPĒDI',
        'PILSĒTAS VELOSIPĒDI',
        'BĒRNU VELOSIPĒDI',
        'E-Velosipēdi',
        'Pārbaudīti lietotie',
      ],
    },
    {
      key: 'size',
      label: 'Rāmja izmērs',
      value: selectedSizeFilter,
      onChange: setSelectedSizeFilter,
      options: ['Visi', 'XS', 'S', 'M', 'L', 'XL', '20"', '24"'],
    },
    {
      key: 'availability',
      label: 'Pieejamība',
      value: selectedAvailability,
      onChange: setSelectedAvailability,
      options: ['Visi', 'Noliktavā Rindas 44', 'Piegāde 2–3 d.d.'],
    },
    {
      key: 'brand',
      label: 'Zīmols',
      value: selectedBrand,
      onChange: setSelectedBrand,
      options: ['Visi', 'DRAG', 'Fuji', 'Adriatica', 'VentVelo', 'Specialized'],
    },
    {
      key: 'suspension',
      label: 'Amortizatori',
      value: selectedSuspension,
      onChange: setSelectedSuspension,
      options: ['Visi', 'Priekšējais amortizators (Hardtail)', 'Cietā dakša (Rigid)'],
    },
    {
      key: 'material',
      label: 'Rāmja materiāls',
      value: selectedMaterial,
      onChange: setSelectedMaterial,
      options: ['Visi', 'Alumīnijs', 'Oglekļa šķiedra (Carbon)'],
    },
    {
      key: 'gears',
      label: 'Ātrumu skaits',
      value: selectedGears,
      onChange: setSelectedGears,
      options: ['Visi', 'Līdz 8 ātrumiem', '9–16 ātrumi', '18–24 ātrumi'],
    },
    {
      key: 'wheelSize',
      label: 'Ratu izmērs',
      value: selectedWheelSize,
      onChange: setSelectedWheelSize,
      options: ['Visi', '20"', '24"', '27.5"', '28" / 700c', '29"'],
    },
    {
      key: 'brakes',
      label: 'Bremžu tips',
      value: selectedBrakeType,
      onChange: setSelectedBrakeType,
      options: ['Visi', 'Hidrauliskās disku', 'Mehāniskās disku', 'V-veida un kājas bremze'],
    },
    {
      key: 'price',
      label: 'Cena',
      value: selectedPriceRange,
      onChange: setSelectedPriceRange,
      options: ['Visi', 'Līdz €400', '€400 – €800', '€800 – €1300', 'Virs €1300'],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Header Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-8 sm:p-10 border border-stone-800 space-y-8 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="text-xs font-semibold text-amber-400 tracking-wide">
              VentVelo darbojas jau 18 gadus · Rindas iela 44, Ventspils
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-heading text-balance">
              Velosipēdu salons un katalogs ar garantiju
            </h1>
            <p className="text-stone-300 text-sm leading-relaxed">
              Kalnu (MTB), Gravel, pilsētas un bērnu velosipēdi ar 18 gadu servisa pieredzi. Izvēlies pasūtīt riteni oriģinālajā kastē vai uztici meistaram pilnu montāžu ar oficiālu garantiju par €35.
            </p>
          </div>

          <div className="bg-stone-800/80 border border-stone-700/80 rounded-xl p-5 text-xs space-y-2.5 shrink-0 lg:w-80">
            <div className="font-semibold text-stone-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>18 gadu pieredze kopš 2008. gada</span>
            </div>
            <p className="text-stone-400 leading-relaxed">
              Nodod savu veco riteni kā pirmo iemaksu par jauno vai sadali maksājumu ar Inbank un ESTO līzingu. Piegāde ar servisa busiņu Ventspilī, Usmā un Talsos.
            </p>
          </div>
        </div>

        {/* 4 Key VentVelo Purchase Guarantees Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-stone-800 text-xs">
          <div className="space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Kastē vai salikts ar garantiju</span>
            </div>
            <p className="text-stone-400 leading-relaxed">
              Oriģinālajā kastē pašu montāžai (bez garantijas) vai par €35 meistara samontēts ar garantiju veikalā vai piegādē.
            </p>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Vecais ritenis pirmajai iemaksai</span>
            </div>
            <p className="text-stone-400 leading-relaxed">
              Atved savu esošo velosipēdu uz Rindas ielu 44 vai nodod busiņam — novērtēsim un ieskaitīsim kā pirmo iemaksu.
            </p>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Inbank un ESTO līzings</span>
            </div>
            <p className="text-stone-400 leading-relaxed">
              Ātra nomaksa no 6 līdz 36 mēnešiem vai 3 bezprocentu daļās. Visas cenas norādītas skaidri bez centiem.
            </p>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>18 gadu darbnīcas pieredze</span>
            </div>
            <p className="text-stone-400 leading-relaxed">
              Jau 18 gadus apkalpojam un pārdodam kvalitatīvus velosipēdus Kurzemē ar uzticamu pēcpārdošanas servisu.
            </p>
          </div>
        </div>
      </div>

      {/* Prominent Inbank & ESTO Leasing Offer Banner */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-950 text-white rounded-2xl p-6 border border-emerald-800/80 flex flex-col justify-between gap-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                Inbank Līzings · No 6 līdz 36 mēnešiem
              </div>
              <h2 className="text-xl font-bold font-heading text-white">
                Pērc jaunu riteni ar Inbank no €12 mēnesī
              </h2>
              <p className="text-xs text-emerald-100/85 leading-relaxed">
                Noformē līzingu 2 minūtēs ar Smart-ID vai klātienē Rindas ielā 44. Pirmā iemaksa no €0 vai izmanto savu veco velosipēdu kā pirmo iemaksu!
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-emerald-400 shrink-0" />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-emerald-200 pt-2 border-t border-emerald-800/70">
            <span>Lēmums 2 minūtēs</span>
            <span>·</span>
            <span>Pirmā iemaksa no €0</span>
            <span>·</span>
            <span>Bez slēptām komisijām</span>
          </div>
        </div>

        <div className="bg-amber-500 text-stone-950 rounded-2xl p-6 border border-amber-400 flex flex-col justify-between gap-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-900">
                ESTO 3 un ESTO Nomaksa · 0% Pārmaksa
              </div>
              <h2 className="text-xl font-bold font-heading text-stone-950">
                Sadali cenu 3 daļās bez procentiem (0%)
              </h2>
              <p className="text-xs text-stone-900/90 leading-relaxed">
                Ar <strong>ESTO 3</strong> maksā 3 vienādās daļās bez neviena eiro pārmaksas, vai izvēlies garāku ESTO nomaksu līdz 36 mēnešiem. Apstiprinājums 60 sekundēs.
              </p>
            </div>
            <Award className="w-8 h-8 text-stone-900 shrink-0" />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold text-stone-900 pt-2 border-t border-stone-950/15">
            <span>ESTO 3: 0% likme</span>
            <span>·</span>
            <span>Apstiprinājums 60 sek.</span>
            <span>·</span>
            <span>Der arī ar +€35 montāžu</span>
          </div>
        </div>
      </section>

      {/* 4 Main Category Showcase Cards (adapted from veloprofs.lv screenshot to VentVelo) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900 font-heading">Velosipēdu kategorijas</h2>
          {selectedCategory !== 'Visi' && (
            <button
              onClick={() => setSelectedCategory('Visi')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 cursor-pointer"
            >
              Skatīt visus velosipēdus
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {mainCategories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryTileClick(cat.id)}
                className={`group text-left bg-white rounded-xl overflow-hidden border transition-all cursor-pointer ${
                  isActive
                    ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                    : 'border-stone-200 hover:border-stone-300 shadow-xs hover:shadow-md'
                }`}
              >
                <div className="aspect-4/3 bg-stone-100 overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                </div>
                <div className="p-3.5 text-center space-y-1">
                  <div
                    className={`text-sm font-bold tracking-tight font-heading ${
                      isActive ? 'text-amber-700' : 'text-stone-800 group-hover:text-stone-950'
                    }`}
                  >
                    {cat.title}
                  </div>
                  <div className="text-[11px] text-stone-500 truncate">{cat.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Multi-Parameter Filter Bar (adapted from veloprofs.lv MTB filter bar to VentVelo) */}
      <section ref={filterBarRef} className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {filterConfigs.map((cfg) => {
              const isSelected = cfg.value !== 'Visi';
              const isOpen = openDropdown === cfg.key;
              return (
                <div key={cfg.key} className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(isOpen ? null : cfg.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : isOpen
                        ? 'bg-stone-100 text-stone-900 border-stone-400'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    <span>
                      {cfg.label}
                      {isSelected ? `: ${cfg.value}` : ''}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="absolute left-0 top-full mt-1.5 z-30 min-w-[230px] bg-white border border-stone-200 rounded-xl shadow-xl p-1.5 space-y-0.5">
                      {cfg.options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            cfg.onChange(opt);
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                            cfg.value === opt
                              ? 'bg-amber-50 text-amber-900 font-semibold'
                              : 'text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          <span>{opt === 'Visi' ? `Visi (${cfg.label.toLowerCase()})` : opt}</span>
                          {cfg.value === opt && <Check className="w-3.5 h-3.5 text-amber-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-amber-700 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Notīrīt filtrus</span>
              </button>
            )}
          </div>

          {/* Sort & Counter */}
          <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
            <span className="text-xs text-stone-500 font-medium tabular-nums">
              Atrasti {filteredBikes.length} modeļi
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'price_asc' | 'price_desc' | 'name')}
              aria-label="Kārtot velosipēdus"
              className="px-3 py-2 text-xs font-medium bg-white border border-stone-200 rounded-lg text-stone-800 cursor-pointer focus:outline-none focus:border-stone-900"
            >
              <option value="price_asc">Cena, no lētākās</option>
              <option value="price_desc">Cena, no dārgākās</option>
              <option value="name">Nosaukums A–Ž</option>
            </select>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <div ref={catalogGridRef}>
        {filteredBikes.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-3">
            <p className="text-sm font-semibold text-stone-900">
              Pēc izvēlētajiem filtriem velosipēdi netika atrasti.
            </p>
            <p className="text-xs text-stone-500">
              Pamēģini noņemt kādu no filtriem vai sazinies ar mūsu meistaru par individuālu pasūtījumu tieši no ražotāju piegādēm.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="mt-2 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 cursor-pointer"
            >
              Rādīt visus velosipēdus
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBikes.map((bike) => {
              const discountEur = bike.originalPriceEur ? bike.originalPriceEur - bike.priceEur : 0;
              return (
                <div
                  key={bike.id}
                  className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  {/* Image container */}
                  <div
                    className="relative aspect-4/3 bg-stone-100 overflow-hidden cursor-pointer"
                    onClick={() => handleOpenBikeDetails(bike)}
                  >
                    <img
                      src={bike.image}
                      alt={bike.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />

                    {discountEur > 0 && (
                      <div className="absolute top-3 left-3 bg-amber-500 text-stone-950 text-[11px] font-bold px-2.5 py-0.5 rounded shadow-xs font-mono tabular-nums">
                        -{formatPrice(discountEur)}
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 bg-stone-950/85 backdrop-blur-md text-stone-100 text-[11px] font-medium px-2.5 py-1 rounded border border-stone-700">
                      {bike.availabilityStatus}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      {/* Clean unboxed metadata per zero-pill discipline */}
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <span className="font-semibold text-stone-800">{bike.brand}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{bike.category}</span>
                      </div>

                      <h3
                        onClick={() => handleOpenBikeDetails(bike)}
                        className="font-bold text-stone-900 text-base leading-snug cursor-pointer hover:text-amber-600 transition-colors"
                      >
                        {bike.name}
                      </h3>

                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {bike.groupset} · {bike.brakeType}
                      </p>

                      <div className="text-[11px] text-stone-500 pt-1">
                        Izmēri: <span className="text-stone-700 font-medium">{bike.sizesAvailable.join(' · ')}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-100 space-y-3">
                      <div className="flex items-end justify-between gap-2">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-stone-950 font-mono tabular-nums">
                              {formatPrice(bike.priceEur)}
                            </span>
                            {bike.originalPriceEur && (
                              <span className="text-xs text-stone-400 line-through font-mono tabular-nums">
                                {formatPrice(bike.originalPriceEur)}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-500 mt-0.5 tabular-nums">
                            Inbank / ESTO no <strong className="text-stone-800">{formatPrice(monthlyEstimate(bike.priceEur))}/mēn.</strong>
                          </div>
                        </div>

                        <div className="text-xs text-emerald-700 font-medium flex items-center gap-1 shrink-0">
                          <Check className="w-3.5 h-3.5" />
                          <span>{bike.inStockCount} gab.</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1">
                        <div className="bg-emerald-50 border border-emerald-200/80 text-emerald-950 px-2.5 py-1.5 rounded-lg tabular-nums">
                          <span className="font-bold block">Inbank</span>
                          <span>no {formatPrice(monthlyEstimate(bike.priceEur))}/mēn.</span>
                        </div>
                        <div className="bg-amber-50 border border-amber-200/80 text-amber-950 px-2.5 py-1.5 rounded-lg tabular-nums">
                          <span className="font-bold block">ESTO 3 (0%)</span>
                          <span>3 × {formatPrice(Math.round(bike.priceEur / 3))}</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-stone-500 bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-100">
                        Kastē (€0, bez garantijas) vai <strong className="text-stone-800">+€35 salikts ar garantiju</strong>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => handleOpenBikeDetails(bike)}
                          className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
                        >
                          Izvēlēties izmēru
                        </button>
                        <button
                          onClick={() => handleOpenBikeDetails(bike)}
                          className="py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
                        >
                          Pirkt / Līzings
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detailed Bike Modal (Veloprofs size selector + Box vs +€35 Assembled + Trade-in + Inbank/ESTO) */}
      {selectedBike && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-amber-400 font-semibold">{selectedBike.brand}</span>
                <span className="text-stone-500">·</span>
                <span className="text-stone-300">{selectedBike.category}</span>
              </div>
              <button
                onClick={() => setSelectedBike(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                aria-label="Aizvērt logu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left: Image & Highlights */}
                <div className="md:col-span-5 space-y-4">
                  <div className="rounded-xl overflow-hidden bg-stone-100 border border-stone-200 aspect-4/3 relative">
                    <img
                      src={selectedBike.image}
                      alt={selectedBike.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 bg-stone-950/90 text-white text-xs px-2.5 py-1 rounded backdrop-blur-sm flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        {assemblyOption === 'assembled'
                          ? `${selectedBike.guaranteeMonths} mēnešu garantija`
                          : 'Kastē – bez garantijas'}
                      </span>
                    </div>
                  </div>

                  {/* Specs summary mini grid */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-100">
                      <span className="text-stone-500 block text-[11px]">Ātrumi</span>
                      <span className="font-semibold text-stone-900">{selectedBike.groupset}</span>
                    </div>
                    <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-100">
                      <span className="text-stone-500 block text-[11px]">Bremzes</span>
                      <span className="font-semibold text-stone-900">{selectedBike.brakes}</span>
                    </div>
                    <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-100">
                      <span className="text-stone-500 block text-[11px]">Rati un riepas</span>
                      <span className="font-semibold text-stone-900">{selectedBike.specs.wheelSize}</span>
                    </div>
                    <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-100">
                      <span className="text-stone-500 block text-[11px]">Svars</span>
                      <span className="font-semibold text-stone-900 font-mono">{selectedBike.specs.weightKg} kg</span>
                    </div>
                  </div>
                </div>

                {/* Right: Contiguous Purchase Module (Veloprofs size boxes + Assembly + Trade-in + Leasing) */}
                <div className="md:col-span-7 space-y-5">
                  <div>
                    <h2 className="text-2xl font-bold text-stone-900 font-heading leading-tight">
                      {selectedBike.name}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-baseline gap-3">
                      <span className="text-3xl font-bold text-stone-950 font-mono tabular-nums">
                        {formatPrice(getFinalPrice(selectedBike))}
                      </span>
                      {selectedBike.originalPriceEur && (
                        <span className="text-sm text-stone-400 line-through font-mono tabular-nums">
                          {formatPrice(selectedBike.originalPriceEur)}
                        </span>
                      )}
                      <span className="text-xs text-stone-600 tabular-nums">
                        ar PVN · Inbank / ESTO no <strong>{formatPrice(monthlyEstimate(getFinalPrice(selectedBike)))}/mēn.</strong>
                      </span>
                    </div>
                  </div>

                  {/* Frame Size Selector (matching veloprofs.lv size buttons with height ranges) */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-2">
                      Rāmja izmērs (pēc braucēja auguma):
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedBike.sizesAvailable.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`px-3.5 py-2 text-xs font-semibold rounded-lg border cursor-pointer transition-colors ${
                            selectedSize === size
                              ? 'border-stone-950 bg-stone-950 text-white shadow-xs'
                              : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Assembly Choice: Oriģinālajā iepakojumā (kastē) vs +€35 Meistara salikts ar garantiju */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-stone-800">
                      Izvēlies komplektāciju un garantiju:
                    </label>
                    <div className="grid grid-cols-1 gap-2.5">
                      <label
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                          assemblyOption === 'assembled'
                            ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="assembly_option"
                          checked={assemblyOption === 'assembled'}
                          onChange={() => setAssemblyOption('assembled')}
                          className="mt-1 accent-amber-600"
                        />
                        <div className="flex-1 text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-stone-900">
                            <span className="flex items-center gap-1.5">
                              <Wrench className="w-3.5 h-3.5 text-amber-600" />
                              Meistara salikts ritenis ar garantiju
                            </span>
                            <span className="font-mono text-amber-800">+€35</span>
                          </div>
                          <p className="text-stone-600 leading-relaxed">
                            Pilnībā samontēts un noregulēts ar {selectedBike.guaranteeMonths} mēnešu VentVelo darbnīcas garantiju. Piegāde ar busiņu pēc izvēles vai saņemšana veikalā Rindas ielā 44 jau samontētu un gatavu braukšanai!
                          </p>
                        </div>
                      </label>

                      <label
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                          assemblyOption === 'box'
                            ? 'border-stone-900 bg-stone-50 shadow-xs'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="assembly_option"
                          checked={assemblyOption === 'box'}
                          onChange={() => setAssemblyOption('box')}
                          className="mt-1 accent-stone-900"
                        />
                        <div className="flex-1 text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-stone-900">
                            <span className="flex items-center gap-1.5">
                              <Package className="w-3.5 h-3.5 text-stone-600" />
                              Oriģinālajā iepakojumā (kastē)
                            </span>
                            <span className="font-mono text-stone-700">€0</span>
                          </div>
                          <p className="text-stone-600 leading-relaxed">
                            Rūpnīcas iepakojums — velosipēds būs jāsamontē un jānoregulē pašam pircējam. Uz pašu montētu velosipēdu darbnīcas garantija neattiecas.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Trade-In Option: Vecais ritenis kā pirmā iemaksa */}
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-3 text-xs">
                    <label className="flex items-center justify-between gap-2 cursor-pointer">
                      <span className="font-bold text-stone-900 flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                        Nodod savu veco riteni kā pirmo iemaksu
                      </span>
                      <input
                        type="checkbox"
                        checked={useTradeIn}
                        onChange={(e) => setUseTradeIn(e.target.checked)}
                        className="w-4 h-4 accent-amber-600 cursor-pointer"
                      />
                    </label>

                    {useTradeIn && (
                      <div className="space-y-2.5 pt-2 border-t border-stone-200">
                        <div>
                          <label className="block text-[11px] text-stone-600 mb-1">
                            Vecā velosipēda marka un aptuvenais stāvoklis:
                          </label>
                          <input
                            type="text"
                            value={tradeInModel}
                            onChange={(e) => setTradeInModel(e.target.value)}
                            placeholder="Piem., Trek Marlin vai bērnu 16'' ritenis, labs stāvoklis"
                            className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] text-stone-600">Orientējošā pirmā iemaksa:</span>
                          {[50, 100, 150, 250].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setTradeInEstimateEur(val)}
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold font-mono cursor-pointer border ${
                                tradeInEstimateEur === val
                                  ? 'bg-stone-900 text-white border-stone-900'
                                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                              }`}
                            >
                              -€{val}
                            </button>
                          ))}
                        </div>
                        <p className="text-[11px] text-stone-500">
                          Precīzu vecā velosipēda vērtību apstiprinās meistars Rindas ielā 44 vai servisa busiņa šoferis apskates brīdī.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Features & 18 years proof */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-200 text-xs">
                <div className="space-y-2">
                  <h4 className="font-bold text-stone-900 text-sm font-heading">Galvenās priekšrocības</h4>
                  <ul className="space-y-1.5 text-stone-600">
                    {selectedBike.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-emerald-950 text-white border border-emerald-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm font-heading flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <span>Inbank un ESTO Līzinga piedāvājums</span>
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="bg-emerald-900/70 border border-emerald-700/70 rounded-lg p-2.5">
                      <div className="font-bold text-emerald-200">Inbank līzings</div>
                      <div className="text-base font-bold font-mono text-white tabular-nums mt-0.5">
                        no {formatPrice(monthlyEstimate(getFinalPrice(selectedBike)))} / mēn.
                      </div>
                      <div className="text-[11px] text-emerald-200/80 mt-0.5">6–36 mēn., €0 pirmā iemaksa</div>
                    </div>
                    <div className="bg-amber-500 text-stone-950 rounded-lg p-2.5">
                      <div className="font-bold">ESTO 3 (0% likme)</div>
                      <div className="text-base font-bold font-mono tabular-nums mt-0.5">
                        3 × {formatPrice(Math.round(getFinalPrice(selectedBike) / 3))}
                      </div>
                      <div className="text-[11px] font-medium mt-0.5">Bez procentiem un pārmaksas</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-100/85 leading-relaxed">
                    Nākamajā solī vari izvēlēties Inbank vai ESTO un apvienot ar vecā velosipēda nodošanu pirmajai iemaksai. VentVelo — 18 gadi pieredzes Ventspilī!
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => setSelectedBike(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer text-left"
              >
                Aizvērt
              </button>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleAddToCartFromModal(selectedBike)}
                  className="px-4 py-2.5 text-xs font-semibold text-stone-800 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg transition-colors cursor-pointer"
                >
                  Ielikt grozā
                </button>
                <button
                  onClick={() => handleDirectBuyFromModal(selectedBike)}
                  className="px-6 py-2.5 text-xs font-semibold text-stone-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors cursor-pointer shadow-md font-heading"
                >
                  Pirkt / Inbank un ESTO ({formatPrice(getFinalPrice(selectedBike))})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
