'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Store,
  Users,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit2,
  LogOut,
  MapPin,
  QrCode,
  Search,
  Filter,
  RefreshCw,
  Sliders,
  BarChart3,
  Download,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { Shop, Merchant, Claim, Customer, Offer, ShopAnalytics } from '@/types';

export default function AdminDashboardPage() {
  const router = useRouter();

  // State
  const [stats, setStats] = useState<any>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Analytics & QR Modal State
  const [analyticsData, setAnalyticsData] = useState<ShopAnalytics[]>([]);
  const [qrModalShop, setQrModalShop] = useState<any | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Active Tab
  const [currentTab, setCurrentTab] = useState<'SHOPS' | 'MERCHANTS' | 'CLAIMS' | 'CUSTOMERS' | 'OFFERS' | 'ANALYTICS'>('SHOPS');

  // Filter state for claims
  const [selectedShopFilter, setSelectedShopFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Modal states
  const [isAddShopModalOpen, setIsAddShopModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [isAddMerchantModalOpen, setIsAddMerchantModalOpen] = useState(false);

  // New Shop Form
  const [shopForm, setShopForm] = useState({
    name: '',
    category: 'Cafe & Restaurant',
    address: '',
    phone: '+91 ',
    latitude: 28.6315,
    longitude: 77.2167,
    radiusMeters: 75,
    wifiIp: '',
  });

  // New Merchant Form
  const [merchantForm, setMerchantForm] = useState({
    shopId: '',
    name: '',
    email: '',
    password: 'shop123',
    phone: '',
    gmailEmail: '', // Gmail for Google OAuth login
  });


  const [isRefreshing, setIsRefreshing] = useState(false);

  // LocalStorage Helpers
  const getLocalShops = (): any[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('flinty_local_shops');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveLocalShops = (updatedShops: any[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('flinty_local_shops', JSON.stringify(updatedShops));
    } catch {}
  };

  const getLocalMerchants = (): any[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('flinty_local_merchants');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveLocalMerchants = (updatedMerchants: any[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('flinty_local_merchants', JSON.stringify(updatedMerchants));
    } catch {}
  };

  // Restore from localStorage on initial load
  useEffect(() => {
    const storedShops = getLocalShops();
    const storedMerchants = getLocalMerchants();
    if (storedShops.length > 0) setShops(storedShops);
    if (storedMerchants.length > 0) setMerchants(storedMerchants);
  }, []);

  // Fetch all admin data & merge with localStorage
  const fetchAdminData = useCallback(async () => {
    setIsRefreshing(true);
    const ts = Date.now();
    const fetchOptions: RequestInit = { cache: 'no-store' };
    try {
      // Check auth
      const authRes = await fetch(`/api/auth/admin?_t=${ts}`, fetchOptions);
      if (!authRes.ok) {
        router.push('/admin/login');
        return;
      }

      // Fetch stats
      const statsRes = await fetch(`/api/admin/stats?_t=${ts}`, fetchOptions);
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch shops from API & merge with localStorage
      const shopsRes = await fetch(`/api/admin/shops?_t=${ts}`, fetchOptions);
      const shopsData = await shopsRes.json();
      const apiShops = shopsData.success ? shopsData.shops : [];
      const storedShops = getLocalShops();

      const shopMap = new Map<string, any>();
      apiShops.forEach((s: any) => shopMap.set(s.id, s));
      storedShops.forEach((s: any) => shopMap.set(s.id, { ...shopMap.get(s.id), ...s }));
      const mergedShops = Array.from(shopMap.values());

      if (mergedShops.length > 0) {
        saveLocalShops(mergedShops);
        setShops(mergedShops);
        setMerchantForm((prev) => {
          if (!prev.shopId && mergedShops.length > 0) {
            return { ...prev, shopId: mergedShops[0].id };
          }
          return prev;
        });
      }

      // Fetch merchants from API & merge with localStorage
      const merchantsRes = await fetch(`/api/admin/merchants?_t=${ts}`, fetchOptions);
      const merchantsData = await merchantsRes.json();
      const apiMerchants = merchantsData.success ? merchantsData.merchants : [];
      const storedMerchants = getLocalMerchants();

      const merchantMap = new Map<string, any>();
      apiMerchants.forEach((m: any) => merchantMap.set(m.id, m));
      storedMerchants.forEach((m: any) => merchantMap.set(m.id, { ...merchantMap.get(m.id), ...m }));
      const mergedMerchants = Array.from(merchantMap.values());

      if (mergedMerchants.length > 0) {
        saveLocalMerchants(mergedMerchants);
        setMerchants(mergedMerchants);
      }

      // Fetch claims
      const claimsRes = await fetch(`/api/claims?_t=${ts}`, fetchOptions);
      const claimsData = await claimsRes.json();
      if (claimsData.success) {
        setClaims(claimsData.claims);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [router]);

  // Fetch shop analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/qr', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setAnalyticsData(data.analytics);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  }, []);

  // Show QR modal for a shop
  const handleShowQr = async (shop: any) => {
    setQrModalShop(shop);
    setIsLoadingQr(true);
    setQrDataUrl(null);
    setQrUrl(null);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const shopSlug = shop.slug || shop.id;
      const targetQrUrl = `${origin}/shop/${shopSlug}`;

      const QRCode = (await import('qrcode')).default;
      const dataUrl = await QRCode.toDataURL(targetQrUrl, {
        width: 400,
        margin: 2,
        color: { dark: '#111827', light: '#FFFFFF' },
        errorCorrectionLevel: 'H',
      });

      setQrDataUrl(dataUrl);
      setQrUrl(targetQrUrl);
    } catch (err) {
      console.error('Error generating QR:', err);
    } finally {
      setIsLoadingQr(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 6000);
    return () => clearInterval(interval);
  }, [fetchAdminData]);

  useEffect(() => {
    if (currentTab === 'ANALYTICS') {
      fetchAnalytics();
    }
  }, [currentTab, fetchAnalytics]);

  // Handle Create / Edit Shop (No page reload, immediate localStorage & state update)
  const handleSaveShop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!shopForm.name.trim()) {
        alert('Please enter a valid shop name.');
        return;
      }
      if (!shopForm.address.trim()) {
        alert('Please enter a valid shop address.');
        return;
      }

      const isEditing = Boolean(editingShop?.id);
      const shopId = isEditing ? editingShop!.id : `shop-${Date.now()}`;
      const slug = shopForm.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

      const targetShop: Shop = {
        id: shopId,
        name: shopForm.name.trim(),
        category: shopForm.category || 'Retail Store',
        address: shopForm.address.trim(),
        phone: shopForm.phone.trim(),
        latitude: Number(shopForm.latitude) || 28.6315,
        longitude: Number(shopForm.longitude) || 77.2167,
        radiusMeters: Number(shopForm.radiusMeters) || 75,
        wifiIp: shopForm.wifiIp || '',
        slug,
        isActive: true,
        createdAt: isEditing ? (editingShop?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      };

      // 1. Immediately update React state & localStorage
      setShops((prevShops) => {
        const idx = prevShops.findIndex((s) => s.id === shopId);
        let updated: any[];
        if (idx >= 0) {
          updated = [...prevShops];
          updated[idx] = { ...updated[idx], ...targetShop };
        } else {
          updated = [targetShop, ...prevShops];
        }
        saveLocalShops(updated);
        return updated;
      });

      // 2. Reset modal & form immediately without refreshing page
      setIsAddShopModalOpen(false);
      setEditingShop(null);
      setShopForm({
        name: '',
        category: 'Cafe & Restaurant',
        address: '',
        phone: '+91 ',
        latitude: 28.6315,
        longitude: 77.2167,
        radiusMeters: 75,
        wifiIp: '',
      });

      // 3. Send API sync request to backend silently
      const url = '/api/admin/shops';
      const method = isEditing ? 'PUT' : 'POST';
      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetShop),
      }).catch((err) => console.error('API shop sync notice:', err));

      alert(`Shop "${targetShop.name}" ${isEditing ? 'updated' : 'created'} successfully!`);
    } catch (err) {
      console.error('Error saving shop:', err);
      alert('Error saving shop.');
    }
  };

  // Handle Delete Shop (Immediate state & localStorage update)
  const handleDeleteShop = async (shopId: string) => {
    if (!confirm('Are you sure you want to delete this shop and its associated merchants?')) return;
    try {
      setShops((prevShops) => {
        const updated = prevShops.filter((s) => s.id !== shopId);
        saveLocalShops(updated);
        return updated;
      });

      fetch(`/api/admin/shops?id=${shopId}`, { method: 'DELETE' }).catch(() => {});
    } catch (err) {
      console.error('Failed to delete shop:', err);
    }
  };

  // Handle Create Merchant (Immediate state & localStorage update)
  const handleSaveMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!merchantForm.name.trim()) {
        alert('Please enter a valid merchant name.');
        return;
      }
      if (!merchantForm.email.trim()) {
        alert('Please enter a valid merchant email.');
        return;
      }
      if (!merchantForm.password.trim()) {
        alert('Please enter a password for the merchant.');
        return;
      }

      const targetShopId = merchantForm.shopId || shops[0]?.id;
      if (!targetShopId) {
        alert('Please select a valid shop to assign to this merchant.');
        return;
      }

      const targetShop = shops.find((s) => s.id === targetShopId);
      const merchantId = `merchant-${Date.now()}`;
      const newMerchant = {
        id: merchantId,
        shopId: targetShopId,
        email: merchantForm.email.trim(),
        name: merchantForm.name.trim(),
        passwordHash: merchantForm.password,
        phone: merchantForm.phone.trim(),
        isActive: true,
        googleEmail: merchantForm.gmailEmail?.trim() || undefined,
        loginType: merchantForm.gmailEmail?.trim() ? 'both' : 'password',
        createdAt: new Date().toISOString(),
        shop: targetShop,
      };

      setMerchants((prev) => {
        const updated = [newMerchant, ...prev];
        saveLocalMerchants(updated);
        return updated;
      });

      setIsAddMerchantModalOpen(false);
      setMerchantForm({
        shopId: shops[0]?.id || '',
        name: '',
        email: '',
        password: 'shop123',
        phone: '',
        gmailEmail: '',
      });

      fetch('/api/admin/merchants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMerchant),
      }).catch(() => {});

      alert(`Merchant "${newMerchant.name}" created successfully!`);
    } catch (err) {
      console.error('Error saving merchant:', err);
      alert('Error saving merchant account.');
    }
  };

  // Handle Delete Merchant (Immediate state & localStorage update)
  const handleDeleteMerchant = async (merchantId: string) => {
    if (!confirm('Delete this merchant account?')) return;
    try {
      setMerchants((prev) => {
        const updated = prev.filter((m) => m.id !== merchantId);
        saveLocalMerchants(updated);
        return updated;
      });

      fetch(`/api/admin/merchants?id=${merchantId}`, { method: 'DELETE' }).catch(() => {});
    } catch (err) {
      console.error('Failed to delete merchant:', err);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await fetch('/api/auth/admin', { method: 'DELETE' });
    router.push('/admin/login');
  };

  if (isLoading && !stats) {
    return (
      <div className="min-h-[calc(100vh-61px)] flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-slate-900" />
          <span>Loading Admin Console...</span>
        </div>
      </div>
    );
  }

  // Filtered claims
  const filteredClaims = claims.filter((c) => {
    if (selectedShopFilter !== 'ALL' && c.shopId !== selectedShopFilter) return false;
    if (selectedStatusFilter !== 'ALL' && c.status !== selectedStatusFilter) return false;
    return true;
  });

  return (
    <div className="min-h-[calc(100vh-61px)] bg-slate-50 flex flex-col">
      {/* Top Admin Sub-Header */}
      <div className="bg-slate-900 text-white sticky top-[57px] z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">Master Admin Dashboard</h1>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
                  SuperAdmin
                </span>
              </div>
              <p className="text-xs text-slate-400">Universal QR Network Management</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchAdminData}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold shadow-xs transition-all border border-white/10 disabled:opacity-50"
              title="Refresh All Admin Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : 'text-slate-300'}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>

            <Link
              href="/admin/qr-stand"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span>Acrylic Stand Studio</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 text-xs font-semibold transition-all border border-white/10"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 space-y-6">

        {/* Global KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Partner Shops</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats?.totalShops || shops.length}</div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Active retail locations</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Merchants</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats?.totalMerchants || merchants.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Assigned managers</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Customers</div>
            <div className="text-2xl font-black text-indigo-600 mt-1">{stats?.totalCustomers || 2}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Unique mobile users</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Claims</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats?.totalClaims || claims.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Scratch cards generated</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Accepted</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{stats?.acceptedClaims || 0}</div>
            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">{stats?.acceptanceRate || 0}% rate</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Pending</div>
            <div className="text-2xl font-black text-amber-500 mt-1">{stats?.pendingClaims || 0}</div>
            <div className="text-[10px] text-amber-600 font-medium mt-0.5">Awaiting cashier</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setCurrentTab('SHOPS')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              currentTab === 'SHOPS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Shops & Counters ({shops.length})</span>
          </button>

          <button
            onClick={() => setCurrentTab('MERCHANTS')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              currentTab === 'MERCHANTS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Merchant Logins ({merchants.length})</span>
          </button>

          <button
            onClick={() => setCurrentTab('CLAIMS')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              currentTab === 'CLAIMS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Global Claims Feed ({claims.length})</span>
          </button>

          <button
            onClick={() => setCurrentTab('OFFERS')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              currentTab === 'OFFERS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Offers Engine</span>
          </button>

          <button
            onClick={() => setCurrentTab('ANALYTICS')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              currentTab === 'ANALYTICS'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics & QR Reports</span>
          </button>
        </div>

        {/* TAB 1: SHOPS MANAGEMENT */}
        {currentTab === 'SHOPS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Partner Retail Shops</h2>
                <p className="text-xs text-slate-500">Manage shop locations, geofence radius, and cashier credentials.</p>
              </div>
              <button
                onClick={() => {
                  setEditingShop(null);
                  setShopForm({
                    name: '',
                    category: 'Cafe & Restaurant',
                    address: '',
                    phone: '+91 ',
                    latitude: 28.6315,
                    longitude: 77.2167,
                    radiusMeters: 75,
                    wifiIp: '',
                  });
                  setIsAddShopModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Shop</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Shop Name</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Location & Geofence</th>
                    <th className="px-6 py-3.5">Assigned Merchant</th>
                    <th className="px-6 py-3.5">Terminal Status</th>
                    <th className="px-6 py-3.5">Claims</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shops.map((shop) => (
                    <tr key={shop.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {shop.name}
                        <div className="text-[11px] text-slate-400 font-normal">{shop.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                          {shop.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-700 truncate max-w-xs">{shop.address}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {shop.latitude.toFixed(4)}, {shop.longitude.toFixed(4)} (Radius: {shop.radiusMeters}m)
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {shop.merchant ? (
                          <div>
                            <span className="font-semibold text-slate-800">{shop.merchant.name}</span>
                            <div className="text-[11px] text-slate-400 font-mono">{shop.merchant.email}</div>
                          </div>
                        ) : (
                          <span className="text-amber-600 italic">No merchant assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Online
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        <span className="font-bold text-slate-900">{shop.totalClaims || 0}</span>
                        <span className="text-[11px] text-slate-400"> ({shop.acceptedClaims || 0} accepted)</span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleShowQr(shop)}
                          title="Generate & View QR Code"
                          className="px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-lg inline-flex items-center gap-1 transition-all"
                        >
                          <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                          <span>QR Code</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditingShop(shop);
                            setShopForm({
                              name: shop.name,
                              category: shop.category,
                              address: shop.address,
                              phone: shop.phone,
                              latitude: shop.latitude,
                              longitude: shop.longitude,
                              radiusMeters: shop.radiusMeters,
                              wifiIp: shop.wifiIp || '',
                            });
                            setIsAddShopModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteShop(shop.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: MERCHANTS MANAGEMENT */}
        {currentTab === 'MERCHANTS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Merchant User Accounts</h2>
                <p className="text-xs text-slate-500">Store managers who log in to review and accept incoming claims.</p>
              </div>
              <button
                onClick={() => setIsAddMerchantModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Merchant</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Name</th>
                    <th className="px-6 py-3.5">Email (Login)</th>
                    <th className="px-6 py-3.5">Assigned Shop</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {merchants.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {m.name}
                        {m.phone && <div className="text-[11px] text-slate-400 font-normal">{m.phone}</div>}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600">{m.email}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {m.shop?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[11px] font-semibold text-emerald-600">Active</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteMerchant(m.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: GLOBAL CLAIMS FEED */}
        {currentTab === 'CLAIMS' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Live Global Claims Feed</h2>
                <p className="text-xs text-slate-500">Every scratch card transaction across all partner locations.</p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedShopFilter}
                  onChange={(e) => setSelectedShopFilter(e.target.value)}
                  className="p-2 text-xs bg-white border border-slate-200 rounded-xl font-medium"
                >
                  <option value="ALL">All Shops</option>
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="p-2 text-xs bg-white border border-slate-200 rounded-xl font-medium"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Mobile</th>
                    <th className="px-6 py-3.5">Shop</th>
                    <th className="px-6 py-3.5">Offer</th>
                    <th className="px-6 py-3.5">Code</th>
                    <th className="px-6 py-3.5">Method</th>
                    <th className="px-6 py-3.5">Date & Time</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClaims.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{c.customerName}</td>
                      <td className="px-6 py-4 font-mono text-slate-600">+91 {c.customerMobile}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{c.shopName}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-amber-600">10% OFF</span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-700">{c.claimCode}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {c.identificationMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {c.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            Pending
                          </span>
                        )}
                        {c.status === 'ACCEPTED' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Accepted
                          </span>
                        )}
                        {c.status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                            Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: OFFERS ENGINE */}
        {currentTab === 'OFFERS' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Offer Campaign Engine</h2>
              <p className="text-xs text-slate-500">Universal scratch offer applied to all acrylic displays across the network.</p>
            </div>

            <div className="max-w-xl bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Primary In-Store Offer</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">Flat 10% OFF Entire Bill</h3>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">Active</span>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Discount Rate:</span>
                  <span className="font-bold text-slate-900">10.0% Flat</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Claim Frequency:</span>
                  <span className="font-medium text-slate-900">1 per customer mobile / 24 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Display:</span>
                  <span className="font-medium text-slate-900">Universal Printed Acrylic Stand</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Verification Requirement:</span>
                  <span className="font-medium text-slate-900">Cashier Tap Confirmation</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                💡 <strong>Network Rule:</strong> This offer is automatically displayed to every customer scanning the common QR display. The customer cannot tamper with or change the offer percentage.
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ANALYTICS & QR REPORTS */}
        {currentTab === 'ANALYTICS' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Merchant QR & Scan Analytics</h2>
                <p className="text-xs text-slate-500">Track QR code scans, unique customers, and claim request status per shop.</p>
              </div>
              <button
                onClick={fetchAnalytics}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Data</span>
              </button>
            </div>

            {/* Global Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-4 rounded-2xl shadow-sm">
                <div className="text-[11px] font-semibold text-indigo-100 uppercase tracking-wider">Total QR Scans</div>
                <div className="text-2xl font-black mt-1">
                  {analyticsData.reduce((acc, a) => acc + a.qrScanCount, 0)}
                </div>
                <div className="text-[10px] text-indigo-200 mt-0.5">Scans across all shops</div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-4 rounded-2xl shadow-sm">
                <div className="text-[11px] font-semibold text-emerald-100 uppercase tracking-wider">Scans Today</div>
                <div className="text-2xl font-black mt-1">
                  {analyticsData.reduce((acc, a) => acc + a.todayScans, 0)}
                </div>
                <div className="text-[10px] text-emerald-200 mt-0.5">Live today&apos;s activity</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-2xl shadow-sm">
                <div className="text-[11px] font-semibold text-purple-100 uppercase tracking-wider">Unique Customers</div>
                <div className="text-2xl font-black mt-1">
                  {analyticsData.reduce((acc, a) => acc + a.uniqueCustomers, 0)}
                </div>
                <div className="text-[10px] text-purple-200 mt-0.5">Distinct mobile numbers</div>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-4 rounded-2xl shadow-sm">
                <div className="text-[11px] font-semibold text-amber-100 uppercase tracking-wider">Accepted Claims</div>
                <div className="text-2xl font-black mt-1">
                  {analyticsData.reduce((acc, a) => acc + a.acceptedClaims, 0)}
                </div>
                <div className="text-[10px] text-amber-200 mt-0.5">Successfully scratched</div>
              </div>
            </div>

            {/* Merchant Detailed Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Shop & Merchant</th>
                    <th className="px-6 py-3.5 text-center">QR Scans</th>
                    <th className="px-6 py-3.5 text-center">Scans Today</th>
                    <th className="px-6 py-3.5 text-center">Customers</th>
                    <th className="px-6 py-3.5 text-center">Total Requests</th>
                    <th className="px-6 py-3.5 text-center">Accepted</th>
                    <th className="px-6 py-3.5 text-center">Declined</th>
                    <th className="px-6 py-3.5 text-center">Pending</th>
                    <th className="px-6 py-3.5 text-right">QR Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analyticsData.map((item) => (
                    <tr key={item.shopId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{item.shopName}</div>
                        <div className="text-[11px] text-slate-500">{item.merchantName} ({item.merchantEmail})</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-black text-slate-900 text-sm">{item.qrScanCount}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          {item.todayScans}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-800">
                        {item.uniqueCustomers}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-900">
                        {item.totalClaims}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {item.acceptedClaims}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                          {item.rejectedClaims}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          {item.pendingClaims}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleShowQr({ id: item.shopId, name: item.shopName, slug: item.shopId })}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-all"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Get QR</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {analyticsData.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-slate-400">
                        Koi shop data nahi mil raha.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Shop Modal */}
      {isAddShopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingShop ? 'Edit Partner Shop' : 'Add New Partner Shop'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter shop coordinates so the common QR automatically resolves customer footfall.
            </p>

            <form onSubmit={handleSaveShop} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Shop Name</label>
                <input
                  type="text"
                  value={shopForm.name}
                  onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                  placeholder="e.g. Blue Tokai Coffee"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={shopForm.category}
                    onChange={(e) => setShopForm({ ...shopForm, category: e.target.value })}
                    placeholder="Cafe / Apparel / Food"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={shopForm.phone}
                    onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })}
                    placeholder="+91 98100..."
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Store Address</label>
                <input
                  type="text"
                  value={shopForm.address}
                  onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                  placeholder="Shop #4, Galleria Market..."
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={shopForm.latitude}
                    onChange={(e) => setShopForm({ ...shopForm, latitude: parseFloat(e.target.value) })}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={shopForm.longitude}
                    onChange={(e) => setShopForm({ ...shopForm, longitude: parseFloat(e.target.value) })}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Radius (m)</label>
                  <input
                    type="number"
                    value={shopForm.radiusMeters}
                    onChange={(e) => setShopForm({ ...shopForm, radiusMeters: parseInt(e.target.value) })}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddShopModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                  Save Shop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Merchant Modal */}
      {isAddMerchantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Create Merchant Account</h3>
            <p className="text-xs text-slate-500 mb-4">
              Create manager credentials linked directly to an active shop counter.
            </p>

            <form onSubmit={handleSaveMerchant} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Shop</label>
                <select
                  value={merchantForm.shopId}
                  onChange={(e) => setMerchantForm({ ...merchantForm, shopId: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900 font-medium"
                >
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Manager Full Name</label>
                <input
                  type="text"
                  value={merchantForm.name}
                  onChange={(e) => setMerchantForm({ ...merchantForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Login Email</label>
                <input
                  type="email"
                  value={merchantForm.email}
                  onChange={(e) => setMerchantForm({ ...merchantForm, email: e.target.value })}
                  placeholder="manager@shop.com"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={merchantForm.password}
                  onChange={(e) => setMerchantForm({ ...merchantForm, password: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900"
                />
              </div>

              {/* Gmail OAuth field */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Gmail (Google Login) <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  value={merchantForm.gmailEmail}
                  onChange={(e) => setMerchantForm({ ...merchantForm, gmailEmail: e.target.value })}
                  placeholder="merchant@gmail.com"
                  className="w-full p-2.5 bg-blue-50 border border-blue-200 rounded-xl outline-none focus:border-blue-500 text-slate-800"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Yeh Gmail se merchant &quot;Sign in with Google&quot; button se login kar sakega.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMerchantModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Generated QR Code Modal */}
      {qrModalShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-600">Admin QR Generator</div>
                <h3 className="text-base font-black text-slate-900 leading-tight">{qrModalShop.name}</h3>
              </div>
              <button
                onClick={() => setQrModalShop(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {isLoadingQr ? (
              <div className="py-12 text-slate-400 font-medium text-xs flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                QR Code generate ho raha hai...
              </div>
            ) : qrDataUrl ? (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrDataUrl}
                    alt={`QR Code for ${qrModalShop.name}`}
                    className="w-56 h-56 mx-auto rounded-lg"
                  />
                </div>

                <div className="text-xs text-slate-500">
                  Customer is QR code ko scan karke directly <strong className="text-slate-800">{qrModalShop.name}</strong> ke landing page par jayega.
                </div>

                {qrUrl && (
                  <div className="bg-slate-100 p-2.5 rounded-xl flex items-center justify-between gap-2 text-xs font-mono text-slate-700">
                    <span className="truncate">{qrUrl}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(qrUrl);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="p-1 text-slate-500 hover:text-slate-900 flex-shrink-0"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {copiedLink && (
                  <div className="text-[11px] font-semibold text-emerald-600">✓ Link copied to clipboard!</div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <a
                    href={qrDataUrl}
                    download={`QR-${qrModalShop.name.replace(/\s+/g, '-')}.png`}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PNG</span>
                  </a>

                  {qrUrl && (
                    <a
                      href={qrUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
                      title="Test Scan Link"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Test Link</span>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-rose-500 text-xs">QR Code generate karne mein fail hua.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
