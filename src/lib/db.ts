import { getDb } from './mongodb';
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

class DatabaseStore {
  private initPromise: Promise<void> | null = null;

  public async ensureInit() {
    if (!this.initPromise) {
      this.initPromise = (async () => {
        try {
          const db = await getDb();

          // Create essential indexes
          await db.collection('admins').createIndex({ email: 1 }, { unique: true }).catch(() => {});
          await db.collection('shops').createIndex({ id: 1 }, { unique: true }).catch(() => {});
          await db.collection('shops').createIndex({ slug: 1 }, { unique: true }).catch(() => {});
          await db.collection('merchants').createIndex({ id: 1 }, { unique: true }).catch(() => {});
          await db.collection('merchants').createIndex({ email: 1 }, { unique: true }).catch(() => {});
          await db.collection('customers').createIndex({ mobile: 1 }, { unique: true }).catch(() => {});
          await db.collection('rewards').createIndex({ id: 1 }, { unique: true }).catch(() => {});
          await db.collection('claims').createIndex({ id: 1 }, { unique: true }).catch(() => {});
          await db.collection('stampCards').createIndex({ customerMobile: 1, shopId: 1 }, { unique: true }).catch(() => {});

          // Seed if database collections are empty
          const shopsCount = await db.collection('shops').countDocuments();
          if (shopsCount === 0) {
            console.log('Seeding initial MongoDB Atlas collections...');
            if (INITIAL_ADMINS.length > 0) {
              await db.collection('admins').insertMany(INITIAL_ADMINS).catch(() => {});
            }
            if (INITIAL_SHOPS.length > 0) {
              await db.collection('shops').insertMany(INITIAL_SHOPS).catch(() => {});
            }
            if (INITIAL_MERCHANTS.length > 0) {
              await db.collection('merchants').insertMany(INITIAL_MERCHANTS).catch(() => {});
            }
            if (INITIAL_OFFERS.length > 0) {
              await db.collection('rewards').insertMany(INITIAL_OFFERS).catch(() => {});
            }
            if (INITIAL_CLAIMS.length > 0) {
              const claimsWithDateStr = INITIAL_CLAIMS.map((c) => ({
                ...c,
                dateStr: c.createdAt ? c.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
              }));
              await db.collection('claims').insertMany(claimsWithDateStr).catch(() => {});
            }
          }
        } catch (err) {
          console.error('Error initializing MongoDB Atlas connection:', err);
        }
      })();
    }
    return this.initPromise;
  }

  // --- ADMIN ---
  public async getAdminByEmail(email: string): Promise<AdminUser | undefined> {
    await this.ensureInit();
    const db = await getDb();
    const cleanEmail = email.trim().toLowerCase();
    const admin = await db.collection<AdminUser>('admins').findOne({ email: new RegExp('^' + cleanEmail + '$', 'i') });
    if (!admin) return undefined;
    const { _id, ...clean }: any = admin;
    return clean;
  }

  // --- SHOPS ---
  public async getShops(): Promise<Shop[]> {
    await this.ensureInit();
    const db = await getDb();
    const shops = await db.collection<Shop>('shops').find().toArray();
    return shops.map(({ _id, ...s }: any) => s);
  }

  public async getShopById(id?: string): Promise<Shop | undefined> {
    if (!id || !id.trim()) return undefined;
    await this.ensureInit();
    const db = await getDb();
    const cleanId = id.trim().toLowerCase();

    // 1. Direct match on id, slug, or normalized name
    let shop = await db.collection<Shop>('shops').findOne({
      $or: [
        { id: id },
        { id: new RegExp('^' + cleanId + '$', 'i') },
        { slug: new RegExp('^' + cleanId + '$', 'i') },
      ],
    });
    if (shop) {
      const { _id, ...cleanShop }: any = shop;
      return cleanShop;
    }

    // 2. Check if cleanId matches a merchant id or merchant email
    const merchant = await db.collection<Merchant>('merchants').findOne({
      $or: [
        { id: cleanId },
        { id: new RegExp('^' + cleanId + '$', 'i') },
        { email: new RegExp('^' + cleanId + '$', 'i') },
      ],
    });
    if (merchant) {
      const matchedShop = await db.collection<Shop>('shops').findOne({
        $or: [{ id: merchant.shopId }, { slug: merchant.shopId }],
      });
      if (matchedShop) {
        const { _id, ...cleanShop }: any = matchedShop;
        return cleanShop;
      }
    }

    return undefined;
  }

