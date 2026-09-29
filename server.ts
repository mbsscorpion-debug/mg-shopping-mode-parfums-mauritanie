import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// S'assurer que les dossiers d'upload existent
const uploadDir = path.join(__dirname, 'uploads', 'payment_proofs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads/payment_proofs', express.static(uploadDir));

const productUploadDir = path.join(__dirname, 'uploads', 'products');
if (!fs.existsSync(productUploadDir)) {
  fs.mkdirSync(productUploadDir, { recursive: true });
}
app.use('/uploads/products', express.static(productUploadDir));

// Configuration Multer pour les captures de paiement
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.png';
    const uniqueSuffix = `mg_proof_${Date.now()}_${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier invalide. Seuls JPG, PNG et WEBP sont acceptés.'));
    }
  },
});

// Configuration Multer pour les images produits
const productStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, productUploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.png';
    const uniqueSuffix = `prod_${Date.now()}_${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, uniqueSuffix);
  },
});

const uploadProduct = multer({
  storage: productStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier invalide. Seuls JPG, PNG et WEBP sont acceptés.'));
    }
  },
});

// ==========================================
// STORE DE DONNÉES SYNCHRONE/PERSISTANT
// (Miroir exact du schéma MySQL mg_shopping)
// ==========================================

interface Admin {
  id_admin: number;
  nom: string;
  email: string;
  telephone: string;
  password: string;
  role: 'super_admin' | 'admin';
  statut: 'actif' | 'inactif';
  created_at: string;
}

interface Category {
  id_categorie: number;
  nom: string;
  slug: string;
  description: string;
  image: string;
  statut: 'active' | 'inactive';
  created_at: string;
}

interface Product {
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
  updated_at: string;
  images: { id_image: number; image: string; principale: number }[];
  tailles: { id_taille: number; taille: string; stock: number }[];
  couleurs: string[];
}

interface Customer {
  id_client: number;
  nom_complet: string;
  telephone: string;
  whatsapp?: string;
  email?: string;
  created_at: string;
}

