<?php
require 'config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['email']);
    $password = $_POST['password'];

    $user = db_get_row("SELECT * FROM users WHERE email = :e", [':e' => $email]);

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_type'] = $user['type'];
        $_SESSION['verified'] = $user['verified'];

        if ($user['type'] === 'admin') {
            header("Location: admin.html");
        } elseif ($user['type'] === 'seller') {
            header("Location: seller-dashboard.php");
        } else {
            header("Location: dashboard.html");
        }
        exit;
    } else {
        echo "<h3 style='color:red;text-align:center;margin-top:50px;'>Invalid email or password. <a href='index.html'>Back</a></h3>";
    }
}
?>