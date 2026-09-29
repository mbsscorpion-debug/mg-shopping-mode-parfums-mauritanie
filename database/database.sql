-- ========================================================
-- MG SHOPPING - BASE DE DONNÉES MYSQL / MARIADB
-- Structure complète des tables
-- ========================================================

CREATE DATABASE IF NOT EXISTS `mg_shopping`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `mg_shopping`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. TABLE ADMINS
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
    `id_admin` INT AUTO_INCREMENT PRIMARY KEY,
    `nom` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `telephone` VARCHAR(30),
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('super_admin','admin') DEFAULT 'admin',
    `statut` ENUM('actif','inactif') DEFAULT 'actif',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABLE CATEGORIES
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
    `id_categorie` INT AUTO_INCREMENT PRIMARY KEY,
    `nom` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `image` VARCHAR(255),
    `statut` ENUM('active','inactive') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABLE PRODUCTS
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
    `id_produit` INT AUTO_INCREMENT PRIMARY KEY,
    `id_categorie` INT NOT NULL,
    `nom` VARCHAR(200) NOT NULL,
    `description` TEXT,
    `prix` DECIMAL(12,2) NOT NULL,
    `ancien_prix` DECIMAL(12,2) DEFAULT NULL,
    `stock` INT DEFAULT 0,
    `marque` VARCHAR(100),
    `genre` ENUM('homme','femme','unisexe') DEFAULT 'unisexe',
    `statut` ENUM('actif','inactif') DEFAULT 'actif',
    `vedette` TINYINT(1) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (`id_categorie`)
    REFERENCES `categories`(`id_categorie`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABLE PRODUCT_IMAGES
DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images` (
    `id_image` INT AUTO_INCREMENT PRIMARY KEY,
    `id_produit` INT NOT NULL,
    `image` VARCHAR(255) NOT NULL,
    `principale` TINYINT(1) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (`id_produit`)
    REFERENCES `products`(`id_produit`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABLE PRODUCT_SIZES
DROP TABLE IF EXISTS `product_sizes`;
CREATE TABLE `product_sizes` (
    `id_taille` INT AUTO_INCREMENT PRIMARY KEY,
    `id_produit` INT NOT NULL,
    `taille` VARCHAR(30) NOT NULL,
    `stock` INT DEFAULT 0,

    FOREIGN KEY (`id_produit`)
    REFERENCES `products`(`id_produit`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABLE PRODUCT_COLORS
DROP TABLE IF EXISTS `product_colors`;
CREATE TABLE `product_colors` (
    `id_couleur` INT AUTO_INCREMENT PRIMARY KEY,
    `id_produit` INT NOT NULL,
    `couleur` VARCHAR(50) NOT NULL,

    FOREIGN KEY (`id_produit`)
    REFERENCES `products`(`id_produit`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TABLE CUSTOMERS
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
    `id_client` INT AUTO_INCREMENT PRIMARY KEY,
    `nom_complet` VARCHAR(150) NOT NULL,
    `telephone` VARCHAR(30) NOT NULL,
    `whatsapp` VARCHAR(30),
    `email` VARCHAR(150),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. TABLE DELIVERY_ADDRESSES
DROP TABLE IF EXISTS `delivery_addresses`;
CREATE TABLE `delivery_addresses` (
    `id_adresse` INT AUTO_INCREMENT PRIMARY KEY,
    `id_client` INT NOT NULL,
    `wilaya` VARCHAR(100) NOT NULL,
    `commune` VARCHAR(100),
    `quartier` VARCHAR(150),
    `adresse` TEXT,
    `point_repere` TEXT,
    `latitude` DECIMAL(10,8),
    `longitude` DECIMAL(11,8),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (`id_client`)
    REFERENCES `customers`(`id_client`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. TABLE DELIVERY_ZONES
DROP TABLE IF EXISTS `delivery_zones`;
CREATE TABLE `delivery_zones` (
    `id_zone` INT AUTO_INCREMENT PRIMARY KEY,
    `wilaya` VARCHAR(100) NOT NULL,
    `commune` VARCHAR(100),
    `frais` DECIMAL(12,2) NOT NULL DEFAULT 0,
    `statut` ENUM('active','inactive') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. TABLE ORDERS
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
    `id_commande` INT AUTO_INCREMENT PRIMARY KEY,
    `numero_commande` VARCHAR(50) NOT NULL UNIQUE,
    `id_client` INT NOT NULL,
    `id_adresse` INT NOT NULL,
    `sous_total` DECIMAL(12,2) NOT NULL DEFAULT 0,
    `frais_livraison` DECIMAL(12,2) NOT NULL DEFAULT 0,
    `total` DECIMAL(12,2) NOT NULL DEFAULT 0,
    `statut_commande` ENUM(
        'en_attente_paiement',
        'paiement_a_verifier',
        'paiement_confirme',
        'paiement_refuse',
        'confirmee',
        'en_preparation',
        'prete_a_livrer',
        'en_livraison',
        'livree',
        'annulee'
    ) DEFAULT 'en_attente_paiement',
    `notes` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (`id_client`)
    REFERENCES `customers`(`id_client`),

    FOREIGN KEY (`id_adresse`)
    REFERENCES `delivery_addresses`(`id_adresse`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. TABLE ORDER_ITEMS
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
    `id_item` INT AUTO_INCREMENT PRIMARY KEY,
    `id_commande` INT NOT NULL,
    `id_produit` INT NOT NULL,
    `nom_produit` VARCHAR(200) NOT NULL,
    `prix_unitaire` DECIMAL(12,2) NOT NULL,
    `quantite` INT NOT NULL,
    `taille` VARCHAR(30),
    `couleur` VARCHAR(50),
    `total` DECIMAL(12,2) NOT NULL,

    FOREIGN KEY (`id_commande`)
    REFERENCES `orders`(`id_commande`)
    ON DELETE CASCADE,

    FOREIGN KEY (`id_produit`)
    REFERENCES `products`(`id_produit`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. TABLE PAYMENTS
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
    `id_paiement` INT AUTO_INCREMENT PRIMARY KEY,
    `id_commande` INT NOT NULL,
    `methode` ENUM('bankily','masravi','seddad') NOT NULL,
    `montant` DECIMAL(12,2) NOT NULL,
    `numero_utilise` VARCHAR(50),
    `statut` ENUM('en_attente','a_verifier','confirme','refuse') DEFAULT 'en_attente',
    `raison_refus` TEXT,
    `verifie_par` INT DEFAULT NULL,
    `date_verification` DATETIME DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (`id_commande`)
    REFERENCES `orders`(`id_commande`)
    ON DELETE CASCADE,

    FOREIGN KEY (`verifie_par`)
    REFERENCES `admins`(`id_admin`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. TABLE PAYMENT_PROOFS
DROP TABLE IF EXISTS `payment_proofs`;
CREATE TABLE `payment_proofs` (
    `id_preuve` INT AUTO_INCREMENT PRIMARY KEY,
    `id_paiement` INT NOT NULL,
    `fichier` VARCHAR(255) NOT NULL,
    `nom_original` VARCHAR(255),
    `type_fichier` VARCHAR(100),
    `taille_fichier` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (`id_paiement`)
    REFERENCES `payments`(`id_paiement`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. TABLE ORDER_STATUS_HISTORY
DROP TABLE IF EXISTS `order_status_history`;
CREATE TABLE `order_status_history` (
    `id_historique` INT AUTO_INCREMENT PRIMARY KEY,
    `id_commande` INT NOT NULL,
    `ancien_statut` VARCHAR(50),
    `nouveau_statut` VARCHAR(50) NOT NULL,
    `commentaire` TEXT,
    `id_admin` INT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (`id_commande`)
    REFERENCES `orders`(`id_commande`)
    ON DELETE CASCADE,

    FOREIGN KEY (`id_admin`)
    REFERENCES `admins`(`id_admin`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. TABLE NOTIFICATIONS
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
    `id_notification` INT AUTO_INCREMENT PRIMARY KEY,
    `id_admin` INT DEFAULT NULL,
    `id_commande` INT DEFAULT NULL,
    `titre` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `lu` TINYINT(1) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (`id_admin`)
    REFERENCES `admins`(`id_admin`)
    ON DELETE CASCADE,

    FOREIGN KEY (`id_commande`)
    REFERENCES `orders`(`id_commande`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. TABLE SETTINGS
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
    `id_setting` INT AUTO_INCREMENT PRIMARY KEY,
    `setting_key` VARCHAR(100) NOT NULL UNIQUE,
    `setting_value` TEXT,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. TABLE ADMIN_LOGS
DROP TABLE IF EXISTS `admin_logs`;
CREATE TABLE `admin_logs` (
    `id_log` INT AUTO_INCREMENT PRIMARY KEY,
    `id_admin` INT NOT NULL,
    `action` VARCHAR(150) NOT NULL,
    `description` TEXT,
    `ip_address` VARCHAR(45),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (`id_admin`)
    REFERENCES `admins`(`id_admin`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
