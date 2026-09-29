import {
  Product,
  Category,
  DeliveryZone,
  Order,
  ShopSettings,
  AdminUser,
} from '../types';

export const api = {
  // 1. Paramètres
  async getSettings(): Promise<ShopSettings> {
    const res = await fetch('/api/settings');
    const data = await res.json();
    return data.settings;
  },

  // 2. Zones de livraison
  async getDeliveryZones(): Promise<DeliveryZone[]> {
    const res = await fetch('/api/delivery/zones');
    const data = await res.json();
    return data.zones || [];
  },

  // 3. Catégories
  async getCategories(): Promise<Category[]> {
    const res = await fetch('/api/categories');
    const data = await res.json();
    return data.categories || [];
  },

  // 4. Produits
  async getProducts(params?: {
    category?: string;
    genre?: string;
    q?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    promo?: boolean;
    featured?: boolean;
  }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.genre) query.set('genre', params.genre);
    if (params?.q) query.set('q', params.q);
    if (params?.minPrice !== undefined) query.set('minPrice', String(params.minPrice));
    if (params?.maxPrice !== undefined) query.set('maxPrice', String(params.maxPrice));
    if (params?.sort) query.set('sort', params.sort);
    if (params?.promo) query.set('promo', 'true');
    if (params?.featured) query.set('featured', 'true');

    const res = await fetch(`/api/products?${query.toString()}`);
    const data = await res.json();
    return data.products || [];
  },

  // 5. Détail d'un produit
  async getProduct(id: number): Promise<{ product: Product; similar: Product[] }> {
    const res = await fetch(`/api/products/${id}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Erreur lors du chargement du produit');
    return { product: data.product, similar: data.similar || [] };
  },

  // 6. Création de commande
  async createOrder(payload: {
    customer: {
      nom_complet: string;
      telephone: string;
      whatsapp?: string;
      email?: string;
    };
    delivery: {
      wilaya: string;
      commune: string;
      quartier: string;
      adresse: string;
      point_repere: string;
      latitude?: number | null;
      longitude?: number | null;
    };
    items: {
      id_produit: number;
      nom_produit: string;
      prix_unitaire: number;
      quantite: number;
      taille?: string;
      couleur?: string;
    }[];
    notes?: string;
  }): Promise<{ order: Order }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Erreur lors de la création de la commande');
    return { order: data.order };
  },

  // 7. Envoi preuve de paiement (Capture d'écran)
  async uploadPaymentProof(formData: FormData): Promise<{ paymentId: number; filePath: string }> {
    const res = await fetch('/api/payments/proof', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Erreur lors de l’envoi de la preuve');
    return { paymentId: data.paymentId, filePath: data.filePath };
  },

  // 8. Suivi de commande
  async trackOrder(numero_commande: string, telephone: string): Promise<Order> {
    const res = await fetch('/api/orders/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numero_commande, telephone }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Commande non trouvée');
    return data.order;
  },

  // ===================================
  // ADMIN API
  // ===================================
  async adminLogin(email: string, password: string): Promise<{ token: string; admin: AdminUser }> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Identifiants invalides');
    return { token: data.token, admin: data.admin };
  },

  async getAdminDashboard(): Promise<any> {
    const res = await fetch('/api/admin/dashboard');
    const data = await res.json();
    return data;
  },

  async getAdminOrders(params?: { status?: string; search?: string }): Promise<Order[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    const res = await fetch(`/api/admin/orders?${query.toString()}`);
    const data = await res.json();
    return data.orders || [];
  },

  async getAdminOrder(id: number): Promise<Order> {
    const res = await fetch(`/api/admin/orders/${id}`);
    const data = await res.json();
    return data.order;
  },

  async updateOrderStatus(id: number, status: string, commentaire?: string): Promise<void> {
    const res = await fetch(`/api/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, commentaire }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Erreur mise à jour statut');
  },

  async getPendingPayments(): Promise<any[]> {
    const res = await fetch('/api/admin/payments/pending');
    const data = await res.json();
    return data.payments || [];
  },

  async verifyPayment(paymentId: number, action: 'confirme' | 'refuse', raison_refus?: string): Promise<void> {
    const res = await fetch(`/api/admin/payments/${paymentId}/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, raison_refus }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Erreur vérification paiement');
  },

  async getAdminProducts(): Promise<Product[]> {
    const res = await fetch('/api/admin/products');
    const data = await res.json();
    return data.products || [];
  },

  async uploadProductImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch('/api/admin/upload-product-image', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Erreur lors du téléversement de l’image');
    return data.url;
  },

  async createAdminProduct(productData: any): Promise<Product> {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Erreur création produit');
    return data.product;
  },

  async updateAdminProduct(id: number, productData: any): Promise<Product> {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Erreur modification produit');
    return data.product;
  },

  async deleteAdminProduct(id: number): Promise<void> {
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Erreur suppression produit');
  },

  async getAdminCustomers(): Promise<any[]> {
    const res = await fetch('/api/admin/customers');
    const data = await res.json();
    return data.customers || [];
  },

  async getAdminDeliveryZones(): Promise<DeliveryZone[]> {
    const res = await fetch('/api/admin/delivery/zones');
    const data = await res.json();
    return data.zones || [];
  },

  async updateDeliveryZone(id: number, zoneData: { frais?: number; statut?: 'active' | 'inactive' }): Promise<void> {
    const res = await fetch(`/api/admin/delivery/zones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zoneData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Erreur modification zone');
  },

  async getAdminSettings(): Promise<ShopSettings> {
    const res = await fetch('/api/admin/settings');
    const data = await res.json();
    return data.settings;
  },

  async updateAdminSettings(settingsData: Partial<ShopSettings>): Promise<void> {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Erreur sauvegarde paramètres');
  },

  async getAdminNotifications(): Promise<any[]> {
    const res = await fetch('/api/admin/notifications');
    const data = await res.json();
    return data.notifications || [];
  },

  async markNotificationsRead(): Promise<void> {
    await fetch('/api/admin/notifications/read', { method: 'PUT' });
  },

  async getAdminLogs(): Promise<any[]> {
    const res = await fetch('/api/admin/logs');
    const data = await res.json();
    return data.logs || [];
  },

  // Espace Livreur
  async getDeliveryAgentOrders(): Promise<Order[]> {
    const res = await fetch('/api/delivery-agent/orders');
    const data = await res.json();
    return data.orders || [];
  },

  async markOrderDelivered(id: number): Promise<void> {
    const res = await fetch(`/api/delivery-agent/orders/${id}/deliver`, { method: 'PUT' });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Erreur mise à jour commande');
  },

  // Gestion des contenus d'insertion (Vider / Recharger)
  async clearAllData(): Promise<void> {
    const res = await fetch('/api/admin/clear-all', { method: 'POST' });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Erreur vidage données');
  },

  async clearOrders(): Promise<void> {
    const res = await fetch('/api/admin/clear-orders', { method: 'POST' });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Erreur vidage commandes');
  },

  async seedDemoData(): Promise<void> {
    const res = await fetch('/api/admin/seed-demo', { method: 'POST' });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Erreur rechargement données démo');
  },
};
