import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JobStatus, MaintenanceJob, UserBike } from '../../types';
import { 
  Wrench, 
  Truck, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  CircleDot, 
  Plus, 
  Printer, 
  ExternalLink, 
  FileText, 
  ShoppingBag, 
  QrCode, 
  Play, 
  AlertCircle 
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { 
    jobs, 
    selectedTrackingJob, 
    setSelectedTrackingJob, 
    updateJobStatus, 
    garageBikes, 
    addGarageBike, 
    orders, 
    formatPrice, 
    openBookingWithService,
    showToast 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'tracking' | 'garage' | 'orders'>('tracking');
  const [showAddBikeModal, setShowAddBikeModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState<MaintenanceJob | null>(null);

  // New bike form
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newYear, setNewYear] = useState(2024);
  const [newSerial, setNewSerial] = useState('');
  const [newType, setNewType] = useState('Grants un tūrisma velosipēds');

  const currentJob: MaintenanceJob = selectedTrackingJob || jobs[0];

  const statusSteps: { key: JobStatus; label: string; desc: string }[] = [
    { key: 'booked', label: '1. Pieteikts', desc: 'Pieteikums apstiprināts grafikā' },
    { key: 'van_en_route', label: '2. Busiņš ceļā', desc: 'Busiņš ceļā / Saņemts darbnīcā' },
    { key: 'diagnostics', label: '3. Diagnostika', desc: '18 punktu pārbaude un darbu plāns' },
    { key: 'in_progress', label: '4. Darbnīcā', desc: 'Mezglu remonts un mazgāšana' },
    { key: 'quality_check', label: '5. Pārbaude', desc: 'Testa brauciens un pievilkšana' },
    { key: 'ready_for_pickup_or_delivery', label: '6. Gatavs', desc: 'Gatavs saņemšanai vai busiņam' },
  ];

  const getStepIndex = (status: JobStatus) => {
    const keys: JobStatus[] = ['booked', 'van_en_route', 'diagnostics', 'in_progress', 'quality_check', 'ready_for_pickup_or_delivery', 'delivered'];
    const idx = keys.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  const currentStepIdx = currentJob ? getStepIndex(currentJob.status) : 0;

  const handleAdvanceSimulation = () => {
    if (!currentJob) return;
    const flow: JobStatus[] = ['booked', 'van_en_route', 'diagnostics', 'in_progress', 'quality_check', 'ready_for_pickup_or_delivery', 'delivered'];
    const currIdx = flow.indexOf(currentJob.status);
    const nextIdx = (currIdx + 1) % flow.length;
    const nextStatus = flow[nextIdx];

    const simNotes: Record<JobStatus, string> = {
      booked: 'Pieteikums atjaunots plānotajā servisa rindā.',
      van_en_route: 'VentVelo servisa busiņš ir izbraucis pēc velosipēda norādītajā adresē.',
      diagnostics: 'Meistars uzlika velosipēdu uz Park Tool statīva. Pārbaudīta rāmja ģeometrija un ķēdes nodilums.',
      in_progress: 'Pabeigta kasetes un ķēdes ultraskaņas vanna. Veikta ratu taisnošana un jaunu trošu montāža.',
      quality_check: 'Meistars veicis testa braucienu un skrūvju pievilkšanu ar dinamometrisko atslēgu.',
      ready_for_pickup_or_delivery: 'Velosipēds ir nospodrināts un gatavs piegādei ar servisa busiņu atpakaļ pie klienta.',
      delivered: 'Nodots klientam. VentVelo 6 mēnešu garantijas sertifikāts ir spēkā.',
    };

    updateJobStatus(currentJob.id, nextStatus, simNotes[nextStatus]);
  };

  const handleCreateBike = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand || !newModel) return;

    const bike: UserBike = {
      id: `bike_u_${Date.now()}`,
      brand: newBrand,
      model: newModel,
      year: newYear,
      serialNumber: newSerial || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      type: newType,
      purchaseDate: new Date().toISOString().split('T')[0],
      lastServiceDate: 'Reģistrēts šodien',
      activeGuaranteeMonths: 12,
    };

    addGarageBike(bike);
    setShowAddBikeModal(false);
    setNewBrand('');
    setNewModel('');
    setNewSerial('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header Dashboard Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-heading">
            Mana velogaraža un darbnīcas statuss
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Tiešsaistes remonta gaita, digitālā servisa grāmatiņa un oficiālie garantijas sertifikāti.
          </p>
        </div>

        {/* Dashboard Sub-tabs */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg shrink-0">
          <button
            onClick={() => setActiveSubTab('tracking')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'tracking'
                ? 'bg-white text-stone-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Aktīvā remonta gaita
          </button>
          <button
            onClick={() => setActiveSubTab('garage')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'garage'
                ? 'bg-white text-stone-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Mana garāža ({garageBikes.length})
          </button>
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'orders'
                ? 'bg-white text-stone-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Pirkumu vēsture ({orders.length})
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: LIVE SERVICE TRACKING */}
      {activeSubTab === 'tracking' && (
        <div className="space-y-6">
          
          {/* Active Job Selector & Status Card */}
          {currentJob ? (
            <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
              
              {/* Job Banner */}
              <div className="bg-stone-900 text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs bg-amber-500 text-stone-950 px-2.5 py-0.5 rounded font-bold">
                      {currentJob.trackingCode}
                    </span>
                    <span className="text-xs text-stone-400">
                      Pieteikts: {currentJob.createdAt}
                    </span>
                    <span className="text-stone-600">·</span>
                    <span className="text-xs text-amber-400 font-medium">
                      {currentJob.mechanicName}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
                    {currentJob.bikeModel}
                  </h2>

                  <p className="text-xs text-stone-300">
                    Apkope: <strong className="text-white">{currentJob.servicePackage.name}</strong> 
                    {currentJob.customRepairs.length > 0 && ` + ${currentJob.customRepairs.map(c => c.name).join(', ')}`}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  {/* Simulate Status Advance */}
                  <button
                    onClick={handleAdvanceSimulation}
                    className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg transition-colors border border-stone-700 flex items-center justify-center gap-2 cursor-pointer"
                    title="Pārslēgt nākamo remonta posmu (izmēģināt meistara atjauninājumu)"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pārslēgt statusu (Demo)</span>
                  </button>

                  {/* View Guarantee Certificate */}
                  <button
                    onClick={() => setShowCertificateModal(currentJob)}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Garantijas sertifikāts</span>
                  </button>
                </div>
              </div>

              {/* Visual Progress Stepper */}
              <div className="p-6 sm:p-8 border-b border-stone-200 bg-stone-50/50">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {statusSteps.map((step, idx) => {
                    const isCompleted = idx < currentStepIdx;
                    const isCurrent = idx === currentStepIdx;

                    return (
                      <div 
                        key={step.key}
                        className={`p-3 rounded-xl border text-xs transition-all ${
                          isCurrent
                            ? 'bg-amber-50 border-amber-400 ring-1 ring-amber-400 shadow-xs'
                            : isCompleted
                              ? 'bg-white border-emerald-300 text-stone-800'
                              : 'bg-white border-stone-200 text-stone-400 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1.5 font-bold">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : isCurrent ? (
                            <CircleDot className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-stone-300 shrink-0" />
                          )}
                          <span className={isCurrent ? 'text-amber-900' : isCompleted ? 'text-stone-900' : 'text-stone-400'}>
                            {step.label}
                          </span>
                        </div>
                        <p className="text-[11px] leading-tight text-stone-500">
                          {step.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Two Column Details: Logistics & Timeline */}
              <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Col 1: Chronological Technician Log */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2 font-heading">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Darbnīcas inspekcijas un progresa žurnāls</span>
                  </h3>

                  <div className="space-y-4 border-l-2 border-stone-200 pl-4 ml-2">
                    {currentJob.statusHistory.map((item, idx) => (
                      <div key={idx} className="relative space-y-1">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-stone-900 ring-4 ring-white" />
                        <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                          <span className="font-semibold text-stone-800 uppercase">{item.status.replace(/_/g, ' ')}</span>
                          <span>{item.timestamp}</span>
                        </div>
                        <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                          {item.note}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Col 2: Logistics & Guarantee Summary */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-4 text-xs">
                    <h4 className="font-bold text-stone-900 text-sm font-heading">Loģistikas un norēķinu detaļas</h4>
                    
                    <div className="space-y-2 text-stone-600">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Nodošanas veids:</span>
                        <span className="font-semibold text-stone-900">
                          {currentJob.deliveryType === 'van_pickup' ? 'Servisa buss līdz namdurvīm' : 'Nodošana darbnīcā'}
                        </span>
                      </div>

                      {currentJob.pickupLocation && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-stone-500">Reģiona zona:</span>
                            <span className="font-semibold text-stone-900">{currentJob.pickupLocation.region}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-500">Adrese:</span>
                            <span className="font-semibold text-stone-900 text-right max-w-[200px]">
                              {currentJob.pickupLocation.address}, {currentJob.pickupLocation.city}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-500">Pieteiktais laiks:</span>
                            <span className="font-semibold text-stone-900">
                              {currentJob.pickupLocation.preferredDate} ({currentJob.pickupLocation.preferredTimeSlot})
                            </span>
                          </div>
                        </>
                      )}

                      <div className="pt-2 border-t border-stone-200 flex justify-between">
                        <span className="text-stone-500">Apmaksas statuss:</span>
                        <span className="font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{currentJob.paid ? 'Apmaksāts (Pārbaudīts)' : 'Apmaksa pie saņemšanas'}</span>
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-stone-500">Kopējā summa:</span>
                        <span className="font-bold text-stone-950 font-mono text-sm tabular-nums">
                          {formatPrice(currentJob.totalPriceEur)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-200">
                      <div className="flex items-center gap-2 text-stone-800">
                        <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                        <div>
                          <div className="font-bold text-stone-900">Garantija aktīva līdz:</div>
                          <div className="text-stone-600">{currentJob.guaranteeExpiresAt} (VentVelo oficiālā meistara garantija)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8 space-y-4">
              <Wrench className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-lg font-bold text-stone-900">Nav aktīvu remonta pieteikumu</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Piesaki velosipēda apkopi ar mūsu servisa busiņu Ventspilī, Usmā vai Talsos.
              </p>
              <button
                onClick={() => openBookingWithService()}
                className="px-5 py-2.5 bg-stone-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Pieteikt pirmo servisu
              </button>
            </div>
          )}

          {/* List of other customer jobs if multiple */}
          {jobs.length > 1 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Pārslēgt skatāmo velosipēdu:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {jobs.map(j => (
                  <button
                    key={j.id}
                    onClick={() => setSelectedTrackingJob(j)}
                    className={`p-3 rounded-xl border text-left text-xs transition-colors cursor-pointer flex items-center justify-between ${
                      currentJob?.id === j.id ? 'border-amber-500 bg-amber-50/40 font-semibold' : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-stone-900">{j.bikeModel}</div>
                      <div className="text-[11px] text-stone-500">#{j.trackingCode} · {j.servicePackage.name}</div>
                    </div>
                    <span className="font-mono text-stone-700">{j.status.replace(/_/g, ' ')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* SUB-TAB 2: MY BICYCLE GARAGE */}
      {activeSubTab === 'garage' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-lg font-heading">Garāžā reģistrētie velosipēdi</h3>
              <p className="text-xs text-stone-500">
                Pārskati servisa vēsturi, rāmja numurus un aktīvās garantijas vienuviet.
              </p>
            </div>

            <button
              onClick={() => setShowAddBikeModal(true)}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Reģistrēt velosipēdu</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {garageBikes.map(bike => (
              <div key={bike.id} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                      Rāmis: {bike.serialNumber}
                    </span>
                    <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{bike.activeGuaranteeMonths} mēn. garantija</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-stone-900 font-heading">{bike.brand} {bike.model}</h4>
                    <p className="text-xs text-stone-500">{bike.year}. gads · {bike.type}</p>
                  </div>

                  <div className="space-y-1 text-xs text-stone-600 bg-stone-50 p-3 rounded-lg border border-stone-100">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Pēdējā apkope:</span>
                      <span className="font-semibold text-stone-800">{bike.lastServiceDate}</span>
                    </div>
                    {bike.notes && (
                      <div className="pt-1 text-[11px] text-stone-500 border-t border-stone-200/60 mt-1">
                        {bike.notes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center gap-3">
                  <button
                    onClick={() => openBookingWithService()}
                    className="flex-1 py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
                  >
                    Pieteikt apkopi un busiņu
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ORDER HISTORY */}
      {activeSubTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-lg font-heading">Pirkumu un aksesuāru pasūtījumu vēsture</h3>
              <p className="text-xs text-stone-500">
                Apmaksātie rēķini, čeki un piegādes kodi.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-stone-900">{order.orderNumber}</span>
                    <span className="text-xs text-stone-400">·</span>
                    <span className="text-xs text-stone-500">{order.createdAt}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                      APMAKSĀTS ({order.paymentMethod})
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-xs text-stone-700 py-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-stone-500">{item.quantity}x</span>
                        <span className="font-medium text-stone-900">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-stone-900 tabular-nums">
                        {formatPrice(item.priceEur * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div className="text-stone-500">
                    Piegāde: <strong className="text-stone-800">{order.deliveryMethod === 'van_delivery' ? 'Piegāde ar servisa busiņu' : 'Saņemšana darbnīcā'}</strong>
                  </div>
                  <div className="text-sm font-bold text-stone-950 font-mono tabular-nums">
                    Kopā apmaksāts: {formatPrice(order.totalEur)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Bike Modal */}
      {showAddBikeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-stone-900 text-lg font-heading">Reģistrēt velosipēdu garāžā</h3>
            <form onSubmit={handleCreateBike} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Marka (zīmols) *</label>
                <input
                  type="text"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  placeholder="piem., Trek, Canyon, Scott, Cube, Specialized"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-stone-700 font-medium mb-1">Modelis *</label>
                <input
                  type="text"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  placeholder="piem., FX 3, Grizl, Aspect, Aim"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Izlaiduma gads</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Tips</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  >
                    <option value="Grants / Piedzīvojumu (Gravel)">Grants / Piedzīvojumu (Gravel)</option>
                    <option value="Šosejas / Sporta">Šosejas / Sporta</option>
                    <option value="Pilsētas / Tūrisma">Pilsētas / Tūrisma</option>
                    <option value="E-velosipēds / Skrejritenis">E-velosipēds / Skrejritenis</option>
                    <option value="Kalnu MTB">Kalnu MTB</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-stone-700 font-medium mb-1">Rāmja numurs</label>
                <input
                  type="text"
                  value={newSerial}
                  onChange={(e) => setNewSerial(e.target.value)}
                  placeholder="piem., WTU28194481M"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBikeModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Atcelt
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 text-white rounded-lg font-semibold cursor-pointer"
                >
                  Saglabāt garāžā
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Workshop Guarantee Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-xl w-full shadow-2xl p-6 sm:p-8 space-y-6">
            
            {/* Certificate Header */}
            <div className="border-b-2 border-stone-900 pb-4 flex items-center justify-between">
              <div>
                <div className="text-xl font-bold font-heading text-stone-950">
                  <span className="text-amber-500">Vent</span>Velo darbnīcas garantijas sertifikāts
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Oficiāls mehānisko darbu garantijas apliecinājums · Ventspils, Latvija
                </p>
              </div>
              <ShieldCheck className="w-10 h-10 text-amber-500" />
            </div>

            {/* Certificate Body */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-stone-500 block text-[11px]">Sertifikāta numurs</span>
                  <span className="font-mono font-bold text-stone-900 text-sm">CERT-{showCertificateModal.trackingCode}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Izsniegšanas datums</span>
                  <span className="font-semibold text-stone-900">{showCertificateModal.createdAt}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-200">
                <div>
                  <span className="text-stone-500 block text-[11px]">Īpašnieks</span>
                  <span className="font-semibold text-stone-900">{showCertificateModal.customerName}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Velosipēda modelis</span>
                  <span className="font-semibold text-stone-900">{showCertificateModal.bikeModel}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200">
                <span className="text-stone-500 block text-[11px]">Veiktie darbi</span>
                <span className="font-bold text-stone-900 text-sm">{showCertificateModal.servicePackage.name}</span>
                <p className="text-stone-600 mt-1 leading-relaxed">
                  Visi mezgli pārbaudīti un pievilkti ar dinamometrisko atslēgu. Gultņiem, ātrumu pārslēgšanai un bremzēm tiek nodrošināta bezmaksas novēršana defektu gadījumā.
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-amber-900 font-bold block">Garantija spēkā līdz:</span>
                  <span className="text-amber-800 text-sm font-semibold">{showCertificateModal.guaranteeExpiresAt}</span>
                </div>
                <div className="text-right text-[11px] text-amber-900">
                  <span>Meistara paraksts: <strong>{showCertificateModal.mechanicName}</strong></span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Drukāt sertifikātu</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCertificateModal(null)}
                className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg cursor-pointer"
              >
                Aizvērt
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
