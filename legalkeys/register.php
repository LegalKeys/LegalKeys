<?php
require 'config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = trim($_POST['name']);
    $email = trim($_POST['email']);
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $type = $_POST['type'];
    
    $company = ($type === 'seller') ? trim($_POST['company_name']) : null;
    $comp_num = ($type === 'seller') ? trim($_POST['company_number']) : null;
    $vat = ($type === 'seller') ? trim($_POST['vat_number']) : null;

    try {
        db_query(
            "INSERT INTO users (name, email, password, type, company_name, company_number, vat_number) 
             VALUES (:name, :email, :pass, :type, :company, :comp_num, :vat)",
            [
                ':name' => $name, ':email' => $email, ':pass' => $password, ':type' => $type,
                ':company' => $company, ':comp_num' => $comp_num, ':vat' => $vat
            ]
        );
        header("Location: index.html?success=1");
        exit;
    } catch (Exception $e) {
        echo "Error: Email already exists or invalid data.";
    }
}
?>