export type Currency = 'EUR' | 'USD' | 'GBP' | 'PLN' | 'SEK';

export interface CurrencyRate {
  symbol: string;
  rate: number; // multiplier from EUR
  label: string;
}

export type VanRegion = 'Ventspils' | 'Usma' | 'Talsi';

export interface VanPickupZone {
  region: VanRegion;
  displayName: string;
  distanceKm: string;
  estimatedLeadTime: string;
  feeEur: number;
  freeThresholdEur: number;
  coverageNote: string;
  pickupDays: string[];
}

export type ServiceTierId = 'safety_tuneup' | 'standard_overhaul' | 'kapitalais_remonts' | 'escooter_diagnostic';

export interface ServicePackage {
  id: ServiceTierId;
  name: string;
  nameLv: string;
  priceEur: number;
  durationHours: number;
  guaranteeMonths: number;
  description: string;
  idealFor: string;
  checklist: string[];
  popular?: boolean;
}

export interface CustomRepairItem {
  id: string;
  name: string;
  priceEur: number;
  category: 'wheels' | 'brakes' | 'drivetrain' | 'suspension' | 'accessories';
  estimatedTime: string;
}

export interface BikeProduct {
  id: string;
  name: string;
  category: 'Gravel & Road' | 'City & Commuter' | 'E-Bikes' | 'Kids & Junior' | 'Pre-Owned Certified';
  priceEur: number;
  originalPriceEur?: number;
  image: string;
  frameMaterial: string;
  groupset: string;
  brakes: string;
  sizesAvailable: string[];
  inStockCount: number;
  guaranteeMonths: number;
  condition: 'Brand New' | 'Certified Refurbished';
  specs: {
    weightKg: number;
    wheelSize: string;
    gears: number;
    color: string;
  };
  features: string[];
  inspectionPassed: boolean;
}

export interface AccessoryProduct {
  id: string;
  name: string;
  category: 'Helmets & Apparel' | 'Lights & Electronics' | 'Locks & Security' | 'Maintenance & Lubes' | 'Tires & Tubes' | 'Pumps & Tools';
  priceEur: number;
  image: string;
  sku: string;
  stockCount: number;
  lowStockThreshold: number;
  brand: string;
  description: string;
  compatibility?: string;
  rating: number;
  reviewsCount: number;
}

export type JobStatus = 
  | 'booked' 
  | 'van_en_route' 
  | 'diagnostics' 
  | 'in_progress' 
  | 'quality_check' 
  | 'ready_for_pickup_or_delivery'
  | 'delivered';

export interface MaintenanceJob {
  id: string;
  trackingCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  bikeModel: string;
  bikeSerial?: string;
  servicePackage: ServicePackage;
  customRepairs: CustomRepairItem[];
  deliveryType: 'workshop_dropoff' | 'van_pickup';
  pickupLocation?: {
    region: VanRegion;
    address: string;
    city: string;
    postalCode: string;
    preferredDate: string;
    preferredTimeSlot: string;
    notes?: string;
    feeEur: number;
  };
  workshopBranch?: 'Rindas iela 44';
  status: JobStatus;
  statusHistory: {
    status: JobStatus;
    timestamp: string;
    note: string;
  }[];
  totalPriceEur: number;
  paid: boolean;
  paymentMethod?: string;
  currencyUsed: Currency;
  guaranteeExpiresAt: string;
  mechanicName: string;
  createdAt: string;
}

export interface UserBike {
  id: string;
  brand: string;
  model: string;
  year: number;
  serialNumber: string;
  type: string;
  purchaseDate?: string;
  lastServiceDate?: string;
  activeGuaranteeMonths?: number;
  notes?: string;
}

export interface CartItem {
  id: string;
  type: 'bike' | 'accessory' | 'service';
  productId: string;
  name: string;
  priceEur: number;
  quantity: number;
  image?: string;
  details?: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: CartItem[];
  subtotalEur: number;
  shippingEur: number;
  totalEur: number;
  currency: Currency;
  customer: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    region?: string;
  };
  deliveryMethod: 'van_delivery' | 'store_pickup';
  paymentStatus: 'paid' | 'pending';
  paymentMethod: string;
  trackingCode: string;
  guaranteeCertificates: {
    itemName: string;
    durationMonths: number;
    code: string;
  }[];
}

export interface EmailNotification {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  previewText: string;
  category: 'service_booking' | 'status_update' | 'order_confirmation' | 'guarantee_issued';
  timestamp: string;
  htmlContent: string;
  read: boolean;
  referenceId: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  quickReplies?: string[];
}
