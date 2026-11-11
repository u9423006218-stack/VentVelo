import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SERVICE_PACKAGES, CUSTOM_REPAIR_ITEMS, VAN_PICKUP_ZONES, WORKSHOP_BRANCHES } from '../../data/mockData';
import { VanRegion, ServicePackage, CustomRepairItem, MaintenanceJob, EmailNotification } from '../../types';
import { 
  X, 
  Check, 
  Truck, 
  Wrench, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Lock,
  Clock
} from 'lucide-react';

export const ServiceBookingModal: React.FC = () => {
  const { 
    isBookingModalOpen, 
    setIsBookingModalOpen, 
    preselectedServiceId, 
    formatPrice, 
    currency, 
    addJob, 
    addNotification, 
    setActiveTab, 
    openCheckout 
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form state
  const [selectedPackageId, setSelectedPackageId] = useState<string>('standard_overhaul');
  const [selectedCustomIds, setSelectedCustomIds] = useState<string[]>([]);
  const [deliveryType, setDeliveryType] = useState<'workshop_dropoff' | 'van_pickup'>('van_pickup');
  const [vanRegion, setVanRegion] = useState<VanRegion>('Ventspils');
  const [vanAddress, setVanAddress] = useState('');
  const [vanCity, setVanCity] = useState('Ventspils');
  const [vanPostalCode, setVanPostalCode] = useState('LV-3601');
  const [vanDate, setVanDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [vanTimeSlot, setVanTimeSlot] = useState('10:00 – 13:00');
  const [vanNotes, setVanNotes] = useState('');
  const [workshopBranch, setWorkshopBranch] = useState<'Rindas iela 44'>('Rindas iela 44');

  // Client and Bike Info
  const [customerName, setCustomerName] = useState('Līna Damberga');
  const [customerEmail, setCustomerEmail] = useState('lina.damberga@vatp.lv');
  const [customerPhone, setCustomerPhone] = useState('+371 29112233');
  const [bikeBrandModel, setBikeBrandModel] = useState('');
  const [bikeSerial, setBikeSerial] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [paymentPreference, setPaymentPreference] = useState<'pay_online' | 'pay_on_pickup'>('pay_online');

  useEffect(() => {
    if (preselectedServiceId) {
      setSelectedPackageId(preselectedServiceId);
    }
  }, [preselectedServiceId]);

  if (!isBookingModalOpen) return null;

  const currentPkg: ServicePackage = SERVICE_PACKAGES.find(p => p.id === selectedPackageId) || SERVICE_PACKAGES[1];
  const customItems: CustomRepairItem[] = CUSTOM_REPAIR_ITEMS.filter(c => selectedCustomIds.includes(c.id));

  const currentZone = VAN_PICKUP_ZONES.find(z => z.region === vanRegion) || VAN_PICKUP_ZONES[0];
  
  // Calculate price
  const baseServicePriceEur = currentPkg.priceEur;
  const customRepairsTotalEur = customItems.reduce((sum, item) => sum + item.priceEur, 0);
  const subtotalBeforeVan = baseServicePriceEur + customRepairsTotalEur;

  let vanFeeEur = 0;
  if (deliveryType === 'van_pickup') {
    if (subtotalBeforeVan >= currentZone.freeThresholdEur) {
      vanFeeEur = 0;
    } else {
      vanFeeEur = currentZone.feeEur;
    }
  }

  const grandTotalEur = subtotalBeforeVan + vanFeeEur;

  const toggleCustomItem = (id: string) => {
    setSelectedCustomIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleFinishBooking = () => {
    const randomCode = `VV-${Math.floor(1000 + Math.random() * 9000)}-LV`;
    const newJob: MaintenanceJob = {
      id: `job_${Date.now()}`,
      trackingCode: randomCode,
      customerName,
      customerPhone,
      customerEmail,
      bikeModel: bikeBrandModel || 'Velosipēds / E-skrejritenis',
      bikeSerial: bikeSerial || undefined,
      servicePackage: currentPkg,
      customRepairs: customItems,
      deliveryType,
      pickupLocation: deliveryType === 'van_pickup' ? {
        region: vanRegion,
        address: vanAddress,
        city: vanCity,
        postalCode: vanPostalCode,
        preferredDate: vanDate,
        preferredTimeSlot: vanTimeSlot,
        notes: vanNotes,
        feeEur: vanFeeEur,
      } : undefined,
      workshopBranch: deliveryType === 'workshop_dropoff' ? workshopBranch : undefined,
      status: 'booked',
      statusHistory: [
        {
          status: 'booked',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          note: deliveryType === 'van_pickup' 
            ? `Busiņa izbraukums pieteikts reģionā ${vanRegion} (${vanDate} ${vanTimeSlot})`
            : `Klients pats atvedīs velosipēdu uz darbnīcu: ${workshopBranch}`,
        }
      ],
      totalPriceEur: grandTotalEur,
      paid: paymentPreference === 'pay_online',
      paymentMethod: paymentPreference === 'pay_online' ? 'Tiešsaistes maksājumu vārteja' : 'Apmaksa pie busiņa / darbnīcas terminālī',
      currencyUsed: currency,
      guaranteeExpiresAt: new Date(Date.now() + currentPkg.guaranteeMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      mechanicName: 'Jānis Bērziņš (Galvenais meistars, VentVelo)',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    // Add job to store
    addJob(newJob);

    // Send automated email notification in natural Latvian
    const emailNotif: EmailNotification = {
      id: `em_${Date.now()}`,
      recipientEmail: customerEmail,
      recipientName: customerName,
      subject: `Serviss pieteikts: ${currentPkg.name} [${randomCode}]`,
      previewText: `Paldies! Jūsu velosipēda ${bikeBrandModel || 'apkope'} ir veiksmīgi iekļauta darbnīcas grafikā.`,
      category: 'service_booking',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      referenceId: randomCode,
      read: false,
      htmlContent: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917; line-height: 1.6;">
          <div style="background-color: #1c1917; padding: 24px; color: #ffffff; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 700;">VentVelo servisa pieteikums apstiprināts</h2>
            <p style="margin: 4px 0 0; font-size: 13px; color: #a8a29e;">Izsekošanas numurs: ${randomCode}</p>
          </div>
          <div style="padding: 24px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 8px 8px; background: #ffffff;">
            <h3 style="margin-top: 0; color: #0c0a09;">Labdien, ${customerName}!</h3>
            <p>Jūsu pieteikums ir pieņemts. Meistars ir iepazinies ar norādītajiem defektiem un sagatavos visu nepieciešamo darbam.</p>
            
            <div style="background: #fafaf9; border-radius: 6px; padding: 16px; margin: 20px 0; border: 1px solid #e7e5e4;">
              <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; color: #78716c; text-transform: uppercase;">PIETEIKUMA DETAĻAS</p>
              <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #1c1917;">
                <li><strong>Velosipēds:</strong> ${bikeBrandModel || 'Klienta velosipēds'}</li>
                <li><strong>Izvēlētā apkope:</strong> ${currentPkg.name} (${formatPrice(currentPkg.priceEur)})</li>
                ${customItems.length > 0 ? `<li><strong>Papildu darbi:</strong> ${customItems.map(c => c.name).join(', ')}</li>` : ''}
                <li><strong>Izpilde:</strong> ${deliveryType === 'van_pickup' ? `Izbraukuma buss ${vanRegion} (${vanAddress}, ${vanDate} ${vanTimeSlot})` : `Nodošana darbnīcā klātienē (${workshopBranch})`}</li>
                <li><strong>Kopējā tāme:</strong> ${formatPrice(grandTotalEur)}</li>
                <li><strong>Meistara garantija:</strong> ${currentPkg.guaranteeMonths} mēneši visiem darbiem un gultņiem</li>
              </ul>
            </div>
            
            <p style="font-size: 13px; color: #57534e;">
              Jūs jebkurā brīdī varat sekot līdzi remonta gaitai VentVelo tiešsaistes garāžā ar kodu <strong>${randomCode}</strong>.
            </p>
          </div>
        </div>
      `,
    };
    addNotification(emailNotif);

    setIsBookingModalOpen(false);

    if (paymentPreference === 'pay_online') {
      openCheckout({
        type: 'service',
        data: newJob,
        totalEur: grandTotalEur,
        title: `Servisa pieteikums: ${currentPkg.name} (${randomCode})`,
      });
    } else {
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-stone-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div>
            <h3 className="font-bold text-lg text-white font-heading">Pieteikt velosipēda servisu un busiņu</h3>
            <p className="text-xs text-stone-400">Solis {step} no 4 · VentVelo darbnīca un Kurzemes izbraukuma loģistika</p>
          </div>
          <button 
            onClick={() => setIsBookingModalOpen(false)}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* STEP 1: Select Package & Custom Options */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h4 className="font-bold text-stone-900 text-base">Izvēlies vajadzīgo apkopi</h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Izvēlies Tavam velosipēdam atbilstošāko tehnisko darbu apjomu.
                </p>
              </div>

              <div className="space-y-3">
                {SERVICE_PACKAGES.map(pkg => (
                  <label
                    key={pkg.id}
                    className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedPackageId === pkg.id 
                        ? 'border-amber-500 bg-amber-50/50 shadow-xs' 
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="service_tier"
                          checked={selectedPackageId === pkg.id}
                          onChange={() => setSelectedPackageId(pkg.id)}
                          className="mt-1 accent-amber-500"
                        />
                        <div>
                          <div className="font-semibold text-stone-900 text-sm flex items-center gap-2">
                            <span>{pkg.name}</span>
                            {pkg.popular && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                                Ieteicamā izvēle
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-600 mt-1">{pkg.description}</p>
                          <div className="flex items-center gap-3 text-xs text-stone-500 mt-2 font-medium">
                            <span className="flex items-center gap-1 text-emerald-700">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {pkg.guaranteeMonths} mēn. garantija
                            </span>
                            <span>·</span>
                            <span>Apm. {pkg.durationHours}h darba</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-stone-950 font-mono text-base tabular-nums">
                          {formatPrice(pkg.priceEur)}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Custom Add-ons */}
              <div className="pt-3 border-t border-stone-200">
                <h5 className="font-semibold text-stone-900 text-xs uppercase tracking-wider mb-2">Papildu remonta darbi (pēc izvēles):</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CUSTOM_REPAIR_ITEMS.map(item => (
                    <label 
                      key={item.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer ${
                        selectedCustomIds.includes(item.id) 
                          ? 'border-amber-500 bg-amber-50/30 font-medium text-stone-900' 
                          : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedCustomIds.includes(item.id)}
                          onChange={() => toggleCustomItem(item.id)}
                          className="accent-amber-500"
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-mono text-stone-900 ml-2 font-semibold tabular-nums">
                        +{formatPrice(item.priceEur)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Delivery & Mobile Van Options */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-stone-900 text-base">Izvēlies velosipēda nodošanas veidu</h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Piesaki busiņu velosipēda savākšanai pie durvīm vai atved uz darbnīcu pats.
                </p>
              </div>

              {/* Delivery method selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDeliveryType('van_pickup')}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    deliveryType === 'van_pickup'
                      ? 'border-amber-500 bg-amber-50/40 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2 text-amber-600 mb-1 font-bold text-sm">
                    <Truck className="w-4 h-4" />
                    <span>Izbraukuma servisa buss līdz namdurvīm</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Mūsu busiņš atbrauks pakaļ uz Tavu adresi Ventspilī, Usmā vai Talsos un atvedīs atpakaļ noregulētu un gatavu.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('workshop_dropoff')}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    deliveryType === 'workshop_dropoff'
                      ? 'border-amber-500 bg-amber-50/40 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2 text-stone-800 mb-1 font-bold text-sm">
                    <MapPin className="w-4 h-4 text-stone-600" />
                    <span>Atvedīšu pats uz darbnīcu</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Nodod ričuku darba laikā mūsu darbnīcā Rindas ielā 44 Pārventā. Bez maksas.
                  </p>
                </button>
              </div>

              {/* Van Pickup Details */}
              {deliveryType === 'van_pickup' && (
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-stone-900 text-sm">Servisa busa izbraukuma detaļas</h5>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      {vanFeeEur === 0 ? 'BEZMAKSAS izbraukums' : `Busiņa brauciens: ${formatPrice(vanFeeEur)}`}
                    </span>
                  </div>

                  {/* Region Choice */}
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Reģionālā zona</label>
                    <div className="grid grid-cols-3 gap-2">
                      {VAN_PICKUP_ZONES.map(zone => (
                        <button
                          key={zone.region}
                          type="button"
                          onClick={() => {
                            setVanRegion(zone.region);
                            if (zone.region === 'Ventspils') setVanCity('Ventspils');
                            if (zone.region === 'Usma') setVanCity('Usma');
                            if (zone.region === 'Talsi') setVanCity('Talsi');
                          }}
                          className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                            vanRegion === zone.region
                              ? 'border-amber-500 bg-white shadow-xs font-semibold text-stone-900'
                              : 'border-stone-200 bg-stone-100/60 text-stone-600 hover:bg-white'
                          }`}
                        >
                          <div className="text-xs font-bold">{zone.region}</div>
                          <div className="text-[11px] text-stone-500">{zone.distanceKm}</div>
                          <div className="text-[10px] text-amber-600 font-medium mt-1">
                            {formatPrice(zone.feeEur)} (Brīvs &gt;{formatPrice(zone.freeThresholdEur)})
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Address input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">Iela, mājas numurs / Kempings</label>
                      <input
                        type="text"
                        value={vanAddress}
                        onChange={(e) => setVanAddress(e.target.value)}
                        placeholder="piem., Inženieru iela 101, vai Usmas kempings"
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">Pilsēta / Pagasts</label>
                      <input
                        type="text"
                        value={vanCity}
                        onChange={(e) => setVanCity(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                        required
                      />
                    </div>
                  </div>

                  {/* Date & Time Slot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">Vēlamais savākšanas datums</label>
                      <input
                        type="date"
                        value={vanDate}
                        onChange={(e) => setVanDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">Vēlamais laika logs</label>
                      <select
                        value={vanTimeSlot}
                        onChange={(e) => setVanTimeSlot(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                      >
                        <option value="09:00 – 12:00">Rīts (09:00 – 12:00)</option>
                        <option value="12:00 – 15:00">Pusdienlaiks (12:00 – 15:00)</option>
                        <option value="15:00 – 18:00">Pēcpusdiena (15:00 – 18:00)</option>
                        <option value="18:00 – 20:00">Vakars (18:00 – 20:00)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Piezīmes šoferim / Vārtu kods (pēc izvēles)</label>
                    <input
                      type="text"
                      value={vanNotes}
                      onChange={(e) => setVanNotes(e.target.value)}
                      placeholder="piem., Piezvanīt 5 min pirms barjeras, ričuks pagalmā pie šķūnīša"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>
              )}

              {/* Workshop Dropoff Details */}
              {deliveryType === 'workshop_dropoff' && (
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                  <h5 className="font-semibold text-stone-900 text-sm">Darbnīcas adrese un saņemšana</h5>
                  {WORKSHOP_BRANCHES.map(branch => (
                    <div
                      key={branch.id}
                      className="p-3.5 rounded-lg border border-amber-500 bg-white shadow-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-500" />
                          <span>{branch.name}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                          Pieņemšana klātienē
                        </span>
                      </div>
                      <div className="text-xs text-stone-600 pl-5">{branch.address}</div>
                      <div className="text-[11px] text-stone-500 pl-5 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          {branch.hours}
                        </span>
                        <span>·</span>
                        <a href={`tel:${branch.phone}`} className="text-stone-700 font-medium hover:text-amber-600">
                          {branch.phone}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Bike Specs & Client Contact */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-stone-900 text-base">Velosipēda un kontaktinformācija</h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Šie dati tiks izmantoti servisa gaitas paziņojumiem un garantijas sertifikāta noformēšanai.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Velosipēda marka un modelis *</label>
                  <input
                    type="text"
                    value={bikeBrandModel}
                    onChange={(e) => setBikeBrandModel(e.target.value)}
                    placeholder="piem., Trek FX 3 Disc, Scott Scale vai Xiaomi 1S"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Rāmja numurs (pēc izvēles)</label>
                  <input
                    type="text"
                    value={bikeSerial}
                    onChange={(e) => setBikeSerial(e.target.value)}
                    placeholder="piem., WTU28194481M"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Kādi defekti vai skaņas novērotas?</label>
                <textarea
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="piem., Lec ķēde uz 3. un 4. zobrata, mīksts aizmugurējo bremžu rokturis, krakšķ monobloks slodzē"
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="pt-2 border-t border-stone-200">
                <h5 className="font-semibold text-stone-900 text-xs uppercase tracking-wider mb-2">Tavi kontakti saziņai:</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Vārds, Uzvārds *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">E-pasts (statusa ziņām) *</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Tālruņa numurs *</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Review Quote & Payment Preference */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h4 className="font-bold text-stone-900 text-base">Pieteikuma kopsavilkums un apstiprinājums</h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Pārbaudi tāmi un izvēlies ērtāko norēķinu veidu.
                </p>
              </div>

              {/* Order breakdown */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex justify-between items-center text-stone-900">
                  <span className="font-semibold">{currentPkg.name}</span>
                  <span className="font-mono tabular-nums font-bold">{formatPrice(baseServicePriceEur)}</span>
                </div>

                {customItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-stone-600 pl-3">
                    <span>+ {item.name}</span>
                    <span className="font-mono tabular-nums">{formatPrice(item.priceEur)}</span>
                  </div>
                ))}

                <div className="flex justify-between items-center text-stone-600">
                  <span>
                    Loģistika: {deliveryType === 'van_pickup' ? `Servisa buss (${vanRegion})` : `Nodošana darbnīcā (${workshopBranch})`}
                  </span>
                  <span className="font-mono tabular-nums font-medium">
                    {deliveryType === 'van_pickup' 
                      ? (vanFeeEur === 0 ? 'BEZMAKSAS' : formatPrice(vanFeeEur))
                      : 'BEZMAKSAS'}
                  </span>
                </div>

                <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-stone-950 font-bold text-sm">
                  <span>Kopējā tāme</span>
                  <span className="font-mono tabular-nums text-base">{formatPrice(grandTotalEur)}</span>
                </div>
              </div>

              {/* Guarantee pledge callout */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-stone-800">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-900">{currentPkg.guaranteeMonths} mēnešu VentVelo garantija:</span> Visiem mehāniskajiem darbiem, nomainītajām detaļām un gultņiem nodrošinām oficiālu darbnīcas garantiju.
                </div>
              </div>

              {/* Payment Preference */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider">Apmaksas izvēle:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center gap-2 ${
                    paymentPreference === 'pay_online' ? 'border-amber-500 bg-amber-50/40 font-semibold' : 'border-stone-200'
                  }`}>
                    <input
                      type="radio"
                      name="payment_pref"
                      checked={paymentPreference === 'pay_online'}
                      onChange={() => setPaymentPreference('pay_online')}
                      className="accent-amber-500"
                    />
                    <div>
                      <div className="font-bold text-stone-900 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-stone-600" />
                        <span>Apmaksāt tagad (BankLink vai karti)</span>
                      </div>
                      <div className="text-[11px] text-stone-500">256-bitu drošs maksājums izvēlētajā valūtā ({currency})</div>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center gap-2 ${
                    paymentPreference === 'pay_on_pickup' ? 'border-amber-500 bg-amber-50/40 font-semibold' : 'border-stone-200'
                  }`}>
                    <input
                      type="radio"
                      name="payment_pref"
                      checked={paymentPreference === 'pay_on_pickup'}
                      onChange={() => setPaymentPreference('pay_on_pickup')}
                      className="accent-amber-500"
                    />
                    <div>
                      <div className="font-bold text-stone-900">Maksāt pie busiņa vai darbnīcā</div>
                      <div className="text-[11px] text-stone-500">Ar bankas karti terminālī vai skaidrā naudā</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Atpakaļ</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 2 && deliveryType === 'van_pickup' && !vanAddress) {
                  setVanAddress('Inženieru iela 101');
                }
                setStep((s) => (s + 1) as any);
              }}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Turpināt</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishBooking}
              className="px-6 py-2.5 text-xs font-semibold text-stone-950 bg-amber-500 hover:bg-amber-400 rounded-lg flex items-center gap-2 cursor-pointer shadow-md font-heading"
            >
              <Check className="w-4 h-4" />
              <span>Apstiprināt un pieteikt servisu</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
