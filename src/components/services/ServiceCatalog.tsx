import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SERVICE_PACKAGES, CUSTOM_REPAIR_ITEMS, VAN_PICKUP_ZONES, WORKSHOP_BRANCHES } from '../../data/mockData';
import { 
  Check, 
  Wrench, 
  Clock, 
  ShieldCheck, 
  Truck, 
  MapPin, 
  Search, 
  ArrowRight, 
  Sparkles,
  PhoneCall
} from 'lucide-react';

export const ServiceCatalog: React.FC = () => {
  const { 
    formatPrice, 
    openBookingWithService, 
    setActiveTab, 
    setSelectedTrackingJob, 
    jobs,
    showToast 
  } = useApp();

  const [trackingInput, setTrackingInput] = useState('');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingInput.trim()) return;
    const clean = trackingInput.trim().toUpperCase();
    const found = jobs.find(j => j.trackingCode.toUpperCase() === clean);
    if (found) {
      setSelectedTrackingJob(found);
      setActiveTab('dashboard');
      showToast(`Atrasts remonta ieraksts velosipēdam ${found.bikeModel}`);
    } else {
      showToast(`Kods ${clean} nav atrasts. Izmēģini demo kodu: VV-8492-LV`);
    }
  };

  return (
    <div className="space-y-16 py-8">
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 shadow-xl">
          <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-3 py-1 rounded-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Vadošā velodarbnīca un izbraukuma serviss Kurzemē</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15] font-heading">
              Meistara roku darbs un servisa buss līdz namdurvīm.
            </h1>

            <p className="text-stone-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              No precīzas ratu spieķošanas un taisnošanas līdz 100% pilnai rāmja pārlasīšanai (<em>kapitālajam remontam</em>) un e-skrejriteņu elektronikai. Paņemam un atvedam Tavu ričuku <strong className="text-white">Ventspilī, Usmā un Talsos</strong>.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => openBookingWithService()}
                className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold rounded-lg transition-colors flex items-center gap-2 text-sm shadow-md cursor-pointer"
              >
                <Wrench className="w-4 h-4" />
                <span>Pieteikt servisu un busiņu</span>
              </button>

              <button
                onClick={() => setActiveTab('bikes')}
                className="px-6 py-3.5 bg-stone-800 hover:bg-stone-700 text-stone-100 font-medium rounded-lg transition-colors text-sm border border-stone-700 cursor-pointer"
              >
                Velosipēdi pārdošanā
              </button>
            </div>

            {/* Quick Live Tracking Input Bar */}
            <div className="pt-4 border-t border-stone-800">
              <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row items-stretch gap-2 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder="Izsekošanas kods (piem., VV-8492-LV)"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-stone-950/80 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-200 rounded-lg transition-colors cursor-pointer shrink-0 border border-stone-700"
                >
                  Pārbaudīt statusu
                </button>
              </form>
              <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-2">
                <span>Aktīva remonta parauga kods:</span>
                <button 
                  type="button"
                  onClick={() => { setTrackingInput('VV-8492-LV'); }}
                  className="text-amber-400 hover:underline cursor-pointer font-mono"
                >
                  VV-8492-LV
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 h-72 lg:h-full relative min-h-[360px]">
            <img
              src="/src/assets/images/hero_bicycle_workshop_1794340029993.jpg"
              alt="VentVelo darbnīca Rindas ielā 44"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-stone-900 lg:via-transparent lg:to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 bg-stone-950/90 backdrop-blur-md border border-stone-800 p-3 rounded-lg text-xs text-stone-300">
              <span className="font-semibold text-stone-100">Rindas iela 44:</span> Sertificēti Park Tool remonta statīvi un ultraskaņas vannas.
            </div>
          </div>
        </div>
      </section>

      {/* Regional Mobile Van Feature Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-stone-100 border border-stone-200 rounded-2xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1 rounded-xl overflow-hidden border border-stone-300 shadow-md">
            <img
              src="/src/assets/images/service_van_mobile_repair_1794340031954.jpg"
              alt="VentVelo servisa busiņš Kurzemē"
              referrerPolicy="no-referrer"
              className="w-full h-64 sm:h-72 object-cover"
            />
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
              <Truck className="w-4 h-4" />
              <span>Serviss tieši pie Tavām namdurvīm</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 font-heading">
              Nav ērti atvest velosipēdu uz darbnīcu? Servisa busiņš atbrauks pie Tevis.
            </h2>

            <p className="text-stone-600 text-sm leading-relaxed">
              Mēs uzturam speciāli aprīkotu servisa furgonu, kas regulāri apkalpo <strong className="text-stone-900">Ventspils pilsētu, Usmas ezera piekrasti un Talsu novadu</strong>. Savācam velosipēdu no Tavām mājām, darba vietas vai kempinga, droši nostiprinām iekšējos statīvos, darbnīcā saremontējam un atvedam atpakaļ gatavu braukšanai.
            </p>

            {/* Zone breakdown mini grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {VAN_PICKUP_ZONES.map(z => (
                <div key={z.region} className="bg-white border border-stone-200 rounded-lg p-3 text-xs shadow-xs">
                  <div className="font-bold text-stone-900 text-sm">{z.region}</div>
                  <div className="text-stone-500 mt-0.5">{z.distanceKm}</div>
                  <div className="mt-2 text-amber-600 font-semibold">{formatPrice(z.feeEur)} brauciens</div>
                  <div className="text-[11px] text-stone-400">Bezmaksas no {formatPrice(z.freeThresholdEur)}</div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveTab('van_fleet')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-900 hover:text-amber-600 transition-colors cursor-pointer"
              >
                <span>Skatīt visus busiņa nedēļas grafikus un apkalpošanas zonu karti</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Service Packages */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-950 tracking-tight font-heading">
            Skaidras remonta un apkopju paketes
          </h2>
          <p className="text-stone-600 text-sm">
            Fiksētas darba izmaksas bez slēptiem pārsteigumiem. Katrai apkopei tiek izsniegts oficiāls meistara garantijas sertifikāts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICE_PACKAGES.map((pkg) => (
            <div 
              key={pkg.id} 
              className={`rounded-2xl border transition-all flex flex-col justify-between bg-white ${
                pkg.popular 
                  ? 'border-amber-500 shadow-lg ring-1 ring-amber-500/30' 
                  : 'border-stone-200 hover:border-stone-300 shadow-xs'
              }`}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Apm. {pkg.durationHours}h darba
                  </span>
                  {pkg.popular && (
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                      Ieteicamā izvēle
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-stone-900 leading-snug">{pkg.name}</h3>
                  <p className="text-xs text-stone-500 mt-0.5 italic">{pkg.nameLv}</p>
                </div>

                <div className="py-2 border-y border-stone-100 flex items-baseline justify-between">
                  <div className="text-2xl font-bold text-stone-950 font-mono tabular-nums">
                    {formatPrice(pkg.priceEur)}
                  </div>
                  <div className="text-xs text-stone-500 flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{pkg.guaranteeMonths} mēn. garantija</span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {pkg.description}
                </p>

                <div className="space-y-2 pt-2">
                  <p className="text-[11px] font-semibold text-stone-800 uppercase tracking-wider">Ietvertie darbi:</p>
                  <ul className="space-y-1.5 text-xs text-stone-600">
                    {pkg.checklist.slice(0, 4).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="leading-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => openBookingWithService(pkg.id)}
                  className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    pkg.popular
                      ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                      : 'bg-stone-900 hover:bg-stone-800 text-white'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Pieteikt šo apkopi</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Component Level Repairs & Add-ons */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-stone-900 font-heading">Atsevišķu mezglu remonti un regulēšana</h3>
              <p className="text-xs text-stone-500 mt-1">
                Darba izcenojumi konkrētiem uzdevumiem (detaļu izmaksas tiek saskaņotas atsevišķi pirms montāžas).
              </p>
            </div>
            <button
              onClick={() => openBookingWithService()}
              className="px-4 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
            >
              Cita nestandarta vēlme
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CUSTOM_REPAIR_ITEMS.map((item) => (
              <div key={item.id} className="border border-stone-100 bg-stone-50/70 p-4 rounded-xl flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-stone-900">{item.name}</div>
                  <div className="text-xs text-stone-500 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>Apm. {item.estimatedTime}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-stone-950 font-mono tabular-nums">
                    {formatPrice(item.priceEur)}
                  </div>
                  <button
                    onClick={() => openBookingWithService()}
                    className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
                  >
                    + Pievienot darbu
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workshop Physical Drop-off Locations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border-t border-stone-200 pt-10">
          <h3 className="text-xl font-bold text-stone-900 mb-6 font-heading">Vai iegriezies mūsu darbnīcā klātienē Ventspilī</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {WORKSHOP_BRANCHES.map(branch => (
              <div key={branch.id} className="bg-white border border-stone-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-stone-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    {branch.name}
                  </h4>
                  {branch.isMain && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                      Galvenā darbnīca
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600">{branch.address}</p>
                <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {branch.hours}
                  </span>
                  <a href={`tel:${branch.phone}`} className="font-semibold text-stone-800 hover:text-amber-600 flex items-center gap-1">
                    <PhoneCall className="w-3 h-3" />
                    {branch.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