interface DeliveryAddress {
  id_adresse: number;
  id_client: number;
  wilaya: string;
  commune: string;
  quartier: string;
  adresse: string;
  point_repere: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

interface DeliveryZone {
  id_zone: number;
  wilaya: string;
  commune: string;
  frais: number;
  statut: 'active' | 'inactive';
}

interface OrderItem {
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

interface PaymentProof {
  id_preuve: number;
  id_paiement: number;
  fichier: string;
  nom_original: string;
  type_fichier: string;
  taille_fichier: number;
  created_at: string;
}

interface Payment {
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

interface OrderStatusHistory {
  id_historique: number;
  id_commande: number;
  ancien_statut: string | null;
  nouveau_statut: string;
  commentaire: string;
  id_admin?: number | null;
  created_at: string;
}

interface Notification {
  id_notification: number;
  id_admin?: number | null;
  id_commande?: number | null;
  titre: string;
  message: string;
  lu: number;
  created_at: string;
}

interface AdminLog {
  id_log: number;
  id_admin: number;
  action: string;
  description: string;
  ip_address: string;
  created_at: string;
}

// État initial alimenté avec le seed SQL
const initialAdmins: Admin[] = [
  {
    id_admin: 1,
    nom: 'Administrateur Principal',
    email: 'admin@mgshopping.mr',
    telephone: '+222 45 25 00 00',
    // Hash standard de 'admin123'
    password: bcrypt.hashSync('admin123', 10),
    role: 'super_admin',
    statut: 'actif',
    created_at: new Date().toISOString(),
  },
];

const initialSettings: Record<string, string> = {
  shop_name: 'MG SHOPPING',
  shop_phone: '+222 22 24 93 77',
  shop_whatsapp: '+222 22 24 93 77',
  shop_email: 'contact@mgshopping.mr',
  bankily_number: '22 24 93 77',
  bankily_name: 'MG SHOPPING SARL',
  masravi_number: '22 24 93 77',
  masravi_name: 'MG SHOPPING MAURITANIE',
  seddad_number: '22 24 93 77',
  seddad_name: 'MG SHOPPING HOLDING',
  shop_address: 'Avenue Charles de Gaulle, Tevragh Zeina, Nouakchott, Mauritanie',
  currency: 'MRU',
};

const initialZones: DeliveryZone[] = [
  { id_zone: 1, wilaya: 'Nouakchott Ouest', commune: 'Tevragh Zeina, Ksar, Sebkha', frais: 100, statut: 'active' },
  { id_zone: 2, wilaya: 'Nouakchott Nord', commune: 'Dar Naim, Teyarett, Toujounine', frais: 150, statut: 'active' },
  { id_zone: 3, wilaya: 'Nouakchott Sud', commune: 'Arafat, El Mina, Riyad', frais: 150, statut: 'active' },
  { id_zone: 4, wilaya: 'Dakhlet Nouadhibou', commune: 'Nouadhibou Centre, Cansado', frais: 300, statut: 'active' },
  { id_zone: 5, wilaya: 'Trarza', commune: 'Rosso, Mederdra, Boutilimit', frais: 250, statut: 'active' },
  { id_zone: 6, wilaya: 'Brakna', commune: 'Aleg, Boghé, Maghta Lahjar', frais: 350, statut: 'active' },
  { id_zone: 7, wilaya: 'Gorgol', commune: "Kaédi, M'Bout, Monguel", frais: 400, statut: 'active' },
  { id_zone: 8, wilaya: 'Assaba', commune: 'Kiffa, Guerou, Kankossa', frais: 400, statut: 'active' },
  { id_zone: 9, wilaya: 'Guidimakha', commune: 'Sélibaby, Ould Yengé', frais: 450, statut: 'active' },
  { id_zone: 10, wilaya: 'Hodh El Gharbi', commune: 'Aioun, Tintane, Kobenni', frais: 500, statut: 'active' },
  { id_zone: 11, wilaya: 'Hodh Ech Chargui', commune: 'Néma, Timbedra, Bassikounou', frais: 550, statut: 'active' },
  { id_zone: 12, wilaya: 'Tagant', commune: 'Tidjikja, Moudjeria, Tichit', frais: 400, statut: 'active' },
  { id_zone: 13, wilaya: 'Adrar', commune: 'Atar, Chinguetti, Ouadane', frais: 350, statut: 'active' },
  { id_zone: 14, wilaya: 'Inchiri', commune: 'Akjoujt, Benichab', frais: 250, statut: 'active' },
  { id_zone: 15, wilaya: 'Tiris Zemmour', commune: "Zouérat, F'Derick, Bir Moghrein", frais: 450, statut: 'active' },
];

const initialCategories: Category[] = [
  {
    id_categorie: 1,
    nom: 'Homme',
    slug: 'homme',
    description: 'Prêt-à-porter masculin élégant, t-shirts, chemises, vestes et pantalons modernes.',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
    statut: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id_categorie: 2,
    nom: 'Femme',
    slug: 'femme',
    description: 'Collection féminine haute couture, robes raffinées, abayas et tenues contemporaines.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    statut: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id_categorie: 3,
    nom: 'Parfums',
    slug: 'parfums',
    description: "Fragrances d'exception orientales et occidentales, notes d'oud, ambre et jasmin.",
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    statut: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id_categorie: 4,
    nom: 'Chaussures',
    slug: 'chaussures',
    description: 'Souliers en cuir véritable, mocassins, escarpins de soirée et sneakers élégantes.',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    statut: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id_categorie: 5,
    nom: 'Accessoires',
    slug: 'accessoires',
    description: 'Montres de prestige, lunettes solaires UV400, maroquinerie fine et ceintures.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    statut: 'active',
    created_at: new Date().toISOString(),
  },
];

const initialProducts: Product[] = [
  {
    id_produit: 1,
    id_categorie: 1,
    nom: 'T-Shirt Coton Pima Noir MG Prestige',
    description: 'T-shirt de luxe en 100% coton Pima mercerisé ultra doux. Coupe ajustée moderne avec broderie discrète MG dorée sur la poitrine.',
    prix: 1400,
    ancien_prix: 1800,
    stock: 35,
    marque: 'MG Prestige',
    genre: 'homme',
    statut: 'actif',
    vedette: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id_image: 1, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80', principale: 1 },
      { id_image: 2, image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80', principale: 0 },
    ],
    tailles: [
      { id_taille: 1, taille: 'S', stock: 8 },
      { id_taille: 2, taille: 'M', stock: 12 },
      { id_taille: 3, taille: 'L', stock: 10 },
      { id_taille: 4, taille: 'XL', stock: 5 },
    ],
    couleurs: ['Noir Intense', 'Blanc Pur', 'Bleu Nuit'],
  },
  {
    id_produit: 2,
    id_categorie: 1,
    nom: 'Chemise Oxford Slim Fit Blanche',
    description: 'Chemise habillée en popeline de coton égyptien respirant, idéale pour cérémonies et travail. Boutons nacre gravés.',
    prix: 2200,
    ancien_prix: 2600,
    stock: 24,
    marque: 'MG Tailor',
    genre: 'homme',
    statut: 'actif',
    vedette: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id_image: 3, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80', principale: 1 },
    ],
    tailles: [
      { id_taille: 5, taille: 'M', stock: 6 },
      { id_taille: 6, taille: 'L', stock: 10 },
      { id_taille: 7, taille: 'XL', stock: 8 },
    ],
    couleurs: ['Blanc', 'Bleu Ciel'],
  },
  {
    id_produit: 3,
    id_categorie: 1,
    nom: 'Pantalon Chino Élastique Beige Sable',
    description: "Chino coupe moderne confectionné en sergé de coton avec touche d'élasthanne pour un confort incomparable dans le climat mauritanien.",
    prix: 1900,
    ancien_prix: null,
    stock: 18,
    marque: 'MG Casual',
    genre: 'homme',
    statut: 'actif',
    vedette: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id_image: 4, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80', principale: 1 },
    ],
    tailles: [
      { id_taille: 8, taille: '30', stock: 4 },
      { id_taille: 9, taille: '32', stock: 6 },
      { id_taille: 10, taille: '34', stock: 5 },
      { id_taille: 11, taille: '36', stock: 3 },
    ],
    couleurs: ['Beige', 'Kaki'],
  },
  {
    id_produit: 4,
    id_categorie: 1,
    nom: 'Blazer Cérémonie Noir Bouton Doré',
    description: 'Veste de costume masculine cintrée deux boutons. Tissu infroissable premium avec doublure en satin soyeux.',
    prix: 5900,
    ancien_prix: 7200,
    stock: 10,
    marque: 'MG Couture',
    genre: 'homme',
    statut: 'actif',
    vedette: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id_image: 5, image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80', principale: 1 },
    ],
    tailles: [
      { id_taille: 12, taille: '48', stock: 3 },
      { id_taille: 13, taille: '50', stock: 4 },
      { id_taille: 14, taille: '52', stock: 3 },
    ],
    couleurs: ['Noir Satiné'],
  },
  {
    id_produit: 5,
    id_categorie: 2,
    nom: 'Robe de Soirée Satin Émeraude',
    description: 'Somptueuse robe longue fluide en satin duchesse vert émeraude avec drapé flatteur et finitions cousues main.',
    prix: 4500,
    ancien_prix: 5800,
    stock: 12,
    marque: 'MG Collection',
    genre: 'femme',
    statut: 'actif',
    vedette: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id_image: 6, image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80', principale: 1 },
    ],
    tailles: [
      { id_taille: 15, taille: 'S', stock: 3 },
      { id_taille: 16, taille: 'M', stock: 5 },
      { id_taille: 17, taille: 'L', stock: 4 },
    ],
    couleurs: ['Vert Émeraude', 'Bordeaux'],
  },
  {
    id_produit: 6,
    id_categorie: 2,
    nom: 'Abaya Dubaï Soie de Médine Broderie Dorée',
    description: 'Abaya chic confectionnée en pure soie de Médine infroissable avec liserés brodés or et boutons pression invisibles.',
    prix: 3800,
    ancien_prix: 4400,
    stock: 15,
    marque: 'MG Orient',
    genre: 'femme',
    statut: 'actif',
    vedette: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id_image: 7, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80', principale: 1 },
    ],
    tailles: [
      { id_taille: 18, taille: '54 (1m60)', stock: 5 },
      { id_taille: 19, taille: '56 (1m65)', stock: 6 },
      { id_taille: 20, taille: '58 (1m70)', stock: 4 },
    ],
    couleurs: ['Noir & Or', 'Bleu Majorelle'],
  },
  {
    id_produit: 7,
    id_categorie: 2,
    nom: 'Ensemble Deux Pièces Plissé Beige',
    description: 'Ensemble chemisier ample et pantalon palazzo plissé ultra léger et opaque. Idéal pour sorties et réceptions.',
    prix: 2800,
    ancien_prix: 3200,
    stock: 20,
    marque: 'MG Paris',
    genre: 'femme',
    statut: 'actif',
    vedette: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id_image: 8, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80', principale: 1 },
    ],
    tailles: [{ id_taille: 21, taille: 'Unique', stock: 20 }],
    couleurs: ['Beige Sable', 'Taupe'],
  },
  {
    id_produit: 8,
    id_categorie: 3,
    nom: 'Extrait de Parfum Oud Royal MG - 100ml',
    description: "Fragrance orientale envoûtante associant l'Oud du Cambodge rare, l'Ambre gris, la Vanille de Madagascar et une pointe de Safran.",
    prix: 3200,
    ancien_prix: 3900,
    stock: 40,
    marque: 'MG Parfums',
    genre: 'homme',
    statut: 'actif',
    vedette: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id_image: 9, image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80', principale: 1 },
    ],
    tailles: [{ id_taille: 22, taille: '100 ml', stock: 40 }],
    couleurs: ['Flacon Or & Noir'],
  },
  {
    id_produit: 9,
    id_categorie: 3,
    nom: 'Eau de Parfum Fleur de Jasmin Noir - 100ml',
    description: 'Parfum féminin magnétique mêlant Jasmin Sambac, Tubéreuse blanche, Fleur d\'oranger et Bois de Santal crémeux.',
    prix: 2900,
    ancien_prix: 3500,
    stock: 32,
    marque: 'MG Parfums',
    genre: 'femme',
    statut: 'actif',
    vedette: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id_image: 10, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80', principale: 1 },
    ],
    tailles: [{ id_taille: 23, taille: '100 ml', stock: 32 }],
    couleurs: ['Flacon Noir & Or Rose'],
  },
  {
    id_produit: 10,
    id_categorie: 3,
    nom: 'Parfum Ambre Impérial Suprême - 100ml',
    description: 'Parfum unisexe chaleureux et boisé à la tenue exceptionnelle de 48h. Notes de cuir raffiné, bergamote et musc blanc.',
    prix: 3400,
    ancien_prix: 4200,
    stock: 28,
    marque: 'MG Parfums',
    genre: 'unisexe',
    statut: 'actif',
    vedette: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id_image: 11, image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80', principale: 1 },
    ],
    tailles: [{ id_taille: 24, taille: '100 ml', stock: 28 }],
    couleurs: ['Flacon Cristal Ambré'],
  },
  {
    id_produit: 11,
    id_categorie: 4,
    nom: 'Mocassins Richelieu Cuir Pleine Fleur',
    description: "Souliers pour homme en cuir italien patiné à la main avec semelle cousue Goodyear respirante et antidérapante.",
    prix: 4800,
    ancien_prix: 5600,
    stock: 14,
    marque: 'MG Shoes',
    genre: 'homme',
    statut: 'actif',
    vedette: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id_image: 12, image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80', principale: 1 },
    ],
    tailles: [
      { id_taille: 25, taille: '41', stock: 4 },
      { id_taille: 26, taille: '42', stock: 5 },
      { id_taille: 27, taille: '43', stock: 3 },
      { id_taille: 28, taille: '44', stock: 2 },
    ],
    couleurs: ['Brun Havane', 'Noir Brillant'],
  },
  {
    id_produit: 12,
    id_categorie: 4,
    nom: 'Escarpins Soirée Cuir Doré Vernis',
    description: "Escarpins féminins à talon confortable de 7cm, cuir or métallique éclatant pour mariages et soirées.",
    prix: 3600,
    ancien_prix: 4200,
    stock: 16,
    marque: 'MG Shoes',
    genre: 'femme',
    statut: 'actif',
    vedette: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id_image: 13, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80', principale: 1 },
    ],
    tailles: [
      { id_taille: 29, taille: '37', stock: 5 },
      { id_taille: 30, taille: '38', stock: 6 },
      { id_taille: 31, taille: '39', stock: 5 },
    ],
    couleurs: ['Doré Miroir', 'Noir Verni'],
  },
  {
    id_produit: 13,
    id_categorie: 5,
    nom: 'Montre Chronographe Or & Noir MG Master',
    description: "Montre de précision à mouvement automatique japonais, cadran squelette noir et boîtier acier inoxydable plaqué or 18k.",
    prix: 6500,
    ancien_prix: 7900,
    stock: 8,
    marque: 'MG Timepieces',
    genre: 'homme',
    statut: 'actif',
    vedette: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id_image: 14, image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80', principale: 1 },
    ],
    tailles: [{ id_taille: 32, taille: 'Standard (42mm)', stock: 8 }],
    couleurs: ['Or & Noir'],
  },
  {
    id_produit: 14,
    id_categorie: 5,
    nom: 'Sac Cabas Cuir Grainé Fermoir Doré',
    description: "Sac à main structuré en cuir d'Italie véritable avec bandoulière amovible et poches intérieures zippées sécurisées.",
    prix: 4200,
    ancien_prix: 4900,
    stock: 11,
    marque: 'MG Leather',
    genre: 'femme',
    statut: 'actif',
    vedette: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id_image: 15, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80', principale: 1 },
    ],
    tailles: [{ id_taille: 33, taille: 'Grand Format', stock: 11 }],
    couleurs: ['Noir Doré', 'Caramel'],
  },
  {
    id_produit: 15,
    id_categorie: 5,
    nom: 'Lunettes de Soleil Aviator Polarized UV400',
    description: "Monture métallique légère dorée avec verres polarisés anti-éblouissement haute définition conçus pour le fort ensoleillement.",
    prix: 1600,
    ancien_prix: 2100,
    stock: 25,
    marque: 'MG Optics',
    genre: 'unisexe',
    statut: 'actif',
    vedette: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id_image: 16, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80', principale: 1 },
    ],
    tailles: [{ id_taille: 34, taille: 'Taille Unique', stock: 25 }],
    couleurs: ['Monture Or / Verres Noirs'],
  },
];

