import React from 'react';
import { useApp } from '../../context/AppContext';
import { VAN_PICKUP_ZONES } from '../../data/mockData';
import { 
  Truck, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Check, 
  Wrench, 
  Compass, 
  PhoneCall, 
  Sparkles 
} from 'lucide-react';
import serviceVanImg from '../../assets/images/service_van_mobile_repair_1794340031954.jpg';

export const MobileVanFleet: React.FC = () => {
  const { formatPrice, openBookingWithService } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      
      {/* Fleet Hero */}
      <div className="bg-stone-900 text-white rounded-2xl overflow-hidden border border-stone-800 shadow-xl grid grid-cols-1 lg:grid-cols-12 items-center">
        <div className="lg:col-span-7 p-8 sm:p-12 space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-3 py-1 rounded-md">
            <Truck className="w-3.5 h-3.5" />
            <span>VentVelo mobilās darbnīcas loģistika</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-heading">
            Velosipēdu savākšana un piegāde Ventspilī, Usmā un Talsos.
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Vairs nekādas smagu e-velo stiepšanas vai dubļainu velosipēdu stūķēšanas vieglā auto bagāžniekā. Mūsu pilnībā aprīkotais Mercedes Sprinter servisa buss ieradīsies tieši pie Tavām mājām, brīvdienu mājas vai darba vietas, paņems velosipēdu un atvedīs atpakaļ gatavu, tīru un ar garantiju.
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <button
              onClick={() => openBookingWithService()}
              className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold rounded-lg transition-colors flex items-center gap-2 text-sm shadow-md cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              <span>Pieteikt busiņa izbraukumu</span>
            </button>
            <a
              href="tel:+37127583888"
              className="px-5 py-3.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm font-medium rounded-lg transition-colors border border-stone-700 flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-amber-400" />
              <span>Dispečera tālrunis: +371 27583888</span>
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 h-72 lg:h-full min-h-[340px] relative">
          <img
            src={serviceVanImg}
            alt="VentVelo servisa busiņš Kurzemē"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Regional Zones Breakdown */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-heading">
            Reģionālais iknedēļas izbraukumu grafiks
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Skaidri definētas apkalpošanas zonas un regulārie reisi, lai pakalpojums būtu ātrs un izdevīgs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VAN_PICKUP_ZONES.map(zone => (
            <div key={zone.region} className="bg-white border border-stone-200 rounded-2xl p-6 space-y-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 uppercase tracking-wider">
                    {zone.region} zona
                  </span>
                  <span className="text-xs text-stone-500 font-mono">
                    {zone.distanceKm}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-stone-900">{zone.displayName}</h3>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    {zone.coverageNote}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-stone-700">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-stone-500" />
                      Izbraukumu dienas:
                    </span>
                    <span className="font-semibold text-stone-900">{zone.pickupDays.join(', ')}</span>
                  </div>

                  <div className="flex items-center justify-between text-stone-700">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-stone-500" />
                      Izpildes ātrums:
                    </span>
                    <span className="text-stone-900">{zone.estimatedLeadTime}</span>
                  </div>
                </div>

                <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-stone-500 block text-[11px]">Savākšanas un atvešanas maksa</span>
                    <span className="font-bold text-stone-900 font-mono text-base tabular-nums">
                      {formatPrice(zone.feeEur)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-700 font-semibold block text-[11px]">Bezmaksas slieksnis</span>
                    <span className="text-stone-600">Ja apkope virs {formatPrice(zone.freeThresholdEur)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => openBookingWithService()}
                  className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pieteikt {zone.region} zonā</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Onboard Van Specifications */}
      <div className="bg-stone-100 border border-stone-200 rounded-2xl p-6 sm:p-10 space-y-6">
        <h3 className="text-xl font-bold text-stone-900 font-heading">
          Servisa busa borta aprīkojums un drošība
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 max-w-3xl leading-relaxed">
          VentVelo servisa transports nav vienkāršs kravas auto – tas ir aprīkots ar Park Tool remonta statīvu ātriem lauka darbiem, Bosch e-velo datoru diagnostiku, amortizatoru sūkņiem un mīkstajiem Thule iekšējiem stiprinājumiem, kas pilnībā izslēdz rāmju saskaršanos ceļā.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-1.5">
            <div className="font-bold text-stone-900 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-amber-500" />
              <span>Droši iekšējie dakšu turētāji</span>
            </div>
            <p className="text-stone-500">Mīkstināti stiprinājumi nodrošina, ka velosipēdi transportēšanas laikā nesaskaras un netiek saskrāpēti.</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-1.5">
            <div className="font-bold text-stone-900 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-amber-500" />
              <span>Bosch un Shimano diagnostika</span>
            </div>
            <p className="text-stone-500">Iebūvēts borta planšetdators kļūdu nolasīšanai un bateriju pārbaudei tieši uz vietas.</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-1.5">
            <div className="font-bold text-stone-900 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-amber-500" />
              <span>Bezkontakta maksājumu terminālis</span>
            </div>
            <p className="text-stone-500">Šoferis pieņem bankas kartes, Apple Pay, Google Pay vai skaidru naudu tieši pie Tavām durvīm.</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-1.5">
            <div className="font-bold text-stone-900 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-amber-500" />
              <span>Evakuācija no Kurzemes takām</span>
            </div>
            <p className="text-stone-500">Salūzi pie Usmas ezera vai meža takās? Zvani uz dispečera tālruni, un mēs atbrauksim palīgā.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
