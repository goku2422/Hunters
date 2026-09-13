export type IdentificationMethod = 'GEOFENCE' | 'COUNTER_SESSION' | 'WIFI_IP' | 'SIMULATOR';

export type ClaimStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Shop {
  id: string;
  name: string;
  slug: string;
  category: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  wifiIp?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Merchant {
  id: string;
  shopId: string;
  email: string;
  passwordHash: string; // Plain/hashed comparison
  name: string;
  phone?: string;
  isActive: boolean;
  googleId?: string;       // Google OAuth sub ID
  googleEmail?: string;    // Gmail address for OAuth login
  loginType?: 'password' | 'google' | 'both'; // Which login methods allowed
  createdAt: string;
}


export interface MerchantSession {
  id: string;
  merchantId: string;
  shopId: string;
  token: string;
  deviceInfo: string;
  ipAddress?: string;
  isCounterActive: boolean;
  lastHeartbeat: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  createdAt: string;
}

export interface Offer {
  id: string;
  title: string;
  discountPercent: number;
  description: string;
  terms: string;
  isActive: boolean;
  createdAt: string;
}

export interface Claim {
  id: string;
  claimCode: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  shopId: string;
  shopName: string;
  offerId: string;
  offerTitle: string;
  discountPercent: number;
  status: ClaimStatus;
  scratchRevealed: boolean;
  identificationMethod: IdentificationMethod;
  customerLat?: number;
  customerLng?: number;
  distanceMeters?: number;
  rejectionReason?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
}

export interface ResolveShopRequest {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  clientIp?: string;
  simulatedShopId?: string; // For testing in simulator
}

export interface ResolveShopResponse {
  success: boolean;
  shop?: Shop;
  method?: IdentificationMethod;
  distanceMeters?: number;
  activeCounterAvailable?: boolean;
  message?: string;
  candidates?: Array<{ shop: Shop; distanceMeters: number }>;
}

export interface CreateClaimRequest {
  name: string;
  mobile: string;
  shopId: string;
  identificationMethod: IdentificationMethod;
  customerLat?: number;
  customerLng?: number;
  distanceMeters?: number;
}

export interface QrScan {
  id: string;
  shopId: string;
  shopName: string;
  scannedAt: string;
  userAgent?: string;
}

export interface ShopAnalytics {
  shopId: string;
  shopName: string;
  merchantName: string;
  merchantEmail: string;
  qrScanCount: number;
  uniqueCustomers: number;
  totalClaims: number;
  pendingClaims: number;
  acceptedClaims: number;
  rejectedClaims: number;
  todayScans: number;
  todayClaims: number;
  qrUrl: string;
}
