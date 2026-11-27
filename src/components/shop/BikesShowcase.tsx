import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { BIKES_FOR_SALE } from '../../data/mockData';
import { BikeCategory, BikeProduct } from '../../types';
import {
  ShieldCheck,
  Check,
  X,
  Truck,
  Wrench,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Package,
  RefreshCw,
  Award,
  CreditCard,
  Search,
} from 'lucide-react';
import catMtbImg from '../../assets/images/cat_mtb_bike_1795451175318.jpg';
import catGravelImg from '../../assets/images/cat_gravel_bike_1795451176389.jpg';
import catCityImg from '../../assets/images/cat_city_bike_1795451176543.jpg';
import catKidsImg from '../../assets/images/cat_kids_bike_1795451176116.jpg';
import storeGravelImg from '../../assets/images/store_curated_gravel_bike_1794340032744.jpg';
import heroWorkshopImg from '../../assets/images/hero_bicycle_workshop_1794340029993.jpg';
import serviceVanImg from '../../assets/images/service_van_mobile_repair_1794340031954.jpg';
import { BikeImage } from '../common/BikeImage';

type FilterDropdownKey =
  | 'category'
  | 'brand'
  | 'riderType'
  | 'size'
  | 'availability'
  | 'suspension'
  | 'material'
  | 'gears'
  | 'wheelSize'
  | 'brakes'
  | 'price';

const PAGE_SIZE = 24;

const FEATURED_CATEGORY_ORDER: BikeCategory[] = [
  'GRAVEL VELOSIPĒDI',
  'E-Velosipēdi',
  'KALNU VELOSIPĒDI (MTB)',
  'HIBRĪDA UN TŪRISMA VELOSIPĒDI',
  'PILSĒTAS VELOSIPĒDI',
  'BĒRNU VELOSIPĒDI',
  'SALIEKAMIE VELOSIPĒDI',
  'BMX VELOSIPĒDI',
  'FATBIKE VELOSIPĒDI',
  'ŠOSEJAS VELOSIPĒDI',
  'Pārbaudīti lietotie',
];

function interleaveFeatured(bikes: BikeProduct[]): BikeProduct[] {
  const buckets = new Map<BikeCategory, BikeProduct[]>();
  for (const cat of FEATURED_CATEGORY_ORDER) {
    buckets.set(cat, []);
  }
  for (const b of bikes) {
    const arr = buckets.get(b.category);
    if (arr) {
      arr.push(b);
    } else {
      buckets.set(b.category, [b]);
    }
  }
  // Sort each bucket with flagship/newer higher-spec or well-stocked items first
  for (const arr of buckets.values()) {
    arr.sort((a, b) => {
      const aYear = parseInt(a.year || '0', 10);
      const bYear = parseInt(b.year || '0', 10);
      if (bYear !== aYear) return bYear - aYear;
      return b.inStockCount - a.inStockCount;
    });
  }

  const result: BikeProduct[] = [];
  let remaining = true;
  while (remaining) {
    remaining = false;
    for (const cat of FEATURED_CATEGORY_ORDER) {
      const bucket = buckets.get(cat);
      if (bucket && bucket.length > 0) {
        const next = bucket.shift();
        if (next) result.push(next);
        if (bucket.length > 0) remaining = true;
      }
    }
  }
  return result;
}

function matchesSizeFilter(sizes: string[], filterVal: string): boolean {
  if (filterVal === 'Visi') return true;
  if (/^(XS|S|M|L|XL)$/i.test(filterVal)) {
    const re = new RegExp(`\\b${filterVal}\\b`, 'i');
    return sizes.some((s) => re.test(s));
  }
  const lower = filterVal.toLowerCase();
  return sizes.some((s) => s.toLowerCase().includes(lower));
}

