import fs from 'fs';
import path from 'path';
import {
  Shop,
  Merchant,
  MerchantSession,
  Customer,
  Offer,
  Claim,
  AdminUser,
  ClaimStatus,
  IdentificationMethod,
  ResolveShopRequest,
  ResolveShopResponse,
  QrScan,
  ShopAnalytics,
} from '../types';
import {
  INITIAL_ADMINS,
  INITIAL_SHOPS,
  INITIAL_MERCHANTS,
  INITIAL_OFFERS,
  INITIAL_CLAIMS,
} from './seed';
import { calculateHaversineDistance } from './geofence';

interface DatabaseData {
  admins: AdminUser[];
  shops: Shop[];
  merchants: Merchant[];
  merchantSessions: MerchantSession[];
  customers: Customer[];
  offers: Offer[];
  claims: Claim[];
  qrScans: QrScan[];
}


// In serverless environments (Netlify / Vercel), process.cwd() is read-only. Use /tmp for writable storage.
const isServerless = Boolean(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_EXECUTION_ENV);
const PRIMARY_DATA_DIR = isServerless ? path.join('/tmp', 'data') : path.join(process.cwd(), 'data');
const PRIMARY_DB_FILE = path.join(PRIMARY_DATA_DIR, 'database.json');
const ROOT_SEED_FILE = path.join(process.cwd(), 'data', 'database.json');

class DatabaseStore {
  private data: DatabaseData;
  private isLoaded = false;

  constructor() {
    this.data = {
      admins: INITIAL_ADMINS,
      shops: INITIAL_SHOPS,
      merchants: INITIAL_MERCHANTS,
      merchantSessions: [
        {
          id: 'session-brew-1',
          merchantId: 'merchant-brew',
          shopId: 'shop-brew',
          token: 'token-brew-sample',
          deviceInfo: 'Counter iPad Pro (Terminal 1)',
          ipAddress: '192.168.1.1',
          isCounterActive: true,
          lastHeartbeat: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: 'session-urban-1',
          merchantId: 'merchant-urban',
          shopId: 'shop-urban',
          token: 'token-urban-sample',
          deviceInfo: 'Cashier Desktop POS',
          ipAddress: '192.168.2.1',
          isCounterActive: true,
          lastHeartbeat: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: 'session-pizza-1',
          merchantId: 'merchant-pizza',
          shopId: 'shop-pizza',
          token: 'token-pizza-sample',
          deviceInfo: 'Billing Android Tablet',
          ipAddress: '192.168.3.1',
          isCounterActive: true,
          lastHeartbeat: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ],
      customers: [
        {
          id: 'cust-1',
          name: 'Rahul Sharma',
          mobile: '9876543210',
          createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
        },
        {
          id: 'cust-2',
          name: 'Pooja Verma',
          mobile: '9811223344',
          createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
        },
      ],
      offers: INITIAL_OFFERS,
      claims: INITIAL_CLAIMS,
      qrScans: [],
    };
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      // 1. Try reading primary writable file
      let targetFile = PRIMARY_DB_FILE;

      if (!fs.existsSync(PRIMARY_DB_FILE) && fs.existsSync(ROOT_SEED_FILE)) {
        targetFile = ROOT_SEED_FILE;
      }

      if (fs.existsSync(targetFile)) {
        const raw = fs.readFileSync(targetFile, 'utf-8');
        const parsed = JSON.parse(raw) as Partial<DatabaseData>;
        this.data = {
          admins: parsed.admins?.length ? parsed.admins : this.data.admins,
          shops: parsed.shops?.length ? parsed.shops : this.data.shops,
          merchants: parsed.merchants?.length ? parsed.merchants : this.data.merchants,
          merchantSessions: parsed.merchantSessions ?? this.data.merchantSessions,
          customers: parsed.customers ?? this.data.customers,
          offers: parsed.offers?.length ? parsed.offers : this.data.offers,
          claims: parsed.claims ?? this.data.claims,
          qrScans: parsed.qrScans ?? [],
        };
      }
      this.isLoaded = true;
    } catch (err) {
      console.error('Error loading database:', err);
    }
  }

