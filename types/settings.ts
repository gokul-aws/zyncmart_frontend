export type PaymentMethod = 'razorpay' | 'cod';

export interface StoreConfigSettings {
  storeName: string;
  storeDescription: string;
  storeEmail: string;
  storePhone: string;
  storeAddressLine1: string;
  storeAddressLine2?: string;
  storeCity: string;
  storeState: string;
  storePincode: string;
  storeCountry: string;
  currency: string;
}

export interface PaymentSettings {
  defaultPaymentMethod: PaymentMethod;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  codEnabled: boolean;
  codLimit: number;
}

export interface ShippingSettings {
  shippingRate: number;
  freeShippingThreshold: number;
  defaultShippingRegion: string;
}

export interface TaxSettings {
  taxRate: number;
  taxId: string;
  taxInclusive: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderConfirmationEmail: boolean;
  shippingUpdateEmail: boolean;
  promotionalEmails: boolean;
}

export interface ProfileSettings {
  supportEmail: string;
  supportPhone: string;
  returnPolicyUrl: string;
  privacyPolicyUrl: string;
  termsUrl: string;
}

export interface AuditLogEntry {
  _id: string;
  action: string;
  actor: string;
  timestamp: string;
  details?: string;
}

export interface AdminSettings {
  store: StoreConfigSettings;
  payment: PaymentSettings;
  shipping: ShippingSettings;
  tax: TaxSettings;
  notifications: NotificationSettings;
  profile: ProfileSettings;
  audit?: AuditLogEntry[];
}

export type UpdateAdminSettingsPayload = AdminSettings;
