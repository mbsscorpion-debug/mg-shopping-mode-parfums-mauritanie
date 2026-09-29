<?php
/**
 * MG SHOPPING - Connexion Base de Données MySQLi
 * Fichier de configuration standard pour XAMPP / MariaDB / MySQL
 */

// Paramètres de connexion
$host = getenv('DB_HOST') ? getenv('DB_HOST') : 'localhost';
$user = getenv('DB_USER') ? getenv('DB_USER') : 'root';
$password = getenv('DB_PASS') ? getenv('DB_PASS') : '';
$database = getenv('DB_NAME') ? getenv('DB_NAME') : 'mg_shopping';
$port = getenv('DB_PORT') ? (int)getenv('DB_PORT') : 3306;

// Initialisation de la connexion MySQLi
$conn = new mysqli(
    $host,
    $user,
    $password,
    $database,
    $port
);

// Vérification de la connexion
if ($conn->connect_error) {
    die(json_encode([
        'success' => false,
        'error' => 'Erreur de connexion MySQLi : ' . $conn->connect_error
    ]));
}

// Jeu de caractères UTF-8 mb4 pour supporter tous les caractères et accents
$conn->set_charset("utf8mb4");

// Fonctions utilitaires MySQLi standardisées
if (!function_exists('db_query')) {
    function db_query($conn, $sql, $params = [], $types = "") {
        if (empty($params)) {
            $result = $conn->query($sql);
            return $result;
        }
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            die("Erreur prepare : " . $conn->error);
        }
        if (empty($types)) {
            $types = str_repeat('s', count($params));
        }
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        return $stmt->get_result();
    }
}
?>
