import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Database, 
  FileCheck, 
  Check, 
  Server, 
  EyeOff 
} from 'lucide-react';

export const SecurityModal: React.FC = () => {
  const { isSecurityModalOpen, setIsSecurityModalOpen } = useApp();

  if (!isSecurityModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-stone-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white font-heading">Datu drošības un privātuma standarti</h3>
          </div>
          <button 
            onClick={() => setIsSecurityModalOpen(false)}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-stone-600 leading-relaxed">
          
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-stone-900">
            <h4 className="font-bold text-sm text-stone-950 mb-1 flex items-center gap-1.5 font-heading">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>Eiropas Savienības GDPR un banku līmeņa norēķinu drošība</span>
            </h4>
            <p className="text-stone-700">
              VentVelo darbojas stingrā saskaņā ar Eiropas Savienības Vispārīgo datu aizsardzības regulu (GDPR) un PCI-DSS 1. līmeņa prasībām, garantējot klientu personas datu un īpašuma neaizskaramību.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-stone-200 rounded-xl p-4 space-y-2 bg-stone-50/50">
              <div className="font-bold text-stone-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                <span>256-bitu TLS/SSL šifrēšana</span>
              </div>
              <p className="text-stone-500">
                Visa datu apmaiņa starp Tavu ierīci un darbnīcas serveri notiek caur modernu un drošu TLS 1.3 protokolu.
              </p>
            </div>

            <div className="border border-stone-200 rounded-xl p-4 space-y-2 bg-stone-50/50">
              <div className="font-bold text-stone-900 flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-amber-500" />
                <span>Karšu datu neturēšana serverī</span>
              </div>
              <p className="text-stone-500">
                Maksājumu karšu dati tiek pārvērsti drošos marķieros. Mūsu serveros netiek saglabāti pilnie karšu numuri vai CVC kodi.
              </p>
            </div>

            <div className="border border-stone-200 rounded-xl p-4 space-y-2 bg-stone-50/50">
              <div className="font-bold text-stone-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-500" />
                <span>Rāmju numuru reģistra aizsardzība</span>
              </div>
              <p className="text-stone-500">
                Velosipēdu rāmja numuri un servisa vēsture tiek glabāta slēgtā reģistrā, kam piekļuve ir tikai sertificētiem darbnīcas meistariem.
              </p>
            </div>

            <div className="border border-stone-200 rounded-xl p-4 space-y-2 bg-stone-50/50">
              <div className="font-bold text-stone-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-500" />
                <span>Tiesības uz datu dzēšanu un eksportu</span>
              </div>
              <p className="text-stone-500">
                Klients jebkurā brīdī var pieprasīt savu servisa grāmatiņas datu eksportu vai pilnīgu profila dzēšanu saskaņā ar regulu.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-stone-200">
            <h5 className="font-bold text-stone-900 font-heading">Darbnīcu un servisa busa fiziskā drošība:</h5>
            <ul className="space-y-1.5 text-stone-600">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Servisa busiņš ir aprīkots ar GPS izsekošanu un drošiem iekšējiem hidrauliskajiem rāmju stiprinājumiem.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Darbnīcā Ventspilī (Rindas ielā 44) ir 24/7 apsardzes signalizācija un apdrošināta telpa.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Katra meistara atzīme uz garantijas sertifikāta tiek fiksēta ar nemainīgu digitālu reģistrācijas numuru.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-6 py-3 border-t border-stone-200 flex justify-end shrink-0">
          <button
            onClick={() => setIsSecurityModalOpen(false)}
            className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg cursor-pointer"
          >
            Sapratu, viss skaidrs
          </button>
        </div>

      </div>
    </div>
  );
};