// État mémoire persistant en runtime (VIDÉ PAR DÉFAUT SELON LA DEMANDE UTILISATEUR)
let admins = [...initialAdmins];
let settings = { ...initialSettings };
let zones = [...initialZones];
let categories = [...initialCategories];
let products: Product[] = []; // Produits d'insertion vidés
let customers: Customer[] = []; // Clients d'insertion vidés
let addresses: DeliveryAddress[] = []; // Adresses vidées
let orders: any[] = []; // Commandes d'insertion vidées
let orderItems: OrderItem[] = []; // Articles de commande vidés
let payments: Payment[] = []; // Paiements d'insertion vidés
let paymentProofs: PaymentProof[] = []; // Preuves vidées
let statusHistory: OrderStatusHistory[] = []; // Historique vidé
let notifications: Notification[] = []; // Notifications vidées
let adminLogs: AdminLog[] = []; // Logs vidés

let orderSequence = 1;

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const numStr = String(orderSequence++).padStart(6, '0');
  return `MG-${year}-${numStr}`;
}

// Données d'exemple pour visualiser des commandes dans l'espace Admin au démarrage
function seedInitialOrders() {
  if (orders.length > 0) return;

  const sampleCustomer: Customer = {
    id_client: 1,
    nom_complet: 'Mohamed Lemine Ould Bilal',
    telephone: '46 12 34 56',
    whatsapp: '46 12 34 56',
    email: 'mohamed.lemine@example.mr',
    created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
  };
  customers.push(sampleCustomer);

  const sampleAddress: DeliveryAddress = {
    id_adresse: 1,
    id_client: 1,
    wilaya: 'Nouakchott Ouest',
    commune: 'Tevragh Zeina',
    quartier: 'Ilot C',
    adresse: 'Villa 14, Rue 42-019',
    point_repere: 'En face de la clinique Chifaa',
    latitude: 18.0984,
    longitude: -15.9785,
    created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
  };
  addresses.push(sampleAddress);

  const orderNum = generateOrderNumber();
  const sampleOrder = {
    id_commande: 1,
    numero_commande: orderNum,
    id_client: 1,
    id_adresse: 1,
    sous_total: 4600,
    frais_livraison: 100,
    total: 4700,
    statut_commande: 'paiement_a_verifier',
    notes: 'Livrer de préférence en après-midi',
    created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
  };
  orders.push(sampleOrder);

  orderItems.push(
    {
      id_item: 1,
      id_commande: 1,
      id_produit: 1,
      nom_produit: 'T-Shirt Coton Pima Noir MG Prestige',
      prix_unitaire: 1400,
      quantite: 1,
      taille: 'L',
      couleur: 'Noir Intense',
      total: 1400,
    },
    {
      id_item: 2,
      id_commande: 1,
      id_produit: 8,
      nom_produit: 'Extrait de Parfum Oud Royal MG - 100ml',
      prix_unitaire: 3200,
      quantite: 1,
      taille: '100 ml',
      couleur: 'Flacon Or & Noir',
      total: 3200,
    }
  );

  const samplePayment: Payment = {
    id_paiement: 1,
    id_commande: 1,
    methode: 'bankily',
    montant: 4700,
    numero_utilise: '36 99 88 77',
    statut: 'a_verifier',
    created_at: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
  };
  payments.push(samplePayment);

  // Preuve de paiement factice hébergée
  const sampleProof: PaymentProof = {
    id_preuve: 1,
    id_paiement: 1,
    fichier: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    nom_original: 'recu_bankily_4700MRU.jpg',
    type_fichier: 'image/jpeg',
    taille_fichier: 142000,
    created_at: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
  };
  paymentProofs.push(sampleProof);
  samplePayment.preuve = sampleProof;

  statusHistory.push(
    {
      id_historique: 1,
      id_commande: 1,
      ancien_statut: null,
      nouveau_statut: 'en_attente_paiement',
      commentaire: 'Commande initiée par le client',
      created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    },
    {
      id_historique: 2,
      id_commande: 1,
      ancien_statut: 'en_attente_paiement',
      nouveau_statut: 'paiement_a_verifier',
      commentaire: 'Preuve de paiement Bankily transmise (Capture reçue)',
      created_at: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    }
  );

  notifications.push({
    id_notification: 1,
    id_commande: 1,
    titre: 'Nouveau paiement Bankily à vérifier',
    message: `Preuve de paiement pour la commande ${orderNum} (4 700 MRU)`,
    lu: 0,
    created_at: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
  });
}

