export interface Category {
  id_categorie: number;
  nom: string;
  slug: string;
  description: string;
  image: string;
  statut: 'active' | 'inactive';
}

export interface ProductSize {
  id_taille: number;
  taille: string;
  stock: number;
}

export interface ProductImage {
  id_image: number;
  image: string;
  principale: number;
}

export interface Product {
  id_produit: number;
  id_categorie: number;
  nom: string;
  description: string;
  prix: number;
  ancien_prix: number | null;
  stock: number;
  marque: string;
  genre: 'homme' | 'femme' | 'unisexe';
  statut: 'actif' | 'inactif';
  vedette: number;
  created_at: string;
  categorie_nom?: string;
  categorie_slug?: string;
  image_principale?: string;
  images?: ProductImage[];
  tailles?: ProductSize[];
  couleurs?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface DeliveryZone {
  id_zone: number;
  wilaya: string;
  commune: string;
  frais: number;
  statut: 'active' | 'inactive';
}

export interface Customer {
  id_client: number;
  nom_complet: string;
  telephone: string;
  whatsapp?: string;
  email?: string;
  created_at?: string;
  total_commandes?: number;
  depenses_totales?: number;
}

export interface DeliveryAddress {
  id_adresse: number;
  id_client?: number;
  wilaya: string;
  commune: string;
  quartier: string;
  adresse: string;
  point_repere: string;
  latitude: number | null;
  longitude: number | null;
}

export interface OrderItem {
  id_item: number;
  id_commande: number;
  id_produit: number;
  nom_produit: string;
  prix_unitaire: number;
  quantite: number;
  taille?: string;
  couleur?: string;
  total: number;
}

export interface PaymentProof {
  id_preuve: number;
  id_paiement: number;
  fichier: string;
  nom_original: string;
  type_fichier: string;
  taille_fichier: number;
  created_at: string;
}

export interface Payment {
  id_paiement: number;
  id_commande: number;
  methode: 'bankily' | 'masravi' | 'seddad';
  montant: number;
  numero_utilise?: string;
  statut: 'en_attente' | 'a_verifier' | 'confirme' | 'refuse';
  raison_refus?: string;
  verifie_par?: number | null;
  date_verification?: string | null;
  created_at: string;
  preuve?: PaymentProof;
}

export interface OrderStatusHistory {
  id_historique: number;
  id_commande: number;
  ancien_statut: string | null;
  nouveau_statut: string;
  commentaire: string;
  id_admin?: number | null;
  created_at: string;
}

export type OrderStatus =
  | 'en_attente_paiement'
  | 'paiement_a_verifier'
  | 'paiement_confirme'
  | 'paiement_refuse'
  | 'confirmee'
  | 'en_preparation'
  | 'prete_a_livrer'
  | 'en_livraison'
  | 'livree'
  | 'annulee';

export interface Order {
  id_commande: number;
  numero_commande: string;
  id_client: number;
  id_adresse: number;
  sous_total: number;
  frais_livraison: number;
  total: number;
  statut_commande: OrderStatus;
  notes?: string;
  created_at: string;
  updated_at?: string;
  client?: Customer;
  adresse?: DeliveryAddress;
  items?: OrderItem[];
  paiement?: Payment;
  historique?: OrderStatusHistory[];
}

export interface ShopSettings {
  shop_name: string;
  shop_phone: string;
  shop_whatsapp: string;
  shop_email: string;
  bankily_number: string;
  bankily_name: string;
  masravi_number: string;
  masravi_name: string;
  seddad_number: string;
  seddad_name: string;
  shop_address: string;
  currency: string;
}

export interface AdminUser {
  id_admin: number;
  nom: string;
  email: string;
  role: 'super_admin' | 'admin';
}
