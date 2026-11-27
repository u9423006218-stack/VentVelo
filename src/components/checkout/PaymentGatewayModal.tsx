import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CartItem, EmailNotification, OrderRecord } from '../../types';
import { BikeImage } from '../common/BikeImage';
import {
  buildInvoiceHtml,
  downloadInvoiceHtml,
  InvoiceDispatchPayload,
  sendInvoiceEmails,
  STORE_OFFICIAL_EMAIL,
  submitViaStandardForm,
} from '../../utils/invoiceEmail';
import {
  ArrowRight,
  Banknote,
  Building,
  Check,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Download,
  Lock,
  Mail,
  MapPin,
  Pencil,
  ShieldCheck,
  Tag,
  Truck,
  X,
} from 'lucide-react';

type CheckoutStep = 1 | 2 | 3 | 4;
type PaymentMethodType = 'incredit' | 'card' | 'banklink' | 'cash_onsite';
type DeliveryOptionId = 'store_pickup' | 'van_ventspils' | 'van_usma' | 'van_talsi' | 'service_included';

interface DeliveryOptionConfig {
  id: DeliveryOptionId;
  title: string;
  subtitle: string;
  baseFeeEur: number;
  freeThresholdEur: number | null;
  methodType: 'store_pickup' | 'van_delivery';
}