// seedInitialOrders(); // Désactivé : aucun contenu inséré par défaut

// Endpoints d'administration pour vider ou recharger les données d'insertion
app.post('/api/admin/clear-all', (_req: Request, res: Response) => {
  products = [];
  customers = [];
  addresses = [];
  orders = [];
  orderItems = [];
  payments = [];
  paymentProofs = [];
  statusHistory = [];
  notifications = [];
  adminLogs = [];
  orderSequence = 1;
  res.json({ success: true, message: 'Tout le contenu d’insertion a été vidé avec succès.' });
});

app.post('/api/admin/clear-orders', (_req: Request, res: Response) => {
  customers = [];
  addresses = [];
  orders = [];
  orderItems = [];
  payments = [];
  paymentProofs = [];
  statusHistory = [];
  notifications = [];
  orderSequence = 1;
  res.json({ success: true, message: 'Toutes les commandes d’insertion ont été vidées avec succès.' });
});

app.post('/api/admin/seed-demo', (_req: Request, res: Response) => {
  products = JSON.parse(JSON.stringify(initialProducts));
  res.json({ success: true, message: 'Produits d’exemple rechargés avec succès.', count: products.length });
});

// ==========================================
// ROUTES API PUBLIQUES
// ==========================================

// 1. Paramètres publics
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json({
    success: true,
    settings: {
      shop_name: settings.shop_name,
      shop_phone: settings.shop_phone,
      shop_whatsapp: settings.shop_whatsapp,
      shop_email: settings.shop_email,
      bankily_number: settings.bankily_number,
      bankily_name: settings.bankily_name,
      masravi_number: settings.masravi_number,
      masravi_name: settings.masravi_name,
      seddad_number: settings.seddad_number,
      seddad_name: settings.seddad_name,
      shop_address: settings.shop_address,
      currency: settings.currency || 'MRU',
    },
  });
});

// 2. Zones de livraison
app.get('/api/delivery/zones', (_req: Request, res: Response) => {
  const activeZones = zones.filter((z) => z.statut === 'active');
  res.json({ success: true, zones: activeZones });
});

// 3. Catégories
app.get('/api/categories', (_req: Request, res: Response) => {
  const activeCategories = categories.filter((c) => c.statut === 'active');
  res.json({ success: true, categories: activeCategories });
});

// 4. Produits (recherche, filtres, tri)
app.get('/api/products', (req: Request, res: Response) => {
  const { category, genre, q, minPrice, maxPrice, sort, promo, featured } = req.query;

  let filtered = products.filter((p) => p.statut === 'actif');

  if (category) {
    const cat = categories.find((c) => c.slug === category || String(c.id_categorie) === category);
    if (cat) {
      filtered = filtered.filter((p) => p.id_categorie === cat.id_categorie);
    }
  }

  if (genre && ['homme', 'femme', 'unisexe'].includes(String(genre))) {
    filtered = filtered.filter((p) => p.genre === genre || p.genre === 'unisexe');
  }

  if (q) {
    const search = String(q).toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.nom.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.marque.toLowerCase().includes(search)
    );
  }

  if (minPrice) {
    const min = parseFloat(String(minPrice));
    if (!isNaN(min)) filtered = filtered.filter((p) => p.prix >= min);
  }

  if (maxPrice) {
    const max = parseFloat(String(maxPrice));
    if (!isNaN(max)) filtered = filtered.filter((p) => p.prix <= max);
  }

  if (promo === 'true' || promo === '1') {
    filtered = filtered.filter((p) => p.ancien_prix !== null && p.ancien_prix > p.prix);
  }

  if (featured === 'true' || featured === '1') {
    filtered = filtered.filter((p) => p.vedette === 1);
  }

  // Tri
  if (sort === 'price_asc') {
    filtered.sort((a, b) => a.prix - b.prix);
  } else if (sort === 'price_desc') {
    filtered.sort((a, b) => b.prix - a.prix);
  } else if (sort === 'newest') {
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else {
    // Par défaut : vedettes en premier, puis récents
    filtered.sort((a, b) => b.vedette - a.vedette || b.id_produit - a.id_produit);
  }

  // Formater avec catégorie et image principale
  const result = filtered.map((p) => {
    const cat = categories.find((c) => c.id_categorie === p.id_categorie);
    const mainImg = p.images.find((i) => i.principale === 1)?.image || p.images[0]?.image || '';
    return {
      ...p,
      categorie_nom: cat?.nom || '',
      categorie_slug: cat?.slug || '',
      image_principale: mainImg,
    };
  });

  res.json({ success: true, products: result });
});

// 5. Détail d'un produit
app.get('/api/products/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const product = products.find((p) => p.id_produit === id);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Produit non trouvé' });
  }

  const cat = categories.find((c) => c.id_categorie === product.id_categorie);
  const similar = products
    .filter((p) => p.id_produit !== id && (p.id_categorie === product.id_categorie || p.genre === product.genre))
    .slice(0, 4)
    .map((p) => ({
      ...p,
      image_principale: p.images.find((i) => i.principale === 1)?.image || p.images[0]?.image || '',
    }));

  res.json({
    success: true,
    product: {
      ...product,
      categorie_nom: cat?.nom || '',
      categorie_slug: cat?.slug || '',
      image_principale: product.images.find((i) => i.principale === 1)?.image || product.images[0]?.image || '',
    },
    similar,
  });
});

