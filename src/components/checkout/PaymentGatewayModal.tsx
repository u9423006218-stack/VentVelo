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

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'banklink' | 'apple_pay' | 'van_pos'>('card');
  const [selectedBank, setSelectedBank] = useState<'swedbank' | 'seb' | 'citadele' | 'luminor'>('swedbank');
  
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

  const totalEur = checkoutPayload.totalEur;

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
              priceEur: checkoutPayload.data.priceEur,
              quantity: 1,
              details: `Izmērs: ${checkoutPayload.data.selectedSize}`,
            }]
          : [{
              id: `ci_${Date.now()}`,
              type: 'service' as const,
              productId: checkoutPayload.data?.id || 'service_job',
              name: checkoutPayload.title,
              priceEur: totalEur,
              quantity: 1,
            }];

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
        paymentMethod: paymentMethod === 'card' 
          ? `Bankas karte (Visa ...${cardNumber.slice(-4)})` 
          : paymentMethod === 'banklink' 
            ? `${selectedBank.toUpperCase()} BankLink` 
            : 'Maksājums pie busiņa ar POS termināli',
        trackingCode: `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
        guaranteeCertificates: [
          {
            itemName: checkoutPayload.title,
            durationMonths: 24,
            code: `CERT-${Math.floor(1000 + Math.random() * 9000)}`,
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
                  Izvēlies apmaksas veidu:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-amber-500 bg-amber-50/50 font-semibold text-stone-900 shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mb-1 text-stone-700" />
                    <span>Bankas karte</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('banklink')}
                    className={`p-3 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                      paymentMethod === 'banklink'
                        ? 'border-amber-500 bg-amber-50/50 font-semibold text-stone-900 shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <Building className="w-4 h-4 mb-1 text-stone-700" />
                    <span>Latvijas BankLink</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('van_pos')}
                    className={`p-3 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                      paymentMethod === 'van_pos'
                        ? 'border-amber-500 bg-amber-50/50 font-semibold text-stone-900 shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <Truck className="w-4 h-4 mb-1 text-stone-700" />
                    <span>Maksāt pie busiņa</span>
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

              {/* Van POS notice */}
              {paymentMethod === 'van_pos' && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs space-y-1 text-stone-800">
                  <div className="font-bold text-stone-950 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-amber-600" />
                    <span>Apmaksa pie busiņa šofera</span>
                  </div>
                  <p className="leading-relaxed">
                    Mūsu šoferim līdzi ir bezkontakta POS karšu terminālis. Varēsi norēķināties ar bankas karti, telefonu vai skaidrā naudā pie velosipēda nodošanas/saņemšanas.
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
                  <span>Apstrādā drošo maksājumu...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Droši apmaksāt ({formatPrice(totalEur)})</span>
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
