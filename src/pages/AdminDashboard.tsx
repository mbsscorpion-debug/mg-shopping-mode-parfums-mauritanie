import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Package,
  Users,
  MapPin,
  Settings as SettingsIcon,
  FileText,
  LogOut,
  CheckCircle,
  XCircle,
  Eye,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  AlertTriangle,
  RefreshCw,
  Search,
  Phone,
  MessageSquare,
  Upload,
  Camera,
  Check,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { api } from '../services/api';
import { Order, Product, Category, DeliveryZone, ShopSettings, AdminUser } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AdminDashboardProps {
  onLogoutAdmin?: () => void;
  currency?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currency = 'MRU' }) => {
  // Auth state
  const [token, setToken] = useState<string | null>(localStorage.getItem('mg_admin_token'));
  const [adminUser, setAdminUser] = useState<AdminUser | null>(
    localStorage.getItem('mg_admin_user') ? JSON.parse(localStorage.getItem('mg_admin_user')!) : null
  );
  const [loginEmail, setLoginEmail] = useState('admin@mgshopping.mr');
  const [loginPass, setLoginPass] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'orders' | 'payments' | 'products' | 'customers' | 'delivery' | 'settings' | 'logs'
  >('dashboard');

  // Données
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals & Actions
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedPaymentProof, setSelectedPaymentProof] = useState<any | null>(null);
  const [refusalModal, setRefusalModal] = useState<{ open: boolean; paymentId: number | null }>({
    open: false,
    paymentId: null,
  });
  const [refusalReason, setRefusalReason] = useState('');

  // Product Create/Edit Modal
  const [productModal, setProductModal] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    product: any | null;
  }>({ open: false, mode: 'create', product: null });

  // Gestion image produit (Importation fichier ou URL)
  const [productImageSource, setProductImageSource] = useState<'upload' | 'url'>('upload');
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string>('');
  const [uploadingProductImage, setUploadingProductImage] = useState(false);

  // Status update
  const [newOrderStatus, setNewOrderStatus] = useState<string>('');
  const [orderComment, setOrderComment] = useState<string>('');

  // Zone edit
  const [editingZone, setEditingZone] = useState<{ id: number; frais: number } | null>(null);

  // Filtres commandes
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');

  // 1. Charger les données si authentifié
  const loadAllData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [dash, ords, pendPay, prods, cats, zns, sets, custs, lg] = await Promise.all([
        api.getAdminDashboard(),
        api.getAdminOrders(),
        api.getPendingPayments(),
        api.getAdminProducts(),
        api.getCategories(),
        api.getAdminDeliveryZones(),
        api.getAdminSettings(),
        api.getAdminCustomers(),
        api.getAdminLogs(),
      ]);

      setDashboardData(dash);
      setOrders(ords);
      setPendingPayments(pendPay);
      setProducts(prods);
      setCategories(cats);
      setZones(zns);
      setSettings(sets);
      setCustomers(custs);
      setLogs(lg);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadAllData();
    }
  }, [token]);

  // Connexion Admin
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await api.adminLogin(loginEmail, loginPass);
      setToken(res.token);
      setAdminUser(res.admin);
      localStorage.setItem('mg_admin_token', res.token);
      localStorage.setItem('mg_admin_user', JSON.stringify(res.admin));
      setLoginLoading(false);
    } catch (err: any) {
      setLoginLoading(false);
      setLoginError(err.message || 'Identifiants invalides');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setAdminUser(null);
    localStorage.removeItem('mg_admin_token');
    localStorage.removeItem('mg_admin_user');
  };

  // Validation d'un paiement
  const handleConfirmPayment = async (paymentId: number) => {
    try {
      await api.verifyPayment(paymentId, 'confirme');
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la validation');
    }
  };

  // Refus d'un paiement
  const handleRefusePayment = async () => {
    if (!refusalModal.paymentId) return;
    try {
      await api.verifyPayment(refusalModal.paymentId, 'refuse', refusalReason || 'Preuve de paiement rejetée');
      setRefusalModal({ open: false, paymentId: null });
      setRefusalReason('');
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erreur lors du refus');
    }
  };

  // Mise à jour statut commande
  const handleUpdateStatus = async (orderId: number) => {
    if (!newOrderStatus) return;
    try {
      await api.updateOrderStatus(orderId, newOrderStatus, orderComment);
      const updated = await api.getAdminOrder(orderId);
      setSelectedOrder(updated);
      await loadAllData();
      alert('Statut mis à jour avec succès');
    } catch (err: any) {
      alert(err.message || 'Erreur mise à jour');
    }
  };

  // Sauvegarde Paramètres
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await api.updateAdminSettings(settings);
      alert('Paramètres enregistrés avec succès !');
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erreur sauvegarde paramètres');
    }
  };

  // Sauvegarde Zone de livraison
  const handleSaveZone = async (id: number, frais: number) => {
    try {
      await api.updateDeliveryZone(id, { frais });
      setEditingZone(null);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erreur modification zone');
    }
  };

  // Supprimer un produit
  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    try {
      await api.deleteAdminProduct(id);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erreur suppression');
    }
  };

  // Vider tout le contenu d’insertion
  const handleClearAllData = async () => {
    if (!confirm('Confirmez-vous vouloir vider tout le contenu d’insertion (produits, commandes, clients et paiements de test) ?')) return;
    try {
      setLoading(true);
      await api.clearAllData();
      await loadAllData();
      alert('Tout le contenu d’insertion a été vidé avec succès.');
    } catch (err: any) {
      alert(err.message || 'Erreur vidage données');
      setLoading(false);
    }
  };

  // Recharger les données de démonstration
  const handleSeedDemoData = async () => {
    try {
      setLoading(true);
      await api.seedDemoData();
      await loadAllData();
      alert('Les articles d’exemple ont été rechargés avec succès !');
    } catch (err: any) {
      alert(err.message || 'Erreur rechargement données');
      setLoading(false);
    }
  };

  // Ouverture du modal création produit
  const openCreateProductModal = () => {
    setProductImageSource('upload');
    setProductImageFile(null);
    setProductImagePreview('');
    setProductModal({
      open: true,
      mode: 'create',
      product: {
        nom: '',
        id_categorie: categories[0]?.id_categorie || 1,
        prix: 1500,
        ancien_prix: null,
        stock: 20,
        marque: 'MG Boutique',
        genre: 'homme',
        description: '',
        image: '',
        vedette: 0,
        tailles: ['S', 'M', 'L', 'XL'],
        couleurs: ['Noir', 'Blanc'],
      },
    });
  };

  // Ouverture du modal modification produit
  const openEditProductModal = (p: any) => {
    const existingImg = p.image || p.image_principale || p.images?.[0]?.image || '';
    setProductImageSource(existingImg.startsWith('http') ? 'url' : 'upload');
    setProductImageFile(null);
    setProductImagePreview(existingImg);
    setProductModal({
      open: true,
      mode: 'edit',
      product: { ...p, image: existingImg },
    });
  };

  // Sélection & Importation de la photo du produit (Galerie / Fichier)
  const handleProductImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('La photo sélectionnée est trop lourde (maximum 10 Mo).');
      return;
    }

    setProductImageFile(file);

    // 1. Prévisualisation locale immédiate
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setProductImagePreview(base64);
      setProductModal((prev) => ({
        ...prev,
        product: {
          ...prev.product,
          image: base64,
        },
      }));
    };
    reader.readAsDataURL(file);

    // 2. Téléversement vers l'API serveur
    try {
      setUploadingProductImage(true);
      const uploadedUrl = await api.uploadProductImage(file);
      setProductModal((prev) => ({
        ...prev,
        product: {
          ...prev.product,
          image: uploadedUrl,
        },
      }));
      setUploadingProductImage(false);
    } catch (err: any) {
      console.warn('Erreur téléversement serveur, fallback sur aperçu base64:', err);
      setUploadingProductImage(false);
    }
  };

  // Sauvegarder produit (Ajout ou Modification)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productModal.product) return;
    const p = { ...productModal.product };
    if (!p.image && productImagePreview) {
      p.image = productImagePreview;
    }
    if (!p.image) {
      p.image = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';
    }
    try {
      if (productModal.mode === 'create') {
        await api.createAdminProduct(p);
      } else {
        await api.updateAdminProduct(p.id_produit, p);
      }
      setProductModal({ open: false, mode: 'create', product: null });
      setProductImagePreview('');
      setProductImageFile(null);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erreur sauvegarde produit');
    }
  };

  // ============================================
  // VUE DE CONNEXION ADMIN
  // ============================================
  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="bg-white max-w-md w-full rounded-3xl p-8 border border-stone-200 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-md mx-auto">
              <div className="w-full h-full bg-stone-950 rounded-[10px] flex items-center justify-center">
                <span className="font-serif text-2xl font-black gold-gradient-text">MG</span>
              </div>
            </div>
            <h2 className="text-2xl font-black text-stone-950 font-brand">
              Administration MG SHOPPING
            </h2>
            <p className="text-xs text-stone-500">
              Accès réservé aux gestionnaires de la boutique en Mauritanie
            </p>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-stone-700">
            <strong>Identifiants de test pré-configurés :</strong>
            <br />
            Email : <code>admin@mgshopping.mr</code>
            <br />
            Mot de passe : <code>admin123</code>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">
                Adresse Email *
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">
                Mot de passe *
              </label>
              <input
                type="password"
                required
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 rounded-xl bg-stone-950 text-amber-400 hover:bg-stone-900 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{loginLoading ? 'Connexion en cours...' : 'Se connecter au panneau admin'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ============================================
  // VUE DU PANNEAU D'ADMINISTRATION
  // ============================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Admin Bar */}
      <div className="bg-stone-950 text-white rounded-3xl p-6 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-base font-serif">
            MG
          </div>
          <div>
            <h1 className="text-lg font-bold font-brand tracking-wider">
              Panneau d'Administration MG SHOPPING
            </h1>
            <p className="text-xs text-stone-400">
              Connecté en tant que <span className="text-amber-400 font-semibold">{adminUser?.nom}</span> ({adminUser?.role})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 flex items-center gap-1.5 text-xs"
            title="Actualiser les données"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200">
        {[
          { key: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
          { key: 'payments', label: `Paiements à vérifier (${pendingPayments.length})`, icon: CreditCard, alert: pendingPayments.length > 0 },
          { key: 'orders', label: `Commandes (${orders.length})`, icon: ShoppingBag },
          { key: 'products', label: `Produits (${products.length})`, icon: Package },
          { key: 'customers', label: `Clients (${customers.length})`, icon: Users },
          { key: 'delivery', label: 'Zones de livraison (15)', icon: MapPin },
          { key: 'settings', label: 'Paramètres Boutique', icon: SettingsIcon },
          { key: 'logs', label: 'Journal d’audit', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-stone-950 text-amber-400 shadow-md border border-amber-400/40'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.alert && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: TABLEAU DE BORD & CHART.JS ================= */}
      {activeTab === 'dashboard' && dashboardData && (
        <div className="space-y-8">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Chiffre d'Affaires
              </span>
              <p className="text-2xl font-black text-stone-950 font-serif">
                {dashboardData.stats.revenue.toLocaleString('fr-FR')} {currency}
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold">Commandes confirmées</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Total Commandes
              </span>
              <p className="text-2xl font-black text-stone-950 font-serif">
                {dashboardData.stats.totalOrders}
              </p>
              <span className="text-[10px] text-stone-500">Depuis le lancement</span>
            </div>

            <div
              onClick={() => setActiveTab('payments')}
              className="bg-amber-50 p-5 rounded-2xl border border-amber-300 shadow-sm space-y-1 cursor-pointer hover:border-amber-500 transition-colors"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Paiements à vérifier
              </span>
              <p className="text-2xl font-black text-amber-700 font-serif">
                {dashboardData.stats.pendingPayments}
              </p>
              <span className="text-[10px] text-amber-800 font-bold">Action requise</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                En Livraison / Livrées
              </span>
              <p className="text-2xl font-black text-stone-950 font-serif">
                {dashboardData.stats.deliveryOrders} / {dashboardData.stats.deliveredOrders}
              </p>
              <span className="text-[10px] text-stone-500">Flux logistique</span>
            </div>
          </div>

          {/* Chart.js Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart 1: Ventes récentes */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-stone-900 uppercase tracking-wider">
                Ventes des 7 derniers jours (MRU)
              </h3>
              <div className="h-64 flex items-center justify-center">
                <Line
                  data={{
                    labels: dashboardData.charts.salesByDay.labels,
                    datasets: [
                      {
                        label: 'Ventes (MRU)',
                        data: dashboardData.charts.salesByDay.data,
                        borderColor: '#d4af37',
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                        tension: 0.3,
                        fill: true,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>

            {/* Chart 2: Ventes par Catégorie */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-stone-900 uppercase tracking-wider">
                Répartition des ventes par Catégorie
              </h3>
              <div className="h-64 flex items-center justify-center">
                <Doughnut
                  data={{
                    labels: dashboardData.charts.salesByCategory.labels,
                    datasets: [
                      {
                        data: dashboardData.charts.salesByCategory.data,
                        backgroundColor: ['#d4af37', '#1c1917', '#44403c', '#ca8a04', '#eab308'],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </div>

            {/* Chart 3: Commandes par Wilaya */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-stone-900 uppercase tracking-wider">
                Commandes par Wilaya
              </h3>
              <div className="h-64 flex items-center justify-center">
                <Bar
                  data={{
                    labels: dashboardData.charts.ordersByWilaya.labels,
                    datasets: [
                      {
                        label: 'Nombre de commandes',
                        data: dashboardData.charts.ordersByWilaya.data,
                        backgroundColor: '#1c1917',
                        borderRadius: 6,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>

            {/* Chart 4: Commandes par Statut */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-stone-900 uppercase tracking-wider">
                État des Commandes
              </h3>
              <div className="h-64 flex items-center justify-center">
                <Bar
                  data={{
                    labels: dashboardData.charts.ordersByStatus.labels,
                    datasets: [
                      {
                        label: 'Commandes',
                        data: dashboardData.charts.ordersByStatus.data,
                        backgroundColor: '#d4af37',
                        borderRadius: 6,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: PAIEMENTS À VÉRIFIER ================= */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden space-y-6 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-200">
            <div>
              <h2 className="text-lg font-bold text-stone-950 font-brand">
                Paiements mobiles à vérifier (Bankily / Masravi / Seddad)
              </h2>
              <p className="text-xs text-stone-500">
                Vérifiez manuellement la capture d'écran reçue du client avant de valider la commande
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              {pendingPayments.length} en attente
            </span>
          </div>

          {pendingPayments.length === 0 ? (
            <div className="py-12 text-center text-stone-400">
              <CheckCircle className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-stone-700">Tous les paiements ont été vérifiés !</p>
              <p className="text-xs">Aucune capture d'écran en attente d'audit pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingPayments.map((pmt) => (
                <div
                  key={pmt.id_paiement}
                  className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-lg bg-stone-950 text-amber-400 font-mono text-xs font-bold">
                        {pmt.commande?.numero_commande}
                      </span>
                      <h4 className="text-sm font-bold text-stone-900 mt-1">
                        {pmt.client?.nom_complet}
                      </h4>
                      <p className="text-xs text-stone-500">
                        Tel : {pmt.client?.telephone} (Virement fait depuis : <strong>{pmt.numero_utilise || pmt.client?.telephone}</strong>)
                      </p>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg uppercase text-xs font-black bg-stone-200 text-stone-800">
                      {pmt.methode}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-stone-200 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-stone-400 block">Montant attendu :</span>
                      <span className="font-bold text-stone-900 text-sm">
                        {pmt.commande?.total} {currency}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-stone-400 block">Montant déclaré :</span>
                      <span className="font-bold text-amber-700 text-sm">
                        {pmt.montant} {currency}
                      </span>
                    </div>
                  </div>

                  {/* Preuve de paiement avec aperçu */}
                  {pmt.preuve ? (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-stone-700 block">Capture d'écran du reçu :</span>
                      <div
                        onClick={() => setSelectedPaymentProof(pmt.preuve)}
                        className="relative h-44 rounded-xl overflow-hidden border border-stone-300 bg-stone-950 group cursor-pointer"
                      >
                        <img
                          src={pmt.preuve.fichier}
                          alt="Preuve"
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                          Cliquez pour agrandir
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-rose-600 italic">Aucune image fournie</p>
                  )}

                  {/* Boutons d'action */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => handleConfirmPayment(pmt.id_paiement)}
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirmer le paiement</span>
                    </button>

                    <button
                      onClick={() => setRefusalModal({ open: true, paymentId: pmt.id_paiement })}
                      className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Refuser</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: COMMANDES ADMIN ================= */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-stone-950 font-brand">Gestion des Commandes</h2>
              <p className="text-xs text-stone-500">Consultez, modifiez les statuts et visualisez les coordonnées GPS de livraison</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Rechercher N°, nom, tél..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="text-xs bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 w-full sm:w-48"
              />

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="text-xs bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-medium"
              >
                <option value="all">Tous les statuts</option>
                <option value="en_attente_paiement">En attente de paiement</option>
                <option value="paiement_a_verifier">Paiement à vérifier</option>
                <option value="paiement_confirme">Paiement confirmé</option>
                <option value="confirmee">Confirmée</option>
                <option value="en_preparation">En préparation</option>
                <option value="prete_a_livrer">Prête à livrer</option>
                <option value="en_livraison">En livraison</option>
                <option value="livree">Livrée</option>
                <option value="annulee">Annulée</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">N° Commande</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Téléphone</th>
                  <th className="py-3 px-4">Wilaya</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders
                  .filter((o) => {
                    if (orderStatusFilter !== 'all' && o.statut_commande !== orderStatusFilter) return false;
                    if (orderSearch.trim()) {
                      const q = orderSearch.toLowerCase();
                      const matchNum = o.numero_commande.toLowerCase().includes(q);
                      const matchName = (o.client?.nom_complet || '').toLowerCase().includes(q);
                      const matchPhone = (o.client?.telephone || '').includes(q);
                      if (!matchNum && !matchName && !matchPhone) return false;
                    }
                    return true;
                  })
                  .map((ord) => (
                    <tr key={ord.id_commande} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                        {ord.numero_commande}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-stone-900">
                        {ord.client?.nom_complet}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        {ord.client?.telephone}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        {ord.adresse?.wilaya}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-stone-950 font-serif">
                        {ord.total.toLocaleString('fr-FR')} {currency}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-800">
                          {ord.statut_commande.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-400">
                        {new Date(ord.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setNewOrderStatus(ord.statut_commande);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-stone-950 text-amber-400 hover:bg-stone-900 font-bold text-xs"
                        >
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: PRODUITS ADMIN ================= */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-200">
            <div>
              <h2 className="text-lg font-bold text-stone-950 font-brand">Gestion des Produits</h2>
              <p className="text-xs text-stone-500">Ajoutez, modifiez les prix, le stock et les photos</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={openCreateProductModal}
                className="px-4 py-2.5 rounded-xl bg-stone-950 text-amber-400 hover:bg-stone-900 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Produit</span>
              </button>

              <button
                onClick={handleSeedDemoData}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 border border-amber-500/30 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                title="Recharger les articles d'exemple"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recharger démo</span>
              </button>

              <button
                onClick={handleClearAllData}
                className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                title="Vider tout le contenu"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vider contenu</span>
              </button>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="p-12 text-center bg-stone-50 rounded-3xl border border-stone-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-base">Le catalogue est actuellement vide</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Le contenu d’insertion a été vidé. Vous pouvez créer manuellement vos articles ou recharger les produits d’exemple à tout moment.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={openCreateProductModal}
                  className="px-5 py-2.5 bg-stone-950 text-amber-400 font-bold text-xs uppercase rounded-xl cursor-pointer"
                >
                  Ajouter un produit
                </button>
                <button
                  onClick={handleSeedDemoData}
                  className="px-5 py-2.5 bg-amber-500 text-stone-950 font-bold text-xs uppercase rounded-xl cursor-pointer"
                >
                  Recharger les produits d'exemple
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div
                key={p.id_produit}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between space-y-3"
              >
                <div className="flex gap-3">
                  <img
                    src={p.image_principale || p.images?.[0]?.image}
                    alt={p.nom}
                    className="w-16 h-16 rounded-xl object-cover bg-stone-200 shrink-0"
                  />
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-amber-700 font-bold uppercase">
                      {p.categorie_nom || p.genre}
                    </span>
                    <h4 className="text-xs font-bold text-stone-900 truncate">{p.nom}</h4>
                    <p className="text-xs font-black text-stone-950 mt-1">
                      {p.prix.toLocaleString('fr-FR')} {currency}
                    </p>
                    <span className="text-[11px] text-stone-500">Stock : {p.stock} unités</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                  <button
                    onClick={() => openEditProductModal(p)}
                    className="p-2 rounded-lg bg-stone-200 text-stone-700 hover:bg-stone-300 cursor-pointer"
                    title="Modifier"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.id_produit)}
                    className="p-2 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

      {/* ================= TAB 5: ZONES DE LIVRAISON (15 WILAYAS) ================= */}
      {activeTab === 'delivery' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-6">
          <div className="pb-4 border-b border-stone-200">
            <h2 className="text-lg font-bold text-stone-950 font-brand">
              Tarifs de Livraison par Wilaya (Mauritanie)
            </h2>
            <p className="text-xs text-stone-500">
              Modifiez directement les frais de port enregistrés dans MySQL
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.map((z) => (
              <div key={z.id_zone} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900">{z.wilaya}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800">
                    {z.statut}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">{z.commune}</p>

                {editingZone?.id === z.id_zone ? (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="number"
                      value={editingZone.frais}
                      onChange={(e) =>
                        setEditingZone({ ...editingZone, frais: parseFloat(e.target.value) || 0 })
                      }
                      className="w-24 text-xs p-1.5 border rounded-lg"
                    />
                    <button
                      onClick={() => handleSaveZone(z.id_zone, editingZone.frais)}
                      className="px-2.5 py-1.5 bg-stone-950 text-amber-400 font-bold rounded-lg text-xs"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={() => setEditingZone(null)}
                      className="text-xs text-stone-400"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-black text-sm text-stone-900 font-serif">
                      {z.frais} {currency}
                    </span>
                    <button
                      onClick={() => setEditingZone({ id: z.id_zone, frais: z.frais })}
                      className="text-xs text-amber-700 hover:underline font-semibold"
                    >
                      Modifier tarif
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 6: PARAMÈTRES BOUTIQUE & PAIEMENTS ================= */}
      {activeTab === 'settings' && settings && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-6">
          <div className="pb-4 border-b border-stone-200">
            <h2 className="text-lg font-bold text-stone-950 font-brand">Paramètres de la Boutique</h2>
            <p className="text-xs text-stone-500">
              Configurez vos numéros de transfert Bankily, Masravi, Seddad et coordonnées WhatsApp
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
            {/* Bankily */}
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-blue-900">
                Compte Bankily (BPM)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Numéro Bankily :</label>
                  <input
                    type="text"
                    value={settings.bankily_number}
                    onChange={(e) => setSettings({ ...settings, bankily_number: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Nom Bénéficiaire :</label>
                  <input
                    type="text"
                    value={settings.bankily_name}
                    onChange={(e) => setSettings({ ...settings, bankily_name: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Masravi */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900">
                Compte Masravi (Chinguitti Bank)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Numéro Masravi :</label>
                  <input
                    type="text"
                    value={settings.masravi_number}
                    onChange={(e) => setSettings({ ...settings, masravi_number: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Nom Bénéficiaire :</label>
                  <input
                    type="text"
                    value={settings.masravi_name}
                    onChange={(e) => setSettings({ ...settings, masravi_name: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Seddad */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900">
                Compte Seddad (Banque Populaire de Mauritanie)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Numéro Seddad :</label>
                  <input
                    type="text"
                    value={settings.seddad_number}
                    onChange={(e) => setSettings({ ...settings, seddad_number: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Nom Bénéficiaire :</label>
                  <input
                    type="text"
                    value={settings.seddad_name}
                    onChange={(e) => setSettings({ ...settings, seddad_name: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Coordonnées */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">Numéro WhatsApp :</label>
                <input
                  type="text"
                  value={settings.shop_whatsapp}
                  onChange={(e) => setSettings({ ...settings, shop_whatsapp: e.target.value })}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">Téléphone de contact :</label>
                <input
                  type="text"
                  value={settings.shop_phone}
                  onChange={(e) => setSettings({ ...settings, shop_phone: e.target.value })}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-stone-950 text-amber-400 font-bold text-xs uppercase tracking-wider shadow"
            >
              Enregistrer les modifications
            </button>
          </form>
        </div>
      )}

      {/* ================= TAB 7: CLIENTS ================= */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-stone-950 font-brand">Base Clients</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase border-b">
                <tr>
                  <th className="py-3 px-4">Nom complet</th>
                  <th className="py-3 px-4">Téléphone</th>
                  <th className="py-3 px-4">WhatsApp</th>
                  <th className="py-3 px-4">Commandes</th>
                  <th className="py-3 px-4">Total Dépensé</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {customers.map((c) => (
                  <tr key={c.id_client}>
                    <td className="py-3 px-4 font-bold">{c.nom_complet}</td>
                    <td className="py-3 px-4">{c.telephone}</td>
                    <td className="py-3 px-4">{c.whatsapp || '-'}</td>
                    <td className="py-3 px-4">{c.total_commandes || 1}</td>
                    <td className="py-3 px-4 font-serif font-bold">
                      {(c.depenses_totales || 0).toLocaleString('fr-FR')} {currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 8: AUDIT LOGS ================= */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-stone-950 font-brand">Journal des Actions Administrateur</h2>
          <div className="divide-y text-xs">
            {logs.map((lg) => (
              <div key={lg.id_log} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-900 block">{lg.action}</span>
                  <span className="text-stone-500">{lg.description}</span>
                </div>
                <span className="text-[11px] text-stone-400">
                  {new Date(lg.created_at).toLocaleTimeString('fr-FR')} · {new Date(lg.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODAL DÉTAIL COMMANDE ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border max-h-[90vh] flex flex-col">
            <div className="p-5 bg-stone-950 text-white flex items-center justify-between border-b border-amber-500/30">
              <h3 className="font-bold font-mono text-sm">
                Commande {selectedOrder.numero_commande}
              </h3>
              <button onClick={() => setSelectedOrder(null)}>
                <XCircle className="w-5 h-5 text-stone-400 hover:text-white" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Client & Livraison */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-stone-50 rounded-2xl">
                <div>
                  <span className="font-bold text-stone-400 uppercase text-[10px] block">Coordonnées Client</span>
                  <p className="font-bold text-stone-900 flex items-center gap-1.5 mt-1">
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    <span>Appel : {selectedOrder.client?.telephone}</span>
                  </p>
                  <p className="font-semibold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp : {selectedOrder.client?.whatsapp || selectedOrder.client?.telephone}</span>
                  </p>
                  <a
                    href={`https://wa.me/${(selectedOrder.client?.whatsapp || selectedOrder.client?.telephone || '').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-2 px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[10px]"
                  >
                    Ouvrir WhatsApp client
                  </a>
                </div>
                <div>
                  <span className="font-bold text-stone-400 uppercase text-[10px] block">Livraison & Géolocalisation</span>
                  <p className="font-bold text-stone-900 mt-1">
                    Wilaya : {selectedOrder.adresse?.wilaya}
                  </p>
                  {(selectedOrder.adresse?.quartier || selectedOrder.adresse?.commune) && (
                    <p className="font-semibold text-amber-800 text-xs mt-0.5">
                      Quartier : {selectedOrder.adresse?.quartier || selectedOrder.adresse?.commune}
                    </p>
                  )}
                  {selectedOrder.adresse?.latitude && selectedOrder.adresse?.longitude ? (
                    <div className="mt-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <span className="text-[10px] font-bold text-emerald-800 block">Position GPS capturée :</span>
                      <span className="font-mono text-[11px] text-emerald-950 font-bold block">
                        {selectedOrder.adresse.latitude}, {selectedOrder.adresse.longitude}
                      </span>
                      <a
                        href={`https://www.google.com/maps?q=${selectedOrder.adresse.latitude},${selectedOrder.adresse.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 font-bold underline flex items-center gap-1 mt-1 text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3" /> Ouvrir dans Google Maps
                      </a>
                    </div>
                  ) : (
                    <p className="text-stone-500 mt-1">{selectedOrder.adresse?.adresse || 'Non spécifiée'}</p>
                  )}
                </div>
              </div>

              {/* Articles */}
              <div>
                <span className="font-bold text-stone-800 uppercase block mb-2">Articles commandés :</span>
                <div className="space-y-1">
                  {selectedOrder.items?.map((it, idx) => (
                    <div key={idx} className="flex justify-between py-1 border-b">
                      <span>{it.nom_produit} (x{it.quantite}) {it.taille ? `[${it.taille}]` : ''}</span>
                      <span className="font-bold">{it.total} {currency}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-2 font-bold text-sm">
                  <span>Total commande :</span>
                  <span className="text-amber-700">{selectedOrder.total} {currency}</span>
                </div>
              </div>

              {/* Modifier Statut */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3">
                <span className="font-bold text-stone-900 uppercase block">Modifier le statut de la commande :</span>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newOrderStatus}
                    onChange={(e) => setNewOrderStatus(e.target.value)}
                    className="p-2 bg-white border rounded-xl text-xs"
                  >
                    <option value="en_attente_paiement">En attente paiement</option>
                    <option value="paiement_a_verifier">Paiement à vérifier</option>
                    <option value="paiement_confirme">Paiement confirmé</option>
                    <option value="confirmee">Confirmée</option>
                    <option value="en_preparation">En préparation</option>
                    <option value="prete_a_livrer">Prête à livrer</option>
                    <option value="en_livraison">En livraison</option>
                    <option value="livree">Livrée</option>
                    <option value="annulee">Annulée</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Commentaire historique..."
                    value={orderComment}
                    onChange={(e) => setOrderComment(e.target.value)}
                    className="p-2 bg-white border rounded-xl text-xs"
                  />
                </div>

                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id_commande)}
                  className="px-4 py-2 bg-stone-950 text-amber-400 font-bold rounded-xl text-xs"
                >
                  Mettre à jour le statut
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL PREUVE GRAND FORMAT ================= */}
      {selectedPaymentProof && (
        <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-stone-900 rounded-3xl p-4 border border-amber-500/40">
            <button
              onClick={() => setSelectedPaymentProof(null)}
              className="absolute top-4 right-4 text-white p-2 rounded-full bg-stone-800"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h4 className="text-white text-xs font-bold mb-3 uppercase tracking-wider">
              Preuve de paiement : {selectedPaymentProof.nom_original}
            </h4>
            <img
              src={selectedPaymentProof.fichier}
              alt="Reçu"
              className="max-h-[80vh] w-auto mx-auto rounded-xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* ================= MODAL REFUS PAIEMENT ================= */}
      {refusalModal.open && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-stone-950">Motif du refus du paiement</h3>
            <textarea
              placeholder="Ex: Montant envoyé non conforme, reçu illisible..."
              value={refusalReason}
              onChange={(e) => setRefusalReason(e.target.value)}
              className="w-full text-xs p-3 border rounded-xl"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRefusalModal({ open: false, paymentId: null })}
                className="px-3 py-1.5 text-xs text-stone-500"
              >
                Annuler
              </button>
              <button
                onClick={handleRefusePayment}
                className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl"
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL PRODUIT (AJOUT / MODIF) ================= */}
      {productModal.open && productModal.product && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-3xl p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="font-bold text-sm text-stone-950 uppercase font-brand">
              {productModal.mode === 'create' ? 'Ajouter un nouveau produit' : 'Modifier le produit'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Nom du produit *</label>
                <input
                  type="text"
                  required
                  value={productModal.product.nom}
                  onChange={(e) =>
                    setProductModal({
                      ...productModal,
                      product: { ...productModal.product, nom: e.target.value },
                    })
                  }
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Prix (MRU) *</label>
                  <input
                    type="number"
                    required
                    value={productModal.product.prix}
                    onChange={(e) =>
                      setProductModal({
                        ...productModal,
                        product: { ...productModal.product, prix: e.target.value },
                      })
                    }
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Ancien Prix (Promo)</label>
                  <input
                    type="number"
                    value={productModal.product.ancien_prix || ''}
                    onChange={(e) =>
                      setProductModal({
                        ...productModal,
                        product: { ...productModal.product, ancien_prix: e.target.value },
                      })
                    }
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Catégorie *</label>
                  <select
                    value={productModal.product.id_categorie}
                    onChange={(e) =>
                      setProductModal({
                        ...productModal,
                        product: { ...productModal.product, id_categorie: parseInt(e.target.value, 10) },
                      })
                    }
                    className="w-full p-2.5 border rounded-xl"
                  >
                    {categories.map((c) => (
                      <option key={c.id_categorie} value={c.id_categorie}>
                        {c.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Genre</label>
                  <select
                    value={productModal.product.genre}
                    onChange={(e) =>
                      setProductModal({
                        ...productModal,
                        product: { ...productModal.product, genre: e.target.value },
                      })
                    }
                    className="w-full p-2.5 border rounded-xl"
                  >
                    <option value="homme">Homme</option>
                    <option value="femme">Femme</option>
                    <option value="unisexe">Unisexe</option>
                  </select>
                </div>
              </div>

              {/* Choix Photo du Produit : Importation directe depuis appareil ou URL */}
              <div className="space-y-2 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="font-bold text-stone-900 block text-xs">
                    Photo du produit *
                  </label>
                  <div className="inline-flex items-center gap-1 bg-stone-200/70 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setProductImageSource('upload')}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        productImageSource === 'upload'
                          ? 'bg-stone-950 text-amber-400 shadow-sm'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Importer photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductImageSource('url')}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        productImageSource === 'url'
                          ? 'bg-stone-950 text-amber-400 shadow-sm'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Lien Web URL</span>
                    </button>
                  </div>
                </div>

                {/* Option 1 : Importer une photo depuis galerie / appareil */}
                {productImageSource === 'upload' && (
                  <div className="space-y-2 pt-1">
                    <label
                      htmlFor="product-image-upload"
                      className="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white hover:bg-amber-50/20 transition-all text-center group"
                    >
                      <input
                        id="product-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleProductImageSelect}
                        className="hidden"
                      />
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-stone-900 text-xs block">
                          Cliquez pour choisir une photo sur votre appareil
                        </span>
                        <span className="text-[11px] text-stone-500 block mt-0.5">
                          Galerie photo, appareil photo ou fichier (JPG, PNG, WEBP — max 10 Mo)
                        </span>
                      </div>
                      {uploadingProductImage && (
                        <div className="text-[11px] font-bold text-amber-600 flex items-center gap-1 mt-1">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Téléversement de la photo en cours...</span>
                        </div>
                      )}
                    </label>
                  </div>
                )}

                {/* Option 2 : Saisir une URL Web */}
                {productImageSource === 'url' && (
                  <div className="space-y-1.5 pt-1">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... ou lien direct vers une photo"
                      value={productModal.product.image || productModal.product.image_principale || ''}
                      onChange={(e) => {
                        const url = e.target.value;
                        setProductModal({
                          ...productModal,
                          product: { ...productModal.product, image: url },
                        });
                        setProductImagePreview(url);
                      }}
                      className="w-full p-2.5 border border-stone-300 rounded-xl bg-white text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-[10px] text-stone-500 block">
                      Collez l'adresse web directe d'une image (ex: Unsplash, CDN, etc.)
                    </span>
                  </div>
                )}

                {/* Aperçu de la photo chargée */}
                {(productImagePreview || productModal.product.image || productModal.product.image_principale) && (
                  <div className="p-3 rounded-2xl bg-white border border-stone-200 flex items-center justify-between gap-3 mt-2">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={productImagePreview || productModal.product.image || productModal.product.image_principale}
                        alt="Aperçu produit"
                        className="w-14 h-14 rounded-xl object-cover border border-stone-200 bg-stone-100 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-stone-900 block truncate">
                          Photo prête
                        </span>
                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                          <span>Image chargée avec succès</span>
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProductImagePreview('');
                        setProductImageFile(null);
                        setProductModal({
                          ...productModal,
                          product: { ...productModal.product, image: '' },
                        });
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold cursor-pointer shrink-0"
                    >
                      Retirer
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={productModal.product.description || ''}
                  onChange={(e) =>
                    setProductModal({
                      ...productModal,
                      product: { ...productModal.product, description: e.target.value },
                    })
                  }
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProductModal({ open: false, mode: 'create', product: null })}
                  className="px-4 py-2 border rounded-xl text-stone-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-stone-950 text-amber-400 font-bold rounded-xl"
                >
                  Enregistrer le produit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