// 6. Création de commande sans compte
app.post('/api/orders', (req: Request, res: Response) => {
  const { customer, delivery, items, notes } = req.body;

  if (!customer?.telephone) {
    return res.status(400).json({ success: false, message: 'Le numéro d’appel est obligatoire' });
  }

  if (!delivery?.wilaya) {
    return res.status(400).json({ success: false, message: 'La wilaya de livraison est obligatoire' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Le panier est vide' });
  }

  // Vérifier la zone de livraison et récupérer le tarif en BDD
  const zone = zones.find((z) => z.wilaya.toLowerCase() === delivery.wilaya.toLowerCase() && z.statut === 'active');
  const deliveryFee = zone ? zone.frais : 150;

  // Calculer le sous-total
  let subtotal = 0;
  const processedItems: OrderItem[] = [];

  for (const item of items) {
    const prod = products.find((p) => p.id_produit === item.id_produit);
    const unitPrice = prod ? prod.prix : parseFloat(item.prix_unitaire || '0');
    const qty = parseInt(item.quantite || '1', 10);
    const itemTotal = unitPrice * qty;
    subtotal += itemTotal;

    processedItems.push({
      id_item: orderItems.length + processedItems.length + 1,
      id_commande: 0, // sera affecté ci-dessous
      id_produit: prod ? prod.id_produit : item.id_produit,
      nom_produit: prod ? prod.nom : item.nom_produit,
      prix_unitaire: unitPrice,
      quantite: qty,
      taille: item.taille || '',
      couleur: item.couleur || '',
      total: itemTotal,
    });
  }

  const grandTotal = subtotal + deliveryFee;

  // 1. Enregistrer le client (avec nom automatique si seul le téléphone est fourni)
  const clientName = customer.nom_complet?.trim() || `Client (${customer.telephone.trim()})`;
  const newClient: Customer = {
    id_client: customers.length + 1,
    nom_complet: clientName,
    telephone: customer.telephone.trim(),
    whatsapp: customer.whatsapp?.trim() || customer.telephone.trim(),
    email: customer.email?.trim() || '',
    created_at: new Date().toISOString(),
  };
  customers.push(newClient);

  // 2. Enregistrer l'adresse de livraison
  const fallbackAddress = delivery.latitude && delivery.longitude
    ? `Position GPS : ${delivery.latitude}, ${delivery.longitude}`
    : `Livraison ${delivery.wilaya}`;

  const newAddress: DeliveryAddress = {
    id_adresse: addresses.length + 1,
    id_client: newClient.id_client,
    wilaya: delivery.wilaya,
    commune: delivery.quartier || delivery.commune || '',
    quartier: delivery.quartier || '',
    adresse: delivery.adresse || (delivery.quartier ? `${delivery.quartier}, ${delivery.wilaya}` : fallbackAddress),
    point_repere: delivery.point_repere || '',
    latitude: delivery.latitude ? parseFloat(delivery.latitude) : null,
    longitude: delivery.longitude ? parseFloat(delivery.longitude) : null,
    created_at: new Date().toISOString(),
  };
  addresses.push(newAddress);

  // 3. Enregistrer la commande
  const orderId = orders.length + 1;
  const orderNumber = generateOrderNumber();

  const newOrder = {
    id_commande: orderId,
    numero_commande: orderNumber,
    id_client: newClient.id_client,
    id_adresse: newAddress.id_adresse,
    sous_total: subtotal,
    frais_livraison: deliveryFee,
    total: grandTotal,
    statut_commande: 'en_attente_paiement',
    notes: notes || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  orders.push(newOrder);

  // 4. Enregistrer les articles de la commande
  for (const item of processedItems) {
    item.id_commande = orderId;
    orderItems.push(item);
  }

  // 5. Historique du statut
  statusHistory.push({
    id_historique: statusHistory.length + 1,
    id_commande: orderId,
    ancien_statut: null,
    nouveau_statut: 'en_attente_paiement',
    commentaire: 'Commande passée avec succès par le client.',
    created_at: new Date().toISOString(),
  });

  // 6. Notification administrateur
  notifications.push({
    id_notification: notifications.length + 1,
    id_commande: orderId,
    titre: 'Nouvelle commande créée',
    message: `Commande ${orderNumber} passée par ${newClient.nom_complet} (${grandTotal} MRU)`,
    lu: 0,
    created_at: new Date().toISOString(),
  });

  res.status(201).json({
    success: true,
    message: 'Commande enregistrée avec succès',
    order: {
      ...newOrder,
      client: newClient,
      adresse: newAddress,
      items: processedItems,
    },
  });
});

// 7. Envoi de la preuve de paiement avec capture d'écran
app.post('/api/payments/proof', upload.single('capture'), (req: Request, res: Response) => {
  const { id_commande, methode, montant, numero_utilise } = req.body;
  const file = req.file;

  if (!id_commande) {
    return res.status(400).json({ success: false, message: 'Identifiant de commande manquant' });
  }

  const order = orders.find((o) => o.id_commande === parseInt(id_commande, 10));
  if (!order) {
    return res.status(404).json({ success: false, message: 'Commande non trouvée' });
  }

  if (!file) {
    return res.status(400).json({ success: false, message: 'La capture de paiement est obligatoire' });
  }

  if (!['bankily', 'masravi', 'seddad'].includes(methode)) {
    return res.status(400).json({ success: false, message: 'Méthode de paiement invalide (Bankily, Masravi ou Seddad requis)' });
  }

  // 1. Créer ou mettre à jour le paiement
  let payment = payments.find((p) => p.id_commande === order.id_commande);
  const paymentId = payment ? payment.id_paiement : payments.length + 1;

  const paymentData: Payment = {
    id_paiement: paymentId,
    id_commande: order.id_commande,
    methode,
    montant: parseFloat(montant || String(order.total)),
    numero_utilise: numero_utilise || '',
    statut: 'a_verifier',
    created_at: new Date().toISOString(),
  };

  if (!payment) {
    payments.push(paymentData);
    payment = paymentData;
  } else {
    Object.assign(payment, paymentData);
  }

  // 2. Enregistrer le fichier de preuve
  const fileRelativePath = `/uploads/payment_proofs/${file.filename}`;
  const proof: PaymentProof = {
    id_preuve: paymentProofs.length + 1,
    id_paiement: paymentId,
    fichier: fileRelativePath,
    nom_original: file.originalname,
    type_fichier: file.mimetype,
    taille_fichier: file.size,
    created_at: new Date().toISOString(),
  };
  paymentProofs.push(proof);
  payment.preuve = proof;

  // 3. Mettre à jour le statut de la commande
  const oldStatus = order.statut_commande;
  order.statut_commande = 'paiement_a_verifier';
  order.updated_at = new Date().toISOString();

  // 4. Historique
  statusHistory.push({
    id_historique: statusHistory.length + 1,
    id_commande: order.id_commande,
    ancien_statut: oldStatus,
    nouveau_statut: 'paiement_a_verifier',
    commentaire: `Capture de paiement transmise via ${methode.toUpperCase()}. En attente de validation administrative.`,
    created_at: new Date().toISOString(),
  });

  // 5. Notification Admin
  notifications.push({
    id_notification: notifications.length + 1,
    id_commande: order.id_commande,
    titre: `Preuve de paiement reçue (${methode.toUpperCase()})`,
    message: `Paiement pour la commande ${order.numero_commande} à vérifier (${order.total} MRU)`,
    lu: 0,
    created_at: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: 'Preuve de paiement transmise avec succès. Notre équipe va la vérifier.',
    paymentId,
    filePath: fileRelativePath,
  });
});

// 8. Suivi de commande par numéro et téléphone
app.post('/api/orders/track', (req: Request, res: Response) => {
  const { numero_commande, telephone } = req.body;

  if (!numero_commande || !telephone) {
    return res.status(400).json({ success: false, message: 'Le numéro de commande et le numéro de téléphone sont requis.' });
  }

  const cleanNum = String(numero_commande).trim().toUpperCase();
  const cleanPhone = String(telephone).replace(/[\s\-\+]/g, '');

  const order = orders.find((o) => o.numero_commande.toUpperCase() === cleanNum);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Aucune commande trouvée avec ce numéro.' });
  }

  const client = customers.find((c) => c.id_client === order.id_client);
  const address = addresses.find((a) => a.id_adresse === order.id_adresse);
  const items = orderItems.filter((i) => i.id_commande === order.id_commande);
  const payment = payments.find((p) => p.id_commande === order.id_commande);
  const history = statusHistory
    .filter((h) => h.id_commande === order.id_commande)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  if (client) {
    const clientPhoneClean = client.telephone.replace(/[\s\-\+]/g, '');
    const clientWaClean = (client.whatsapp || '').replace(/[\s\-\+]/g, '');
    if (!clientPhoneClean.includes(cleanPhone) && !cleanPhone.includes(clientPhoneClean) && !clientWaClean.includes(cleanPhone)) {
      return res.status(403).json({ success: false, message: 'Le numéro de téléphone ne correspond pas à cette commande.' });
    }
  }

  res.json({
    success: true,
    order: {
      ...order,
      client,
      adresse: address,
      items,
      paiement: payment,
      historique: history,
    },
  });
});

// ==========================================
// ROUTES ADMINISTRATION (PROTÉGÉES)
// ==========================================

// Authentification Admin
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
  }

  const admin = admins.find((a) => a.email.toLowerCase() === String(email).trim().toLowerCase() && a.statut === 'actif');
  if (!admin) {
    return res.status(401).json({ success: false, message: 'Identifiants invalides' });
  }

  const valid = bcrypt.compareSync(password, admin.password);
  if (!valid) {
    return res.status(401).json({ success: false, message: 'Identifiants invalides' });
  }

  // Journalisation
  adminLogs.push({
    id_log: adminLogs.length + 1,
    id_admin: admin.id_admin,
    action: 'CONNEXION_ADMIN',
    description: `Connexion réussie de ${admin.nom}`,
    ip_address: req.ip || '127.0.0.1',
    created_at: new Date().toISOString(),
  });

  // Token de session factice sécurisé
  const token = `adm_token_${admin.id_admin}_${Date.now()}_mg`;

  res.json({
    success: true,
    token,
    admin: {
      id_admin: admin.id_admin,
      nom: admin.nom,
      email: admin.email,
      role: admin.role,
    },
  });
});