const DELIVERY_OPTIONS: DeliveryOptionConfig[] = [
  {
    id: 'store_pickup',
    title: 'Saņemšana VentVelo veikalā (Rindas iela 44, Ventspils)',
    subtitle: 'Pārbaudīts un gatavs · Darba dienās 10:00–18:00, Sestd. 10:00–15:00',
    baseFeeEur: 0,
    freeThresholdEur: 0,
    methodType: 'store_pickup',
  },
  {
    id: 'van_ventspils',
    title: 'VentVelo servisa busa piegāde Ventspilī un novadā',
    subtitle: 'Piegāde līdz mājas durvīm Ventspilī un Pārventā · 1 darba dienas laikā',
    baseFeeEur: 8,
    freeThresholdEur: 50,
    methodType: 'van_delivery',
  },
  {
    id: 'van_usma',
    title: 'VentVelo servisa busa piegāde uz Usmu',
    subtitle: 'Regulārie reisi Pirmd., Trešd., Piektd. · Arī viesu namiem un kempingiem',
    baseFeeEur: 18,
    freeThresholdEur: 120,
    methodType: 'van_delivery',
  },
  {
    id: 'van_talsi',
    title: 'VentVelo servisa busa piegāde Talsu rajonā',
    subtitle: 'Otrd. un Ceturtd. maršruts · Talsi, Stende, Pastende, Sabile un Talsu novads',
    baseFeeEur: 22,
    freeThresholdEur: 150,
    methodType: 'van_delivery',
  },
];

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
    setIsSecurityModalOpen,
    showToast,
  } = useApp();

  // Stepper & Accordion State
  const [activeStep, setActiveStep] = useState<CheckoutStep>(1);
  const [unlockedStep, setUnlockedStep] = useState<CheckoutStep>(1);
  const [stepError, setStepError] = useState<string | null>(null);
  const [showOrderItems, setShowOrderItems] = useState<boolean>(true);

  // Step 1: Personīgā informācija
  const [customerType, setCustomerType] = useState<'private' | 'company'>('private');
  const [companyName, setCompanyName] = useState('');
  const [companyRegNo, setCompanyRegNo] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Step 2: Piegādes adrese
  const [addressMode, setAddressMode] = useState<'address' | 'store'>('address');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Step 3: Piegādes veids
  const [deliveryOptionId, setDeliveryOptionId] = useState<DeliveryOptionId>('store_pickup');

  // Step 4: Maksājums
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('incredit');
  const [selectedBank, setSelectedBank] = useState<'swedbank' | 'seb' | 'citadele' | 'luminor'>('swedbank');
  const [leaseTermMonths, setLeaseTermMonths] = useState<number>(12);
  const [firstPaymentEur, setFirstPaymentEur] = useState<number>(0);
  const [extraTradeIn, setExtraTradeIn] = useState<boolean>(false);
  const [extraTradeInBike, setExtraTradeInBike] = useState<string>('');
  const [cashSubMethod, setCashSubMethod] = useState<'store_cash_card' | 'courier_cash_pos'>('store_cash_card');

  // Card inputs (always empty by default)
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  // Promo code
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<'VENTVELO5' | null>(null);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  // Processing & Confirmation
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);
  const [lastInvoicePayload, setLastInvoicePayload] = useState<InvoiceDispatchPayload | null>(null);
  const [emailDispatchState, setEmailDispatchState] = useState<
    'idle' | 'sending' | 'sent' | 'needs_activation' | 'error'
  >('idle');

  // Reset form cleanly whenever modal opens with a payload
  useEffect(() => {
    if (!isCheckoutModalOpen || !checkoutPayload) return;

    setActiveStep(1);
    setUnlockedStep(1);
    setStepError(null);
    setIsProcessing(false);
    setIsSuccess(false);
    setConfirmedOrder(null);
    setLastInvoicePayload(null);
    setEmailDispatchState('idle');
    setPromoInput('');
    setAppliedPromo(null);
    setPromoMessage(null);
    setFirstPaymentEur(0);

    // Clear sensitive/card fields on every open
    setCardNumber('');
    setCardExpiry('');
    setCardCvc('');
    setCardName('');

    if (checkoutPayload.type === 'service' && checkoutPayload.data) {
      const job = checkoutPayload.data;
      const parts = String(job.customerName || '').trim().split(/\s+/);
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setCustomerEmail(job.customerEmail || '');
      setCustomerPhone(job.customerPhone || '');
      setDeliveryOptionId('service_included');
      if (job.deliveryType === 'van_pickup' && job.pickupLocation) {
        setAddressMode('address');
        setStreetAddress(job.pickupLocation.address || '');
        setCity(job.pickupLocation.city || job.pickupLocation.region || '');
        setPostalCode(job.pickupLocation.postalCode || '');
      } else {
        setAddressMode('store');
      }
    } else {
      setCustomerType('private');
      setCompanyName('');
      setCompanyRegNo('');
      setFirstName('');
      setLastName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setTermsAccepted(false);
      setNewsletterOptIn(false);
      setAddressMode('address');
      setStreetAddress('');
      setCity('');
      setPostalCode('');
      setDeliveryNotes('');
      setDeliveryOptionId('store_pickup');
      setExtraTradeIn(Boolean(checkoutPayload.type === 'single_bike' && checkoutPayload.data?.useTradeIn));
      setExtraTradeInBike(
        checkoutPayload.type === 'single_bike' && checkoutPayload.data?.tradeInModel
          ? String(checkoutPayload.data.tradeInModel)
          : ''
      );
    }
  }, [isCheckoutModalOpen, checkoutPayload]);

  if (!isCheckoutModalOpen || !checkoutPayload) return null;

  const subtotalEur = Math.max(0, Math.round(checkoutPayload.totalEur));
  const discountEur = appliedPromo === 'VENTVELO5' ? Math.round(subtotalEur * 0.05) : 0;
  const afterDiscountEur = Math.max(0, subtotalEur - discountEur);

  const getShippingCost = (optId: DeliveryOptionId): number => {
    if (optId === 'service_included') return 0;
    const opt = DELIVERY_OPTIONS.find((o) => o.id === optId);
    if (!opt) return 0;
    if (opt.freeThresholdEur !== null && afterDiscountEur >= opt.freeThresholdEur) {
      return 0;
    }
    return opt.baseFeeEur;
  };

  const selectedDeliveryConfig =
    deliveryOptionId === 'service_included'
      ? {
          id: 'service_included' as const,
          title:
            checkoutPayload.data?.deliveryType === 'van_pickup'
              ? `Servisa busa piegāde (${checkoutPayload.data?.pickupLocation?.region || 'Ventspils'}) — iekļauta tāmē`
              : 'Darbnīcā Rindas ielā 44 — iekļauta tāmē',
          subtitle: 'Piegāde un izpilde saskaņota servisa pieteikumā',
          baseFeeEur: 0,
          freeThresholdEur: 0,
          methodType: (checkoutPayload.data?.deliveryType === 'van_pickup' ? 'van_delivery' : 'store_pickup') as
            | 'van_delivery'
            | 'store_pickup',
        }
      : DELIVERY_OPTIONS.find((o) => o.id === deliveryOptionId) || DELIVERY_OPTIONS[0];

  const shippingEur = unlockedStep >= 3 || activeStep >= 3 ? getShippingCost(deliveryOptionId) : 0;
  const grandTotalEur = Math.max(0, afterDiscountEur + shippingEur);

  // Financing calculations (Incredit)
  const clampedFirstPayment = Math.min(Math.max(0, Math.round(firstPaymentEur)), Math.max(0, grandTotalEur - 30));
  const financedAmountEur = Math.max(0, grandTotalEur - clampedFirstPayment);
  const monthlyIncreditEur = Math.max(10, Math.round(financedAmountEur / leaseTermMonths));

  // Right column summary line items
  const summaryItems: CartItem[] =
    checkoutPayload.type === 'cart'
      ? cart
      : checkoutPayload.type === 'single_bike'
        ? [
            {
              id: 'single_bike_preview',
              type: 'bike',
              productId: checkoutPayload.data?.id || 'bike',
              name: checkoutPayload.data?.name || checkoutPayload.title,
              priceEur: subtotalEur,
              quantity: 1,
              image: checkoutPayload.data?.image,
              details: `Izmērs: ${checkoutPayload.data?.selectedSize || 'Standarts'}${
                checkoutPayload.data?.assemblyOption === 'box'
                  ? ' · Kastē'
                  : ' · Meistara salikts (+€35) ar garantiju'
              }`,
            },
          ]
        : checkoutPayload.type === 'rental'
          ? [
              {
                id: 'rental_preview',
                type: 'rental',
                productId: checkoutPayload.data?.id || 'rental',
                name: checkoutPayload.title,
                priceEur: subtotalEur,
                quantity: 1,
                image: checkoutPayload.data?.image,
                details: `${checkoutPayload.data?.durationLabel || ''} · ${checkoutPayload.data?.startDate || ''}`,
              },
            ]
          : [
              {
                id: 'service_preview',
                type: 'service',
                productId: checkoutPayload.data?.id || 'service',
                name: checkoutPayload.title,
                priceEur: subtotalEur,
                quantity: 1,
                details: checkoutPayload.data?.bikeModel || 'Velosipēda apkope',
              },
            ];

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      setPromoMessage('Ievadi atlaides kodu, piemēram, VENTVELO5.');
      return;
    }
    if (code === 'VENTVELO5') {
      setAppliedPromo('VENTVELO5');
      setPromoMessage('Atlaide 5% apmērā piemērota!');
    } else {
      setPromoMessage('Nederīgs kods. Aktīvais kods: VENTVELO5 (-5%).');
    }
  };

  const handleStep1Continue = () => {
    setStepError(null);
    if (customerType === 'company' && !companyName.trim()) {
      setStepError('Lūdzu, norādi uzņēmuma nosaukumu.');
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setStepError('Lūdzu, ievadi vārdu un uzvārdu.');
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setStepError('Lūdzu, ievadi korektu e-pasta adresi rēķinam un apstiprinājumam.');
      return;
    }
    if (customerPhone.replace(/\D/g, '').length < 7) {
      setStepError('Lūdzu, ievadi tālruņa numuru saziņai par piegādi.');
      return;
    }
    if (!termsAccepted) {
      setStepError('Lai turpinātu, apstiprini iepazīšanos ar lietošanas noteikumiem un privātuma politiku.');
      return;
    }
    setUnlockedStep((prev) => (prev < 2 ? 2 : prev));
    setActiveStep(2);
  };

  const handleStep2Continue = () => {
    setStepError(null);
    if (addressMode === 'address') {
      if (!streetAddress.trim() || !city.trim()) {
        setStepError('Lūdzu, norādi piegādes ielu/māju un pilsētu vai pagastu, vai izvēlies saņemšanu veikalā.');
        return;
      }
    } else {
      if (deliveryOptionId !== 'service_included') {
        setDeliveryOptionId('store_pickup');
      }
    }
    setUnlockedStep((prev) => (prev < 3 ? 3 : prev));
    setActiveStep(3);
  };

  const handleStep3Continue = () => {
    setStepError(null);
    if (deliveryOptionId === 'store_pickup' && paymentMethod === 'cash_onsite') {
      setCashSubMethod('store_cash_card');
    } else if (deliveryOptionId !== 'store_pickup' && paymentMethod === 'cash_onsite') {
      setCashSubMethod('courier_cash_pos');
    }
    setUnlockedStep(4);
    setActiveStep(4);
  };

  const formatCardNumberInput = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiryInput = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setStepError(null);

    if (paymentMethod === 'card') {
      const cardDigits = cardNumber.replace(/\D/g, '');
      if (!cardName.trim()) {
        setStepError('Lūdzu, ievadi kartes īpašnieka vārdu un uzvārdu.');
        return;
      }
      if (cardDigits.length < 12) {
        setStepError('Lūdzu, ievadi derīgu bankas kartes numuru.');
        return;
      }
      if (cardExpiry.length < 4 || cardCvc.replace(/\D/g, '').length < 3) {
        setStepError('Lūdzu, pārbaudi kartes derīguma termiņu un CVC kodu.');
        return;
      }
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const orderNum = `VV-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || 'Klients';
      const digitsOnly = cardNumber.replace(/\D/g, '');

      const resolvedMethod =
        paymentMethod === 'incredit'
          ? `Incredit nomaksa (${leaseTermMonths} mēn. · ~${formatPrice(monthlyIncreditEur)}/mēn.${
              clampedFirstPayment > 0 ? ` · Pirmā iemaksa ${formatPrice(clampedFirstPayment)}` : ''
            }${extraTradeIn ? ' + Vecā velo maiņa' : ''})`
          : paymentMethod === 'card'
            ? digitsOnly.length >= 4
              ? `Bankas karte (••• ${digitsOnly.slice(-4)})`
              : 'Bankas karte (Visa / Mastercard)'
            : paymentMethod === 'banklink'
              ? `${selectedBank.toUpperCase()} internetbanka`
              : cashSubMethod === 'store_cash_card'
                ? 'Skaidrā naudā vai ar karti veikalā (Rindas iela 44)'
                : 'Skaidrā naudā vai terminālī piegādes brīdī';

      const guaranteeDuration =
        checkoutPayload.type === 'rental'
          ? 0
          : checkoutPayload.type === 'single_bike' && checkoutPayload.data?.assemblyOption === 'box'
            ? 0
            : 24;

      const fullAddress =
        addressMode === 'store' || selectedDeliveryConfig.methodType === 'store_pickup'
          ? 'Saņemšana veikalā Rindas iela 44, Ventspils'
          : [streetAddress.trim(), city.trim(), postalCode.trim()].filter(Boolean).join(', ');

      const newOrder: OrderRecord = {
        id: `ord_${Date.now()}`,
        orderNumber: orderNum,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        items: summaryItems.map((it) => ({
          id: it.id,
          type: it.type,
          productId: it.productId,
          name: it.name,
          priceEur: it.priceEur,
          quantity: it.quantity,
          image: it.image,
          details: it.details,
        })),
        subtotalEur: afterDiscountEur,
        shippingEur,
        totalEur: grandTotalEur,
        currency,
        customer: {
          name: customerType === 'company' && companyName ? `${fullName} (${companyName})` : fullName,
          email: customerEmail.trim(),
          phone: customerPhone.trim(),
          address: fullAddress,
          city: addressMode === 'store' ? 'Ventspils' : city.trim() || 'Ventspils / Talsu rajons',
        },
        deliveryMethod: selectedDeliveryConfig.methodType,
        paymentStatus: paymentMethod === 'card' || paymentMethod === 'banklink' ? 'paid' : 'pending',
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
          },
        ],
      };

      addOrder(newOrder);
      setConfirmedOrder(newOrder);
      setIsSuccess(true);

      const invoicePayload: InvoiceDispatchPayload = {
        orderNumber: orderNum,
        createdAt: newOrder.createdAt,
        customerName: newOrder.customer.name,
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        address: fullAddress,
        deliveryLabel: selectedDeliveryConfig.title,
        paymentMethodLabel: resolvedMethod,
        items: summaryItems.map((it) => ({
          name: it.name,
          details: it.details,
          quantity: it.quantity,
          unitPriceFormatted: formatPrice(it.priceEur),
          lineTotalFormatted: formatPrice(it.priceEur * it.quantity),
        })),
        subtotalFormatted: formatPrice(subtotalEur),
        discountFormatted: discountEur > 0 ? formatPrice(discountEur) : undefined,
        shippingFormatted: shippingEur === 0 ? 'Bezmaksas (€0)' : formatPrice(shippingEur),
        totalFormatted: formatPrice(grandTotalEur),
        notes: [
          extraTradeIn && extraTradeInBike ? `Vecā riteņa maiņa: ${extraTradeInBike}` : '',
          deliveryNotes.trim() ? `Piegādes piezīme: ${deliveryNotes.trim()}` : '',
          companyRegNo.trim() ? `Uzņēmuma Reģ./PVN Nr.: ${companyRegNo.trim()}` : '',
        ]
          .filter(Boolean)
          .join(' | '),
        kind: checkoutPayload.type === 'service' ? 'service' : 'order',
      };

      setLastInvoicePayload(invoicePayload);
      setEmailDispatchState('sending');

      const email: EmailNotification = {
        id: `em_${Date.now()}`,
        recipientEmail: customerEmail.trim() || STORE_OFFICIAL_EMAIL,
        recipientName: fullName,
        subject: `VentVelo Rēķins #${orderNum} [${formatPrice(grandTotalEur)}]`,
        previewText: `Pasūtījums ${orderNum} (${formatPrice(grandTotalEur)}) reģistrēts. Norēķinu veids: ${resolvedMethod}.`,
        category: 'order_confirmation',
        timestamp: newOrder.createdAt,
        referenceId: orderNum,
        read: false,
        htmlContent: buildInvoiceHtml(invoicePayload),
      };
      addNotification(email);

      void sendInvoiceEmails(invoicePayload).then((res) => {
        if (res.ok) {
          setEmailDispatchState('sent');
          showToast(
            res.customerIncluded
              ? `Rēķins #${orderNum} nosūtīts uz ${customerEmail.trim()} un ${STORE_OFFICIAL_EMAIL}!`
              : `Rēķins #${orderNum} nosūtīts uz ${STORE_OFFICIAL_EMAIL}!`
          );
        } else if (res.needsActivation) {
          setEmailDispatchState('needs_activation');
          showToast(`Nepieciešama vienreizēja e-pasta aktivizācija adresē ${STORE_OFFICIAL_EMAIL}!`);
        } else {
          setEmailDispatchState('error');
        }
      });

      if (checkoutPayload.type === 'cart') {
        clearCart();
      }
    }, 700);
  };

  const handleClose = () => {
    setIsCheckoutModalOpen(false);
    setIsSuccess(false);
  };

  const bankLabels: Record<typeof selectedBank, string> = {
    swedbank: 'Swedbank',
    seb: 'SEB banka',
    citadele: 'Citadele',
    luminor: 'Luminor',
  };

  const getSubmitButtonLabel = () => {
    if (isProcessing) return 'Sagatavo pasūtījumu...';
    if (paymentMethod === 'incredit') {
      return `Apstiprināt un noformēt Incredit nomaksu (~${formatPrice(monthlyIncreditEur)}/mēn.)`;
    }
    if (paymentMethod === 'card') {
      return `Droši apmaksāt ar karti (${formatPrice(grandTotalEur)})`;
    }
    if (paymentMethod === 'banklink') {
      return `Turpināt uz ${bankLabels[selectedBank]} (${formatPrice(grandTotalEur)})`;
    }
    return `Apstiprināt pasūtījumu — apmaksa uz vietas (${formatPrice(grandTotalEur)})`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-start sm:items-center justify-center p-2 sm:p-5">
      <div className="bg-stone-50 border border-stone-200 rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Top Bar */}
        <div className="bg-stone-900 text-white px-5 sm:px-7 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-white font-heading leading-tight">
                Pasūtījuma noformēšana
              </h2>
              <p className="text-[11px] text-stone-400">
                VentVelo kase · Rindas iela 44, Ventspils · Droša šifrēta datu apstrāde
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Aizvērt kases logu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6">
          {isSuccess && confirmedOrder ? (
            /* Confirmation View */
            <div className="max-w-xl mx-auto bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-xs my-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-bold text-stone-950 font-heading">
                  {paymentMethod === 'cash_onsite'
                    ? 'Pasūtījums apstiprināts un rezervēts!'
                    : paymentMethod === 'incredit'
                      ? 'Pasūtījums reģistrēts Incredit nomaksai!'
                      : 'Maksājums apstiprināts un pasūtījums pieņemts!'}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Paldies, <strong className="text-stone-900">{confirmedOrder.customer.name}</strong>! Jūsu pasūtījuma
                  numurs ir <strong className="font-mono text-stone-950">#{confirmedOrder.orderNumber}</strong>.
                </p>
              </div>

              {paymentMethod === 'incredit' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left text-xs text-stone-800 space-y-1">
                  <div className="font-bold text-stone-950">
                    Nākamais solis (Incredit nomaksa):
                  </div>
                  <p className="leading-relaxed">
                    Incredit nomaksas pieteikuma saite ar Smart-ID / eParaksts parakstīšanu ir nosūtīta uz{' '}
                    <strong>{confirmedOrder.customer.email}</strong>. Pēc līguma apstiprināšanas meistars Raivis sagatavos
                    velosipēdu saņemšanai vai piegādei.
                  </p>
                </div>
              )}

              {/* Automatic Invoice Dispatch Status */}
              <div
                className={`rounded-xl p-3.5 text-left text-xs border flex items-start gap-2.5 ${
                  emailDispatchState === 'sent'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : emailDispatchState === 'needs_activation' || emailDispatchState === 'error'
                      ? 'bg-amber-50 border-amber-200 text-stone-800'
                      : 'bg-stone-50 border-stone-200 text-stone-700'
                }`}
              >
                <Mail className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" />
                <div className="space-y-2 leading-relaxed">
                  {emailDispatchState === 'sending' && (
                    <p className="font-medium">
                      Sūta elektronisko rēķinu uz <strong>{confirmedOrder.customer.email}</strong> un{' '}
                      <strong>{STORE_OFFICIAL_EMAIL}</strong>...
                    </p>
                  )}
                  {emailDispatchState === 'sent' && (
                    <p>
                      <strong className="font-semibold">Rēķins nosūtīts automātiski!</strong> Rēķina kopija nosūtīta uz{' '}
                      <strong>{confirmedOrder.customer.email}</strong> un veikala oficiālo e-pastu{' '}
                      <strong>{STORE_OFFICIAL_EMAIL}</strong>.
                    </p>
                  )}
                  {emailDispatchState === 'needs_activation' && (
                    <>
                      <p>
                        <strong className="font-semibold">Nepieciešama vienreizēja e-pasta aktivizācija!</strong> Uz{' '}
                        <strong>{STORE_OFFICIAL_EMAIL}</strong> ir izsūtīta FormSubmit apstiprinājuma vēstule ar pogu{' '}
                        <em>Activate Form</em> (pārbaudi arī Gmail <strong>Spam / Mēstules</strong> un{' '}
                        <strong>Atjauninājumi / Reklāmas</strong>). Kad tā tiks apstiprināta, visi rēķini tiks sūtīti
                        pilnībā automātiski.
                      </p>
                      {lastInvoicePayload && (
                        <button
                          type="button"
                          onClick={() => submitViaStandardForm(lastInvoicePayload)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold rounded-lg text-[11px] cursor-pointer"
                        >
                          Pieprasīt aktivizāciju / nosūtīt caur FormSubmit lapu
                        </button>
                      )}
                    </>
                  )}
                  {emailDispatchState === 'error' && (
                    <>
                      <p>
                        Pasūtījums apstiprināts! Pārlūka satura bloķētājs vai lokālais priekšskatījums neļāva nosūtīt
                        rēķinu fonā — vari to nosūtīt caur FormSubmit lapu vai lejupielādēt zemāk.
                      </p>
                      {lastInvoicePayload && (
                        <button
                          type="button"
                          onClick={() => submitViaStandardForm(lastInvoicePayload)}
                          className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg text-[11px] cursor-pointer"
                        >
                          Nosūtīt rēķinu caur FormSubmit lapu
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs space-y-2 text-left">
                <div className="flex justify-between gap-4">
                  <span className="text-stone-500">Summa (ar PVN):</span>
                  <span className="font-mono font-bold text-stone-950 tabular-nums">
                    {formatPrice(confirmedOrder.totalEur)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-stone-500">Apmaksas veids:</span>
                  <span className="font-semibold text-stone-900 text-right">{confirmedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-stone-500">Piegādes veids:</span>
                  <span className="font-semibold text-stone-900 text-right">{selectedDeliveryConfig.title}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-stone-500">Adrese / Saņemšana:</span>
                  <span className="font-medium text-stone-800 text-right">{confirmedOrder.customer.address}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap justify-center gap-3">
                {lastInvoicePayload && (
                  <button
                    type="button"
                    onClick={() => downloadInvoiceHtml(lastInvoicePayload)}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 rounded-lg text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Lejupielādēt rēķinu</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Aizvērt
                </button>
                <a
                  href="https://api.whatsapp.com/message/CRYR7PFOHNY2J1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs inline-flex items-center gap-1.5"
                >
                  <span>Sazināties WhatsApp ar meistaru</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            /* 2-Column Veloprofs-Style Checkout Layout */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* RIGHT COLUMN: Order Summary & Promo Code */}
              <aside className="lg:col-span-4 lg:order-2 lg:sticky lg:top-0 space-y-4">
                <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
                  {/* Items Count & Toggle */}
                  <div className="px-5 py-3.5 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
                    <span className="text-xs font-bold text-stone-900">
                      {summaryItems.reduce((sum, i) => sum + i.quantity, 0)}{' '}
                      {summaryItems.reduce((sum, i) => sum + i.quantity, 0) === 1 ? 'vienība' : 'vienības'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowOrderItems((prev) => !prev)}
                      className="text-xs font-medium text-stone-600 hover:text-stone-950 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>{showOrderItems ? 'paslēpt sīkāk' : 'parādīt sīkāk'}</span>
                      {showOrderItems ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Expandable Items List */}
                  {showOrderItems && (
                    <div className="px-5 py-3 divide-y divide-stone-100 max-h-60 overflow-y-auto">
                      {summaryItems.map((item) => (
                        <div key={item.id} className="py-2.5 flex items-start gap-3">
                          {item.image && (
                            <BikeImage
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-contain bg-white border border-stone-200 p-0.5 shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-stone-900 leading-snug line-clamp-2">
                              {item.quantity > 1 ? `${item.quantity} × ` : ''}
                              {item.name}
                            </div>
                            {item.details && (
                              <div className="text-[11px] text-stone-500 mt-0.5 leading-snug">{item.details}</div>
                            )}
                          </div>
                          <div className="text-xs font-mono font-bold text-stone-950 tabular-nums shrink-0">
                            {formatPrice(item.priceEur * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pricing Breakdown */}
                  <div className="px-5 py-4 border-t border-stone-200 space-y-2 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>Starpsumma</span>
                      <span className="font-mono font-semibold text-stone-900 tabular-nums">
                        {formatPrice(subtotalEur)}
                      </span>
                    </div>

                    {discountEur > 0 && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Atlaide ({appliedPromo})</span>
                        <span className="font-mono font-bold tabular-nums">-{formatPrice(discountEur)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-stone-600">
                      <span>Piegādes izmaksas</span>
                      {unlockedStep >= 3 || activeStep >= 3 ? (
                        <span className="font-mono font-semibold text-stone-900 tabular-nums">
                          {shippingEur === 0 ? 'Bezmaksas (€0)' : formatPrice(shippingEur)}
                        </span>
                      ) : (
                        <span className="text-stone-500">Izvēlies 3. solī</span>
                      )}
                    </div>

                    <div className="pt-3 border-t border-stone-200 flex items-baseline justify-between">
                      <span className="text-sm font-bold text-stone-950 font-heading">Kopā (ar PVN)</span>
                      <span className="text-xl font-bold font-mono text-stone-950 tabular-nums">
                        {formatPrice(grandTotalEur)}
                      </span>
                    </div>

                    {activeStep === 4 && paymentMethod === 'incredit' && (
                      <div className="mt-2 pt-2.5 border-t border-dashed border-stone-200 space-y-1 text-[11px]">
                        {clampedFirstPayment > 0 && (
                          <div className="flex justify-between text-stone-600">
                            <span>Pirmā iemaksa:</span>
                            <span className="font-mono font-semibold text-stone-900 tabular-nums">
                              {formatPrice(clampedFirstPayment)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-emerald-800 font-semibold">
                          <span>Incredit ({leaseTermMonths} mēn.):</span>
                          <span className="font-mono font-bold tabular-nums">
                            ~{formatPrice(monthlyIncreditEur)}/mēn.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Promo Code Row */}
                  <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          placeholder="Atlaides vai kupona kods"
                          className="w-full pl-8 pr-2.5 py-2 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="px-3.5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        Pievienot
                      </button>
                    </div>
                    {promoMessage && (
                      <p className={`text-[11px] ${appliedPromo ? 'text-emerald-700 font-medium' : 'text-stone-600'}`}>
                        {promoMessage}
                      </p>
                    )}
                  </div>
                </div>

                {/* Compact Trust & Security Block */}
                <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 text-[11px] text-stone-600 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>256-bitu SSL šifrēts savienojums</span>
                  </div>
                  <p className="leading-relaxed">
                    Jautājumi par Incredit nomaksu vai piegādi?{' '}
                    <a
                      href="https://api.whatsapp.com/message/CRYR7PFOHNY2J1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-900 font-semibold underline"
                    >
                      Raksti WhatsApp meistaram
                    </a>{' '}
                    vai skati{' '}
                    <button
                      type="button"
                      onClick={() => setIsSecurityModalOpen(true)}
                      className="text-stone-900 font-semibold underline cursor-pointer"
                    >
                      GDPR noteikumus
                    </button>
                    .
                  </p>
                </div>
              </aside>

              {/* LEFT COLUMN: 4-Step Veloprofs Accordion Flow */}
              <div className="lg:col-span-8 lg:order-1 space-y-3">
                {stepError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 text-xs font-medium px-4 py-3 rounded-xl">
                    {stepError}
                  </div>
                )}

                {/* STEP 1: Personīgā informācija */}
                <section className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
                  <div
                    onClick={() => {
                      if (activeStep !== 1) {
                        setStepError(null);
                        setActiveStep(1);
                      }
                    }}
                    className={`px-5 py-4 flex items-center justify-between gap-3 ${
                      activeStep !== 1 ? 'cursor-pointer hover:bg-stone-50/70' : 'border-b border-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                          activeStep > 1
                            ? 'bg-emerald-600 text-white'
                            : activeStep === 1
                              ? 'bg-stone-900 text-white'
                              : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {activeStep > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
                      </span>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-stone-950 font-heading">
                          Personīgā informācija
                        </h3>
                        {activeStep !== 1 && firstName && (
                          <p className="text-xs text-stone-500 mt-0.5">
                            {firstName} {lastName} · {customerEmail} · {customerPhone}
                          </p>
                        )}
                      </div>
                    </div>
                    {activeStep !== 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStepError(null);
                          setActiveStep(1);
                        }}
                        className="text-xs font-semibold text-stone-700 hover:text-stone-950 inline-flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Labot</span>
                      </button>
                    )}
                  </div>

                  {activeStep === 1 && (
                    <div className="p-5 sm:p-6 space-y-4 text-xs">
                      {/* Customer Type */}
                      <div className="flex flex-wrap items-center gap-5 pb-1">
                        <span className="font-semibold text-stone-700 min-w-[110px]">Statuss</span>
                        <label className="inline-flex items-center gap-2 cursor-pointer text-stone-900 font-medium">
                          <input
                            type="radio"
                            name="customerType"
                            checked={customerType === 'private'}
                            onChange={() => setCustomerType('private')}
                            className="accent-stone-900"
                          />
                          <span>Privātpersona</span>
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer text-stone-900 font-medium">
                          <input
                            type="radio"
                            name="customerType"
                            checked={customerType === 'company'}
                            onChange={() => setCustomerType('company')}
                            className="accent-stone-900"
                          />
                          <span>Uzņēmums (Juridiska persona)</span>
                        </label>
                      </div>

                      {customerType === 'company' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                          <div>
                            <label className="block text-stone-700 font-medium mb-1">Uzņēmuma nosaukums *</label>
                            <input
                              type="text"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              placeholder="SIA Nosaukums"
                              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-stone-700 font-medium mb-1">Reģ. Nr. / PVN Nr.</label>
                            <input
                              type="text"
                              value={companyRegNo}
                              onChange={(e) => setCompanyRegNo(e.target.value)}
                              placeholder="LV4000..."
                              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-stone-700 font-medium mb-1">Vārds *</label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Ievadi vārdu"
                            className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                          />
                        </div>
                        <div>
                          <label className="block text-stone-700 font-medium mb-1">Uzvārds *</label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Ievadi uzvārdu"
                            className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-stone-700 font-medium mb-1">E-pasts *</label>
                          <input
                            type="email"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="vards@epasts.lv"
                            className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                          />
                          <p className="text-[11px] text-stone-500 mt-1">
                            Rēķinam, līzinga saitei un garantijas sertifikātam
                          </p>
                        </div>
                        <div>
                          <label className="block text-stone-700 font-medium mb-1">Tālrunis *</label>
                          <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="+371 20000000"
                            className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                          />
                          <p className="text-[11px] text-stone-500 mt-1">
                            Meistara vai busiņa šofera saziņai pirms piegādes
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2.5 pt-2 border-t border-stone-100">
                        <label className="flex items-start gap-2.5 cursor-pointer text-stone-700">
                          <input
                            type="checkbox"
                            checked={newsletterOptIn}
                            onChange={(e) => setNewsletterOptIn(e.target.checked)}
                            className="mt-0.5 accent-stone-900"
                          />
                          <span>Vēlos saņemt sezonas velo apkopes atgādinājumus un jaunumus</span>
                        </label>

                        <label className="flex items-start gap-2.5 cursor-pointer text-stone-900 font-medium">
                          <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="mt-0.5 accent-stone-900"
                          />
                          <span>
                            Es piekrītu veikala lietošanas noteikumiem un{' '}
                            <button
                              type="button"
                              onClick={() => setIsSecurityModalOpen(true)}
                              className="underline hover:text-amber-700 cursor-pointer"
                            >
                              privātuma politikai
                            </button>{' '}
                            *
                          </span>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={handleStep1Continue}
                        className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer font-heading"
                      >
                        Turpināt
                      </button>
                    </div>
                  )}
                </section>

                {/* STEP 2: Adreses */}
                <section className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
                  <div
                    onClick={() => {
                      if (unlockedStep >= 2 && activeStep !== 2) {
                        setStepError(null);
                        setActiveStep(2);
                      }
                    }}
                    className={`px-5 py-4 flex items-center justify-between gap-3 ${
                      unlockedStep >= 2 && activeStep !== 2
                        ? 'cursor-pointer hover:bg-stone-50/70'
                        : activeStep === 2
                          ? 'border-b border-stone-200'
                          : 'opacity-65'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                          unlockedStep > 2 && activeStep !== 2
                            ? 'bg-emerald-600 text-white'
                            : activeStep === 2
                              ? 'bg-stone-900 text-white'
                              : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {unlockedStep > 2 && activeStep !== 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
                      </span>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-stone-950 font-heading">
                          Piegādes adrese
                        </h3>
                        {unlockedStep > 2 && activeStep !== 2 && (
                          <p className="text-xs text-stone-500 mt-0.5">
                            {addressMode === 'store'
                              ? 'Saņemšu klātienē veikalā Rindas ielā 44, Ventspilī'
                              : [streetAddress, city, postalCode].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    {unlockedStep >= 2 && activeStep !== 2 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStepError(null);
                          setActiveStep(2);
                        }}
                        className="text-xs font-semibold text-stone-700 hover:text-stone-950 inline-flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Labot</span>
                      </button>
                    )}
                  </div>

                  {activeStep === 2 && (
                    <div className="p-5 sm:p-6 space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setAddressMode('store')}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                            addressMode === 'store'
                              ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900/20'
                              : 'border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          <div className="font-bold text-stone-950 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Saņemšu veikalā Rindas ielā 44</span>
                          </div>
                          <p className="text-[11px] text-stone-500 mt-1">
                            Nav jāievada mājas adrese — paņem savu velo klātienē Ventspilī
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAddressMode('address')}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                            addressMode === 'address'
                              ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900/20'
                              : 'border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          <div className="font-bold text-stone-950 flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-stone-700 shrink-0" />
                            <span>Vēlos piegādi uz adresi</span>
                          </div>
                          <p className="text-[11px] text-stone-500 mt-1">
                            VentVelo servisa buss (Ventspils, Usma un Talsu rajons)
                          </p>
                        </button>
                      </div>

                      {addressMode === 'address' && (
                        <div className="space-y-3.5 pt-1">
                          <div>
                            <label className="block text-stone-700 font-medium mb-1">
                              Iela, mājas un dzīvokļa numurs *
                            </label>
                            <input
                              type="text"
                              value={streetAddress}
                              onChange={(e) => setStreetAddress(e.target.value)}
                              placeholder="piem., Lielais prospekts 10–15"
                              className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                              <label className="block text-stone-700 font-medium mb-1">Pilsēta / Pagasts *</label>
                              <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="piem., Ventspils, Usma, Talsi"
                                className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                              />
                            </div>
                            <div>
                              <label className="block text-stone-700 font-medium mb-1">Pasta indekss</label>
                              <input
                                type="text"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                placeholder="LV-3601"
                                className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-stone-700 font-medium mb-1">
                              Piezīmes servisa busa šoferim (neobligāti)
                            </label>
                            <input
                              type="text"
                              value={deliveryNotes}
                              onChange={(e) => setDeliveryNotes(e.target.value)}
                              placeholder="Vārtu kods, vēlamais piegādes laiks u.c."
                              className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                            />
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleStep2Continue}
                        className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer font-heading"
                      >
                        Turpināt
                      </button>
                    </div>
                  )}
                </section>

                {/* STEP 3: Piegādes veids */}
                <section className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
                  <div
                    onClick={() => {
                      if (unlockedStep >= 3 && activeStep !== 3) {
                        setStepError(null);
                        setActiveStep(3);
                      }
                    }}
                    className={`px-5 py-4 flex items-center justify-between gap-3 ${
                      unlockedStep >= 3 && activeStep !== 3
                        ? 'cursor-pointer hover:bg-stone-50/70'
                        : activeStep === 3
                          ? 'border-b border-stone-200'
                          : 'opacity-65'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                          unlockedStep > 3 && activeStep !== 3
                            ? 'bg-emerald-600 text-white'
                            : activeStep === 3
                              ? 'bg-stone-900 text-white'
                              : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {unlockedStep > 3 && activeStep !== 3 ? <Check className="w-3.5 h-3.5" /> : '3'}
                      </span>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-stone-950 font-heading">
                          Piegādes veids
                        </h3>
                        {unlockedStep > 3 && activeStep !== 3 && (
                          <p className="text-xs text-stone-500 mt-0.5">
                            {selectedDeliveryConfig.title} ·{' '}
                            <strong className="text-stone-800">
                              {shippingEur === 0 ? 'Bezmaksas (€0)' : formatPrice(shippingEur)}
                            </strong>
                          </p>
                        )}
                      </div>
                    </div>
                    {unlockedStep >= 3 && activeStep !== 3 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStepError(null);
                          setActiveStep(3);
                        }}
                        className="text-xs font-semibold text-stone-700 hover:text-stone-950 inline-flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Labot</span>
                      </button>
                    )}
                  </div>

                  {activeStep === 3 && (
                    <div className="p-5 sm:p-6 space-y-3 text-xs">
                      {checkoutPayload.type === 'service' ? (
                        <div className="p-4 rounded-xl border border-stone-900 bg-stone-50 flex items-center justify-between gap-3">
                          <div>
                            <div className="font-bold text-stone-950">{selectedDeliveryConfig.title}</div>
                            <div className="text-[11px] text-stone-500 mt-0.5">{selectedDeliveryConfig.subtitle}</div>
                          </div>
                          <span className="font-mono font-bold text-emerald-700 shrink-0">€0</span>
                        </div>
                      ) : (
                        DELIVERY_OPTIONS.map((opt) => {
                          const cost = getShippingCost(opt.id);
                          const isSelected = deliveryOptionId === opt.id;
                          return (
                            <label
                              key={opt.id}
                              onClick={() => setDeliveryOptionId(opt.id)}
                              className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900/20'
                                  : 'border-stone-200 hover:bg-stone-50/60'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <input
                                  type="radio"
                                  name="deliveryOption"
                                  checked={isSelected}
                                  onChange={() => setDeliveryOptionId(opt.id)}
                                  className="mt-0.5 accent-stone-900"
                                />
                                <div>
                                  <div className="font-bold text-stone-950">{opt.title}</div>
                                  <div className="text-[11px] text-stone-500 mt-0.5">{opt.subtitle}</div>
                                  {opt.freeThresholdEur !== null && opt.freeThresholdEur > 0 && cost > 0 && (
                                    <div className="text-[11px] text-amber-700 mt-0.5">
                                      Bezmaksas pasūtījumiem no {formatPrice(opt.freeThresholdEur)}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <span
                                className={`font-mono font-bold shrink-0 tabular-nums ${
                                  cost === 0 ? 'text-emerald-700' : 'text-stone-950'
                                }`}
                              >
                                {cost === 0 ? 'Bezmaksas (€0)' : formatPrice(cost)}
                              </span>
                            </label>
                          );
                        })
                      )}

                      <button
                        type="button"
                        onClick={handleStep3Continue}
                        className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer font-heading mt-2"
                      >
                        Turpināt
                      </button>
                    </div>
                  )}
                </section>

                {/* STEP 4: Maksājums */}
                <section className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
                  <div
                    onClick={() => {
                      if (unlockedStep >= 4 && activeStep !== 4) {
                        setStepError(null);
                        setActiveStep(4);
                      }
                    }}
                    className={`px-5 py-4 flex items-center justify-between gap-3 ${
                      activeStep === 4 ? 'border-b border-stone-200' : unlockedStep < 4 ? 'opacity-65' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                          activeStep === 4 ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        4
                      </span>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-stone-950 font-heading">Maksājums</h3>
                        {activeStep !== 4 && (
                          <p className="text-xs text-stone-500 mt-0.5">
                            Incredit nomaksa · Bankas karte · Internetbanka · Skaidrā naudā / POS uz vietas
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {activeStep === 4 && (
                    <form onSubmit={handleSubmitOrder} className="p-5 sm:p-6 space-y-4 text-xs">
                      <p className="text-stone-600 leading-relaxed">
                        Izvēlies sev piemērotāko norēķinu veidu — atverot konkrēto sadaļu, redzēsi precīzus nosacījumus un
                        mēneša maksājumu aprēķinu.
                      </p>

                      {/* 1. INCREDIT */}
                      <div
                        className={`rounded-xl border transition-all overflow-hidden ${
                          paymentMethod === 'incredit'
                            ? 'border-emerald-600 ring-1 ring-emerald-500/30'
                            : 'border-stone-200'
                        }`}
                      >
                        <label
                          onClick={() => setPaymentMethod('incredit')}
                          className={`p-4 flex items-center justify-between gap-3 cursor-pointer ${
                            paymentMethod === 'incredit' ? 'bg-emerald-50/60' : 'bg-white hover:bg-stone-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={paymentMethod === 'incredit'}
                              onChange={() => setPaymentMethod('incredit')}
                              className="accent-emerald-700"
                            />
                            <div>
                              <div className="font-bold text-sm text-stone-950">Incredit nomaksa un līzings</div>
                              <div className="text-[11px] text-stone-600">
                                Atmaksas termiņš 6–36 mēn. · Pirmā iemaksa no €0 · Parakstīšana ar Smart-ID vai eParaksts
                              </div>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-emerald-700 shrink-0 tabular-nums">
                            No ~{formatPrice(Math.max(10, Math.round(grandTotalEur / 36)))}/mēn.
                          </span>
                        </label>

                        {paymentMethod === 'incredit' && (
                          <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-4">
                            <div>
                              <label className="block font-semibold text-stone-700 mb-1.5">
                                Izvēlies atmaksas termiņu:
                              </label>
                              <div className="grid grid-cols-4 gap-2">
                                {[6, 12, 24, 36].map((months) => (
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                              <div>
                                <label className="block font-semibold text-stone-700 mb-1">
                                  Vēlamā pirmā iemaksa (€)
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  max={Math.max(0, grandTotalEur - 30)}
                                  value={firstPaymentEur}
                                  onChange={(e) => setFirstPaymentEur(Number(e.target.value) || 0)}
                                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                                />
                              </div>

                              <div className="bg-white border border-stone-200 rounded-lg p-2.5 flex items-center justify-between">
                                <div>
                                  <div className="text-[11px] text-stone-500">
                                    Finansējamā summa: {formatPrice(financedAmountEur)}
                                  </div>
                                  <div className="font-bold text-stone-950">Aptuvenais maksājums:</div>
                                </div>
                                <span className="text-base font-mono font-bold text-emerald-700 tabular-nums">
                                  ~{formatPrice(monthlyIncreditEur)}/mēn.
                                </span>
                              </div>
                            </div>

                            <label className="flex items-center gap-2 pt-2 border-t border-stone-200 cursor-pointer text-stone-800">
                              <input
                                type="checkbox"
                                checked={extraTradeIn}
                                onChange={(e) => setExtraTradeIn(e.target.checked)}
                                className="accent-emerald-700"
                              />
                              <span className="font-medium">
                                Vēlos nodot savu veco velosipēdu kā pirmo iemaksu
                              </span>
                            </label>
                            {extraTradeIn && (
                              <input
                                type="text"
                                value={extraTradeInBike}
                                onChange={(e) => setExtraTradeInBike(e.target.value)}
                                placeholder="Norādi vecā velosipēda modeli, stāvokli un vēlamo summu..."
                                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                              />
                            )}

                            <div className="bg-white border border-stone-200 rounded-lg p-3 text-[11px] text-stone-600 space-y-1">
                              <div className="font-bold text-stone-900">Kā darbojas Incredit nomaksa:</div>
                              <p>
                                1. Šeit personas kods nav jāievada. 2. Pēc pasūtījuma apstiprināšanas sagatavosim Incredit
                                nomaksas pieteikumu — lēmumu saņemsi dažu minūšu laikā. 3. Līgumu parakstīsi attālināti ar
                                Smart-ID / eParaksts vai klātienē Rindas ielā 44.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 3. BANKAS KARTE */}
                      <div
                        className={`rounded-xl border transition-all overflow-hidden ${
                          paymentMethod === 'card' ? 'border-stone-900 ring-1 ring-stone-900/20' : 'border-stone-200'
                        }`}
                      >
                        <label
                          onClick={() => setPaymentMethod('card')}
                          className={`p-4 flex items-center justify-between gap-3 cursor-pointer ${
                            paymentMethod === 'card' ? 'bg-stone-50' : 'bg-white hover:bg-stone-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={paymentMethod === 'card'}
                              onChange={() => setPaymentMethod('card')}
                              className="accent-stone-900"
                            />
                            <div>
                              <div className="font-bold text-sm text-stone-950 flex items-center gap-1.5">
                                <CreditCard className="w-4 h-4 text-stone-700" />
                                <span>Bankas karte (Visa / Mastercard)</span>
                              </div>
                              <div className="text-[11px] text-stone-500">
                                Tūlītēja tiešsaistes apmaksa ar debetkarti vai kredītkarti
                              </div>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-stone-950 shrink-0 tabular-nums">
                            {formatPrice(grandTotalEur)}
                          </span>
                        </label>

                        {paymentMethod === 'card' && (
                          <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-3">
                            <div>
                              <label className="block text-stone-700 font-medium mb-1">
                                Kartes īpašnieka Vārds, Uzvārds *
                              </label>
                              <input
                                type="text"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                placeholder="Vārds Uzvārds"
                                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-stone-700 font-medium mb-1">Kartes numurs *</label>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(formatCardNumberInput(e.target.value))}
                                placeholder="0000 0000 0000 0000"
                                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-stone-700 font-medium mb-1">Derīguma termiņš MM/GG *</label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={cardExpiry}
                                  onChange={(e) => setCardExpiry(formatExpiryInput(e.target.value))}
                                  placeholder="MM/GG"
                                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-stone-700 font-medium mb-1">CVC drošības kods *</label>
                                <input
                                  type="password"
                                  inputMode="numeric"
                                  maxLength={4}
                                  value={cardCvc}
                                  onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                                  placeholder="•••"
                                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 4. INTERNETBANKA */}
                      <div
                        className={`rounded-xl border transition-all overflow-hidden ${
                          paymentMethod === 'banklink'
                            ? 'border-stone-900 ring-1 ring-stone-900/20'
                            : 'border-stone-200'
                        }`}
                      >
                        <label
                          onClick={() => setPaymentMethod('banklink')}
                          className={`p-4 flex items-center justify-between gap-3 cursor-pointer ${
                            paymentMethod === 'banklink' ? 'bg-stone-50' : 'bg-white hover:bg-stone-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={paymentMethod === 'banklink'}
                              onChange={() => setPaymentMethod('banklink')}
                              className="accent-stone-900"
                            />
                            <div>
                              <div className="font-bold text-sm text-stone-950 flex items-center gap-1.5">
                                <Building className="w-4 h-4 text-stone-700" />
                                <span>Internetbanka (BankLink)</span>
                              </div>
                              <div className="text-[11px] text-stone-500">
                                Swedbank · SEB · Citadele · Luminor ar Smart-ID apstiprinājumu
                              </div>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-stone-950 shrink-0 tabular-nums">
                            {formatPrice(grandTotalEur)}
                          </span>
                        </label>

                        {paymentMethod === 'banklink' && (
                          <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-3">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {[
                                { id: 'swedbank', name: 'Swedbank' },
                                { id: 'seb', name: 'SEB banka' },
                                { id: 'citadele', name: 'Citadele' },
                                { id: 'luminor', name: 'Luminor' },
                              ].map((bank) => (
                                <button
                                  key={bank.id}
                                  type="button"
                                  onClick={() => setSelectedBank(bank.id as typeof selectedBank)}
                                  className={`p-2.5 rounded-lg border text-center cursor-pointer transition-colors ${
                                    selectedBank === bank.id
                                      ? 'border-stone-900 bg-white font-bold text-stone-950 shadow-xs'
                                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                                  }`}
                                >
                                  {bank.name}
                                </button>
                              ))}
                            </div>
                            <p className="text-[11px] text-stone-500">
                              Maksājums tiek apstiprināts caur Tavas izvēlētās bankas drošo autentifikāciju (Smart-ID /
                              kodu kalkulators).
                            </p>
                          </div>
                        )}
                      </div>

                      {/* 5. SKAIDRĀ NAUDĀ VAI AR KARTI UZ VIETAS */}
                      <div
                        className={`rounded-xl border transition-all overflow-hidden ${
                          paymentMethod === 'cash_onsite'
                            ? 'border-stone-900 ring-1 ring-stone-900/20'
                            : 'border-stone-200'
                        }`}
                      >
                        <label
                          onClick={() => setPaymentMethod('cash_onsite')}
                          className={`p-4 flex items-center justify-between gap-3 cursor-pointer ${
                            paymentMethod === 'cash_onsite' ? 'bg-amber-50/50' : 'bg-white hover:bg-stone-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={paymentMethod === 'cash_onsite'}
                              onChange={() => setPaymentMethod('cash_onsite')}
                              className="accent-stone-900"
                            />
                            <div>
                              <div className="font-bold text-sm text-stone-950 flex items-center gap-1.5">
                                <Banknote className="w-4 h-4 text-amber-700" />
                                <span>Maksāt skaidrā naudā vai ar karti uz vietas / piegādē</span>
                              </div>
                              <div className="text-[11px] text-stone-500">
                                Veikalā Rindas ielā 44 vai pie servisa busa šofera saņemšanas brīdī (€0 komisija)
                              </div>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-stone-950 shrink-0 tabular-nums">
                            {formatPrice(grandTotalEur)}
                          </span>
                        </label>

                        {paymentMethod === 'cash_onsite' && (
                          <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <button
                                type="button"
                                onClick={() => setCashSubMethod('store_cash_card')}
                                className={`p-3 rounded-lg border text-left cursor-pointer ${
                                  cashSubMethod === 'store_cash_card'
                                    ? 'border-stone-900 bg-white font-semibold text-stone-950 shadow-xs'
                                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                                }`}
                              >
                                <div className="font-bold">Veikalā Rindas ielā 44</div>
                                <div className="text-[11px] text-stone-500">
                                  Skaidrā naudā vai ar karti saņemot velosipēdu Ventspilī
                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={() => setCashSubMethod('courier_cash_pos')}
                                className={`p-3 rounded-lg border text-left cursor-pointer ${
                                  cashSubMethod === 'courier_cash_pos'
                                    ? 'border-stone-900 bg-white font-semibold text-stone-950 shadow-xs'
                                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                                }`}
                              >
                                <div className="font-bold">Pie VentVelo servisa busa šofera</div>
                                <div className="text-[11px] text-stone-500">
                                  Skaidrā naudā vai mobilajā POS terminālī pie durvīm
                                </div>
                              </button>
                            </div>

                            <label className="flex items-center gap-2 pt-2 border-t border-stone-200 cursor-pointer text-stone-800">
                              <input
                                type="checkbox"
                                checked={extraTradeIn}
                                onChange={(e) => setExtraTradeIn(e.target.checked)}
                                className="accent-stone-900"
                              />
                              <span className="font-medium">
                                Vēlos nodot veco velosipēdu novērtēšanai un cenas samazināšanai uz vietas
                              </span>
                            </label>
                            {extraTradeIn && (
                              <input
                                type="text"
                                value={extraTradeInBike}
                                onChange={(e) => setExtraTradeInBike(e.target.value)}
                                placeholder="Vecā velosipēda marka un apraksts..."
                                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                              />
                            )}

                            <p className="text-[11px] text-stone-600 leading-relaxed">
                              Tiešsaistē šobrīd nekas netiek ieturēts — mēs rezervējam velosipēdu, un samaksu veic
                              pēc tā apskates un pārbaudes.
                            </p>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md font-heading mt-2"
                      >
                        <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{getSubmitButtonLabel()}</span>
                      </button>
                    </form>
                  )}
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
