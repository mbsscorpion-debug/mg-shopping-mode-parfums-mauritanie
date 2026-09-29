-- ========================================================
-- MG SHOPPING - DONNÉES DE DÉMONSTRATION (SEED)
-- ========================================================

USE `mg_shopping`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. ADMINISTRATEUR DE TEST (Mot de passe: admin123)
-- Hash bcrypt standard pour 'admin123'
INSERT INTO `admins` (`id_admin`, `nom`, `email`, `telephone`, `password`, `role`, `statut`) VALUES
(1, 'Administrateur Principal', 'admin@mgshopping.mr', '+222 45 25 00 00', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'super_admin', 'actif');

-- 2. PARAMÈTRES BOUTIQUE
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('shop_name', 'MG SHOPPING'),
('shop_phone', '+222 22 24 93 77'),
('shop_whatsapp', '+222 22 24 93 77'),
('shop_email', 'contact@mgshopping.mr'),
('bankily_number', '22 24 93 77'),
('bankily_name', 'MG SHOPPING SARL'),
('masravi_number', '22 24 93 77'),
('masravi_name', 'MG SHOPPING MAURITANIE'),
('seddad_number', '22 24 93 77'),
('seddad_name', 'MG SHOPPING HOLDING'),
('shop_address', 'Avenue Charles de Gaulle, Tevragh Zeina, Nouakchott, Mauritanie'),
('currency', 'MRU');

-- 3. ZONES DE LIVRAISON MAURITANIE (15 Wilayas)
INSERT INTO `delivery_zones` (`id_zone`, `wilaya`, `commune`, `frais`, `statut`) VALUES
(1, 'Nouakchott Ouest', 'Tevragh Zeina, Ksar, Sebkha', 100.00, 'active'),
(2, 'Nouakchott Nord', 'Dar Naim, Teyarett, Toujounine', 150.00, 'active'),
(3, 'Nouakchott Sud', 'Arafat, El Mina, Riyad', 150.00, 'active'),
(4, 'Dakhlet Nouadhibou', 'Nouadhibou Centre, Cansado', 300.00, 'active'),
(5, 'Trarza', 'Rosso, Mederdra, Boutilimit', 250.00, 'active'),
(6, 'Brakna', 'Aleg, Boghé, Maghta Lahjar', 350.00, 'active'),
(7, 'Gorgol', 'Kaédi, M\'Bout, Monguel', 400.00, 'active'),
(8, 'Assaba', 'Kiffa, Guerou, Kankossa', 400.00, 'active'),
(9, 'Guidimakha', 'Sélibaby, Ould Yengé', 450.00, 'active'),
(10, 'Hodh El Gharbi', 'Aioun, Tintane, Kobenni', 500.00, 'active'),
(11, 'Hodh Ech Chargui', 'Néma, Timbedra, Bassikounou', 550.00, 'active'),
(12, 'Tagant', 'Tidjikja, Moudjeria, Tichit', 400.00, 'active'),
(13, 'Adrar', 'Atar, Chinguetti, Ouadane', 350.00, 'active'),
(14, 'Inchiri', 'Akjoujt, Benichab', 250.00, 'active'),
(15, 'Tiris Zemmour', 'Zouérat, F\'Derick, Bir Moghrein', 450.00, 'active');