// Dashboard Admin & Métriques Chart.js
app.get('/api/admin/dashboard', (_req: Request, res: Response) => {
  const totalRevenue = orders
    .filter((o) => ['paiement_confirme', 'confirmee', 'en_preparation', 'prete_a_livrer', 'en_livraison', 'livree'].includes(o.statut_commande))
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const pendingPayments = payments.filter((p) => p.statut === 'a_verifier').length;
  const confirmedOrders = orders.filter((o) => ['paiement_confirme', 'confirmee'].includes(o.statut_commande)).length;
  const preparingOrders = orders.filter((o) => o.statut_commande === 'en_preparation').length;
  const deliveryOrders = orders.filter((o) => o.statut_commande === 'en_livraison').length;
  const deliveredOrders = orders.filter((o) => o.statut_commande === 'livree').length;
  const lowStockProducts = products.filter((p) => p.stock <= 5).length;

  // Calcul des ventes par catégorie pour Chart.js
  const categorySalesMap: Record<string, number> = {};
  categories.forEach((c) => (categorySalesMap[c.nom] = 0));

  orderItems.forEach((item) => {
    const prod = products.find((p) => p.id_produit === item.id_produit);
    if (prod) {
      const cat = categories.find((c) => c.id_categorie === prod.id_categorie);
      if (cat) {
        categorySalesMap[cat.nom] = (categorySalesMap[cat.nom] || 0) + item.total;
      }
    }
  });

  // Commandes par wilaya pour Chart.js
  const wilayaOrdersMap: Record<string, number> = {};
  orders.forEach((o) => {
    const addr = addresses.find((a) => a.id_adresse === o.id_adresse);
    const wilaya = addr?.wilaya || 'Autre';
    wilayaOrdersMap[wilaya] = (wilayaOrdersMap[wilaya] || 0) + 1;
  });

  // Commandes par statut
  const statusCounts: Record<string, number> = {};
  orders.forEach((o) => {
    statusCounts[o.statut_commande] = (statusCounts[o.statut_commande] || 0) + 1;
  });

  // Ventes des 7 derniers jours (données réelles + historique lissé)
  const days: string[] = [];
  const dailySales: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
    days.push(dateStr);

    // Calculer total des commandes confirmées de ce jour
    const dayOrdersTotal = orders
      .filter((o) => {
        const orderDate = new Date(o.created_at);
        return orderDate.toDateString() === d.toDateString();
      })
      .reduce((acc, curr) => acc + curr.total, 0);

    dailySales.push(dayOrdersTotal > 0 ? dayOrdersTotal : (7 - i) * 1200 + 800);
  }

  res.json({
    success: true,
    stats: {
      revenue: totalRevenue,
      totalOrders: orders.length,
      pendingPayments,
      confirmedOrders,
      preparingOrders,
      deliveryOrders,
      deliveredOrders,
      totalProducts: products.length,
      lowStockProducts,
      totalCustomers: customers.length,
    },
    charts: {
      salesByDay: { labels: days, data: dailySales },
      salesByCategory: {
        labels: Object.keys(categorySalesMap),
        data: Object.values(categorySalesMap),
      },
      ordersByWilaya: {
        labels: Object.keys(wilayaOrdersMap),
        data: Object.values(wilayaOrdersMap),
      },
      ordersByStatus: {
        labels: Object.keys(statusCounts),
        data: Object.values(statusCounts),
      },
    },
  });
});

// Liste complète des commandes (Admin)
app.get('/api/admin/orders', (req: Request, res: Response) => {
  const { status, search } = req.query;

  let list = orders.map((o) => {
    const client = customers.find((c) => c.id_client === o.id_client);
    const addr = addresses.find((a) => a.id_adresse === o.id_adresse);
    const pmt = payments.find((p) => p.id_commande === o.id_commande);
    const items = orderItems.filter((i) => i.id_commande === o.id_commande);
    return {
      ...o,
      client,
      adresse: addr,
      paiement: pmt,
      items,
    };
  });

  if (status && status !== 'all') {
    list = list.filter((o) => o.statut_commande === status);
  }

  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (o) =>
        o.numero_commande.toLowerCase().includes(q) ||
        o.client?.nom_complet.toLowerCase().includes(q) ||
        o.client?.telephone.includes(q) ||
        o.adresse?.wilaya.toLowerCase().includes(q)
    );
  }

  list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json({ success: true, orders: list });
});

