<?php
require 'config.php';
if (!is_logged_in()) { header("Location: index.html"); exit; }

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $product_id = intval($_POST['product_id'] ?? 1);
    $total = floatval($_POST['total'] ?? 0);
    // LegalKeys is not VAT registered — no VAT calculated or charged

    db_query(
        "INSERT INTO orders (buyer_id, product_id, total, vat_amount, key_code)
         VALUES (:bid, :pid, :t, :v, :k)",
        [
            ':bid' => $_SESSION['user_id'],
            ':pid' => $product_id,
            ':t'   => $total,
            ':v'   => 0,
            ':k'   => 'ABCD-1234-WXYZ-5678' // Replace with real key lookup
        ]
    );

    header("Location: success.php");
    exit;
}
?>