-- 4. CATÉGORIES
INSERT INTO `categories` (`id_categorie`, `nom`, `slug`, `description`, `image`, `statut`) VALUES
(1, 'Homme', 'homme', 'Prêt-à-porter masculin élégant, t-shirts, chemises, vestes et pantalons modernes.', 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80', 'active'),
(2, 'Femme', 'femme', 'Collection féminine haute couture, robes raffinées, abayas et tenues contemporaines.', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80', 'active'),
(3, 'Parfums', 'parfums', 'Fragrances d\'exception orientales et occidentales, notes d\'oud, ambre et jasmin.', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80', 'active'),
(4, 'Chaussures', 'chaussures', 'Souliers en cuir véritable, mocassins, escarpins de soirée et sneakers élégantes.', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80', 'active'),
(5, 'Accessoires', 'accessoires', 'Montres de prestige, lunettes solaires UV400, maroquinerie fine et ceintures.', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', 'active');

-- 5. PRODUITS
INSERT INTO `products` (`id_produit`, `id_categorie`, `nom`, `description`, `prix`, `ancien_prix`, `stock`, `marque`, `genre`, `statut`, `vedette`) VALUES
(1, 1, 'T-Shirt Coton Pima Noir MG Prestige', 'T-shirt de luxe en 100% coton Pima mercerisé ultra doux. Coupe ajustée moderne avec broderie discrète MG dorée sur la poitrine.', 1400.00, 1800.00, 35, 'MG Prestige', 'homme', 'actif', 1),
(2, 1, 'Chemise Oxford Slim Fit Blanche', 'Chemise habillée en popeline de coton égyptien respirant, idéale pour cérémonies et travail. Boutons nacre gravés.', 2200.00, 2600.00, 24, 'MG Tailor', 'homme', 'actif', 1),
(3, 1, 'Pantalon Chino Élastique Beige Sable', 'Chino coupe moderne confectionné en sergé de coton avec touche d\'élasthanne pour un confort incomparable dans le climat mauritanien.', 1900.00, NULL, 18, 'MG Casual', 'homme', 'actif', 0),
(4, 1, 'Blazer Cérémonie Noir Bouton Doré', 'Veste de costume masculine cintrée deux boutons. Tissu infroissable premium avec doublure en satin soyeux.', 5900.00, 7200.00, 10, 'MG Couture', 'homme', 'actif', 1),

(5, 2, 'Robe de Soirée Satin Émeraude', 'Somptueuse robe longue fluide en satin duchesse vert émeraude avec drapé flatteur et finitions cousues main.', 4500.00, 5800.00, 12, 'MG Collection', 'femme', 'actif', 1),
(6, 2, 'Abaya Dubaï Soie de Médine Broderie Dorée', 'Abaya chic confectionnée en pure soie de Médine infroissable avec liserés brodés or et boutons pression invisibles.', 3800.00, 4400.00, 15, 'MG Orient', 'femme', 'actif', 1),
(7, 2, 'Ensemble Deux Pièces Plissé Beige', 'Ensemble chemisier ample et pantalon palazzo plissé ultra léger et opaque. Idéal pour sorties et réceptions.', 2800.00, 3200.00, 20, 'MG Paris', 'femme', 'actif', 0),

(8, 3, 'Extrait de Parfum Oud Royal MG - 100ml', 'Fragrance orientale envoûtante associant l\'Oud du Cambodge rare, l\'Ambre gris, la Vanille de Madagascar et une pointe de Safran.', 3200.00, 3900.00, 40, 'MG Parfums', 'homme', 'actif', 1),
(9, 3, 'Eau de Parfum Fleur de Jasmin Noir - 100ml', 'Parfum féminin magnétique mêlant Jasmin Sambac, Tubéreuse blanche, Fleur d\'oranger et Bois de Santal crémeux.', 2900.00, 3500.00, 32, 'MG Parfums', 'femme', 'actif', 1),
(10, 3, 'Parfum Ambre Impérial Suprême - 100ml', 'Parfum unisexe chaleureux et boisé à la tenue exceptionnelle de 48h. Notes de cuir raffiné, bergamote et musc blanc.', 3400.00, 4200.00, 28, 'MG Parfums', 'unisexe', 'actif', 1),

(11, 4, 'Mocassins Richelieu Cuir Pleine Fleur', 'Souliers pour homme en cuir italien patiné à la main avec semelle cousue Goodyear respirante et antidérapante.', 4800.00, 5600.00, 14, 'MG Shoes', 'homme', 'actif', 1),
(12, 4, 'Escarpins Soirée Cuir Doré Vernis', 'Escarpins féminins à talon confortable de 7cm, cuir or métallique éclatant pour mariages et soirées.', 3600.00, 4200.00, 16, 'MG Shoes', 'femme', 'actif', 1),

(13, 5, 'Montre Chronographe Or & Noir MG Master', 'Montre de précision à mouvement automatique japonais, cadran squelette noir et boîtier acier inoxydable plaqué or 18k.', 6500.00, 7900.00, 8, 'MG Timepieces', 'homme', 'actif', 1),
(14, 5, 'Sac Cabas Cuir Grainé Fermoir Doré', 'Sac à main structuré en cuir d\'Italie véritable avec bandoulière amovible et poches intérieures zippées sécurisées.', 4200.00, 4900.00, 11, 'MG Leather', 'femme', 'actif', 1),
(15, 5, 'Lunettes de Soleil Aviator Polarized UV400', 'Monture métallique légère dorée avec verres polarisés anti-éblouissement haute définition conçus pour le fort ensoleillement.', 1600.00, 2100.00, 25, 'MG Optics', 'unisexe', 'actif', 1);

-- 6. IMAGES DES PRODUITS
INSERT INTO `product_images` (`id_produit`, `image`, `principale`) VALUES
(1, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80', 1),
(1, 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80', 0),
(2, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80', 1),
(3, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80', 1),
(4, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80', 1),
(5, 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80', 1),
(6, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80', 1),
(7, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80', 1),
(8, 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80', 1),
(9, 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80', 1),
(10, 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80', 1),
(11, 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80', 1),
(12, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80', 1),
(13, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80', 1),
(14, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80', 1),
(15, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80', 1);

-- 7. TAILLES DES PRODUITS
INSERT INTO `product_sizes` (`id_produit`, `taille`, `stock`) VALUES
(1, 'S', 8), (1, 'M', 12), (1, 'L', 10), (1, 'XL', 5),
(2, 'M', 6), (2, 'L', 10), (2, 'XL', 8),
(3, '30', 4), (3, '32', 6), (3, '34', 5), (3, '36', 3),
(4, '48', 3), (4, '50', 4), (4, '52', 3),
(5, 'S', 3), (5, 'M', 5), (5, 'L', 4),
(6, '54 (1m60)', 5), (6, '56 (1m65)', 6), (6, '58 (1m70)', 4),
(7, 'Unique', 20),
(8, '100 ml', 40),
(9, '100 ml', 32),
(10, '100 ml', 28),
(11, '41', 4), (11, '42', 5), (11, '43', 3), (11, '44', 2),
(12, '37', 5), (12, '38', 6), (12, '39', 5),
(13, 'Standard (42mm)', 8),
(14, 'Grand Format', 11),
(15, 'Taille Unique', 25);

-- 8. COULEURS DES PRODUITS
INSERT INTO `product_colors` (`id_produit`, `couleur`) VALUES
(1, 'Noir Intense'), (1, 'Blanc Pur'), (1, 'Bleu Nuit'),
(2, 'Blanc'), (2, 'Bleu Ciel'),
(3, 'Beige'), (3, 'Kaki'),
(4, 'Noir Satiné'),
(5, 'Vert Émeraude'), (5, 'Bordeaux'),
(6, 'Noir & Or'), (6, 'Bleu Majorelle'),
(7, 'Beige Sable'), (7, 'Taupe'),
(8, 'Flacon Or & Noir'),
(9, 'Flacon Noir & Or Rose'),
(10, 'Flacon Cristal Ambré'),
(11, 'Brun Havane'), (11, 'Noir Brillant'),
(12, 'Doré Miroir'), (12, 'Noir Verni'),
(13, 'Or & Noir'),
(14, 'Noir Doré'), (14, 'Caramel'),
(15, 'Monture Or / Verres Noirs');

SET FOREIGN_KEY_CHECKS = 1;