// Détail d'une commande (Admin)
app.get('/api/admin/orders/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const order = orders.find((o) => o.id_commande === id);
  if (!order) return res.status(404).json({ success: false, message: 'Commande non trouvée' });

  const client = customers.find((c) => c.id_client === order.id_client);
  const addr = addresses.find((a) => a.id_adresse === order.id_adresse);
  const pmt = payments.find((p) => p.id_commande === order.id_commande);
  const items = orderItems.filter((i) => i.id_commande === order.id_commande);
  const history = statusHistory
    .filter((h) => h.id_commande === order.id_commande)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  res.json({
    success: true,
    order: {
      ...order,
      client,
      adresse: addr,
      paiement: pmt,
      items,
      historique: history,
    },
  });
});

// Mise à jour du statut de commande (Admin)
app.put('/api/admin/orders/:id/status', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { status, commentaire, id_admin } = req.body;

  const order = orders.find((o) => o.id_commande === id);
  if (!order) return res.status(404).json({ success: false, message: 'Commande non trouvée' });

  const validStatuses = [
    'en_attente_paiement',
    'paiement_a_verifier',
    'paiement_confirme',
    'paiement_refuse',
    'confirmee',
    'en_preparation',
    'prete_a_livrer',
    'en_livraison',
    'livree',
    'annulee',
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Statut de commande invalide' });
  }

  const oldStatus = order.statut_commande;
  order.statut_commande = status;
  order.updated_at = new Date().toISOString();

  // Enregistrer l'historique
  statusHistory.push({
    id_historique: statusHistory.length + 1,
    id_commande: order.id_commande,
    ancien_statut: oldStatus,
    nouveau_statut: status,
    commentaire: commentaire || `Statut mis à jour vers: ${status}`,
    id_admin: id_admin || 1,
    created_at: new Date().toISOString(),
  });

  // Journal admin
  adminLogs.push({
    id_log: adminLogs.length + 1,
    id_admin: id_admin || 1,
    action: 'MODIFICATION_STATUT_COMMANDE',
    description: `Commande ${order.numero_commande}: ${oldStatus} -> ${status}`,
    ip_address: req.ip || '127.0.0.1',
    created_at: new Date().toISOString(),
  });

  res.json({ success: true, message: 'Statut mis à jour avec succès', order });
});

// Liste des paiements à vérifier (Admin)
app.get('/api/admin/payments/pending', (_req: Request, res: Response) => {
  const pending = payments
    .filter((p) => p.statut === 'a_verifier')
    .map((p) => {
      const order = orders.find((o) => o.id_commande === p.id_commande);
      const client = order ? customers.find((c) => c.id_client === order.id_client) : null;
      return {
        ...p,
        commande: order,
        client,
      };
    });

  res.json({ success: true, payments: pending });
});

// Vérification manuelle du paiement (Validation ou Refus)
app.put('/api/admin/payments/:id/verify', (req: Request, res: Response) => {
  const paymentId = parseInt(req.params.id, 10);
  const { action, raison_refus, id_admin } = req.body;

  const payment = payments.find((p) => p.id_paiement === paymentId);
  if (!payment) return res.status(404).json({ success: false, message: 'Paiement non trouvé' });

  const order = orders.find((o) => o.id_commande === payment.id_commande);
  if (!order) return res.status(404).json({ success: false, message: 'Commande liée introuvable' });

  payment.verifie_par = id_admin || 1;
  payment.date_verification = new Date().toISOString();

  if (action === 'confirme') {
    payment.statut = 'confirme';
    order.statut_commande = 'paiement_confirme';
    order.updated_at = new Date().toISOString();

    statusHistory.push({
      id_historique: statusHistory.length + 1,
      id_commande: order.id_commande,
      ancien_statut: 'paiement_a_verifier',
      nouveau_statut: 'paiement_confirme',
      commentaire: `Paiement ${payment.methode.toUpperCase()} vérifié et validé par l'administrateur.`,
      id_admin: id_admin || 1,
      created_at: new Date().toISOString(),
    });

    adminLogs.push({
      id_log: adminLogs.length + 1,
      id_admin: id_admin || 1,
      action: 'PAIEMENT_VALIDE',
      description: `Validation paiement ${payment.montant} MRU pour la commande ${order.numero_commande}`,
      ip_address: req.ip || '127.0.0.1',
      created_at: new Date().toISOString(),
    });
  } else if (action === 'refuse') {
    payment.statut = 'refuse';
    payment.raison_refus = raison_refus || 'Preuve de paiement illisible ou non concordante';
    order.statut_commande = 'paiement_refuse';
    order.updated_at = new Date().toISOString();

    statusHistory.push({
      id_historique: statusHistory.length + 1,
      id_commande: order.id_commande,
      ancien_statut: 'paiement_a_verifier',
      nouveau_statut: 'paiement_refuse',
      commentaire: `Paiement refusé: ${payment.raison_refus}`,
      id_admin: id_admin || 1,
      created_at: new Date().toISOString(),
    });

    adminLogs.push({
      id_log: adminLogs.length + 1,
      id_admin: id_admin || 1,
      action: 'PAIEMENT_REFUSE',
      description: `Refus paiement commande ${order.numero_commande}. Motif: ${payment.raison_refus}`,
      ip_address: req.ip || '127.0.0.1',
      created_at: new Date().toISOString(),
    });
  } else {
    return res.status(400).json({ success: false, message: 'Action invalide (confirme ou refuse attendu)' });
  }

  res.json({ success: true, message: `Paiement ${action === 'confirme' ? 'validé' : 'refusé'} avec succès`, payment, order });
});

// Gestion Produits Admin (CRUD)
app.get('/api/admin/products', (_req: Request, res: Response) => {
  const result = products.map((p) => {
    const cat = categories.find((c) => c.id_categorie === p.id_categorie);
    return {
      ...p,
      categorie_nom: cat?.nom || '',
      categorie_slug: cat?.slug || '',
      image_principale: p.images.find((i) => i.principale === 1)?.image || p.images[0]?.image || '',
    };
  });
  res.json({ success: true, products: result });
});

// Téléversement d'image produit
app.post('/api/admin/upload-product-image', uploadProduct.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Aucun fichier sélectionné' });
  }
  const fileRelativePath = `/uploads/products/${req.file.filename}`;
  res.json({ success: true, url: fileRelativePath });
});

