<?php
/**
 * LegalKeys — Database Setup Script
 * Run this ONCE after uploading to Namecheap.
 * Visit: https://legalkeys.to/setup.php
 * DELETE or rename this file immediately after running it.
 */

// Basic security — change this password before uploading
define('SETUP_PASSWORD', 'legalkeys-setup-2026');

if (!isset($_GET['key']) || $_GET['key'] !== SETUP_PASSWORD) {
    die('<h2 style="font-family:sans-serif;color:red;text-align:center;margin-top:100px;">Access denied. Add ?key=YOUR_PASSWORD to the URL.</h2>');
}

try {
    $db = new SQLite3(__DIR__ . '/database.db');

    // USERS TABLE
    $db->exec("CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'buyer', -- buyer, seller, admin
        company_name TEXT,
        company_number TEXT,
        utr_number TEXT,
        vat_number TEXT,
        verified INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // PRODUCTS TABLE
    $db->exec("CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        seller_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        platform TEXT NOT NULL, -- pc, ps, xbox, nintendo
        region TEXT DEFAULT 'Global',
        stock INTEGER DEFAULT 0,
        verified INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(seller_id) REFERENCES users(id)
    )");

    // ORDERS TABLE
    $db->exec("CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        buyer_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        total REAL NOT NULL,
        vat_amount REAL DEFAULT 0,
        key_code TEXT,
        status TEXT DEFAULT 'completed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(buyer_id) REFERENCES users(id),
        FOREIGN KEY(product_id) REFERENCES products(id)
    )");

    // SELLER APPLICATIONS TABLE
    $db->exec("CREATE TABLE IF NOT EXISTS seller_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT NOT NULL,
        company_number TEXT,
        utr_number TEXT,
        vat_number TEXT,
        description TEXT,
        supply_proof_path TEXT,
        status TEXT DEFAULT 'pending', -- pending, approved, rejected
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // CREATE DEFAULT ADMIN ACCOUNT
    $admin_exists = $db->querySingle("SELECT id FROM users WHERE type='admin' LIMIT 1");
    if (!$admin_exists) {
        $admin_pass = password_hash('admin123', PASSWORD_DEFAULT);
        $db->exec("INSERT INTO users (name, email, password, type, verified)
                   VALUES ('Admin', 'admin@legalkeys.to', '$admin_pass', 'admin', 1)");
        $admin_created = true;
    }

    echo '<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>body{font-family:sans-serif;max-width:600px;margin:60px auto;padding:20px;}
    .ok{color:green;} .warn{color:orange;} .box{background:#f0fff4;border:1px solid #c6f6d5;padding:20px;border-radius:8px;margin-bottom:16px;}
    .wbox{background:#fffaf0;border:1px solid #fbd38d;padding:20px;border-radius:8px;}</style></head><body>';

    echo '<h2>✅ LegalKeys Database Setup Complete</h2>';
    echo '<div class="box">';
    echo '<p class="ok">✓ Users table created</p>';
    echo '<p class="ok">✓ Products table created</p>';
    echo '<p class="ok">✓ Orders table created</p>';
    echo '<p class="ok">✓ Seller applications table created</p>';
    if (!empty($admin_created)) {
        echo '<p class="ok">✓ Admin account created</p>';
    }
    echo '</div>';

    echo '<div class="wbox">';
    echo '<h3>⚠️ Important — do these now:</h3>';
    echo '<ol>';
    echo '<li><strong>Delete setup.php</strong> from your server immediately via cPanel File Manager.</li>';
    if (!empty($admin_created)) {
        echo '<li><strong>Log in as admin</strong> at <a href="login.php">login.php</a> with:<br>Email: <code>admin@legalkeys.to</code><br>Password: <code>admin123</code><br>Then change your password immediately.</li>';
    }
    echo '<li>Make sure <strong>database.db</strong> is protected by your .htaccess file.</li>';
    echo '</ol>';
    echo '</div>';
    echo '</body></html>';

} catch (Exception $e) {
    die('<h2 style="color:red;font-family:sans-serif;text-align:center;margin-top:100px;">Setup failed: ' . htmlspecialchars($e->getMessage()) . '</h2>');
}
?>
