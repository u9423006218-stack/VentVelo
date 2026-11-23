import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderRecord, EmailNotification } from '../../types';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  CreditCard, 
  Check, 
  Truck, 
  CheckCircle2, 
  ArrowRight,
  Building 
} from 'lucide-react';

export const PaymentGatewayModal: React.FC = () => {
  const { 
    isCheckoutModalOpen, 
    setIsCheckoutModalOpen, 
    checkoutPayload, 
    currency, 
    formatPrice, 
    addOrder, 
    addNotification, 
    clearCart, 
    cart, 
    setActiveTab, 
    setIsSecurityModalOpen,
    showToast 
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'banklink' | 'inbank' | 'esto' | 'van_pos'>('card');
  const [selectedBank, setSelectedBank] = useState<'swedbank' | 'seb' | 'citadele' | 'luminor'>('swedbank');
  const [leaseTermMonths, setLeaseTermMonths] = useState<number>(12);
  const [estoPlan, setEstoPlan] = useState<'esto3' | 'leasing'>('esto3');
  const [extraTradeIn, setExtraTradeIn] = useState<boolean>(false);
  const [extraTradeInBike, setExtraTradeInBike] = useState<string>('');
  
  // Card inputs
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('742');
  const [cardName, setCardName] = useState('Līna Damberga');

  // Customer inputs
  const [customerName, setCustomerName] = useState('Līna Damberga');
  const [customerEmail, setCustomerEmail] = useState('lina.damberga@vatp.lv');
  const [customerPhone, setCustomerPhone] = useState('+371 29112233');
  const [shippingAddress, setShippingAddress] = useState('Inženieru iela 101, Ventspils');

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState('');

  if (!isCheckoutModalOpen || !checkoutPayload) return null;

  const totalEur = Math.round(checkoutPayload.totalEur);
  const monthlyInbankEur = Math.max(10, Math.round(totalEur / leaseTermMonths));
  const monthlyEstoEur = estoPlan === 'esto3' ? Math.round(totalEur / 3) : Math.max(10, Math.round(totalEur / leaseTermMonths));

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      const orderNum = `VV-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      setConfirmedOrderNumber(orderNum);

      const itemsToRecord = checkoutPayload.type === 'cart' 
        ? cart 
        : checkoutPayload.type === 'single_bike'
          ? [{
              id: `ci_${Date.now()}`,
              type: 'bike' as const,
              productId: checkoutPayload.data.id,
              name: checkoutPayload.data.name,
              priceEur: totalEur,
              quantity: 1,
              details: `Izmērs: ${checkoutPayload.data.selectedSize}${checkoutPayload.data.assemblyOption === 'box' ? ' · Kastē (bez garantijas)' : ' · Meistara salikts (+€35) ar garantiju'}`,
            }]
          : checkoutPayload.type === 'rental'
            ? [{
                id: `ci_${Date.now()}`,
                type: 'rental' as const,
                productId: checkoutPayload.data?.id || 'bike_rental',
                name: checkoutPayload.title,
                priceEur: totalEur,
                quantity: 1,
                details: `${checkoutPayload.data?.deliveryLabel || 'Saņemšana Rindas ielā 44'} · Ķivere un slēdzene iekļauta`,
              }]
            : [{
                id: `ci_${Date.now()}`,
                type: 'service' as const,
                productId: checkoutPayload.data?.id || 'service_job',
                name: checkoutPayload.title,
                priceEur: totalEur,
                quantity: 1,
              }];

      const resolvedMethod =
        paymentMethod === 'card'
          ? `Bankas karte (Visa ...${cardNumber.slice(-4)})`
          : paymentMethod === 'banklink'
            ? `${selectedBank.toUpperCase()} BankLink`
            : paymentMethod === 'inbank'
              ? `Inbank līzings (${leaseTermMonths} mēn. · ~${formatPrice(monthlyInbankEur)}/mēn.)${extraTradeIn ? ' + Vecā velo maiņa' : ''}`
              : paymentMethod === 'esto'
                ? `ESTO nomaksa (${estoPlan === 'esto3' ? '3 daļās bez %' : `${leaseTermMonths} mēn.`})${extraTradeIn ? ' + Vecā velo maiņa' : ''}`
                : 'Maksājums pie busiņa vai veikalā Rindas 44';

      const guaranteeDuration =
        checkoutPayload.type === 'rental'
          ? 0
          : checkoutPayload.type === 'single_bike' && checkoutPayload.data?.assemblyOption === 'box'
            ? 0
            : 24;

      const order: OrderRecord = {
        id: `ord_${Date.now()}`,
        orderNumber: orderNum,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        items: itemsToRecord,
        subtotalEur: totalEur,
        shippingEur: 0,
        totalEur,
        currency,
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          address: shippingAddress,
          city: 'Ventspils',
        },
        deliveryMethod: 'van_delivery',
        paymentStatus: 'paid',
        paymentMethod: resolvedMethod,
        trackingCode: `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
        guaranteeCertificates: [
          {
            itemName: checkoutPayload.title,
            durationMonths: guaranteeDuration,
            code:
              checkoutPayload.type === 'rental'
                ? `NOMA-${Math.floor(1000 + Math.random() * 9000)}`
                : guaranteeDuration > 0
                  ? `CERT-${Math.floor(1000 + Math.random() * 9000)}`
                  : 'BEZ-GARANTIJAS-KASTE',
          }
        ],
      };

      addOrder(order);

      // Automated email notification in natural Latvian
      const email: EmailNotification = {
        id: `em_${Date.now()}`,
        recipientEmail: customerEmail,
        recipientName: customerName,
        subject: `Maksājuma čeks un pasūtījums apstiprināts [${orderNum}]`,
        previewText: `Paldies par apmaksu ${formatPrice(totalEur)} apmērā! Pasūtījums ir apstiprināts.`,
        category: 'order_confirmation',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        referenceId: orderNum,
        read: false,
        htmlContent: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917; line-height: 1.6;">
            <div style="background-color: #1c1917; padding: 24px; color: #ffffff; border-radius: 8px 8px 0 0;">
              <h2 style="margin: 0; font-size: 20px; font-weight: 700;">VentVelo maksājuma kvīts</h2>
              <p style="margin: 4px 0 0; font-size: 13px; color: #a8a29e;">Rēķina nr.: ${orderNum}</p>
            </div>
            <div style="padding: 24px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 8px 8px; background: #ffffff;">
              <p>Labdien, ${customerName}! Esam veiksmīgi saņēmuši Jūsu maksājumu <strong>${formatPrice(totalEur)}</strong> apmērā caur drošo 256-bitu šifrēto kanālu.</p>
              
              <div style="background: #fafaf9; border-radius: 6px; padding: 16px; margin: 20px 0; border: 1px solid #e7e5e4;">
                <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; color: #78716c;">DARĪJUMA INFORMĀCIJA</p>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #1c1917;">
                  <li><strong>Pasūtījuma numurs:</strong> ${orderNum}</li>
                  <li><strong>Prece / Pakalpojums:</strong> ${checkoutPayload.title}</li>
                  <li><strong>Samaksātā summa:</strong> ${formatPrice(totalEur)} (${currency})</li>
                  <li><strong>Norēķinu veids:</strong> ${order.paymentMethod}</li>
                  <li><strong>Saņemšana:</strong> Servisa busiņa piegāde / Saņemšana darbnīcā</li>
                </ul>
              </div>

              <p style="font-size: 13px; color: #57534e;">
                Visi iegādātie produkti un to garantiju sertifikāti ir pastāvīgi pieejami Jūsu VentVelo Garāžas kontā.
              </p>
            </div>
          </div>
        `,
      };
      addNotification(email);

      if (checkoutPayload.type === 'cart') {
        clearCart();
      }
    }, 1200);
  };

  const handleClose = () => {
    setIsCheckoutModalOpen(false);
    setIsSuccess(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-stone-200 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-base text-white font-heading">VentVelo drošā maksājumu vārteja</h3>
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isSuccess ? (
            /* Success confirmation screen */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-stone-950 font-heading">
                Maksājums autorizēts un apstiprināts!
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                Paldies, {customerName}! Jūsu pasūtījums <strong className="text-stone-900 font-mono">#{confirmedOrderNumber}</strong> ir veiksmīgi reģistrēts. Automātisks apstiprinājuma e-pasts ar kvīti ir nosūtīts.
              </p>
              
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs max-w-md mx-auto space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-stone-500">Ieturētā summa:</span>
                  <span className="font-mono font-bold text-stone-900">{formatPrice(totalEur)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Apstrādātā valūta:</span>
                  <span className="font-semibold text-stone-900">{currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Loģistika:</span>
                  <span className="font-semibold text-stone-900">Servisa buss / Saņemšana darbnīcā</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => {
                    handleClose();
                    setActiveTab('dashboard');
                  }}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Skatīt manā velogaražā un pirkumu vēsturē
                </button>
                <a
                  href="https://api.whatsapp.com/message/CRYR7PFOHNY2J1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs inline-flex items-center gap-1.5"
                >
                  <span>Rakstīt WhatsApp meistaram</span>
                </a>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handlePay} className="space-y-6">
              
              {/* Order line summary */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-500 block">Kopā apmaksai:</span>
                  <span className="text-2xl font-bold font-mono text-stone-950 tabular-nums">
                    {formatPrice(totalEur)}
                  </span>
                </div>
                <div className="text-right text-xs">
                  <span className="font-semibold text-stone-900 block truncate max-w-[220px]">
                    {checkoutPayload.title}
                  </span>
                  <span className="text-stone-500 font-mono">Valūta: {currency}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider">
                  Izvēlies apmaksas vai līzinga veidu:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('inbank')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer relative ${
                      paymentMethod === 'inbank'
                        ? 'border-emerald-600 bg-emerald-50/70 font-semibold text-stone-900 ring-1 ring-emerald-500/30 shadow-xs'
                        : 'border-emerald-200 bg-emerald-50/20 hover:bg-emerald-50/50 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">Populārs</span>
                    </div>
                    <div className="font-bold text-stone-900">Inbank līzings</div>
                    <div className="text-[11px] text-stone-600 tabular-nums">No ~{formatPrice(Math.max(10, Math.round(totalEur / 36)))}/mēn.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('esto')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer relative ${
                      paymentMethod === 'esto'
                        ? 'border-amber-500 bg-amber-50 font-semibold text-stone-900 ring-1 ring-amber-500/30 shadow-xs'
                        : 'border-amber-200 bg-amber-50/30 hover:bg-amber-50/60 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      <span className="text-[10px] font-bold uppercase text-amber-900 bg-amber-200/70 px-1.5 py-0.5 rounded">0% ESTO 3</span>
                    </div>
                    <div className="font-bold text-stone-900">ESTO nomaksa</div>
                    <div className="text-[11px] text-stone-600 tabular-nums">3 × {formatPrice(Math.round(totalEur / 3))} bez %</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-stone-900 bg-stone-100 font-semibold text-stone-900 shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mb-1 text-stone-700" />
                    <div className="font-semibold text-stone-900">Bankas karte</div>
                    <div className="text-[11px] text-stone-500">Visa / Mastercard</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('banklink')}
                    className={`p-3 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                      paymentMethod === 'banklink'
                        ? 'border-stone-900 bg-stone-100 font-semibold text-stone-900 shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <Building className="w-4 h-4 mb-1 text-stone-700" />
                    <div className="font-semibold text-stone-900">Internetbanka</div>
                    <div className="text-[11px] text-stone-500">Swedbank · SEB · Citadele</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('van_pos')}
                    className={`p-3 rounded-xl border text-left text-xs transition-colors cursor-pointer col-span-2 ${
                      paymentMethod === 'van_pos'
                        ? 'border-stone-900 bg-stone-100 font-semibold text-stone-900 shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <Truck className="w-4 h-4 mb-1 text-stone-700" />
                    <div className="font-semibold text-stone-900">Maksāt pie busiņa vai veikalā Rindas ielā 44</div>
                    <div className="text-[11px] text-stone-500">Ar karti, skaidrā naudā vai vecā riteņa maiņa uz vietas</div>
                  </button>
                </div>
              </div>

              {/* Card Form */}
              {paymentMethod === 'card' && (
                <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Kartes īpašnieka Vārds, Uzvārds</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Kartes numurs</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 •••• •••• ••••"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Derīguma termiņš MM/GG</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/GG"
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">CVC drošības kods</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="•••"
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* BankLink Selector */}
              {paymentMethod === 'banklink' && (
                <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
                  <label className="block text-stone-700 font-medium">Izvēlies savu internetbanku:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'swedbank', name: 'Swedbank Latvija' },
                      { id: 'seb', name: 'SEB banka' },
                      { id: 'citadele', name: 'Citadele banka' },
                      { id: 'luminor', name: 'Luminor Latvija' },
                    ].map(bank => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setSelectedBank(bank.id as any)}
                        className={`p-3 rounded-lg border text-left cursor-pointer transition-colors ${
                          selectedBank === bank.id
                            ? 'border-amber-500 bg-white font-semibold text-stone-900 shadow-xs'
                            : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                        }`}
                      >
                        {bank.name}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Pēc pogas nospiešanas autorizācija notiek droši caur Tavas bankas Smart-ID vai kodu kalkulatoru.
                  </p>
                </div>
              )}

              {/* Inbank Leasing Panel */}
              {paymentMethod === 'inbank' && (
                <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 text-sm">Inbank nomaksa un līzings</span>
                    <span className="font-mono font-bold text-emerald-700 text-sm tabular-nums">
                      ~{formatPrice(monthlyInbankEur)} / mēn.
                    </span>
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1.5">Izvēlies atmaksas termiņu:</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[6, 12, 24, 36].map(months => (
                        <button
                          key={months}
                          type="button"
                          onClick={() => setLeaseTermMonths(months)}
                          className={`py-2 rounded-lg border font-semibold cursor-pointer transition-colors ${
                            leaseTermMonths === months
                              ? 'border-stone-900 bg-stone-900 text-white'
                              : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          {months} mēn.
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 pt-2 border-t border-stone-200 cursor-pointer text-stone-800">
                    <input
                      type="checkbox"
                      checked={extraTradeIn}
                      onChange={(e) => setExtraTradeIn(e.target.checked)}
                      className="accent-amber-600"
                    />
                    <span className="font-medium">Vēlos nodot savu veco riteni kā pirmo iemaksu</span>
                  </label>
                  {extraTradeIn && (
                    <input
                      type="text"
                      value={extraTradeInBike}
                      onChange={(e) => setExtraTradeInBike(e.target.value)}
                      placeholder="Ieraksti vecā velosipēda modeli un stāvokli..."
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                    />
                  )}
                  <p className="text-[11px] text-stone-500">
                    Līguma parakstīšana ar Smart-ID vai eParaksts aizņem 2 minūtes. Pirmā iemaksa no €0 vai ar veco velosipēdu!
                  </p>
                </div>
              )}

              {/* ESTO Leasing Panel */}
              {paymentMethod === 'esto' && (
                <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 text-sm">ESTO maksājumu plāns</span>
                    <span className="font-mono font-bold text-amber-700 text-sm tabular-nums">
                      ~{formatPrice(monthlyEstoEur)} / mēn.
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEstoPlan('esto3')}
                      className={`p-3 rounded-lg border text-left cursor-pointer ${
                        estoPlan === 'esto3'
                          ? 'border-amber-500 bg-white font-semibold text-stone-900 shadow-xs'
                          : 'border-stone-200 bg-white text-stone-600'
                      }`}
                    >
                      <div className="font-bold">ESTO 3 (0% likme)</div>
                      <div className="text-[11px] text-stone-500">3 vienādās daļās bez pārmaksas</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEstoPlan('leasing')}
                      className={`p-3 rounded-lg border text-left cursor-pointer ${
                        estoPlan === 'leasing'
                          ? 'border-amber-500 bg-white font-semibold text-stone-900 shadow-xs'
                          : 'border-stone-200 bg-white text-stone-600'
                      }`}
                    >
                      <div className="font-bold">ESTO nomaksa</div>
                      <div className="text-[11px] text-stone-500">Līdz 36 mēnešiem</div>
                    </button>
                  </div>
                  {estoPlan === 'leasing' && (
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {[6, 12, 24, 36].map(months => (
                        <button
                          key={months}
                          type="button"
                          onClick={() => setLeaseTermMonths(months)}
                          className={`py-2 rounded-lg border font-semibold cursor-pointer ${
                            leaseTermMonths === months
                              ? 'border-stone-900 bg-stone-900 text-white'
                              : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          {months} mēn.
                        </button>
                      ))}
                    </div>
                  )}
                  <label className="flex items-center gap-2 pt-2 border-t border-stone-200 cursor-pointer text-stone-800">
                    <input
                      type="checkbox"
                      checked={extraTradeIn}
                      onChange={(e) => setExtraTradeIn(e.target.checked)}
                      className="accent-amber-600"
                    />
                    <span className="font-medium">Ieskaitīt veco riteni kā pirmo iemaksu</span>
                  </label>
                  {extraTradeIn && (
                    <input
                      type="text"
                      value={extraTradeInBike}
                      onChange={(e) => setExtraTradeInBike(e.target.value)}
                      placeholder="Vecā velosipēda marka / stāvoklis..."
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                    />
                  )}
                  <p className="text-[11px] text-stone-500">
                    Tūlītējs lēmums 60 sekundēs. Piegāde kastē vai samontētam veikalā Rindas ielā 44.
                  </p>
                </div>
              )}

              {/* Van POS notice */}
              {paymentMethod === 'van_pos' && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs space-y-1 text-stone-800">
                  <div className="font-bold text-stone-950 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-amber-600" />
                    <span>Apmaksa pie busiņa šofera vai darbnīcā Rindas ielā 44</span>
                  </div>
                  <p className="leading-relaxed">
                    Varēsi norēķināties ar bankas karti, telefonu, skaidrā naudā vai nodot savu veco riteni pirmajai iemaksai pie velosipēda saņemšanas.
                  </p>
                </div>
              )}

              {/* Security Badges Strip */}
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>256-bitu SSL šifrēts savienojums</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSecurityModalOpen(true)}
                  className="hover:text-stone-900 underline cursor-pointer text-[11px]"
                >
                  GDPR un datu aizsardzība
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md font-heading"
              >
                {isProcessing ? (
                  <span>Apstrādā pieprasījumu...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>
                      {paymentMethod === 'inbank'
                        ? `Noformēt ar Inbank (~${formatPrice(monthlyInbankEur)}/mēn.)`
                        : paymentMethod === 'esto'
                          ? `Noformēt ar ESTO (~${formatPrice(monthlyEstoEur)}/mēn.)`
                          : `Droši apmaksāt (${formatPrice(totalEur)})`}
                    </span>
                  </>
                )}
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
