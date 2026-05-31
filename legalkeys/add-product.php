<?php
require 'config.php';
if (!is_logged_in() || $_SESSION['user_type'] !== 'seller') { header("Location: index.html"); exit; }

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    db_query(
        "INSERT INTO products (seller_id, title, description, price, platform, region, stock) 
         VALUES (:sid, :t, :d, :p, :pf, :r, :s)",
        [
            ':sid' => $_SESSION['user_id'],
            ':t' => $_POST['title'],
            ':d' => $_POST['description'],
            ':p' => $_POST['price'],
            ':pf' => $_POST['platform'],
            ':r' => $_POST['region'],
            ':s' => $_POST['stock']
        ]
    );
    echo "<div style='text-align:center;margin-top:50px;'><h3>✅ Product submitted! Waiting for admin verification.</h3><a href='index.html'>Back</a></div>";
}
?>