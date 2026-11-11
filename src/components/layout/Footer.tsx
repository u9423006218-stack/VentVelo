import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Truck, 
  CreditCard, 
  Lock 
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab, setIsSecurityModalOpen } = useApp();

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 text-sm">
      {/* Upper Regional Delivery & Security Strip */}
      <div className="border-b border-stone-800/80 bg-stone-900/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3.5">
            <Truck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-stone-100 font-semibold text-sm">Servisa buss līdz namdurvīm</h4>
              <p className="text-stone-400 text-xs mt-1 leading-relaxed">
                Savācam un piegādājam Ventspils pilsētā, pie Usmas ezera un Talsu novadā. Droši vedam uz darbnīcu un atpakaļ.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-stone-100 font-semibold text-sm">VentVelo meistara garantija</h4>
              <p className="text-stone-400 text-xs mt-1 leading-relaxed">
                2 gadu garantija jauniem velosipēdiem, 1 gads pārlasītiem lietotajiem un 2 līdz 12 mēneši visiem veiktajiem darbiem darbnīcā.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-stone-100 font-semibold text-sm">Droši norēķini vairākās valūtās</h4>
              <p className="text-stone-400 text-xs mt-1 leading-relaxed">
                256-bitu SSL šifrēti maksājumi EUR, USD, GBP, PLN un SEK valūtās caur Latvijas komercbanku BankLink vai ar bankas karti.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Locations */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Col 1: Brand & Atelier */}
        <div className="space-y-4">
          <div className="text-2xl font-bold font-heading text-white">
            <span className="text-amber-500">Vent</span>Velo
          </div>
          <p className="text-stone-400 text-xs leading-relaxed">
            Galvenā velosipēdu un e-skrejriteņu darbnīca Ventspilī. Diagnostika, pilnā mezglu pārlasīšana, ratu taisnošana, e-mobilitātes serviss un izbraukuma loģistika Kurzemē.
          </p>
          <div className="flex items-center gap-2 pt-2 text-xs text-stone-400">
            <CreditCard className="w-4 h-4 text-stone-500" />
            <span>Swedbank · SEB · Citadele · Luminor · Visa · Apple Pay</span>
          </div>
        </div>

        {/* Col 2: Physical Workshop */}
        <div className="space-y-3">
          <h4 className="text-stone-100 font-semibold text-xs tracking-wider uppercase">Darbnīcas adrese</h4>
          <div className="space-y-3 text-xs text-stone-400">
            <div className="border border-stone-800 rounded p-2.5 bg-stone-900/40">
              <p className="font-semibold text-stone-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                VentVelo darbnīca un salons
              </p>
              <p className="mt-0.5">Rindas iela 44, Ventspils, LV-3602 (Pārventa)</p>
              <p className="text-stone-500 mt-1 flex items-center gap-1">
                <Phone className="w-3 h-3" /> +371 27583888
              </p>
              <p className="text-stone-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Pirmd. – Piektd.: 10:00 – 18:00
              </p>
            </div>
          </div>
        </div>

        {/* Col 3: Van Zones */}
        <div className="space-y-3">
          <h4 className="text-stone-100 font-semibold text-xs tracking-wider uppercase">Busa izbraukuma zonas</h4>
          <ul className="space-y-2 text-xs text-stone-400">
            <li className="flex items-center justify-between border-b border-stone-800 pb-1.5">
              <span className="text-stone-300 font-medium">Ventspils pilsēta un osta</span>
              <span className="text-amber-400">Katru darba dienu</span>
            </li>
            <li className="flex items-center justify-between border-b border-stone-800 pb-1.5">
              <span className="text-stone-300 font-medium">Usmas ezers un pagasts</span>
              <span className="text-amber-400">Pirmd. · Trešd. · Piektd.</span>
            </li>
            <li className="flex items-center justify-between border-b border-stone-800 pb-1.5">
              <span className="text-stone-300 font-medium">Talsu pilsēta un koridors</span>
              <span className="text-amber-400">Otrd. · Ceturtd.</span>
            </li>
            <li className="pt-1 text-[11px] text-stone-500">
              Avārijas savākšana un tehniska palīdzība ceļā pieejama pa tālruni.
            </li>
          </ul>
        </div>

        {/* Col 4: Navigation & Privacy */}
        <div className="space-y-3">
          <h4 className="text-stone-100 font-semibold text-xs tracking-wider uppercase">Saites un palīdzība</h4>
          <ul className="space-y-2 text-xs text-stone-400">
            <li>
              <button 
                onClick={() => setActiveTab('services')}
                className="hover:text-amber-400 transition-colors cursor-pointer"
              >
                Pieteikt velosipēda apkopi
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('bikes')}
                className="hover:text-amber-400 transition-colors cursor-pointer"
              >
                Pārbaudīti velosipēdi ar garantiju
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('accessories')}
                className="hover:text-amber-400 transition-colors cursor-pointer"
              >
                Aksesuāru un detaļu katalogs
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="hover:text-amber-400 transition-colors cursor-pointer"
              >
                Mana velogaraža un remonta statuss
              </button>
            </li>
            <li>
              <button 
                onClick={() => setIsSecurityModalOpen(true)}
                className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5 text-stone-300"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Privātuma politika un GDPR</span>
              </button>
            </li>
          </ul>
          <div className="pt-3 text-xs text-stone-500 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            <a href="mailto:ventvelo@ventvelo.lv" className="hover:text-amber-400">ventvelo@ventvelo.lv</a>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-stone-800/80 py-4 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} SIA VentVelo. Visas tiesības aizsargātas. Ventspils, Latvija.</p>
          <div className="flex items-center gap-4">
            <span className="text-stone-400">Reģ. Nr. 40003000000 · PVN maksātājs</span>
            <span>·</span>
            <button 
              onClick={() => setIsSecurityModalOpen(true)} 
              className="hover:text-stone-300 transition-colors cursor-pointer"
            >
              Datu aizsardzība un noteikumi
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
