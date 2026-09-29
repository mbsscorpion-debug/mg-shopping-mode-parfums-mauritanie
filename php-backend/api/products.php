<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $id = (int)$_GET['id'];
        $stmt = $conn->prepare("
            SELECT p.*, c.nom AS categorie_nom, c.slug AS categorie_slug
            FROM products p
            LEFT JOIN categories c ON p.id_categorie = c.id_categorie
            WHERE p.id_produit = ? AND p.statut = 'actif'
        ");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $product = $result->fetch_assoc();

        if (!$product) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Produit non trouvé']);
            exit();
        }

        // Récupérer les images
        $stmtImg = $conn->prepare("SELECT id_image, image, principale FROM product_images WHERE id_produit = ? ORDER BY principale DESC, id_image ASC");
        $stmtImg->bind_param("i", $id);
        $stmtImg->execute();
        $imagesRes = $stmtImg->get_result();
        $images = [];
        while ($row = $imagesRes->fetch_assoc()) {
            $images[] = $row;
        }
        $product['images'] = $images;

        // Récupérer les tailles
        $stmtSizes = $conn->prepare("SELECT id_taille, taille, stock FROM product_sizes WHERE id_produit = ?");
        $stmtSizes->bind_param("i", $id);
        $stmtSizes->execute();
        $sizesRes = $stmtSizes->get_result();
        $sizes = [];
        while ($row = $sizesRes->fetch_assoc()) {
            $sizes[] = $row;
        }
        $product['tailles'] = $sizes;

        // Récupérer les couleurs
        $stmtCols = $conn->prepare("SELECT id_couleur, couleur FROM product_colors WHERE id_produit = ?");
        $stmtCols->bind_param("i", $id);
        $stmtCols->execute();
        $colsRes = $stmtCols->get_result();
        $colors = [];
        while ($row = $colsRes->fetch_assoc()) {
            $colors[] = $row['couleur'];
        }
        $product['couleurs'] = $colors;

        echo json_encode(['success' => true, 'product' => $product]);
        exit();
    }

    // Liste filtrée
    $conditions = ["p.statut = 'actif'"];
    $params = [];
    $types = "";

    if (!empty($_GET['category'])) {
        $conditions[] = "c.slug = ?";
        $params[] = $_GET['category'];
        $types .= "s";
    }
    if (!empty($_GET['genre'])) {
        $conditions[] = "(p.genre = ? OR p.genre = 'unisexe')";
        $params[] = $_GET['genre'];
        $types .= "s";
    }
    if (!empty($_GET['q'])) {
        $conditions[] = "(p.nom LIKE ? OR p.description LIKE ? OR p.marque LIKE ?)";
        $search = "%" . $_GET['q'] . "%";
        $params[] = $search;
        $params[] = $search;
        $params[] = $search;
        $types .= "sss";
    }

    $whereSql = implode(" AND ", $conditions);
    $sql = "
        SELECT p.*, c.nom AS categorie_nom, c.slug AS categorie_slug,
               (SELECT image FROM product_images pi WHERE pi.id_produit = p.id_produit ORDER BY pi.principale DESC, pi.id_image ASC LIMIT 1) as image_principale
        FROM products p
        LEFT JOIN categories c ON p.id_categorie = c.id_categorie
        WHERE {$whereSql}
        ORDER BY p.vedette DESC, p.id_produit DESC
    ";

    $stmt = $conn->prepare($sql);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    $products = [];
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }

    echo json_encode(['success' => true, 'products' => $products]);
}
?>