export const BikesShowcase: React.FC = () => {
  const { formatPrice, openCheckout, addToCart } = useApp();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Visi');
  const [selectedBrand, setSelectedBrand] = useState<string>('Visi');
  const [selectedRiderType, setSelectedRiderType] = useState<string>('Visi');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('Visi');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('Visi');
  const [selectedSuspension, setSelectedSuspension] = useState<string>('Visi');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('Visi');
  const [selectedGears, setSelectedGears] = useState<string>('Visi');
  const [selectedWheelSize, setSelectedWheelSize] = useState<string>('Visi');
  const [selectedBrakeType, setSelectedBrakeType] = useState<string>('Visi');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('Visi');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'name'>('featured');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [openDropdown, setOpenDropdown] = useState<FilterDropdownKey | null>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);
  const catalogGridRef = useRef<HTMLDivElement>(null);

  // Modal & purchase option states
  const [selectedBike, setSelectedBike] = useState<BikeProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [assemblyOption, setAssemblyOption] = useState<'assembled' | 'box'>('assembled');
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState<boolean>(false);

  const checkModalScroll = () => {
    const el = modalBodyRef.current;
    if (!el) return;
    const hasMoreBelow = el.scrollHeight - el.scrollTop - el.clientHeight > 24;
    setShowScrollHint(hasMoreBelow);
  };

  useEffect(() => {
    if (selectedBike) {
      const timer = setTimeout(checkModalScroll, 80);
      window.addEventListener('resize', checkModalScroll);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', checkModalScroll);
      };
    } else {
      setShowScrollHint(false);
    }
  }, [selectedBike]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterBarRef.current && !filterBarRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset pagination whenever filters/search/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedCategory,
    selectedBrand,
    selectedRiderType,
    selectedSizeFilter,
    selectedAvailability,
    selectedSuspension,
    selectedMaterial,
    selectedGears,
    selectedWheelSize,
    selectedBrakeType,
    selectedPriceRange,
    sortBy,
  ]);

  const rawCategoryDefs: {
    id: BikeCategory;
    title: string;
    subtitle: string;
    fallbackImage: string;
  }[] = [
    {
      id: 'KALNU VELOSIPĒDI (MTB)',
      title: 'Kalnu (MTB)',
      subtitle: 'Raymon, Unibike, Tabou, Romet · 26"–29"',
      fallbackImage: catMtbImg,
    },
    {
      id: 'GRAVEL VELOSIPĒDI',
      title: 'Gravel',
      subtitle: 'Raymon Territ / Soreno, Tabou Gravo',
      fallbackImage: catGravelImg,
    },
    {
      id: 'HIBRĪDA UN TŪRISMA VELOSIPĒDI',
      title: 'Hibrīda un tūrisma',
      subtitle: 'Unibike, Raymon, Tabou, Romet',
      fallbackImage: catCityImg,
    },
    {
      id: 'PILSĒTAS VELOSIPĒDI',
      title: 'Pilsētas',
      subtitle: 'Tabou, Romet, Azimut · Komforts un grozi',
      fallbackImage: catCityImg,
    },
    {
      id: 'E-Velosipēdi',
      title: 'E-Velosipēdi',
      subtitle: 'Raymon Bosch, Ecobike, Tabou UP',
      fallbackImage: storeGravelImg,
    },
    {
      id: 'BĒRNU VELOSIPĒDI',
      title: 'Bērnu un līdzsvara',
      subtitle: 'PUKY, Tabou, Karbon, S\'COOL, Royal Baby',
      fallbackImage: catKidsImg,
    },
    {
      id: 'SALIEKAMIE VELOSIPĒDI',
      title: 'Saliekamie',
      subtitle: 'Tabou, Romet Wigry / Jubilat · 20"–24"',
      fallbackImage: serviceVanImg,
    },
    {
      id: 'BMX VELOSIPĒDI',
      title: 'BMX',
      subtitle: 'Tabou Gravity · 20" triku modeļi',
      fallbackImage: heroWorkshopImg,
    },
    {
      id: 'ŠOSEJAS VELOSIPĒDI',
      title: 'Šosejas',
      subtitle: 'Vieglie asfalta modeļi',
      fallbackImage: storeGravelImg,
    },
    {
      id: 'FATBIKE VELOSIPĒDI',
      title: 'Fatbike',
      subtitle: 'Pludmalei un smiltīm',
      fallbackImage: catMtbImg,
    },
    {
      id: 'Pārbaudīti lietotie',
      title: 'Pārbaudīti lietotie',
      subtitle: 'Darbnīcā pārlasīti ar 12 mēn. garantiju',
      fallbackImage: heroWorkshopImg,
    },
  ];

  const mainCategories = useMemo(() => {
    return rawCategoryDefs
      .map((def) => {
        const matches = BIKES_FOR_SALE.filter((b) => b.category === def.id);
        return {
          ...def,
          count: matches.length,
          image: matches[0]?.image || def.fallbackImage,
        };
      })
      .filter((c) => c.count > 0);
  }, []);

  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    BIKES_FOR_SALE.forEach((b) => set.add(b.brand));
    return ['Visi', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, []);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'Visi' ||
    selectedBrand !== 'Visi' ||
    selectedRiderType !== 'Visi' ||
    selectedSizeFilter !== 'Visi' ||
    selectedAvailability !== 'Visi' ||
    selectedSuspension !== 'Visi' ||
    selectedMaterial !== 'Visi' ||
    selectedGears !== 'Visi' ||
    selectedWheelSize !== 'Visi' ||
    selectedBrakeType !== 'Visi' ||
    selectedPriceRange !== 'Visi';

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Visi');
    setSelectedBrand('Visi');
    setSelectedRiderType('Visi');
    setSelectedSizeFilter('Visi');
    setSelectedAvailability('Visi');
    setSelectedSuspension('Visi');
    setSelectedMaterial('Visi');
    setSelectedGears('Visi');
    setSelectedWheelSize('Visi');
    setSelectedBrakeType('Visi');
    setSelectedPriceRange('Visi');
    setOpenDropdown(null);
  };

  const filteredBikes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const matched = BIKES_FOR_SALE.filter((bike) => {
      if (q) {
        const hay = `${bike.name} ${bike.brand} ${bike.category} ${bike.groupset} ${bike.brakes} ${bike.frameMaterial} ${bike.riderType || ''} ${bike.sku || ''} ${(bike.specsList || []).map((s) => `${s.label} ${s.value}`).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (selectedCategory !== 'Visi' && bike.category !== selectedCategory) return false;
      if (selectedBrand !== 'Visi' && bike.brand !== selectedBrand) return false;
      if (selectedRiderType !== 'Visi' && (bike.riderType || 'Unisex') !== selectedRiderType) return false;
      if (!matchesSizeFilter(bike.sizesAvailable, selectedSizeFilter)) return false;
      if (selectedAvailability !== 'Visi' && bike.availabilityStatus !== selectedAvailability) return false;
      if (selectedSuspension !== 'Visi' && bike.suspension !== selectedSuspension) return false;
      if (selectedMaterial !== 'Visi' && bike.frameMaterialShort !== selectedMaterial) return false;
      if (selectedWheelSize !== 'Visi' && bike.specs.wheelSizeCategory !== selectedWheelSize) return false;
      if (selectedBrakeType !== 'Visi' && bike.brakeType !== selectedBrakeType) return false;

      if (selectedGears !== 'Visi') {
        if (selectedGears === '1 ātrums (Balanss / BMX)' && bike.specs.gears > 1) return false;
        if (selectedGears === '3–8 ātrumi' && (bike.specs.gears < 3 || bike.specs.gears > 8)) return false;
        if (selectedGears === '9–16 ātrumi' && (bike.specs.gears < 9 || bike.specs.gears > 16)) return false;
        if (selectedGears === '18–30 ātrumi' && bike.specs.gears < 18) return false;
      }

      if (selectedPriceRange !== 'Visi') {
        if (selectedPriceRange === 'Līdz €350' && bike.priceEur > 350) return false;
        if (selectedPriceRange === '€350 – €700' && (bike.priceEur < 350 || bike.priceEur > 700)) return false;
        if (selectedPriceRange === '€700 – €1500' && (bike.priceEur < 700 || bike.priceEur > 1500)) return false;
        if (selectedPriceRange === 'Virs €1500' && bike.priceEur <= 1500) return false;
      }

      return true;
    });

    if (sortBy === 'featured') {
      return interleaveFeatured(matched);
    }
    return matched.sort((a, b) => {
      if (sortBy === 'price_asc') return a.priceEur - b.priceEur;
      if (sortBy === 'price_desc') return b.priceEur - a.priceEur;
      return a.name.localeCompare(b.name);
    });
  }, [
    searchQuery,
    selectedCategory,
    selectedBrand,
    selectedRiderType,
    selectedSizeFilter,
    selectedAvailability,
    selectedSuspension,
    selectedMaterial,
    selectedGears,
    selectedWheelSize,
    selectedBrakeType,
    selectedPriceRange,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredBikes.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedBikes = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredBikes.slice(start, start + PAGE_SIZE);
  }, [filteredBikes, safePage]);

  const goToPage = (page: number) => {
    const next = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(next);
    catalogGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleOpenBikeDetails = (bike: BikeProduct) => {
    setSelectedBike(bike);
    setSelectedSize(bike.sizesAvailable[0] || 'One Size');
    setAssemblyOption('assembled');
  };

  const getAssemblyFee = () => (assemblyOption === 'assembled' ? 35 : 0);

  const getFinalPrice = (bike: BikeProduct) => bike.priceEur + getAssemblyFee();

  const handleDirectBuyFromModal = (bike: BikeProduct) => {
    const finalTotal = getFinalPrice(bike);
    const assemblyLabel =
      assemblyOption === 'assembled'
        ? 'Meistara salikts ar garantiju (+€35)'
        : 'Oriģinālajā kastē (pašu montāžai, bez garantijas)';

    openCheckout({
      type: 'single_bike',
      data: {
        ...bike,
        selectedSize: selectedSize || bike.sizesAvailable[0],
        assemblyOption,
        assemblyFeeEur: getAssemblyFee(),
      },
      totalEur: finalTotal,
      title: `${bike.name} (${selectedSize || bike.sizesAvailable[0]}) · ${assemblyLabel}`,
    });
    setSelectedBike(null);
  };

  const handleAddToCartFromModal = (bike: BikeProduct) => {
    const finalTotal = getFinalPrice(bike);
    const assemblyLabel =
      assemblyOption === 'assembled'
        ? 'Meistara salikts (+€35) ar garantiju'
        : 'Kastē (bez garantijas)';

    addToCart({
      type: 'bike',
      productId: `${bike.id}_${selectedSize}_${assemblyOption}`,
      name: `${bike.name} – ${selectedSize || bike.sizesAvailable[0]}`,
      priceEur: finalTotal,
      quantity: 1,
      image: bike.image,
      details: assemblyLabel,
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
      options: ['Visi', ...mainCategories.map((c) => c.id)],
    },
    {
      key: 'brand',
      label: 'Zīmols',
      value: selectedBrand,
      onChange: setSelectedBrand,
      options: availableBrands,
    },
    {
      key: 'riderType',
      label: 'Modelis',
      value: selectedRiderType,
      onChange: setSelectedRiderType,
      options: ['Visi', 'Vīriešu', 'Sieviešu', 'Unisex'],
    },
    {
      key: 'size',
      label: 'Rāmja izmērs',
      value: selectedSizeFilter,
      onChange: setSelectedSizeFilter,
      options: ['Visi', '12"', '14"', '16"', '18"', '20"', '24"', '26"', 'XS', 'S', 'M', 'L', 'XL', 'One Size'],
    },
    {
      key: 'wheelSize',
      label: 'Ratu izmērs',
      value: selectedWheelSize,
      onChange: setSelectedWheelSize,
      options: ['Visi', '12" / 16"', '20"', '24"', '26"', '27.5"', '28" / 700c', '29"'],
    },
    {
      key: 'material',
      label: 'Rāmja materiāls',
      value: selectedMaterial,
      onChange: setSelectedMaterial,
      options: ['Visi', 'Alumīnijs', 'Oglekļa šķiedra (Carbon)', 'Tērauds (Hi-Ten / Cr-Mo)'],
    },
    {
      key: 'suspension',
      label: 'Amortizatori',
      value: selectedSuspension,
      onChange: setSelectedSuspension,
      options: ['Visi', 'Priekšējais amortizators (Hardtail)', 'Cietā dakša (Rigid)'],
    },
    {
      key: 'gears',
      label: 'Ātrumu skaits',
      value: selectedGears,
      onChange: setSelectedGears,
      options: ['Visi', '1 ātrums (Balanss / BMX)', '3–8 ātrumi', '9–16 ātrumi', '18–30 ātrumi'],
    },
    {
      key: 'brakes',
      label: 'Bremžu tips',
      value: selectedBrakeType,
      onChange: setSelectedBrakeType,
      options: ['Visi', 'Hidrauliskās disku', 'Mehāniskās disku', 'V-veida un kājas bremze', 'Šosejas / BMX bremzes'],
    },
    {
      key: 'availability',
      label: 'Pieejamība',
      value: selectedAvailability,
      onChange: setSelectedAvailability,
      options: ['Visi', 'Noliktavā Rindas 44', 'Piegāde 2–3 d.d.'],
    },
    {
      key: 'price',
      label: 'Cena',
      value: selectedPriceRange,
      onChange: setSelectedPriceRange,
      options: ['Visi', 'Līdz €350', '€350 – €700', '€700 – €1500', 'Virs €1500'],
    },
  ];

  // Page number helper for pagination UI
  const pageNumbers = useMemo(() => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push('...');
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
        pages.push(i);
      }
      if (safePage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safePage]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* All Bicycle Category Showcase Cards — Placed at the very top */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 font-heading">Velosipēdu kategorijas</h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Visi {BIKES_FOR_SALE.length} pieejamie modeļi no kalnu un gravel līdz pilsētas, bērnu, BMX un E-velosipēdiem
            </p>
          </div>
          {selectedCategory !== 'Visi' && (
            <button
              onClick={() => setSelectedCategory('Visi')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 cursor-pointer shrink-0"
            >
              Skatīt visus ({BIKES_FOR_SALE.length})
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {mainCategories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryTileClick(cat.id)}
                className={`group text-left bg-white rounded-xl overflow-hidden border transition-all cursor-pointer flex flex-col ${
                  isActive
                    ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                    : 'border-stone-200 hover:border-stone-300 shadow-xs hover:shadow-md'
                }`}
              >
                <div className="aspect-4/3 bg-white overflow-hidden relative p-2.5 border-b border-stone-100">
                  <BikeImage
                    src={cat.image}
                    alt={cat.title}
                    loading="lazy"
                    decoding="async"
                    className={`w-full h-full ${
                      cat.id === 'Pārbaudīti lietotie' ? 'object-cover rounded-lg' : 'object-contain'
                    } group-hover:scale-103 transition-transform duration-300`}
                  />
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-stone-900/85 text-white text-[10px] font-bold tabular-nums">
                    {cat.count}
                  </span>
                </div>
                <div className="p-2.5 sm:p-3 text-center space-y-0.5 flex-1 flex flex-col justify-center">
                  <div
                    className={`text-xs sm:text-sm font-bold tracking-tight font-heading leading-tight ${
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

      {/* Header Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-10 border border-stone-800 space-y-8 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="text-xs font-semibold text-amber-400 tracking-wide">
              VentVelo darbojas jau 18 gadus · Rindas iela 44, Ventspils
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-heading text-balance">
              Velosipēdu salons un katalogs ar garantiju
            </h2>
            <p className="text-stone-300 text-sm leading-relaxed">
              Pieejamie Raymon, Unibike, Romet, Tabou, Ecobike, PUKY, S&apos;COOL un Karbon modeļi ar tiešo noliktavas uzskaiti. Izvēlies pasūtīt riteni oriģinālajā kastē vai uztici meistaram pilnu montāžu ar oficiālu garantiju par €35.
            </p>
          </div>

          <div className="bg-stone-800/80 border border-stone-700/80 rounded-xl p-5 text-xs space-y-2.5 shrink-0 lg:w-80">
            <div className="font-semibold text-stone-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>18 gadu pieredze kopš 2008. gada</span>
            </div>
            <p className="text-stone-400 leading-relaxed">
              Nodod savu veco riteni kā pirmo iemaksu klātienē veikalā Rindas ielā 44 vai sadali maksājumu ar Incredit nomaksu. Piegāde ar servisa busiņu Ventspilī, Usmā un Talsos.
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
              <span>Vecais ritenis pirmajai iemaksai (tikai klātienē)</span>
            </div>
            <p className="text-stone-400 leading-relaxed">
              Atved savu esošo velosipēdu uz Rindas ielu 44 — novērtēsim tikai klātienē un ieskaitīsim kā pirmo iemaksu.
            </p>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Incredit nomaksa</span>
            </div>
            <p className="text-stone-400 leading-relaxed">
              Ātra nomaksa no 6 līdz 36 mēnešiem ar pirmo iemaksu no €0. Visas cenas norādītas skaidri bez centiem.
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

      {/* Prominent Incredit & Assembly Offer Banner */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-950 text-white rounded-2xl p-6 border border-emerald-800/80 flex flex-col justify-between gap-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                Incredit Nomaksa · No 6 līdz 36 mēnešiem
              </div>
              <h2 className="text-xl font-bold font-heading text-white">
                Pērc jaunu riteni ar Incredit no €12 mēnesī
              </h2>
              <p className="text-xs text-emerald-100/85 leading-relaxed">
                Noformē Incredit nomaksu attālināti ar Smart-ID / eParaksts vai klātienē Rindas ielā 44. Atmaksas termiņš 6–36 mēneši ar pirmo iemaksu no €0.
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-emerald-400 shrink-0" />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-emerald-200 pt-2 border-t border-emerald-800/70">
            <span>Ātra pieteikuma izskatīšana</span>
            <span>·</span>
            <span>Pirmā iemaksa no €0</span>
            <span>·</span>
            <span>Parakstīšana ar Smart-ID</span>
          </div>
        </div>

        <div className="bg-amber-500 text-stone-950 rounded-2xl p-6 border border-amber-400 flex flex-col justify-between gap-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-900">
                Vecā riteņa nodošana · Tikai klātienē
              </div>
              <h2 className="text-xl font-bold font-heading text-stone-950">
                Samaini veco riteni un samazini jaunā cenu
              </h2>
              <p className="text-xs text-stone-900/90 leading-relaxed">
                Atved savu esošo velosipēdu uz mūsu veikalu Rindas ielā 44, Ventspilī — tikai klātienē 15 minūtēs novērtēsim to un ieskaitīsim jaunā velosipēda cenā.
              </p>
            </div>
            <Award className="w-8 h-8 text-stone-900 shrink-0" />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold text-stone-900 pt-2 border-t border-stone-950/15">
            <span>Tikai klātienē Rindas ielā 44</span>
            <span>·</span>
            <span>Tūlītējs cenas samazinājums</span>
            <span>·</span>
            <span>Der arī ar +€35 montāžu</span>
          </div>
        </div>
      </section>

      {/* Search & Multi-Parameter Filter Bar */}
      <section ref={filterBarRef} className="space-y-4">
        {/* Search Input & Quick Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Meklēt modeli, zīmolu vai aprīkojumu (piem., Raymon, Unibike, Gravel, Bosch, PUKY, Deore...)"
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                aria-label="Notīrīt meklēšanu"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            <span className="text-xs text-stone-600 font-medium tabular-nums">
              Atrasti <strong className="text-stone-950">{filteredBikes.length}</strong> modeļi
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'featured' | 'price_asc' | 'price_desc' | 'name')}
              aria-label="Kārtot velosipēdus"
              className="px-3 py-2.5 text-xs font-medium bg-white border border-stone-200 rounded-xl text-stone-800 cursor-pointer focus:outline-none focus:border-stone-900 shadow-xs"
            >
              <option value="featured">Ieteicamie vispirms</option>
              <option value="price_asc">Cena, no lētākās</option>
              <option value="price_desc">Cena, no dārgākās</option>
              <option value="name">Nosaukums A–Ž</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-4">
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
                  <div className="absolute left-0 top-full mt-1.5 z-30 min-w-[220px] max-w-[85vw] max-h-72 overflow-y-auto bg-white border border-stone-200 rounded-xl shadow-xl p-1.5 space-y-0.5">
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
      </section>

      {/* Product Grid */}
      <div ref={catalogGridRef} className="space-y-8">
        {filteredBikes.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-3">
            <p className="text-sm font-semibold text-stone-900">
              Pēc izvēlētajiem filtriem velosipēdi netika atrasti.
            </p>
            <p className="text-xs text-stone-500">
              Pamēģini noņemt kādu no filtriem vai sazinies ar mūsu meistaru par individuālu pasūtījumu.
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 cursor-pointer"
              >
                Rādīt visus velosipēdus
              </button>
              <a
                href="https://wa.me/37127583888"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg"
              >
                Rakstīt meistaram WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedBikes.map((bike) => {
                const discountEur = bike.originalPriceEur ? bike.originalPriceEur - bike.priceEur : 0;
                const isRefurbished = bike.condition === 'Certified Refurbished';
                return (
                  <div
                    key={bike.id}
                    className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    {/* Image container */}
                    <div
                      className={`relative aspect-4/3 ${isRefurbished ? 'bg-stone-100' : 'bg-white p-3'} overflow-hidden cursor-pointer border-b border-stone-100`}
                      onClick={() => handleOpenBikeDetails(bike)}
                    >
                      <BikeImage
                        src={bike.image}
                        alt={bike.name}
                        loading="lazy"
                        decoding="async"
                        className={`w-full h-full ${
                          isRefurbished ? 'object-cover' : 'object-contain'
                        } group-hover:scale-103 transition-transform duration-300`}
                      />

                      {discountEur > 0 && (
                        <div className="absolute top-3 left-3 bg-amber-500 text-stone-950 text-[11px] font-bold px-2.5 py-0.5 rounded shadow-xs font-mono tabular-nums">
                          -{formatPrice(discountEur)}
                        </div>
                      )}

                      {bike.year && (
                        <div className="absolute top-3 right-3 bg-stone-100 text-stone-700 text-[10px] font-bold px-2 py-0.5 rounded border border-stone-200 tabular-nums">
                          {bike.year}
                        </div>
                      )}

                      <div className="absolute bottom-3 left-3 bg-stone-950/85 backdrop-blur-md text-stone-100 text-[11px] font-medium px-2.5 py-1 rounded border border-stone-700">
                        {bike.availabilityStatus}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                          <span className="font-semibold text-stone-800">{bike.brand}</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{bike.category}</span>
                          {bike.riderType && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="shrink-0">{bike.riderType}</span>
                            </>
                          )}
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
                              Incredit no <strong className="text-stone-800">{formatPrice(monthlyEstimate(bike.priceEur))}/mēn.</strong>
                            </div>
                          </div>

                          <div className="text-xs text-emerald-700 font-medium flex items-center gap-1 shrink-0">
                            <Check className="w-3.5 h-3.5" />
                            <span>{bike.inStockCount} gab.</span>
                          </div>
                        </div>

                        <div className="bg-emerald-50 border border-emerald-200/80 text-emerald-950 px-3 py-1.5 rounded-lg text-[11px] flex items-center justify-between tabular-nums">
                          <span className="font-bold">Incredit nomaksa</span>
                          <span>no {formatPrice(monthlyEstimate(bike.priceEur))}/mēn. · €0 pirmā iemaksa</span>
                        </div>

                        <div className="text-[11px] text-stone-500 bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-100">
                          Kastē (€0, bez garantijas) vai <strong className="text-stone-800">+€35 salikts ar garantiju</strong>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => handleOpenBikeDetails(bike)}
                            className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
                          >
                            Specifikācija / Izmērs
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

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-200">
                <div className="text-xs text-stone-500 tabular-nums">
                  Rādīti {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredBikes.length)} no{' '}
                  <strong className="text-stone-900">{filteredBikes.length}</strong> modeļiem (lapa {safePage} no {totalPages})
                </div>

                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => goToPage(safePage - 1)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Iepriekšējā</span>
                  </button>

                  {pageNumbers.map((p, i) =>
                    p === '...' ? (
                      <span key={`ellipsis_${i}`} className="px-2 text-xs text-stone-400">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => goToPage(p)}
                        className={`min-w-[32px] h-8 px-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer tabular-nums ${
                          safePage === p
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => goToPage(safePage + 1)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span className="hidden sm:inline">Nākamā</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detailed Bike Modal */}
      {selectedBike && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
            {/* Modal Header */}
            <div className="bg-stone-900 text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
              <div className="flex items-center gap-2 text-xs min-w-0">
                <span className="text-amber-400 font-semibold shrink-0">{selectedBike.brand}</span>
                <span className="text-stone-500">·</span>
                <span className="text-stone-300 truncate">{selectedBike.category}</span>
                {selectedBike.year && (
                  <>
                    <span className="text-stone-500 hidden sm:inline">·</span>
                    <span className="text-stone-400 hidden sm:inline">{selectedBike.year}</span>
                  </>
                )}
              </div>
              <button
                onClick={() => setSelectedBike(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
                aria-label="Aizvērt logu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div
              ref={modalBodyRef}
              onScroll={checkModalScroll}
              className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 relative"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
                {/* Left: Image & Desktop Highlights */}
                <div className="md:col-span-5 space-y-4">
                  <div
                    className={`rounded-xl overflow-hidden ${
                      selectedBike.condition === 'Certified Refurbished' ? 'bg-stone-100' : 'bg-white p-3'
                    } border border-stone-200 h-44 sm:h-52 md:h-auto md:aspect-4/3 relative`}
                  >
                    <BikeImage
                      src={selectedBike.image}
                      alt={selectedBike.name}
                      className={`w-full h-full ${
                        selectedBike.condition === 'Certified Refurbished' ? 'object-cover' : 'object-contain'
                      }`}
                    />
                    <div className="absolute bottom-2.5 left-2.5 bg-stone-950/90 text-white text-[11px] sm:text-xs px-2.5 py-1 rounded backdrop-blur-sm flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        {assemblyOption === 'assembled'
                          ? `${selectedBike.guaranteeMonths} mēnešu garantija`
                          : 'Kastē – bez garantijas'}
                      </span>
                    </div>
                  </div>

                  {/* Specs summary mini grid (Desktop right under photo; shown below options on mobile) */}
                  <div className="hidden md:grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-100">
                      <span className="text-stone-500 block text-[11px]">Ātrumi / Sistēma</span>
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
                      <span className="text-stone-500 block text-[11px]">Svars / Noliktavā</span>
                      <span className="font-semibold text-stone-900 font-mono">
                        {selectedBike.specs.weightKg} kg · {selectedBike.inStockCount} gab.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Contiguous Purchase Module (Immediately visible on mobile right below compact photo) */}
                <div className="md:col-span-7 space-y-4 sm:space-y-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-heading leading-tight">
                      {selectedBike.name}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-stone-500">
                      {selectedBike.riderType && <span>Modelis: {selectedBike.riderType}</span>}
                      {selectedBike.sku && (
                        <>
                          <span>·</span>
                          <span className="font-mono">Kods: {selectedBike.sku}</span>
                        </>
                      )}
                      <span>·</span>
                      <span className="text-emerald-700 font-semibold">Pieejami {selectedBike.inStockCount} gab.</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-baseline gap-2.5">
                      <span className="text-2xl sm:text-3xl font-bold text-stone-950 font-mono tabular-nums">
                        {formatPrice(getFinalPrice(selectedBike))}
                      </span>
                      {selectedBike.originalPriceEur && (
                        <span className="text-sm text-stone-400 line-through font-mono tabular-nums">
                          {formatPrice(selectedBike.originalPriceEur)}
                        </span>
                      )}
                      <span className="text-xs text-stone-600 tabular-nums">
                        ar PVN · Incredit nomaksa no{' '}
                        <strong>{formatPrice(monthlyEstimate(getFinalPrice(selectedBike)))}/mēn.</strong>
                      </span>
                    </div>
                  </div>

                  {/* Frame Size Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-2">
                      Rāmja / riteņa izmērs:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedBike.sizesAvailable.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 py-2 text-xs font-semibold rounded-lg border cursor-pointer transition-colors ${
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

                  {/* Assembly Choice */}
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
                            Pilnībā samontēts un noregulēts ar {selectedBike.guaranteeMonths} mēnešu VentVelo darbnīcas garantiju. Piegāde ar busiņu pēc izvēles vai saņemšana veikalā Rindas ielā 44 jau gatavu braukšanai!
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

                  {/* Trade-In Option — In Person Only */}
                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-1.5 text-xs">
                    <div className="font-bold text-stone-900 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        Nodod savu veco riteni kā pirmo iemaksu
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-900 text-amber-400 px-2 py-0.5 rounded shrink-0">
                        Tikai klātienē
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      Vecā velosipēda novērtēšana un ieskaitīšana kā pirmā iemaksa pieejama <strong>tikai klātienē</strong> veikalā Rindas ielā 44, Ventspilī — pēc meistara apskates uz vietas.
                    </p>
                  </div>

                  {/* Mobile Specs summary mini grid */}
                  <div className="grid md:hidden grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-100">
                      <span className="text-stone-500 block text-[11px]">Ātrumi / Sistēma</span>
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
                      <span className="text-stone-500 block text-[11px]">Svars / Noliktavā</span>
                      <span className="font-semibold text-stone-900 font-mono">
                        {selectedBike.specs.weightKg} kg · {selectedBike.inStockCount} gab.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Technical Specifications from Partner Feed */}
              {selectedBike.specsList && selectedBike.specsList.length > 0 && (
                <div className="pt-4 border-t border-stone-200 space-y-3">
                  <h4 className="font-bold text-stone-900 text-sm font-heading">Tehniskā specifikācija</h4>
                  {selectedBike.descriptionText && (
                    <p className="text-xs text-stone-600 leading-relaxed">{selectedBike.descriptionText}</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs bg-stone-50 border border-stone-200/80 rounded-xl p-4">
                    {selectedBike.specsList.map((spec, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-3 py-1.5 border-b border-stone-200/60 last:border-b-0"
                      >
                        <span className="text-stone-500 shrink-0">{spec.label}:</span>
                        <span className="font-medium text-stone-900 text-right">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                      <span>Incredit Nomaksas piedāvājums</span>
                    </h4>
                  </div>
                  <div className="bg-emerald-900/70 border border-emerald-700/70 rounded-lg p-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-emerald-200">Incredit nomaksa (6–36 mēn.)</div>
                      <div className="text-[11px] text-emerald-200/80 mt-0.5">
                        €0 pirmā iemaksa · Smart-ID vai eParaksts
                      </div>
                    </div>
                    <div className="text-base font-bold font-mono text-white tabular-nums shrink-0">
                      no {formatPrice(monthlyEstimate(getFinalPrice(selectedBike)))} / mēn.
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-100/85 leading-relaxed">
                    Nākamajā solī vari izvēlēties Incredit nomaksu (6–36 mēn.) ar sev vēlamo pirmo iemaksu. VentVelo — 18 gadi pieredzes Ventspilī!
                  </p>
                </div>
              </div>
            </div>

            {/* Clear Scroll-Down Indicator Bar */}
            {showScrollHint && (
              <button
                type="button"
                onClick={() => modalBodyRef.current?.scrollBy({ top: 260, behavior: 'smooth' })}
                className="w-full py-2 px-4 bg-amber-50 hover:bg-amber-100 border-t border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors"
              >
                <span>Ritini uz leju: specifikācija, komplektācija (+€35) un līzings</span>
                <ChevronDown className="w-4 h-4 animate-bounce shrink-0" />
              </button>
            )}

            {/* Compact Modal Footer */}
            <div className="bg-stone-50 px-4 py-3 sm:px-6 sm:py-4 border-t border-stone-200 flex items-center justify-between gap-2.5 shrink-0">
              <button
                onClick={() => setSelectedBike(null)}
                className="hidden sm:inline-block px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer text-left"
              >
                Aizvērt
              </button>

              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => handleAddToCartFromModal(selectedBike)}
                  className="px-3 sm:px-4 py-2.5 text-xs font-semibold text-stone-800 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg transition-colors cursor-pointer text-center"
                >
                  Ielikt grozā
                </button>
                <button
                  onClick={() => handleDirectBuyFromModal(selectedBike)}
                  className="px-3 sm:px-6 py-2.5 text-xs font-semibold text-stone-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors cursor-pointer shadow-md font-heading text-center truncate"
                >
                  Pirkt / Līzings ({formatPrice(getFinalPrice(selectedBike))})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
