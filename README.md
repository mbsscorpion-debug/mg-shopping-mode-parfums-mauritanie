# MG SHOPPING — Plateforme E-Commerce en Mauritanie

Bienvenue sur le projet **MG SHOPPING**, l'application web e-commerce moderne, élégante et complète conçue pour le marché mauritanien.

L'application intègre :
- **Catalogue complet** : Vêtements Homme & Femme, Chaussures, Parfums d'exception, Montres, Lunettes et Maroquinerie.
- **Commande sans compte obligatoire** : Expérience fluide pour tous les clients.
- **Paiements Mobiles Mauritaniens** : Prise en charge de **Bankily (BPM)**, **Masravi (Chinguitti Bank)** et **Seddad (BMS)** avec téléversement et audit de capture d'écran.
- **Livraison Géolocalisée dans les 15 Wilayas** : Récupération des coordonnées GPS par l'API Geolocation du navigateur, calcul automatique des frais de port configurés en base de données.
- **Suivi de Commande en Temps Réel** : Timeline détaillée à 7 étapes (`/suivi-commande`).
- **Administration Sécurisée** : Dashboard interactif avec graphiques **Chart.js**, validation/refus des captures de paiement, gestion des stocks/tailles/couleurs, paramétrage des comptes bancaires et logs d'audit.
- **Espace Livreur Dédié** : Interface mobile (`/livreur`) avec appel direct, contact WhatsApp et itinéraire Google Maps.

---

## 🛠️ Stack Technique

- **Frontend** : React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Chart.js.
- **Backend Node.js** : Express REST API, Multer (stockage sécurisé des captures de paiement dans `uploads/payment_proofs/`), Bcrypt.
- **Backend PHP & MySQLi** : Couche d'accès `mysqli_prepare`, `bind_param` et `execute` prête pour XAMPP.
- **Base de Données** : MySQL / MariaDB (`mg_shopping`).

---

## 🚀 Guide d'Installation XAMPP + MySQL/MariaDB

### Étape 1 : Installer et Lancer XAMPP
1. Téléchargez et installez **XAMPP** pour Windows, macOS ou Linux depuis [apachefriends.org](https://www.apachefriends.org/).
2. Lancez le **XAMPP Control Panel**.
3. Démarrez les modules **Apache** et **MySQL**.

### Étape 2 : Créer la Base de Données dans phpMyAdmin
1. Ouvrez votre navigateur et accédez à [http://localhost/phpmyadmin](http://localhost/phpmyadmin).
2. Cliquez sur **Nouvelle base de données**.
3. Nommez-la : `mg_shopping`.
4. Sélectionnez l'interclassement : `utf8mb4_unicode_ci`.
5. Cliquez sur **Créer**.

### Étape 3 : Importer le Schéma et les Données (Seed)
1. Sélectionnez la base `mg_shopping` dans phpMyAdmin.
2. Cliquez sur l'onglet **Importer**.
3. Choisissez le fichier `database/database.sql` situé dans ce projet et cliquez sur **Exécuter**.
4. Répétez l'opération avec le fichier `database/seed.sql` pour charger les produits de démonstration, les wilayas et le compte administrateur.

### Étape 4 : Configuration MySQLi
Vérifiez ou adaptez les paramètres dans `config/database.php` ou votre fichier `.env` :
```php
$host = "localhost";
$user = "root";
$password = "";
$database = "mg_shopping";
```

### Étape 5 : Lancer l'Application
Dans le terminal du projet :
```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer le serveur full-stack de développement (Port 3000)
npm run dev

# 3. Accéder à l'application
# Ouvrez votre navigateur sur http://localhost:3000
```

---

## 🔐 Identifiants Administrateur de Test

- **URL de Connexion** : `http://localhost:3000` (Menu > Espace Administration ou onglet Admin)
- **Email** : `admin@mgshopping.mr`
- **Mot de passe** : `admin123`

---

## 📱 Déroulement d'un Achat et Flux de Paiement

1. Le client ajoute des articles au panier (choix de taille et couleur).
2. Au checkout, le client saisit son nom, téléphone et sélectionne sa wilaya parmi les 15 wilayas mauritaniennes.
3. Il clique sur **Partager ma localisation** pour enregistrer sa position GPS précise.
4. Il choisit son moyen de paiement :
   - **Bankily** : Affiche le numéro et nom du bénéficiaire configurés par l'admin.
   - **Masravi** : Affiche le numéro et nom du bénéficiaire.
   - **Seddad** : Affiche le numéro et nom du bénéficiaire.
5. Le client effectue son virement puis téléverse la capture d'écran du reçu.
6. La commande est immédiatement enregistrée avec un numéro unique (ex : `MG-2026-000001`).
7. L'administrateur reçoit une alerte dans l'onglet **Paiements à vérifier**, inspecte la capture et clique sur **Confirmer le paiement** ou **Refuser** avec motif.
8. Dès confirmation, la commande passe en préparation puis en livraison.
9. Le livreur consulte la commande dans l'**Espace Livreur**, ouvre l'itinéraire Google Maps et marque la commande comme **Livrée**.