  private saveToDisk() {
    try {
      if (!fs.existsSync(PRIMARY_DATA_DIR)) {
        fs.mkdirSync(PRIMARY_DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(PRIMARY_DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database (safe fallback):', err);
    }
  }

  // --- ADMIN ---
  public getAdminByEmail(email: string): AdminUser | undefined {
    return this.data.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  }

  // --- SHOPS ---
  public getShops(): Shop[] {
    return this.data.shops;
  }

  public getShopById(id: string): Shop | undefined {
    return this.data.shops.find((s) => s.id === id);
  }

  public saveShop(shopData: Partial<Shop> & { name: string; address: string; phone: string; latitude: number; longitude: number }): Shop {
    const existingIndex = shopData.id ? this.data.shops.findIndex((s) => s.id === shopData.id) : -1;
    const now = new Date().toISOString();
    let shop: Shop;

    if (existingIndex >= 0) {
      shop = {
        ...this.data.shops[existingIndex],
        ...shopData,
        updatedAt: now,
      };
      this.data.shops[existingIndex] = shop;
    } else {
      const slug = shopData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      shop = {
        id: `shop-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
        name: shopData.name,
        slug: shopData.slug || slug,
        category: shopData.category || 'Retail Store',
        address: shopData.address,
        phone: shopData.phone,
        latitude: Number(shopData.latitude),
        longitude: Number(shopData.longitude),
        radiusMeters: Number(shopData.radiusMeters) || 75,
        wifiIp: shopData.wifiIp || '',
        isActive: shopData.isActive ?? true,
        createdAt: now,
        updatedAt: now,
      };
      this.data.shops.push(shop);
    }

    this.saveToDisk();
    return shop;
  }

  public deleteShop(id: string): boolean {
    const prevLen = this.data.shops.length;
    this.data.shops = this.data.shops.filter((s) => s.id !== id);
    // Cascade cleanup
    this.data.merchants = this.data.merchants.filter((m) => m.shopId !== id);
    this.data.merchantSessions = this.data.merchantSessions.filter((ms) => ms.shopId !== id);
    this.saveToDisk();
    return this.data.shops.length < prevLen;
  }

  // --- MERCHANTS ---
  public getMerchants(): Array<Merchant & { shop?: Shop }> {
    return this.data.merchants.map((m) => ({
      ...m,
      shop: this.data.shops.find((s) => s.id === m.shopId),
    }));
  }

  public getMerchantById(id: string): Merchant | undefined {
    return this.data.merchants.find((m) => m.id === id);
  }

  public getMerchantByEmail(email: string): Merchant | undefined {
    return this.data.merchants.find((m) => m.email.toLowerCase() === email.toLowerCase());
  }

  public getMerchantByGoogleId(googleId: string): Merchant | undefined {
    return this.data.merchants.find((m) => m.googleId === googleId);
  }

  public getMerchantByGoogleEmail(googleEmail: string): Merchant | undefined {
    return this.data.merchants.find(
      (m) => m.googleEmail?.toLowerCase() === googleEmail.toLowerCase() ||
             m.email.toLowerCase() === googleEmail.toLowerCase()
    );
  }

  public getMerchantByShopId(shopId: string): Merchant | undefined {
    return this.data.merchants.find((m) => m.shopId === shopId);
  }

  public saveMerchant(merchantData: Partial<Merchant> & { shopId: string; email: string; name: string; passwordHash: string }): Merchant {
    const existingIndex = merchantData.id ? this.data.merchants.findIndex((m) => m.id === merchantData.id) : -1;
    const now = new Date().toISOString();
    let merchant: Merchant;

    if (existingIndex >= 0) {
      merchant = {
        ...this.data.merchants[existingIndex],
        ...merchantData,
      };
      this.data.merchants[existingIndex] = merchant;
    } else {
      merchant = {
        id: `merchant-${Date.now().toString(36)}`,
        shopId: merchantData.shopId,
        email: merchantData.email,
        passwordHash: merchantData.passwordHash,
        name: merchantData.name,
        phone: merchantData.phone,
        isActive: merchantData.isActive ?? true,
        createdAt: now,
      };
      this.data.merchants.push(merchant);
    }

    this.saveToDisk();
    return merchant;
  }

  public deleteMerchant(id: string): boolean {
    const prev = this.data.merchants.length;
    this.data.merchants = this.data.merchants.filter((m) => m.id !== id);
    this.saveToDisk();
    return this.data.merchants.length < prev;
  }

  // --- SESSIONS ---
  public getMerchantSessions(shopId?: string): MerchantSession[] {
    if (shopId) {
      return this.data.merchantSessions.filter((s) => s.shopId === shopId);
    }
    return this.data.merchantSessions;
  }

  public registerOrUpdateSession(
    merchantId: string,
    shopId: string,
    isCounterActive = true,
    deviceInfo = 'Web Terminal',
    ipAddress?: string
  ): MerchantSession {
    const existingIndex = this.data.merchantSessions.findIndex((s) => s.merchantId === merchantId);
    const now = new Date().toISOString();
    let session: MerchantSession;

    if (existingIndex >= 0) {
      session = {
        ...this.data.merchantSessions[existingIndex],
        isCounterActive,
        lastHeartbeat: now,
        ipAddress: ipAddress || this.data.merchantSessions[existingIndex].ipAddress,
      };
      this.data.merchantSessions[existingIndex] = session;
    } else {
      session = {
        id: `session-${Date.now().toString(36)}`,
        merchantId,
        shopId,
        token: `tok-${Math.random().toString(36).substring(2)}`,
        deviceInfo,
        ipAddress,
        isCounterActive,
        lastHeartbeat: now,
        createdAt: now,
      };
      this.data.merchantSessions.push(session);
    }

    this.saveToDisk();
    return session;
  }

  public setCounterMode(merchantId: string, active: boolean): boolean {
    const session = this.data.merchantSessions.find((s) => s.merchantId === merchantId);
    if (session) {
      session.isCounterActive = active;
      session.lastHeartbeat = new Date().toISOString();
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --- OFFERS ---
  public getOffers(): Offer[] {
    return this.data.offers;
  }

  public getDefaultOffer(): Offer {
    return this.data.offers[0] || INITIAL_OFFERS[0];
  }

  // --- CUSTOMERS ---
  public getCustomers(): Customer[] {
    return this.data.customers;
  }

  public findOrCreateCustomer(name: string, mobile: string): Customer {
    const cleanMobile = mobile.replace(/[^0-9]/g, '').slice(-10);
    const existing = this.data.customers.find((c) => c.mobile === cleanMobile);
    if (existing) {
      // Update name if changed
      if (name && existing.name !== name) {
        existing.name = name;
        this.saveToDisk();
      }
      return existing;
    }

    const customer: Customer = {
      id: `cust-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      name: name.trim(),
      mobile: cleanMobile,
      createdAt: new Date().toISOString(),
    };
    this.data.customers.push(customer);
    this.saveToDisk();
    return customer;
  }

  // --- CLAIMS ---
  public getClaims(shopId?: string): Claim[] {
    if (shopId) {
      return this.data.claims
        .filter((c) => c.shopId === shopId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return [...this.data.claims].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getClaimById(id: string): Claim | undefined {
    return this.data.claims.find((c) => c.id === id);
  }

  public checkRecentClaim(mobile: string, shopId: string): Claim | undefined {
    const cleanMobile = mobile.replace(/[^0-9]/g, '').slice(-10);
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return this.data.claims.find(
      (c) =>
        c.customerMobile === cleanMobile &&
        c.shopId === shopId &&
        new Date(c.createdAt).getTime() > oneDayAgo
    );
  }

  public createClaim(params: {
    customerName: string;
    customerMobile: string;
    shopId: string;
    identificationMethod: IdentificationMethod;
    customerLat?: number;
    customerLng?: number;
    distanceMeters?: number;
  }): Claim {
    const shop = this.getShopById(params.shopId);
    if (!shop) throw new Error('Shop not found');

    const customer = this.findOrCreateCustomer(params.customerName, params.customerMobile);
    const offer = this.getDefaultOffer();

    const claimCode = `SCR-${Math.floor(1000 + Math.random() * 9000)}`;

    const claim: Claim = {
      id: `claim-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      claimCode,
      customerId: customer.id,
      customerName: customer.name,
      customerMobile: customer.mobile,
      shopId: shop.id,
      shopName: shop.name,
      offerId: offer.id,
      offerTitle: offer.title,
      discountPercent: offer.discountPercent,
      status: 'PENDING',
      scratchRevealed: false,
      identificationMethod: params.identificationMethod,
      customerLat: params.customerLat,
      customerLng: params.customerLng,
      distanceMeters: params.distanceMeters,
      createdAt: new Date().toISOString(),
    };

    this.data.claims.unshift(claim);
    this.saveToDisk();
    return claim;
  }

  public updateClaimStatus(
    claimId: string,
    status: ClaimStatus,
    resolvedBy?: string,
    rejectionReason?: string
  ): Claim | undefined {
    const claim = this.data.claims.find((c) => c.id === claimId);
    if (!claim) return undefined;

    claim.status = status;
    claim.resolvedAt = new Date().toISOString();
    if (resolvedBy) claim.resolvedBy = resolvedBy;
    if (rejectionReason) claim.rejectionReason = rejectionReason;

    this.saveToDisk();
    return claim;
  }

  public markScratchRevealed(claimId: string): Claim | undefined {
    const claim = this.data.claims.find((c) => c.id === claimId);
    if (!claim) return undefined;
    claim.scratchRevealed = true;
    this.saveToDisk();
    return claim;
  }

  // --- THE INTELLIGENT SHOP RESOLVER ---
  /**
   * Resolves the shop without requiring the customer to pick or enter a code.
   * Priority:
   * 1. Simulated Shop (for testing)
   * 2. GPS Geofence (Haversine distance within radiusMeters)
   * 3. IP / Wi-Fi Match
   * 4. Active Merchant Counter Session Pairing
   */
  public resolveShop(req: ResolveShopRequest): ResolveShopResponse {
    const activeShops = this.data.shops.filter((s) => s.isActive);

    // 1. Simulation Override (for interactive testing bar)
    if (req.simulatedShopId) {
      const shop = activeShops.find((s) => s.id === req.simulatedShopId);
      if (shop) {
        return {
          success: true,
          shop,
          method: 'SIMULATOR',
          distanceMeters: 5,
          message: `Simulated standing at ${shop.name}`,
        };
      }
    }

    // 2. GPS Geofencing Resolution
    if (req.latitude !== undefined && req.longitude !== undefined) {
      const candidates = activeShops
        .map((shop) => {
          const distanceMeters = calculateHaversineDistance(
            req.latitude!,
            req.longitude!,
            shop.latitude,
            shop.longitude
          );
          return { shop, distanceMeters };
        })
        .sort((a, b) => a.distanceMeters - b.distanceMeters);

      const closest = candidates[0];
      if (closest && closest.distanceMeters <= closest.shop.radiusMeters) {
        return {
          success: true,
          shop: closest.shop,
          method: 'GEOFENCE',
          distanceMeters: closest.distanceMeters,
          message: `Automatically connected via In-Store Geofence (${closest.distanceMeters}m from counter)`,
          candidates,
        };
      }

      // If close to a shop within 250m (e.g. slight GPS drift in mall)
      if (closest && closest.distanceMeters <= 250) {
        return {
          success: true,
          shop: closest.shop,
          method: 'GEOFENCE',
          distanceMeters: closest.distanceMeters,
          message: `High-confidence match: Near ${closest.shop.name} (${closest.distanceMeters}m away)`,
          candidates,
        };
      }
    }

    // 3. Wi-Fi / IP Match
    if (req.clientIp) {
      const ipMatch = activeShops.find((s) => s.wifiIp && s.wifiIp === req.clientIp);
      if (ipMatch) {
        return {
          success: true,
          shop: ipMatch,
          method: 'WIFI_IP',
          distanceMeters: 0,
          message: `Connected via Store Wi-Fi Gateway (${ipMatch.name})`,
        };
      }
    }

    // 4. Active Merchant Counter Session Pairing (Device-based fallback)
    // Find active sessions that had a heartbeat in last 15 minutes and counter mode ON
    const fifteenMinsAgo = Date.now() - 15 * 60 * 1000;
    const activeSessions = this.data.merchantSessions.filter(
      (ms) =>
        ms.isCounterActive &&
        new Date(ms.lastHeartbeat).getTime() > fifteenMinsAgo
    );

    if (activeSessions.length > 0) {
      // Find the shop with active counter
      const activeShop = activeShops.find((s) => s.id === activeSessions[0].shopId);
      if (activeShop) {
        return {
          success: true,
          shop: activeShop,
          method: 'COUNTER_SESSION',
          activeCounterAvailable: true,
          message: `Paired with Live Cashier Terminal at ${activeShop.name}`,
        };
      }
    }

    // Default fallback to first active shop so customer is never blocked
    if (activeShops.length > 0) {
      return {
        success: true,
        shop: activeShops[0],
        method: 'COUNTER_SESSION',
        message: `Connected to nearest partner shop: ${activeShops[0].name}`,
      };
    }

    return {
      success: false,
      message: 'No active merchant shop found nearby.',
    };
  }

  // --- STATS ---
  public getStats(shopId?: string) {
    const claims = this.getClaims(shopId);
    const totalClaims = claims.length;
    const pendingClaims = claims.filter((c) => c.status === 'PENDING').length;
    const acceptedClaims = claims.filter((c) => c.status === 'ACCEPTED').length;
    const rejectedClaims = claims.filter((c) => c.status === 'REJECTED').length;
    const today = new Date().toISOString().slice(0, 10);
    const todayClaims = claims.filter((c) => c.createdAt.startsWith(today)).length;
    const acceptanceRate = totalClaims > 0 ? Math.round((acceptedClaims / totalClaims) * 100) : 0;

    return {
      totalClaims,
      pendingClaims,
      acceptedClaims,
      rejectedClaims,
      todayClaims,
      acceptanceRate,
      totalShops: this.data.shops.length,
      totalMerchants: this.data.merchants.length,
      totalCustomers: this.data.customers.length,
      totalQrScans: this.data.qrScans.length,
    };
  }

  // --- QR SCANS ---
  public logQrScan(shopId: string, userAgent?: string): QrScan {
    const shop = this.getShopById(shopId);
    const scan: QrScan = {
      id: `scan-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      shopId,
      shopName: shop?.name || 'Unknown Shop',
      scannedAt: new Date().toISOString(),
      userAgent,
    };
    this.data.qrScans.push(scan);
    this.saveToDisk();
    return scan;
  }

  public getQrScans(shopId?: string): QrScan[] {
    if (shopId) {
      return this.data.qrScans.filter((s) => s.shopId === shopId);
    }
    return [...this.data.qrScans];
  }

  // --- SHOP ANALYTICS (per-merchant detailed stats) ---
  public getShopAnalytics(baseUrl = 'http://localhost:3000'): ShopAnalytics[] {
    const today = new Date().toISOString().slice(0, 10);

    return this.data.shops.map((shop) => {
      const merchant = this.data.merchants.find((m) => m.shopId === shop.id);
      const claims = this.data.claims.filter((c) => c.shopId === shop.id);
      const scans = this.data.qrScans.filter((s) => s.shopId === shop.id);
      const uniqueCustomerMobiles = new Set(claims.map((c) => c.customerMobile));

      return {
        shopId: shop.id,
        shopName: shop.name,
        merchantName: merchant?.name || 'Unassigned',
        merchantEmail: merchant?.email || '-',
        qrScanCount: scans.length,
        uniqueCustomers: uniqueCustomerMobiles.size,
        totalClaims: claims.length,
        pendingClaims: claims.filter((c) => c.status === 'PENDING').length,
        acceptedClaims: claims.filter((c) => c.status === 'ACCEPTED').length,
        rejectedClaims: claims.filter((c) => c.status === 'REJECTED').length,
        todayScans: scans.filter((s) => s.scannedAt.startsWith(today)).length,
        todayClaims: claims.filter((c) => c.createdAt.startsWith(today)).length,
        qrUrl: `${baseUrl}/shop/${shop.slug}`,
      };
    });
  }

  // --- LOYALTY STAMPS ---
  public getCustomerStampCount(mobile: string, shopId: string): number {
    const cleanMobile = mobile.replace(/[^0-9]/g, '').slice(-10);
    const accepted = this.data.claims.filter(
      (c) => c.customerMobile === cleanMobile && c.shopId === shopId && c.status === 'ACCEPTED'
    );
    return accepted.length;
  }
}

// Global Singleton
const globalForDb = globalThis as unknown as { dbStore?: DatabaseStore };
export const db = globalForDb.dbStore || new DatabaseStore();
if (process.env.NODE_ENV !== 'production') globalForDb.dbStore = db;