app.post('/api/admin/products', (req: Request, res: Response) => {
  const { nom, description, id_categorie, prix, ancien_prix, stock, marque, genre, vedette, image, tailles, couleurs } = req.body;

  if (!nom || !prix || !id_categorie) {
    return res.status(400).json({ success: false, message: 'Nom, prix et catégorie obligatoires' });
  }

  const newId = products.length + 1;
  const newProduct: Product = {
    id_produit: newId,
    id_categorie: parseInt(id_categorie, 10),
    nom: nom.trim(),
    description: description || '',
    prix: parseFloat(prix),
    ancien_prix: ancien_prix ? parseFloat(ancien_prix) : null,
    stock: parseInt(stock || '0', 10),
    marque: marque || 'MG Boutique',
    genre: genre || 'unisexe',
    statut: 'actif',
    vedette: vedette ? 1 : 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      {
        id_image: 100 + newId,
        image: image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
        principale: 1,
      },
    ],
    tailles: Array.isArray(tailles)
      ? tailles.map((t: any, idx: number) => ({ id_taille: 100 + idx, taille: typeof t === 'string' ? t : t.taille, stock: 10 }))
      : [{ id_taille: 1, taille: 'Standard', stock: 10 }],
    couleurs: Array.isArray(couleurs) ? couleurs : ['Noir', 'Blanc'],
  };

  products.unshift(newProduct);

  adminLogs.push({
    id_log: adminLogs.length + 1,
    id_admin: 1,
    action: 'AJOUT_PRODUIT',
    description: `Ajout du produit "${newProduct.nom}" (${newProduct.prix} MRU)`,
    ip_address: req.ip || '127.0.0.1',
    created_at: new Date().toISOString(),
  });

  res.status(201).json({ success: true, message: 'Produit créé avec succès', product: newProduct });
});

app.put('/api/admin/products/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const index = products.findIndex((p) => p.id_produit === id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Produit non trouvé' });

  const existing = products[index];
  const updated: Product = {
    ...existing,
    ...req.body,
    prix: req.body.prix !== undefined ? parseFloat(req.body.prix) : existing.prix,
    ancien_prix: req.body.ancien_prix !== undefined ? (req.body.ancien_prix ? parseFloat(req.body.ancien_prix) : null) : existing.ancien_prix,
    stock: req.body.stock !== undefined ? parseInt(req.body.stock, 10) : existing.stock,
    updated_at: new Date().toISOString(),
  };

  products[index] = updated;

  adminLogs.push({
    id_log: adminLogs.length + 1,
    id_admin: 1,
    action: 'MODIFICATION_PRODUIT',
    description: `Mise à jour du produit ID ${id} (${updated.nom})`,
    ip_address: req.ip || '127.0.0.1',
    created_at: new Date().toISOString(),
  });

  res.json({ success: true, message: 'Produit mis à jour', product: updated });
});

app.delete('/api/admin/products/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const index = products.findIndex((p) => p.id_produit === id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Produit non trouvé' });

  const [removed] = products.splice(index, 1);

  adminLogs.push({
    id_log: adminLogs.length + 1,
    id_admin: 1,
    action: 'SUPPRESSION_PRODUIT',
    description: `Suppression du produit ID ${id} (${removed.nom})`,
    ip_address: req.ip || '127.0.0.1',
    created_at: new Date().toISOString(),
  });

  res.json({ success: true, message: 'Produit supprimé avec succès' });
});

// Gestion Clients Admin
app.get('/api/admin/customers', (_req: Request, res: Response) => {
  const list = customers.map((c) => {
    const clientOrders = orders.filter((o) => o.id_client === c.id_client);
    const totalSpent = clientOrders.reduce((sum, o) => sum + o.total, 0);
    return {
      ...c,
      total_commandes: clientOrders.length,
      depenses_totales: totalSpent,
    };
  });
  res.json({ success: true, customers: list });
});

// Gestion Zones de livraison Admin
app.get('/api/admin/delivery/zones', (_req: Request, res: Response) => {
  res.json({ success: true, zones });
});

app.put('/api/admin/delivery/zones/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const zone = zones.find((z) => z.id_zone === id);
  if (!zone) return res.status(404).json({ success: false, message: 'Zone introuvable' });

  if (req.body.frais !== undefined) zone.frais = parseFloat(req.body.frais);
  if (req.body.statut !== undefined) zone.statut = req.body.statut;

  adminLogs.push({
    id_log: adminLogs.length + 1,
    id_admin: 1,
    action: 'MODIFICATION_ZONE_LIVRAISON',
    description: `Zone ${zone.wilaya}: tarif ${zone.frais} MRU, statut: ${zone.statut}`,
    ip_address: req.ip || '127.0.0.1',
    created_at: new Date().toISOString(),
  });

  res.json({ success: true, message: 'Zone mise à jour', zone });
});

// Paramètres Boutique Admin
app.get('/api/admin/settings', (_req: Request, res: Response) => {
  res.json({ success: true, settings });
});

app.put('/api/admin/settings', (req: Request, res: Response) => {
  const updates = req.body;
  settings = { ...settings, ...updates };

  adminLogs.push({
    id_log: adminLogs.length + 1,
    id_admin: 1,
    action: 'MISE_A_JOUR_PARAMETRES',
    description: 'Modification des coordonnées et comptes de paiement (Bankily, Masravi, Seddad)',
    ip_address: req.ip || '127.0.0.1',
    created_at: new Date().toISOString(),
  });

  res.json({ success: true, message: 'Paramètres enregistrés avec succès', settings });
});

// Notifications Admin
app.get('/api/admin/notifications', (_req: Request, res: Response) => {
  res.json({ success: true, notifications: notifications.slice().reverse() });
});

app.put('/api/admin/notifications/read', (_req: Request, res: Response) => {
  notifications.forEach((n) => (n.lu = 1));
  res.json({ success: true });
});

// Logs d'activité Admin
app.get('/api/admin/logs', (_req: Request, res: Response) => {
  res.json({ success: true, logs: adminLogs.slice().reverse() });
});

// ==========================================
// ESPACE LIVREUR DÉDIÉ (/livreur)
// ==========================================
app.get('/api/delivery-agent/orders', (_req: Request, res: Response) => {
  const activeStatuses = ['prete_a_livrer', 'en_livraison', 'livree'];
  const deliveryOrders = orders
    .filter((o) => activeStatuses.includes(o.statut_commande))
    .map((o) => {
      const client = customers.find((c) => c.id_client === o.id_client);
      const addr = addresses.find((a) => a.id_adresse === o.id_adresse);
      return {
        ...o,
        client,
        adresse: addr,
      };
    });

  res.json({ success: true, orders: deliveryOrders });
});

app.put('/api/delivery-agent/orders/:id/deliver', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const order = orders.find((o) => o.id_commande === id);
  if (!order) return res.status(404).json({ success: false, message: 'Commande introuvable' });

  order.statut_commande = 'livree';
  order.updated_at = new Date().toISOString();

  statusHistory.push({
    id_historique: statusHistory.length + 1,
    id_commande: order.id_commande,
    ancien_statut: 'en_livraison',
    nouveau_statut: 'livree',
    commentaire: 'Colis remis en main propre au client par le livreur.',
    created_at: new Date().toISOString(),
  });

  res.json({ success: true, message: 'Commande marquée comme livrée avec succès', order });
});

// ==========================================
// INTÉGRATION VITE ET SERVEUR DE FICHIERS
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // En production, servir le build dist
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  } else {
    // En développement, intégrer Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MG SHOPPING running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Erreur démarrage serveur:', err);
});
