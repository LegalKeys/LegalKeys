<?php
session_start();

// CONNECT TO DATABASE FILE
try {
    $db = new SQLite3(__DIR__ . '/database.db');
} catch (Exception $e) {
    die("Database error: " . $e->getMessage());
}

// HELPER FUNCTION TO RUN QUERIES
function db_query($sql, $params = []) {
    global $db;
    $stmt = $db->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    return $stmt->execute();
}

// GET SINGLE ROW
function db_get_row($sql, $params = []) {
    global $db;
    $stmt = $db->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $result = $stmt->execute();
    return $result->fetchArray(SQLITE3_ASSOC);
}

// CHECK IF USER IS LOGGED IN
function is_logged_in() {
    return isset($_SESSION['user_id']);
}

// CHECK IF USER IS ADMIN
function is_admin() {
    return isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'admin';
}
?>