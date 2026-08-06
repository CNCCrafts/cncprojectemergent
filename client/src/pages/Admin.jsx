import { useState, useEffect } from 'react';
import {
  Package, ShoppingBag, BarChart2, Plus, Pencil, Trash2,
  Save, X, RefreshCw, ChevronDown, AlertCircle, CheckCircle,
  Upload, ImageIcon, Tag, Search, MoreVertical, LayoutDashboard,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';

const CATEGORIES = [
  { id: 'acrylic', label: 'Acrylic Art' },
  { id: 'mdf',     label: 'MDF Art'     },
  { id: 'acp',     label: 'ACP'         },
  { id: 'pvc',     label: 'PVC'         },
  { id: '3d',      label: '3D Designs'  },
];

const STATUS_COLORS = {
  pending:   '#f59e0b',
  confirmed: '#3b82f6',
  shipped:   '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

const EMPTY_FORM = { name: '', category: 'acrylic', price: '', offer_price: '', description: '', image: '', stock: '', active: 1 };

function authHeaders() {
  const token = localStorage.getItem('cnc_admin_token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export default function Admin() {
  const { isAdmin, setLoginOpen } = useAuth();
  const [tab, setTab]                     = useState('dashboard');
  const [products, setProducts]           = useState([]);
  const [orders, setOrders]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm]           = useState(false);
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [toast, setToast]                 = useState(null);
  const [inventoryEdits, setInventoryEdits] = useState({});
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [uploading, setUploading]         = useState(false);
  const [imagePreview, setImagePreview]   = useState('');

  // Offer/banner state
  const [offerEdits, setOfferEdits]       = useState({});
  const [bannerImage, setBannerImage]     = useState('');
  const [bannerText, setBannerText]       = useState('');
  const [bannerActive, setBannerActive]   = useState(false);
  const [bannerPreview, setBannerPreview] = useState('');
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerSaving, setBannerSaving]   = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadProducts = () =>
  fetch(apiUrl('/api/products/all'), {
    headers: authHeaders(),
  })
    .then(r => r.json())
    .then(setProducts);
  
  const loadOrders = () =>
  fetch(apiUrl('/api/orders'), {
    headers: authHeaders(),
  })
    .then(r => r.json())
    .then(setOrders);
  
  const loadSettings = () =>
    fetch(apiUrl('/api/settings'))
      .then(r => r.json())
      .then(s => {
        setBannerImage(s.banner_image || '');
        setBannerPreview(s.banner_image || '');
        setBannerText(s.banner_text || '');
        setBannerActive(s.banner_active === '1');
      });

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([loadProducts(), loadOrders(), loadSettings()]).finally(() => setLoading(false));
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="max-w-md w-full bg-white p-12 rounded-3xl shadow-relief text-center border border-gray-100">
          <div className="w-16 h-16 bg-[#C7451F] rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-8 shadow-lg shadow-[#C7451F20]">C</div>
          <h2 className="text-2xl font-heading font-bold mb-4 text-gray-900">Admin Portal Access</h2>
          <p className="text-gray-500 mb-10 leading-relaxed text-sm">Welcome to the CNC Craft management system. Please sign in with your admin credentials to manage orders, inventory, and storefront content.</p>
          <button className="btn-primary w-full justify-center py-4 text-base" onClick={() => setLoginOpen(true)}>Sign In as Administrator</button>
        </div>
      </main>
    );
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF7F0]">
      <RefreshCw size={48} className="animate-spin text-[#C7451F] mb-6 opacity-80" />
      <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs">Synchronizing Core...</p>
    </div>
  );

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const openNew  = () => { setForm(EMPTY_FORM); setEditingProduct(null); setImagePreview(''); setShowForm(true); };
  const openEdit = (p) => {
    setForm({ name: p.name, category: p.category, price: p.price, offer_price: p.offer_price ?? '', description: p.description, image: p.image, stock: p.stock, active: p.active });
    setImagePreview(p.image || '');
    setEditingProduct(p);
    setShowForm(true);
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append('image', file);
    const token = localStorage.getItem('cnc_admin_token');
    try {
      const res = await fetch(apiUrl('/api/upload'), {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: data,
});
      
      const json = await res.json();
      if (json.url) { setForm(v => ({ ...v, image: json.url })); setImagePreview(json.url); showToast('Asset synchronized.'); }
    } catch { showToast('Transmission failed.', 'error'); }
    setUploading(false);
  };

  const saveProduct = async () => {
    const payload = { ...form, price: parseFloat(form.price) || 0, offer_price: form.offer_price !== '' ? parseFloat(form.offer_price) : null, stock: parseInt(form.stock) || 0 };
    if (!payload.name || !payload.category) return showToast('Identity and category required.', 'error');
    if (editingProduct) {
      await fetch(apiUrl(`/api/products/${editingProduct.id}`), {
  method: 'PUT',
  headers: authHeaders(),
  body: JSON.stringify(payload),
});
      
      showToast('Catalog entry updated.');
    } else {
      await fetch(apiUrl('/api/products'), { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
      showToast('New entry established.');
    }
    setShowForm(false);
    loadProducts();
  };

  const deleteProduct = async (id) => {
    if (!confirm('Permanently remove this entry?')) return;
    await fetch(apiUrl(`/api/products/${id}`), { method: 'DELETE', headers: authHeaders() });
    showToast('Entry decommissioned.');
    loadProducts();
  };

  const saveStock = async (id) => {
    const stock = parseInt(inventoryEdits[id]);
    if (isNaN(stock)) return;
    await fetch(apiUrl(`/api/inventory/${id}`), { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ stock }) });
    showToast('Inventory levels adjusted.');
    loadProducts();
    setInventoryEdits(v => { const c = { ...v }; delete c[id]; return c; });
  };

  const updateStatus = async (id, status) => {
    await fetch(apiUrl(`/api/orders/${id}/status`), { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status }) });
    showToast(`Order transitioned to ${status}.`);
    loadOrders();
  };

  const saveOffer = async (product) => {
    const raw = offerEdits[product.id];
    const offer_price = raw === '' ? null : parseFloat(raw);
    const payload = {
      name: product.name, category: product.category, price: product.price,
      offer_price, description: product.description, image: product.image,
      stock: product.stock, active: product.active,
    };
    await fetch(apiUrl(`/api/products/${product.id}`), { method: 'PUT', headers: authHeaders(), body: JSON.stringify(payload) });
    showToast(offer_price ? `Offer price locked: ₹${offer_price}` : 'Offer removed.');
    loadProducts();
    setOfferEdits(v => { const c = { ...v }; delete c[product.id]; return c; });
  };

  const handleBannerUpload = async (file) => {
    if (!file) return;
    setBannerUploading(true);
    const data  = new FormData();
    data.append('image', file);
    const token = localStorage.getItem('cnc_admin_token');
    try {
      const res  = await fetch('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: data });
      const json = await res.json();
      if (json.url) { setBannerImage(json.url); setBannerPreview(json.url); showToast('Banner asset loaded.'); }
    } catch { showToast('Asset link failed.', 'error'); }
    setBannerUploading(false);
  };

  const saveBanner = async () => {
    setBannerSaving(true);
    await fetch(apiUrl('/api/settings'), {
      method: 'PUT', headers: authHeaders(),
      body: JSON.stringify({ banner_image: bannerImage, banner_text: bannerText, banner_active: bannerActive ? '1' : '0' }),
    });
    showToast('Global banner updated.');
    setBannerSaving(false);
    loadSettings();
  };

  const clearBanner = async () => {
    setBannerImage(''); setBannerPreview(''); setBannerText(''); setBannerActive(false);
    await fetch(apiUrl('/api/settings'), {
      method: 'PUT', headers: authHeaders(),
      body: JSON.stringify({ banner_image: '', banner_text: '', banner_active: '0' }),
    });
    showToast('Banner disabled.');
  };

  // ── Metrics ───────────────────────────────────────────────────────────────────
  const totalRevenue  = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const lowStock      = products.filter(p => p.stock <= 5 && p.active).length;

  const TABS = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard'  },
    { id: 'products',  icon: <Package size={18} />,         label: 'Products'   },
    { id: 'offers',    icon: <Tag size={18} />,             label: 'Promotions' },
    { id: 'inventory', icon: <RefreshCw size={18} />,       label: 'Inventory'  },
    { id: 'orders',    icon: <ShoppingBag size={18} />,     label: 'Orders'     },
  ];

  return (
    <div className="flex min-h-screen bg-[#FBF7F0]">
      {/* Sidebar */}
      <aside className="w-[260px] bg-white border-r border-gray-200 flex flex-col py-8 sticky top-0 h-screen z-40">
        <div className="px-8 mb-12 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-xl">C</div>
          <span className="font-heading font-extrabold text-xl tracking-tighter text-gray-900">CNC <span className="text-[#C7451F]">ADMIN</span></span>
        </div>
        
        <nav className="flex-1 space-y-1">
          {TABS.map(t => (
            <button 
              key={t.id} 
              className={`w-full flex items-center gap-3 px-8 py-3.5 text-sm font-bold transition-all relative ${tab === t.id ? 'text-[#C7451F]' : 'text-gray-400 hover:text-gray-900'}`}
              onClick={() => setTab(t.id)}
            >
              {tab === t.id && <div className="absolute left-0 top-2 bottom-2 w-1.5 bg-[#C7451F] rounded-r-full shadow-[2px_0_10px_rgba(217,45,32,0.3)]" />}
              <span className={`transition-transform duration-200 ${tab === t.id ? 'scale-110' : ''}`}>{t.icon}</span> 
              <span>{t.label}</span>
              {t.id === 'orders' && pendingOrders > 0 && <span className="ml-auto bg-[#C7451F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full ring-4 ring-[#C7451F10]">{pendingOrders}</span>}
            </button>
          ))}
        </nav>

        <div className="mt-auto px-6 py-6 border-t border-gray-100 flex items-center gap-4 bg-gray-50/50">
          <div className="w-10 h-10 bg-[#C7451F] rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-[#C7451F20]">AD</div>
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-gray-900 leading-none mb-1">Administrator</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">admin@cnccrafts.in</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-12 max-w-[1400px] mx-auto w-full relative">
        {toast && (
          <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 px-8 py-4 rounded-full shadow-2xl bg-gray-900 text-white border border-white/10 animate-in slide-in-from-top-12 duration-500">
            {toast.type === 'error' ? <AlertCircle className="text-red-400" size={20} /> : <CheckCircle className="text-green-400" size={20} />}
            <span className="font-bold text-sm tracking-wide">{toast.msg}</span>
          </div>
        )}

        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-heading font-black text-gray-900 tracking-tighter capitalize mb-2">{tab.replace('-', ' ')}</h1>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"><Search size={18} /></div>
            <div className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors cursor-pointer relative">
              <ShoppingBag size={18} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#C7451F] rounded-full ring-4 ring-[#FBF7F0]" />
            </div>
          </div>
        </header>

        {/* Dashboard View */}
        {tab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <StatCard label="Live Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} trend="↑ 12.4%" trendUp={true} />
              <StatCard label="Order Flow" value={orders.length} sub="Lifetime Total" />
              <StatCard label="Critical Inventory" value={lowStock.toString().padStart(2, '0')} warn={lowStock > 0} sub="Items < 5 units" />
              <StatCard label="Pending Action" value={pendingOrders.toString().padStart(2, '0')} accent={pendingOrders > 0} sub="Awaiting Fulfillment" />
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 shadow-relief overflow-hidden">
              <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Real-time Order Stream</h2>
                <button className="px-6 py-2 rounded-full border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all uppercase tracking-widest" onClick={() => setTab('orders')}>Analyze All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                    <tr>
                      <th className="px-10 py-6">ID Reference</th>
                      <th className="px-10 py-6">Customer Segment</th>
                      <th className="px-10 py-6">Status State</th>
                      <th className="px-10 py-6">Yield</th>
                      <th className="px-10 py-6 text-right">Operation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.slice(0, 6).map(o => (
                      <tr key={o.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-10 py-6 font-mono text-sm text-gray-400 group-hover:text-gray-900 transition-colors">#{String(o.id).slice(-8).toUpperCase()}</td>
                        <td className="px-10 py-6 font-bold text-gray-900">{o.customerName}</td>
                        <td className="px-10 py-6">
                          <span className={`status-pill ring-4 ring-white shadow-sm ${o.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' : o.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'}`}>
                            {o.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-10 py-6 font-heading font-black text-gray-900">₹{o.total.toLocaleString('en-IN')}</td>
                        <td className="px-10 py-6 text-right"><button className="p-2.5 text-gray-300 hover:text-gray-900 transition-colors rounded-xl border border-transparent hover:border-gray-200 hover:bg-white"><MoreVertical size={18} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Products Management View */}
        {tab === 'products' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-10">
               <div className="text-gray-400 text-sm font-bold uppercase tracking-widest">{products.length} catalog items total</div>
               <button className="btn-primary px-8 shadow-xl shadow-[#C7451F20]" onClick={openNew}><Plus size={20} /> Catalog Entry</button>
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 shadow-relief overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                  <tr>
                    <th className="px-10 py-6">Asset & Identity</th>
                    <th className="px-10 py-6">Classification</th>
                    <th className="px-10 py-6">Base Yield</th>
                    <th className="px-10 py-6">Active Offer</th>
                    <th className="px-10 py-6">Inventory</th>
                    <th className="px-10 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md ring-4 ring-white bg-gray-50 border border-gray-100 flex-shrink-0">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={24} /></div>
                            )}
                          </div>
                          <div>
                            <div className="font-black text-gray-900 text-base mb-1">{p.name}</div>
                            <div className="font-mono text-[10px] text-gray-400 tracking-wider">REF: #{String(p.id).slice(-8).toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6"><span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-600 uppercase tracking-widest">{CATEGORIES.find(c => c.id === p.category)?.label || p.category}</span></td>
                      <td className="px-10 py-6 font-heading font-black text-gray-900">₹{p.price.toLocaleString('en-IN')}</td>
                      <td className="px-10 py-6">
                        {p.offer_price ? (
                          <div className="flex flex-col">
                            <span className="text-[#C7451F] font-black">₹{p.offer_price.toLocaleString('en-IN')}</span>
                            <span className="text-[10px] font-bold text-emerald-600">-{Math.round((1 - p.offer_price / p.price) * 100)}% DISCOUNT</span>
                          </div>
                        ) : (
                          <span className="text-gray-300 font-bold text-xs">NO ACTIVE OFFER</span>
                        )}
                      </td>
                      <td className="px-10 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${p.stock <= 5 ? 'bg-red-50 text-red-700 ring-4 ring-red-500/5' : 'bg-emerald-50 text-emerald-700 ring-4 ring-emerald-500/5'}`}>
                          {p.stock} Units
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button className="p-3 bg-white border border-gray-100 rounded-2xl hover:border-[#C7451F] hover:text-[#C7451F] transition-all shadow-sm hover:shadow-lg" onClick={() => openEdit(p)}><Pencil size={16} /></button>
                          <button className="p-3 bg-white border border-gray-100 rounded-2xl hover:border-red-600 hover:text-red-600 transition-all shadow-sm hover:shadow-lg" onClick={() => deleteProduct(p.id)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Offers & Banner View */}
        {tab === 'offers' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-white rounded-[32px] border border-gray-100 shadow-relief p-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner"><i className="ti ti-layout-board text-2xl" /></div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Storefront Banner</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Global Promotional Control</p>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Banner Narrative</label>
                    <textarea 
                      className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-[#C7451F] outline-none text-sm font-medium transition-all min-h-[100px]"
                      placeholder="e.g. 🎉 Special Launch Offer: Flat 20% Off on all Acrylic Art!"
                      value={bannerText}
                      onChange={e => setBannerText(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <span className="block text-sm font-black text-gray-900">Visibility Status</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Live toggle for storefront</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer scale-125 mr-2">
                      <input type="checkbox" className="sr-only peer" checked={bannerActive} onChange={e => setBannerActive(e.target.checked)} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 ring-offset-2 peer-focus:ring-2 ring-emerald-500/20"></div>
                    </label>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button className="btn-primary px-10 py-4 shadow-xl shadow-[#C7451F15]" onClick={saveBanner} disabled={bannerSaving}>
                      {bannerSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                      Synchronize Settings
                    </button>
                    <button className="px-6 py-4 rounded-full border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all" onClick={clearBanner}>Deactivate</button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[32px] border border-gray-100 shadow-relief p-10 flex flex-col">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Asset Visualization</label>
                <div className="relative flex-1 bg-gray-900 border-4 border-white shadow-2xl rounded-3xl flex items-center justify-center overflow-hidden min-h-[300px] group">
                  {bannerPreview ? (
                    <>
                      <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center pointer-events-none">
                        <div className="w-20 h-1 bg-[#C7451F] mb-6 rounded-full" />
                        <span className="text-white font-black text-2xl tracking-tight leading-tight max-w-sm drop-shadow-2xl">{bannerText || 'TRANSMISSION READY'}</span>
                      </div>
                      <button 
                        className="absolute top-6 right-6 bg-white p-3 rounded-full text-red-600 shadow-2xl hover:bg-red-600 hover:text-white transition-all transform group-hover:scale-110"
                        onClick={() => { setBannerImage(''); setBannerPreview(''); }}
                      >
                        <X size={20} />
                      </button>
                    </>
                  ) : (
                    <label className="flex flex-col items-center gap-4 cursor-pointer hover:opacity-80 transition-all w-full h-full justify-center p-12 border-4 border-dashed border-gray-800">
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleBannerUpload(e.target.files[0])} />
                      <div className="w-20 h-20 bg-gray-800 rounded-3xl flex items-center justify-center text-[#C7451F] mb-2"><Upload size={40} /></div>
                      <span className="text-white font-black text-xl tracking-tight">Load Visual Asset</span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Optimal resolution: 1200 x 320 px</span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 shadow-relief overflow-hidden">
              <div className="px-10 py-8 border-b border-gray-50 bg-gray-50/30">
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Discount Matrix</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Individual Product Offer Management</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                    <tr>
                      <th className="px-10 py-6">Catalog Item</th>
                      <th className="px-10 py-6 text-center">List Price</th>
                      <th className="px-10 py-6">Target Offer (₹)</th>
                      <th className="px-10 py-6 text-center">Calculated Net</th>
                      <th className="px-10 py-6 text-right">Execute</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map(p => {
                      const editVal = offerEdits[p.id];
                      const isDirty = editVal !== undefined;
                      const offerVal = isDirty ? editVal : (p.offer_price ?? '');
                      const discount = p.offer_price && p.offer_price < p.price ? Math.round((1 - p.offer_price / p.price) * 100) : null;

                      return (
                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-10 py-6 font-bold text-gray-900">{p.name}</td>
                          <td className="px-10 py-6 text-center text-gray-400 font-mono text-sm line-through">₹{p.price.toLocaleString('en-IN')}</td>
                          <td className="px-10 py-6">
                            <input 
                              type="number"
                              className="w-40 px-5 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-[#C7451F] outline-none text-sm font-black transition-all"
                              value={offerVal}
                              placeholder="Regular price"
                              onChange={e => setOfferEdits(v => ({ ...v, [p.id]: e.target.value }))}
                            />
                          </td>
                          <td className="px-10 py-6 text-center">
                            {discount ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="bg-red-50 text-[#C7451F] text-[10px] font-black px-3 py-1 rounded-full ring-4 ring-red-500/5 mb-1 uppercase">{discount}% REDUCED</span>
                                <span className="text-gray-900 font-black">₹{parseFloat(offerVal).toLocaleString('en-IN')}</span>
                              </div>
                            ) : (
                              <span className="text-gray-300 font-bold text-[10px] uppercase tracking-widest italic">STANDARD YIELD</span>
                            )}
                          </td>
                          <td className="px-10 py-6 text-right">
                            {isDirty && (
                              <button className="bg-gray-900 text-white p-3 rounded-2xl shadow-lg shadow-gray-900/10 hover:bg-[#C7451F] transition-all scale-110 active:scale-95" onClick={() => saveOffer(p)}><Save size={18} /></button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Management View */}
        {tab === 'inventory' && (
          <div className="animate-in fade-in duration-500">
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-relief overflow-hidden">
              <div className="px-10 py-8 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                 <div>
                   <h2 className="text-xl font-black text-gray-900 tracking-tight">Stock Integrity</h2>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time Fulfillment Capacity</p>
                 </div>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Optimal Flow</div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-xl border border-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Critical Path</div>
                 </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                    <tr>
                      <th className="px-10 py-6">Catalog Reference</th>
                      <th className="px-10 py-6">Capacity State</th>
                      <th className="px-10 py-6">Adjustment Offset</th>
                      <th className="px-10 py-6 text-right">Commit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map(p => (
                      <tr key={p.id} className={`hover:bg-gray-50/50 transition-colors group ${p.stock <= 5 ? 'bg-red-50/20' : ''}`}>
                        <td className="px-10 py-6">
                           <div className="font-bold text-gray-900 mb-1">{p.name}</div>
                           <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{CATEGORIES.find(c => c.id === p.category)?.label}</div>
                        </td>
                        <td className="px-10 py-6">
                          <div className={`inline-flex items-center gap-3 font-black text-lg ${p.stock <= 5 ? 'text-[#C7451F]' : 'text-emerald-600'}`}>
                            {p.stock.toString().padStart(2, '0')}
                            <span className="text-[10px] uppercase tracking-[0.2em] font-black">{p.stock <= 5 ? 'CRITICAL' : 'OPTIMAL'}</span>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <input 
                            type="number"
                            className="w-32 px-5 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-[#C7451F] outline-none text-sm font-black transition-all"
                            placeholder={p.stock}
                            value={inventoryEdits[p.id] ?? ''}
                            onChange={e => setInventoryEdits(v => ({ ...v, [p.id]: e.target.value }))}
                          />
                        </td>
                        <td className="px-10 py-6 text-right">
                          {inventoryEdits[p.id] !== undefined && (
                            <button className="bg-gray-900 text-white p-3 rounded-2xl shadow-lg shadow-gray-900/10 hover:bg-[#C7451F] transition-all scale-110 active:scale-95" onClick={() => saveStock(p.id)}><Check size={20} /></button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders Detailed View */}
        {tab === 'orders' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {orders.length === 0 ? (
              <div className="bg-white rounded-[48px] p-32 text-center border-4 border-dashed border-gray-100 flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-8 shadow-inner"><ShoppingBag size={48} /></div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-2">Zero Flow State</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">System awaiting initial customer acquisition</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-white rounded-[32px] border border-gray-100 shadow-relief overflow-hidden group">
                  <div 
                    className="px-10 py-8 flex items-center justify-between cursor-pointer group-hover:bg-gray-50/50 transition-colors"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <div className="grid grid-cols-3 gap-16">
                      <div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-2">Ref Protocol</div>
                        <div className="font-mono text-sm font-black text-gray-900 tracking-tight">#{String(order.id).slice(-12).toUpperCase()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-2">Segment</div>
                        <div className="text-sm font-black text-gray-900">{order.customerName}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-2">Timestamp</div>
                        <div className="text-sm font-bold text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-10">
                      <div className="text-right">
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-2">Gross Yield</div>
                        <div className="text-xl font-heading font-black text-gray-900">₹{order.total.toLocaleString()}</div>
                      </div>
                      <span className={`status-pill ring-8 ring-white shadow-xl ${order.status === 'delivered' ? 'bg-emerald-500 text-white' : order.status === 'cancelled' ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white'}`}>
                        {order.status.toUpperCase()}
                      </span>
                      <div className={`w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 transition-all duration-300 ${expandedOrder === order.id ? 'rotate-180 bg-gray-900 text-white' : ''}`}><ChevronDown size={20} /></div>
                    </div>
                  </div>
                  
                  {expandedOrder === order.id && (
                    <div className="px-10 py-12 bg-gray-50/50 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-12">
                        <div>
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-[#C7451F] rounded-full" /> Customer Metadata
                          </h4>
                          <div className="space-y-4 bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-50"><span className="text-xs font-bold text-gray-400 uppercase">Secure Email</span> <span className="font-black text-gray-900">{order.customerEmail}</span></div>
                            <div className="flex justify-between items-center pb-4 border-b border-gray-50"><span className="text-xs font-bold text-gray-400 uppercase">Contact Node</span> <span className="font-black text-gray-900">{order.customerPhone || 'N/A'}</span></div>
                            <div className="pt-2"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Logistics Destination</span> <span className="font-bold text-gray-700 leading-relaxed text-sm block bg-gray-50 p-4 rounded-xl border border-gray-100">{order.address}</span></div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> System State Transition
                          </h4>
                          <div className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm flex flex-col h-full justify-between">
                            <div className="space-y-4">
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Target State Selection</label>
                              <select 
                                className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-[#C7451F] outline-none text-base font-black transition-all appearance-none cursor-pointer"
                                value={order.status}
                                onChange={e => updateStatus(order.id, e.target.value)}
                              >
                                {['pending','confirmed','shipped','delivered','cancelled'].map(s => (
                                  <option key={s} value={s}>{s.toUpperCase()}</option>
                                ))}
                              </select>
                            </div>
                            <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                               <AlertCircle className="text-amber-600 shrink-0" size={16} />
                               <p className="text-[10px] font-bold text-amber-800 uppercase tracking-tight leading-relaxed">Transitioning state will trigger automatic notification protocol to customer node and adjust storefront tracking interface.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Manifest Breakdown
                      </h4>
                      <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                          <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                            <tr><th className="px-10 py-4">Protocol Unit</th><th className="px-10 py-4 text-center">Qty</th><th className="px-10 py-4 text-right">Unit Value</th><th className="px-10 py-4 text-right">Line Total</th></tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 text-sm">
                            {order.items.map((item, i) => (
                              <tr key={i} className="hover:bg-gray-50 transition-colors">
                                <td className="px-10 py-5 font-black text-gray-900">{item.name}</td>
                                <td className="px-10 py-5 text-center font-black"><span className="px-3 py-1 bg-gray-100 rounded-lg">{item.quantity}</span></td>
                                <td className="px-10 py-5 text-right text-gray-400 font-mono font-bold">₹{item.price.toLocaleString()}</td>
                                <td className="px-10 py-5 text-right font-mono font-black text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Product CRUD Modal */}
        {showForm && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-6" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
            <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-[0_32px_80px_rgba(0,0,0,0.15)] overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="px-12 py-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <h2 className="text-3xl font-heading font-black text-gray-900 tracking-tight">{editingProduct ? 'Edit Entry' : 'Establish New Entry'}</h2>
                <button onClick={() => setShowForm(false)} className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-900 hover:text-white transition-all scale-90 hover:scale-100"><X size={28} /></button>
              </div>
              
              <div className="p-12 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Asset Management */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Asset Visualization</label>
                  <div className="relative group">
                    <div className={`border-4 border-dashed rounded-[32px] transition-all duration-500 ${imagePreview ? 'border-transparent p-0' : 'border-gray-100 p-12 text-center hover:border-[#C7451F] hover:bg-red-50/30 bg-gray-50/50'}`}>
                      {imagePreview ? (
                        <div className="relative aspect-video rounded-[32px] overflow-hidden shadow-2xl ring-8 ring-white">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-black/20 group-hover:opacity-100 opacity-0 transition-opacity flex items-center justify-center">
                             <button 
                                type="button" 
                                className="bg-white p-4 rounded-full text-red-600 shadow-2xl hover:scale-110 active:scale-95 transition-all"
                                onClick={() => { setImagePreview(''); setForm(v => ({ ...v, image: '' })); }}
                             >
                                <Trash2 size={24} />
                             </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center gap-4 cursor-pointer">
                          <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e.target.files[0])} />
                          <div className="w-20 h-20 bg-white shadow-xl rounded-3xl flex items-center justify-center text-[#C7451F] group-hover:scale-110 transition-transform">
                            {uploading ? <RefreshCw size={32} className="animate-spin" /> : <Upload size={32} />}
                          </div>
                          <div>
                            <div className="font-black text-gray-900 text-lg tracking-tight">Synchronize Visual Data</div>
                            <div className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Drop source file here</div>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>
                  {!imagePreview && (
                    <div className="mt-8 bg-white p-2 rounded-2xl border border-gray-100 shadow-inner flex items-center">
                      <div className="bg-gray-100 text-[10px] font-black px-4 py-2 rounded-xl text-gray-400 uppercase tracking-widest mr-4">Direct Link</div>
                      <input 
                        type="text" 
                        className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-gray-700"
                        placeholder="https://source-url.com/asset.jpg"
                        value={form.image}
                        onChange={e => { setForm(v => ({ ...v, image: e.target.value })); setImagePreview(e.target.value); }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-10 gap-y-10">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="modal-label">Entry Designation</label>
                    <input type="text" className="modal-input" placeholder="e.g. Laser Cut Mandala" value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="modal-label">Classification Unit</label>
                    <select className="modal-input appearance-none bg-no-repeat bg-[right_1.5rem_center] bg-[length:1rem]" value={form.category} onChange={e => setForm(v => ({ ...v, category: e.target.value }))} style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}>
                      {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="modal-label">Yield Base (₹)</label>
                    <input type="number" className="modal-input font-mono font-bold" placeholder="0.00" value={form.price} onChange={e => setForm(v => ({ ...v, price: e.target.value }))} />
                  </div>

                  <div>
                    <label className="modal-label">Flow Capacity</label>
                    <input type="number" className="modal-input font-mono font-bold" placeholder="10" value={form.stock} onChange={e => setForm(v => ({ ...v, stock: e.target.value }))} />
                  </div>

                  <div className="col-span-2">
                    <label className="modal-label">Narrative Description</label>
                    <textarea className="modal-input min-h-[140px] py-6 resize-none" placeholder="Elaborate on the technical and aesthetic properties of this entry..." value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))} />
                  </div>

                  <div className="col-span-2 flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100">
                     <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900 tracking-tight">Active Deployment</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Visible to customer nodes</span>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer scale-125 mr-2">
                      <input type="checkbox" className="sr-only peer" checked={!!form.active} onChange={e => setForm(v => ({ ...v, active: e.target.checked ? 1 : 0 }))} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="px-12 py-10 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-6">
                <button className="px-10 py-4 rounded-full border border-gray-200 text-sm font-black text-gray-400 hover:bg-white hover:text-gray-900 transition-all uppercase tracking-widest" onClick={() => setShowForm(false)}>Abort</button>
                <button className="btn-primary px-12 py-4 text-base shadow-2xl shadow-[#C7451F30]" onClick={saveProduct}><Save size={22} /> {editingProduct ? 'Update Entry' : 'Commit Entry'}</button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .modal-label {
          display: block;
          font-size: 10px;
          font-weight: 900;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin-bottom: 12px;
        }
        .modal-input {
          width: 100%;
          padding: 16px 24px;
          border-radius: 20px;
          border: 1px solid #F1F5F9;
          background: #F8FAFC;
          font-size: 15px;
          font-weight: 600;
          color: #0F172A;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .modal-input:focus {
          border-color: #C7451F;
          background: #fff;
          box-shadow: 0 10px 30px -10px rgba(217, 45, 32, 0.15), 0 0 0 5px rgba(217, 45, 32, 0.03);
          transform: translateY(-2px);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .animate-in { animation: animateIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes animateIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .shadow-relief { box-shadow: 0 4px 24px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02); }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, trend, trendUp, warn, accent, sub }) {
  return (
    <div className={`bg-white rounded-[32px] border border-gray-100 p-10 shadow-relief transition-all duration-300 hover:translate-y-[-4px] hover:shadow-2xl relative overflow-hidden group ${warn ? 'bg-amber-50/20 border-amber-100' : ''} ${accent ? 'bg-red-50/20 border-red-100' : ''}`}>
      <div className={`absolute top-0 right-0 w-32 h-32 opacity-[0.03] transition-transform duration-700 group-hover:scale-150 ${warn ? 'text-amber-600' : accent ? 'text-red-600' : 'text-gray-900'}`}><BarChart2 size={128} /></div>
      <div className="relative z-10">
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{label}</div>
        <div className={`text-4xl font-heading font-black flex items-baseline gap-4 mb-2 tracking-tighter ${warn ? 'text-amber-800' : accent ? 'text-[#C7451F]' : 'text-gray-900'}`}>
          {value}
          {trend && (
            <span className={`text-xs font-black px-2 py-1 rounded-lg ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              {trend}
            </span>
          )}
        </div>
        {sub && <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{sub}</div>}
      </div>
    </div>
  );
}
