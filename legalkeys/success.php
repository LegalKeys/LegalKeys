<?php require 'config.php'; ?>
<!DOCTYPE html>
<html lang="en-GB">
<head>
    <meta charset="UTF-8">
    <title>Payment Successful</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 flex items-center justify-center min-h-screen">
    <div class="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
        <div class="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center text-2xl mx-auto mb-4">✓</div>
        <h1 class="text-2xl font-bold text-success mb-2">Payment Successful!</h1>
        <p class="mb-4">Your game key is ready:</p>
        <div class="bg-gray-100 p-3 rounded font-mono text-lg mb-6">ABCD-1234-WXYZ-5678</div>
        <a href="index.html" class="bg-primary text-white px-6 py-2 rounded-lg">Back to Home</a>
    </div>
</body>
</html>