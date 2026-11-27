import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  ShieldCheck,
  Lock,
  CreditCard,
  Truck,
  RotateCcw,
  FileText,
  Building2,
  Check,
  Database,
  EyeOff,
} from 'lucide-react';

type PolicySection = 'all' | 'payments' | 'delivery' | 'returns' | 'privacy';

const TABS: { id: PolicySection; label: string }[] = [
  { id: 'all', label: 'Visi noteikumi' },
  { id: 'payments', label: 'Pirkšana un apmaksa' },
  { id: 'delivery', label: 'Piegāde' },
  { id: 'returns', label: 'Atgriešana un garantija' },
  { id: 'privacy', label: 'Privātums un drošība' },
];

export const SecurityModal: React.FC = () => {
  const { isSecurityModalOpen, setIsSecurityModalOpen } = useApp();
  const [activeSection, setActiveSection] = useState<PolicySection>('all');

  if (!isSecurityModalOpen) return null;

  const show = (section: Exclude<PolicySection, 'all'>) =>
    activeSection === 'all' || activeSection === section;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-stone-200 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-stone-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h3 className="font-bold text-base text-white font-heading">
                Noteikumi, drošības un privātuma politika
              </h3>
              <p className="text-[11px] text-stone-400">
                SIA &ldquo;RGS6&rdquo; (VentVelo) · Reģ. Nr. 40103846622 · PVN LV40103846622
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSecurityModalOpen(false)}
            aria-label="Aizvērt logu"
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Filter Bar */}
        <div className="bg-stone-50 border-b border-stone-200 px-5 sm:px-6 py-2.5 flex flex-wrap gap-1.5 shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeSection === tab.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:text-stone-950 border border-stone-200 hover:border-stone-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-stone-700 leading-relaxed">
          {/* Verified Company Legal Card */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-stone-900">
            <h4 className="font-bold text-sm text-stone-950 mb-2 flex items-center gap-2 font-heading">
              <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Pārdevēja un datu pārziņa rekvizīti</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-stone-700">
              <div>
                <span className="text-stone-500">Nosaukums:</span>{' '}
                <strong className="text-stone-950">SIA &ldquo;RGS6&rdquo;</strong> (zīmols VentVelo)
              </div>
              <div>
                <span className="text-stone-500">Reģ. Nr.:</span>{' '}
                <strong className="font-mono text-stone-950">40103846622</strong>
              </div>
              <div>
                <span className="text-stone-500">PVN maksātāja Nr.:</span>{' '}
                <strong className="font-mono text-stone-950">LV40103846622</strong>
              </div>
              <div>
                <span className="text-stone-500">Tālrunis / WhatsApp:</span>{' '}
                <a href="tel:+37127583888" className="font-semibold text-stone-950 underline">
                  +371 27 583 888
                </a>
              </div>
              <div className="sm:col-span-2">
                <span className="text-stone-500">Juridiskā adrese:</span>{' '}
                <strong className="text-stone-900">
                  &ldquo;Olīva&rdquo;, Usmas pagasts, Ventspils novads, LV-3619, Latvija
                </strong>
              </div>
              <div>
                <span className="text-stone-500">Veikals un darbnīca:</span>{' '}
                <strong className="text-stone-900">Rindas iela 44, Ventspils, LV-3602</strong>
              </div>
              <div>
                <span className="text-stone-500">E-pasts:</span>{' '}
                <a href="mailto:ventspilsvelo@gmail.com" className="font-semibold text-stone-950 underline">
                  ventspilsvelo@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* 1. Pirkšanas un apmaksas noteikumi */}
          {show('payments') && (
            <section className="space-y-3 border border-stone-200 rounded-xl p-4 sm:p-5 bg-white">
              <h4 className="font-bold text-sm text-stone-950 flex items-center gap-2 font-heading">
                <CreditCard className="w-4 h-4 text-amber-600 shrink-0" />
                <span>1. Pirkšanas un apmaksas noteikumi</span>
              </h4>
              <p className="text-stone-600">
                Visas preču un servisa pakalpojumu cenas interneta veikalā ir norādītas ar iekļautu PVN (21%).
                Norēķinus iespējams veikt EUR, kā arī GBP, USD, PLN un SEK valūtās pēc attiecīgā brīža maiņas kursa.
                Distances pirkuma līgums starp pircēju un SIA &ldquo;RGS6&rdquo; stājas spēkā brīdī, kad pasūtījums ir
                apmaksāts vai ir saņemts oficiāls nomaksas līguma apstiprinājums.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 space-y-1">
                  <div className="font-bold text-stone-900">Drošie norēķinu veidi</div>
                  <ul className="space-y-1 text-stone-600">
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Bankas karte (Visa / Mastercard):</strong> tūlītēja tiešsaistes apmaksa ar 3D Secure
                        autentifikāciju un PCI-DSS 1. līmeņa drošību.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Internetbanka (BankLink):</strong> tiešie maksājumi caur Swedbank, SEB, Citadele un
                        Luminor ar Smart-ID vai kodu kalkulatoru.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Incredit nomaksa (6–36 mēn.):</strong> pieejama jaunu velosipēdu iegādei (neattiecas uz
                        velosipēdu nomu) ar Smart-ID / eParaksts parakstīšanu.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 space-y-1">
                  <div className="font-bold text-stone-900">Pasūtījumu izpilde un dokumenti</div>
                  <ul className="space-y-1 text-stone-600">
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        Jaunu preču pasūtījumi tiek komplektēti tikai pēc apmaksas vai Incredit līguma apstiprināšanas
                        (pēcapmaksa skaidrā naudā kurjeram jaunu velosipēdu pasūtījumiem netiek piemērota).
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        Jaunu velosipēdu var pasūtīt rūpnīcas kastē (€0 — jāsaliek pašam) vai pilnībā meistara saliktu un
                        noregulētu (+€35).
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        Vecā velosipēda nodošana kā pirmā iemaksa iespējama tikai klātienē darbnīcā Rindas ielā 44.
                        Elektroniskais PDF rēķins pēc apmaksas tiek automātiski nosūtīts uz norādīto e-pastu.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* 2. Piegādes noteikumi */}
          {show('delivery') && (
            <section className="space-y-3 border border-stone-200 rounded-xl p-4 sm:p-5 bg-white">
              <h4 className="font-bold text-sm text-stone-950 flex items-center gap-2 font-heading">
                <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>2. Piegādes un saņemšanas noteikumi</span>
              </h4>
              <p className="text-stone-600">
                Pasūtītās preces iespējams saņemt klātienē mūsu veikalā-darbnīcā Ventspilī vai izmantot VentVelo
                izbraukuma servisa busa piegādi tieši līdz namdurvīm Kurzemes reģionā.
              </p>

              <div className="overflow-x-auto border border-stone-200 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-100 text-stone-800 border-b border-stone-200">
                      <th className="py-2 px-3 font-semibold">Saņemšanas / piegādes zona</th>
                      <th className="py-2 px-3 font-semibold">Grafiks</th>
                      <th className="py-2 px-3 font-semibold">Preču piegāde</th>
                      <th className="py-2 px-3 font-semibold">Servisa izbraukums (apkopei)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-stone-700">
                    <tr>
                      <td className="py-2 px-3 font-medium text-stone-900">Saņemšana Rindas ielā 44, Ventspilī</td>
                      <td className="py-2 px-3">Pirmd.–Piektd. 10:00–18:00</td>
                      <td className="py-2 px-3 font-mono font-semibold text-emerald-700">€0</td>
                      <td className="py-2 px-3">Vienmēr bez maksas</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-stone-900">Servisa buss — Ventspils pilsēta</td>
                      <td className="py-2 px-3">Katru darba dienu</td>
                      <td className="py-2 px-3 font-mono font-semibold">€8</td>
                      <td className="py-2 px-3">€8 (apkopei virs €50 — bezmaksas)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-stone-900">Servisa buss — Usma un pagasts</td>
                      <td className="py-2 px-3">Pirmd., Trešd., Piektd.</td>
                      <td className="py-2 px-3 font-mono font-semibold">€18</td>
                      <td className="py-2 px-3">€18 (apkopei virs €120 — bezmaksas)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-stone-900">Servisa buss — Talsi un koridors</td>
                      <td className="py-2 px-3">Otrd., Ceturtd.</td>
                      <td className="py-2 px-3 font-mono font-semibold">€22</td>
                      <td className="py-2 px-3">€22 (apkopei virs €150 — bezmaksas)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-stone-500">
                Pirms busa izbraukuma šoferis vai meistars sazinās ar klientu pa norādīto tālruni, lai precizētu ierašanās
                laiku. Saņemot preci, lūdzam pārbaudīt tās komplektāciju un vizuālo stāvokli.
              </p>
            </section>
          )}

          {/* 3. Preču atgriešanas noteikumi un garantija */}
          {show('returns') && (
            <section className="space-y-3 border border-stone-200 rounded-xl p-4 sm:p-5 bg-white">
              <h4 className="font-bold text-sm text-stone-950 flex items-center gap-2 font-heading">
                <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
                <span>3. Preču atgriešanas noteikumi, atteikuma tiesības un garantija</span>
              </h4>
              <div className="space-y-2 text-stone-600">
                <p>
                  <strong className="text-stone-900">14 dienu atteikuma tiesības:</strong> Saskaņā ar LR Patērētāju
                  tiesību aizsardzības likumu un MK noteikumiem Nr. 255 patērētājam (fiziskai personai) ir tiesības 14
                  kalendāro dienu laikā no preces saņemšanas dienas atkāpties no distances līguma, neminot iemeslu.
                </p>
                <ul className="space-y-1.5 pl-1">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Preces stāvoklis:</strong> Atgriežamajai precei jābūt nelietotai, tīrai, bez mehāniskiem
                      bojājumiem, pilnā komplektācijā un oriģinālajā iepakojumā ar nesabojātām drošības birkām.
                      Izmēģināt preci drīkst tikai tiktāl, cik tas nepieciešams tās īpašību pārbaudei (braukšana pa
                      ielu vai nolietojuma pēdas uz riepām/transmisijas neatbilst pārbaudei).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Atgriešanas kārtība un izmaksas:</strong> Lai pieteiktu atgriešanu, rakstiet uz{' '}
                      <a href="mailto:ventspilsvelo@gmail.com" className="underline font-semibold text-stone-900">
                        ventspilsvelo@gmail.com
                      </a>
                      , norādot pasūtījuma numuru un pirkuma rēķinu, un nogādājiet preci uz Rindas ielu 44, Ventspilī
                      (vai vienojieties par busa savākšanu). Preces atgriešanas tiešās transporta izmaksas sedz pircējs,
                      izņemot gadījumus, kad piegādāta kļūdaina vai ražošanas brāķim atbilstoša prece.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Naudas atmaksa:</strong> Pēc preces saņemšanas un stāvokļa pārbaudes SIA &ldquo;RGS6&rdquo;
                      14 kalendāro dienu laikā atmaksā samaksāto summu uz to pašu bankas kontu vai karti, no kuras tika
                      veikts maksājums.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Garantija:</strong> Meistara pilnībā saliktiem jauniem velosipēdiem (+€35 komplektācija)
                      tiek nodrošināta <strong>24 mēnešu garantija</strong>, pārlasītiem lietotajiem velosipēdiem —{' '}
                      <strong>12 mēnešu garantija</strong>, bet servisa darbiem — <strong>2 līdz 12 mēnešu</strong>{' '}
                      garantija. Jauniem velosipēdiem, kas iegādāti nesalikti kastē (€0), darbnīcas salikšanas un
                      regulēšanas garantija neattiecas.
                    </span>
                  </li>
                </ul>
              </div>
            </section>
          )}

          {/* 4. Datu apstrādes politika un maksājumu drošība (GDPR) */}
          {show('privacy') && (
            <section className="space-y-4 border border-stone-200 rounded-xl p-4 sm:p-5 bg-white">
              <h4 className="font-bold text-sm text-stone-950 flex items-center gap-2 font-heading">
                <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                <span>4. Datu apstrādes politika (GDPR) un maksājumu drošība</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="border border-stone-200 rounded-xl p-3.5 space-y-1.5 bg-stone-50/60">
                  <div className="font-bold text-stone-900 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>256-bitu TLS 1.3 / SSL šifrēšana</span>
                  </div>
                  <p className="text-stone-600">
                    Visa datu apmaiņa starp pircēja pārlūku, veikalu un maksājumu vārteju notiek caur šifrētu HTTPS / TLS
                    1.3 protokolu.
                  </p>
                </div>

                <div className="border border-stone-200 rounded-xl p-3.5 space-y-1.5 bg-stone-50/60">
                  <div className="font-bold text-stone-900 flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Karšu datu neturēšana serverī</span>
                  </div>
                  <p className="text-stone-600">
                    SIA &ldquo;RGS6&rdquo; serveros netiek uzglabāti pilni maksājumu karšu numuri, derīguma termiņi vai
                    CVC drošības kodi — tie tiek apstrādāti PCI-DSS prasībām atbilstošos kanālos.
                  </p>
                </div>

                <div className="border border-stone-200 rounded-xl p-3.5 space-y-1.5 bg-stone-50/60">
                  <div className="font-bold text-stone-900 flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Datu apjoms, mērķis un glabāšana</span>
                  </div>
                  <p className="text-stone-600">
                    Apstrādājam tikai pasūtījuma un servisa izpildei nepieciešamos datus (vārds, uzvārds, e-pasts,
                    tālrunis, piegādes adrese, rēķina rekvizīti) saskaņā ar GDPR 6. panta 1.b un 1.c punktu.
                    Grāmatvedības rēķini tiek glabāti 5 gadus.
                  </p>
                </div>

                <div className="border border-stone-200 rounded-xl p-3.5 space-y-1.5 bg-stone-50/60">
                  <div className="font-bold text-stone-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Klienta tiesības un trešās puses</span>
                  </div>
                  <p className="text-stone-600">
                    Datus nododam tikai maksājumu apstrādātājiem, Incredit (ja izvēlēta nomaksa) un likumā paredzētajām
                    iestādēm. Jums ir tiesības pieprasīt datu labošanu vai dzēšanu, rakstot uz ventspilsvelo@gmail.com,
                    vai vērsties Datu valsts inspekcijā (www.dvi.gov.lv).
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-stone-200">
                <div className="font-bold text-stone-900 font-heading">Darbnīcas un servisa busa fiziskā drošība:</div>
                <ul className="space-y-1 text-stone-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Servisa busiņš ir aprīkots ar GPS izsekošanu un drošiem iekšējiem rāmju stiprinājumiem.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Darbnīcā Ventspilī (Rindas ielā 44) ir 24/7 apsardzes signalizācija un apdrošināta telpa.</span>
                  </li>
                </ul>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-5 sm:px-6 py-3 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-stone-500 hidden sm:inline">
            SIA &ldquo;RGS6&rdquo; · Reģ. Nr. 40103846622 · Atjaunots 2026
          </span>
          <button
            type="button"
            onClick={() => setIsSecurityModalOpen(false)}
            className="ml-auto px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg cursor-pointer"
          >
            Sapratu, aizvērt
          </button>
        </div>
      </div>
    </div>
  );
};