  public async saveShop(shopData: Partial<Shop> & { name: string; address: string; phone: string; latitude: number; longitude: number }): Promise<Shop> {
    await this.ensureInit();
    const db = await getDb();
    const now = new Date().toISOString();

    const targetId = shopData.id;
    let existingShop: Shop | null = null;
    if (targetId) {
      existingShop = await db.collection<Shop>('shops').findOne({ id: targetId });
    }

    let shop: Shop;
    if (existingShop) {
      const { _id, ...prev }: any = existingShop;
      shop = {
        ...prev,
        ...shopData,
        updatedAt: now,
      };
    } else {
      const slug = shopData.slug || shopData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      shop = {
        id: shopData.id || `shop-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
        name: shopData.name,
        slug,
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
    }

    const { _id, ...dataToSave }: any = shop;
    await db.collection('shops').updateOne({ id: shop.id }, { $set: dataToSave }, { upsert: true });
    return shop;
  }

  public async deleteShop(id: string): Promise<boolean> {
    await this.ensureInit();
    const db = await getDb();
    const res = await db.collection('shops').deleteOne({ id });
    await db.collection('merchants').deleteMany({ shopId: id });
    await db.collection('merchantSessions').deleteMany({ shopId: id });
    return res.deletedCount ? res.deletedCount > 0 : false;
  }

  // --- MERCHANTS ---
  public async getMerchants(): Promise<Array<Merchant & { shop?: Shop }>> {
    await this.ensureInit();
    const db = await getDb();
    const merchants = await db.collection<Merchant>('merchants').find().toArray();
    const shops = await this.getShops();

    return merchants.map(({ _id, ...m }: any) => ({
      ...m,
      shop: shops.find((s) => s.id === m.shopId || s.slug === m.shopId),
    }));
  }

  public async getMerchantById(id: string): Promise<Merchant | undefined> {
    await this.ensureInit();
    const db = await getDb();
    const m = await db.collection<Merchant>('merchants').findOne({ id });
    if (!m) return undefined;
    const { _id, ...merchant }: any = m;
    return merchant;
  }

  public async getMerchantByEmail(email: string): Promise<Merchant | undefined> {
    await this.ensureInit();
    const db = await getDb();
    const cleanEmail = email.trim().toLowerCase();
    const m = await db.collection<Merchant>('merchants').findOne({ email: new RegExp('^' + cleanEmail + '$', 'i') });
    if (!m) return undefined;
    const { _id, ...merchant }: any = m;
    return merchant;
  }

  public async getMerchantByGoogleId(googleId: string): Promise<Merchant | undefined> {
    await this.ensureInit();
    const db = await getDb();
    const m = await db.collection<Merchant>('merchants').findOne({ googleId });
    if (!m) return undefined;
    const { _id, ...merchant }: any = m;
    return merchant;
  }

  public async getMerchantByGoogleEmail(googleEmail: string): Promise<Merchant | undefined> {
    await this.ensureInit();
    const db = await getDb();
    const clean = googleEmail.trim().toLowerCase();
    const m = await db.collection<Merchant>('merchants').findOne({
      $or: [
        { googleEmail: new RegExp('^' + clean + '$', 'i') },
        { email: new RegExp('^' + clean + '$', 'i') },
      ],
    });
    if (!m) return undefined;
    const { _id, ...merchant }: any = m;
    return merchant;
  }

  public async getMerchantByShopId(shopId: string): Promise<Merchant | undefined> {
    await this.ensureInit();
    const db = await getDb();
    const m = await db.collection<Merchant>('merchants').findOne({ shopId });
    if (!m) return undefined;
    const { _id, ...merchant }: any = m;
    return merchant;
  }

  public async saveMerchant(merchantData: Partial<Merchant> & { shopId: string; email: string; name: string; passwordHash: string }): Promise<Merchant> {
    await this.ensureInit();
    const db = await getDb();
    const now = new Date().toISOString();

    const targetId = merchantData.id || `merchant-${Date.now().toString(36)}`;
    const existing = await db.collection<Merchant>('merchants').findOne({ id: targetId });

    let merchant: Merchant;
    if (existing) {
      const { _id, ...prev }: any = existing;
      merchant = {
        ...prev,
        ...merchantData,
        id: targetId,
      };
    } else {
      merchant = {
        id: targetId,
        shopId: merchantData.shopId,
        email: merchantData.email.trim(),
        passwordHash: merchantData.passwordHash,
        name: merchantData.name.trim(),
        phone: merchantData.phone || '',
        isActive: merchantData.isActive ?? true,
        createdAt: now,
        googleEmail: merchantData.googleEmail,
        loginType: merchantData.loginType,
      };
    }

    const { _id, ...dataToSave }: any = merchant;
    await db.collection('merchants').updateOne({ id: merchant.id }, { $set: dataToSave }, { upsert: true });
    return merchant;
  }

  public async deleteMerchant(id: string): Promise<boolean> {
    await this.ensureInit();
    const db = await getDb();
    const res = await db.collection('merchants').deleteOne({ id });
    return res.deletedCount ? res.deletedCount > 0 : false;
  }

  // --- SESSIONS ---
  public async getMerchantSessions(shopId?: string): Promise<MerchantSession[]> {
    await this.ensureInit();
    const db = await getDb();
    const query = shopId ? { shopId } : {};
    const sessions = await db.collection<MerchantSession>('merchantSessions').find(query).toArray();
    return sessions.map(({ _id, ...s }: any) => s);
  }

  public async registerOrUpdateSession(
    merchantId: string,
    shopId: string,
    isCounterActive = true,
    deviceInfo = 'Web Terminal',
    ipAddress?: string
  ): Promise<MerchantSession> {
    await this.ensureInit();
    const db = await getDb();
    const now = new Date().toISOString();

    const existing = await db.collection<MerchantSession>('merchantSessions').findOne({ merchantId });
    let session: MerchantSession;

    if (existing) {
      const { _id, ...prev }: any = existing;
      session = {
        ...prev,
        isCounterActive,
        lastHeartbeat: now,
        ipAddress: ipAddress || prev.ipAddress,
      };
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
    }

    const { _id, ...dataToSave }: any = session;
    await db.collection('merchantSessions').updateOne({ merchantId }, { $set: dataToSave }, { upsert: true });
    return session;
  }

  public async setCounterMode(merchantId: string, active: boolean): Promise<boolean> {
    await this.ensureInit();
    const db = await getDb();
    const res = await db.collection('merchantSessions').updateOne(
      { merchantId },
      { $set: { isCounterActive: active, lastHeartbeat: new Date().toISOString() } }
    );
    return res.modifiedCount > 0;
  }

  // --- OFFERS / REWARDS ---
  public async getOffers(): Promise<Offer[]> {
    await this.ensureInit();
    const db = await getDb();
    const offers = await db.collection<Offer>('rewards').find().toArray();
    return offers.map(({ _id, ...o }: any) => o);
  }

  public async getDefaultOffer(): Promise<Offer> {
    const offers = await this.getOffers();
    return offers[0] || INITIAL_OFFERS[0];
  }

  public async getShopOffer(shopId: string): Promise<Offer> {
    await this.ensureInit();
    const db = await getDb();
    const offer = await db.collection<Offer>('rewards').findOne({
      $or: [{ id: shopId }, { id: `offer-${shopId}` }, { shopId: shopId }],
    });
    if (offer) {
      const { _id, ...clean }: any = offer;
      return clean;
    }
    const defaultOff = await this.getDefaultOffer();
    return {
      ...defaultOff,
      title: defaultOff.title || 'Get 5% discount on your total bill after 8 visits',
      visitsRequired: defaultOff.visitsRequired || 8,
      expiryDays: defaultOff.expiryDays || 30,
    };
  }

  public isOfferExpired(offer?: Offer | null): boolean {
    if (!offer) return false;
    if (offer.isActive === false) return true;
    if (offer.expiryDate) {
      const expTime = new Date(offer.expiryDate.includes('T') ? offer.expiryDate : `${offer.expiryDate}T23:59:59`).getTime();
      if (!isNaN(expTime) && expTime < Date.now()) return true;
    }
    if (offer.expiryDays && offer.createdAt) {
      const createdTime = new Date(offer.createdAt).getTime();
      if (!isNaN(createdTime) && createdTime + offer.expiryDays * 86400000 < Date.now()) {
        return true;
      }
    }
    return false;
  }

  public async updateShopOffer(
    shopId: string,
    offerData: { title?: string; description?: string; visitsRequired?: number; expiryDays?: number; expiryDate?: string; image?: string; terms?: string; discountPercent?: number; isActive?: boolean; merchantId?: string }
  ): Promise<Offer> {
    await this.ensureInit();
    const db = await getDb();
    const now = new Date().toISOString();

    const existing = await db.collection<Offer>('rewards').findOne({
      $or: [{ id: shopId }, { id: `offer-${shopId}` }, { shopId: shopId }],
    });

    let offer: Offer;
    if (!existing) {
      offer = {
        id: `offer-${shopId}`,
        title: offerData.title || 'Get 5% discount on your total bill after 8 visits',
        discountPercent: offerData.discountPercent ?? 15,
        description: offerData.description || 'Special reward for loyal customers.',
        terms: offerData.terms || 'Valid on single bill.',
        isActive: offerData.isActive ?? true,
        visitsRequired: offerData.visitsRequired || 8,
        expiryDays: offerData.expiryDays || 30,
        expiryDate: offerData.expiryDate || undefined,
        image: offerData.image || '',
        createdAt: now,
      };
    } else {
      const { _id, ...prev }: any = existing;
      offer = {
        ...prev,
        ...offerData,
      };
    }

    const { _id, ...dataToSave }: any = offer;
    await db.collection('rewards').updateOne(
      { id: offer.id },
      { $set: { ...dataToSave, shopId, merchantId: offerData.merchantId || `merchant-${shopId}`, updatedAt: now } },
      { upsert: true }
    );
    return offer;
  }

  // --- CUSTOMERS ---
  public async getCustomers(): Promise<Customer[]> {
    await this.ensureInit();
    const db = await getDb();
    const customers = await db.collection<Customer>('customers').find().toArray();
    return customers.map(({ _id, ...c }: any) => c);
  }

  public async findOrCreateCustomer(name: string, mobile: string): Promise<Customer> {
    await this.ensureInit();
    const db = await getDb();
    const cleanMobile = mobile.replace(/[^0-9]/g, '').slice(-10);

    const existing = await db.collection<Customer>('customers').findOne({ mobile: cleanMobile });
    if (existing) {
      if (name && existing.name !== name.trim()) {
        await db.collection('customers').updateOne({ mobile: cleanMobile }, { $set: { name: name.trim() } });
        existing.name = name.trim();
      }
      const { _id, ...cleanCust }: any = existing;
      return cleanCust;
    }

    const customer: Customer = {
      id: `cust-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      name: name.trim(),
      mobile: cleanMobile,
      createdAt: new Date().toISOString(),
    };

    await db.collection('customers').insertOne(customer);
    return customer;
  }

  // --- CLAIMS & DUPLICATE PREVENTION ---
  public async getClaims(shopId?: string): Promise<Claim[]> {
    await this.ensureInit();
    const db = await getDb();
    const query = shopId ? { shopId } : {};
    const claims = await db.collection<Claim>('claims').find(query).sort({ createdAt: -1 }).toArray();
    return claims.map(({ _id, ...c }: any) => c);
  }

  public async getClaimById(id: string): Promise<Claim | undefined> {
    await this.ensureInit();
    const db = await getDb();
    const claim = await db.collection<Claim>('claims').findOne({ id });
    if (!claim) return undefined;
    const { _id, ...clean }: any = claim;
    return clean;
  }

  public async hasScannedToday(mobileOrId: string, shopId: string): Promise<Claim | undefined> {
    await this.ensureInit();
    const db = await getDb();
    const cleanMobile = mobileOrId.replace(/[^0-9]/g, '').slice(-10);
    const todayStr = new Date().toISOString().slice(0, 10);

    const claim = await db.collection<Claim>('claims').findOne({
      shopId,
      dateStr: todayStr,
      $or: [
        { customerId: mobileOrId },
        { customerMobile: cleanMobile },
      ],
    });

    if (!claim) return undefined;
    const { _id, ...clean }: any = claim;
    return clean;
  }

  public async createClaim(params: {
    customerName: string;
    customerMobile: string;
    shopId: string;
    identificationMethod: IdentificationMethod;
    customerLat?: number;
    customerLng?: number;
    distanceMeters?: number;
  }): Promise<Claim> {
    await this.ensureInit();
    const db = await getDb();

    const shop = await this.getShopById(params.shopId);
    if (!shop) throw new Error('Shop not found');

    const customer = await this.findOrCreateCustomer(params.customerName, params.customerMobile);
    const offer = await this.getShopOffer(shop.id);

    const currentStamps = await this.getCustomerStampCount(params.customerMobile, shop.id);
    const is8thStamp = currentStamps >= 7;
    const rewardCode = `TREAT-${Math.floor(1000 + Math.random() * 9000)}`;
    const claimCode = `SCR-${Math.floor(1000 + Math.random() * 9000)}`;
    const todayStr = new Date().toISOString().slice(0, 10);

    const claim: Claim & { dateStr: string } = {
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
      is8thStampReward: is8thStamp,
      rewardCode: rewardCode,
      isRedeemed: false,
      dateStr: todayStr,
      createdAt: new Date().toISOString(),
    };

    await db.collection('claims').insertOne(claim);
    return claim;
  }

  public async updateClaimStatus(
    claimId: string,
    status: ClaimStatus,
    resolvedBy?: string,
    rejectionReason?: string
  ): Promise<Claim | undefined> {
    await this.ensureInit();
    const db = await getDb();

    const claim = await this.getClaimById(claimId);
    if (!claim) return undefined;

    const resolvedAt = new Date().toISOString();
    const updateFields: any = {
      status,
      resolvedAt,
    };
    if (resolvedBy) updateFields.resolvedBy = resolvedBy;
    if (rejectionReason) updateFields.rejectionReason = rejectionReason;

    await db.collection('claims').updateOne({ id: claimId }, { $set: updateFields });

    // Increment customer stamp count in MongoDB stampCards collection on ACCEPTED
    if (status === 'ACCEPTED') {
      await this.incrementCustomerStamp(claim.customerMobile, claim.shopId, claim.id, resolvedBy);
    }

    return {
      ...claim,
      ...updateFields,
    };
  }

  public async markClaimRedeemed(claimId: string, resolvedBy?: string): Promise<Claim | undefined> {
    await this.ensureInit();
    const db = await getDb();

    const claim = await this.getClaimById(claimId);
    if (!claim) return undefined;

    const resolvedAt = new Date().toISOString();
    await db.collection('claims').updateOne(
      { id: claimId },
      { $set: { status: 'ACCEPTED', isRedeemed: true, resolvedAt, resolvedBy } }
    );
    await this.incrementCustomerStamp(claim.customerMobile, claim.shopId, claim.id, resolvedBy);

    return { ...claim, status: 'ACCEPTED', isRedeemed: true, resolvedAt, resolvedBy };
  }

  public async markScratchRevealed(claimId: string): Promise<Claim | undefined> {
    await this.ensureInit();
    const db = await getDb();
    await db.collection('claims').updateOne({ id: claimId }, { $set: { scratchRevealed: true } });
    return this.getClaimById(claimId);
  }

  // --- STAMP CARDS ---
  public async getCustomerStampCount(mobile: string, shopId: string): Promise<number> {
    await this.ensureInit();
    const db = await getDb();
    const cleanMobile = mobile.replace(/[^0-9]/g, '').slice(-10);

    const card = await db.collection('stampCards').findOne({ customerMobile: cleanMobile, shopId });
    if (card && card.stampCount !== undefined) {
      return card.stampCount;
    }

    const count = await db.collection('claims').countDocuments({
      customerMobile: cleanMobile,
      shopId,
      status: 'ACCEPTED',
    });
    return count;
  }

  public async incrementCustomerStamp(
    mobile: string,
    shopId: string,
    claimId: string,
    approvedBy?: string
  ): Promise<number> {
    await this.ensureInit();
    const db = await getDb();
    const cleanMobile = mobile.replace(/[^0-9]/g, '').slice(-10);
    const now = new Date().toISOString();
    const shop = await this.getShopById(shopId);

    const filter = { customerMobile: cleanMobile, shopId };
    const update = {
      $inc: { stampCount: 1 },
      $set: {
        customerMobile: cleanMobile,
        shopId,
        shopName: shop?.name || 'Partner Shop',
        lastUpdated: now,
      },
      $push: {
        history: { claimId, approvedAt: now, approvedBy } as any,
      },
    };

    const res = await db.collection('stampCards').findOneAndUpdate(filter, update, {
      upsert: true,
      returnDocument: 'after',
    });

    return res?.stampCount || (await this.getCustomerStampCount(cleanMobile, shopId));
  }

  // --- INTELLIGENT SHOP RESOLVER ---
  public async resolveShop(req: ResolveShopRequest): Promise<ResolveShopResponse> {
    await this.ensureInit();
    const allShops = await this.getShops();
    const activeShops = allShops.filter((s) => s.isActive);

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

    const sessions = await this.getMerchantSessions();
    const fifteenMinsAgo = Date.now() - 15 * 60 * 1000;
    const activeSessions = sessions.filter(
      (ms) => ms.isCounterActive && new Date(ms.lastHeartbeat).getTime() > fifteenMinsAgo
    );

    if (activeSessions.length > 0) {
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

    return {
      success: false,
      message: 'No active merchant shop found nearby.',
    };
  }

  // --- STATS ---
  public async getStats(shopId?: string): Promise<any> {
    await this.ensureInit();
    const claims = await this.getClaims(shopId);
    const totalClaims = claims.length;
    const pendingClaims = claims.filter((c) => c.status === 'PENDING').length;
    const acceptedClaims = claims.filter((c) => c.status === 'ACCEPTED').length;
    const rejectedClaims = claims.filter((c) => c.status === 'REJECTED').length;
    const today = new Date().toISOString().slice(0, 10);
    const todayClaims = claims.filter((c) => c.createdAt.startsWith(today)).length;
    const acceptanceRate = totalClaims > 0 ? Math.round((acceptedClaims / totalClaims) * 100) : 0;

    const shops = await this.getShops();
    const merchants = await this.getMerchants();
    const customers = await this.getCustomers();
    const scans = await this.getQrScans();

    return {
      totalClaims,
      pendingClaims,
      acceptedClaims,
      rejectedClaims,
      todayClaims,
      acceptanceRate,
      totalShops: shops.length,
      totalMerchants: merchants.length,
      totalCustomers: customers.length,
      totalQrScans: scans.length,
    };
  }

  // --- QR SCANS ---
  public async logQrScan(shopId: string, userAgent?: string): Promise<QrScan> {
    await this.ensureInit();
    const db = await getDb();
    const shop = await this.getShopById(shopId);
    const scan: QrScan = {
      id: `scan-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      shopId,
      shopName: shop?.name || 'Unknown Shop',
      scannedAt: new Date().toISOString(),
      userAgent,
    };
    await db.collection('scans').insertOne(scan);
    return scan;
  }

  public async getQrScans(shopId?: string): Promise<QrScan[]> {
    await this.ensureInit();
    const db = await getDb();
    const query = shopId ? { shopId } : {};
    const scans = await db.collection<QrScan>('scans').find(query).toArray();
    return scans.map(({ _id, ...s }: any) => s);
  }

  // --- SHOP ANALYTICS ---
  public async getShopAnalytics(baseUrl = 'http://localhost:3000'): Promise<ShopAnalytics[]> {
    await this.ensureInit();
    const today = new Date().toISOString().slice(0, 10);

    const shops = await this.getShops();
    const merchants = await this.getMerchants();
    const claims = await this.getClaims();
    const scans = await this.getQrScans();

    return shops.map((shop) => {
      const merchant = merchants.find((m) => m.shopId === shop.id);
      const shopClaims = claims.filter((c) => c.shopId === shop.id);
      const shopScans = scans.filter((s) => s.shopId === shop.id);
      const uniqueCustomerMobiles = new Set(shopClaims.map((c) => c.customerMobile));

      return {
        shopId: shop.id,
        shopName: shop.name,
        merchantName: merchant?.name || 'Unassigned',
        merchantEmail: merchant?.email || '-',
        qrScanCount: shopScans.length,
        uniqueCustomers: uniqueCustomerMobiles.size,
        totalClaims: shopClaims.length,
        pendingClaims: shopClaims.filter((c) => c.status === 'PENDING').length,
        acceptedClaims: shopClaims.filter((c) => c.status === 'ACCEPTED').length,
        rejectedClaims: shopClaims.filter((c) => c.status === 'REJECTED').length,
        todayScans: shopScans.filter((s) => s.scannedAt.startsWith(today)).length,
        todayClaims: shopClaims.filter((c) => c.createdAt.startsWith(today)).length,
        qrUrl: `${baseUrl}/shop/${shop.slug}`,
      };
    });
  }
}

// Global Singleton
const globalForDb = globalThis as unknown as { dbStore?: DatabaseStore };
export const db = globalForDb.dbStore || new DatabaseStore();
globalForDb.dbStore = db;
