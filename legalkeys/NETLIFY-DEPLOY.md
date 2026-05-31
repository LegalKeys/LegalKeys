# LegalKeys — Netlify Deployment Guide

## Overview
This version of LegalKeys is converted to run on Netlify (free tier).
- Static HTML files are served directly by Netlify's CDN
- PHP replaced with Netlify Functions (Node.js serverless)
- SQLite replaced with Supabase (free tier Postgres database)

---

## STEP 1 — Create a Supabase Project (free)

1. Go to https://supabase.com and sign up
2. Create a new project (any name, e.g. "legalkeys")
3. Once created, go to Project Settings → API and copy:
   - Project URL → this is your SUPABASE_URL
   - service_role key (under "Project API Keys") → this is your SUPABASE_SERVICE_KEY
4. Go to the SQL Editor and run this to create your tables:

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'buyer',
  company_name TEXT,
  company_number TEXT,
  vat_number TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  seller_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  platform TEXT NOT NULL,
  description TEXT,
  verified BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  buyer_id UUID REFERENCES users(id),
  product_id BIGINT REFERENCES products(id),
  total NUMERIC(10,2) NOT NULL,
  vat_amount NUMERIC(10,2) DEFAULT 0,
  key_code TEXT,
  status TEXT DEFAULT 'pending_payment',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Default admin (password: admin123 — CHANGE IMMEDIATELY)
INSERT INTO users (name, email, password_hash, type, verified)
VALUES ('Admin', 'admin@legalkeys.to', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uHV/WAlnm', 'admin', true);

---

## STEP 2 — Deploy to Netlify

Option A — Drag & Drop (quickest):
1. Go to https://app.netlify.com
2. Click "Add new site" → "Deploy manually"
3. Drag the entire legalkeys folder onto the drop zone
4. Netlify detects netlify.toml and configures automatically

Option B — GitHub (recommended):
1. Push this folder to a GitHub repo
2. In Netlify: "Add new site" → "Import from Git"
3. Connect GitHub and select the repo

---

## STEP 3 — Add Environment Variables

In Netlify: Site → Site Configuration → Environment Variables → Add variable

  SUPABASE_URL         = your Supabase project URL
  SUPABASE_SERVICE_KEY = your Supabase service_role key

After adding variables, trigger a redeploy (Deploys → Trigger deploy).

---

## STEP 4 — Connect Your Domain

1. Netlify: Domain management → Add custom domain → legalkeys.to
2. Update nameservers at your domain registrar to Netlify's
3. Free SSL is provisioned automatically (up to 24 hours)

---

## STEP 5 — Test Everything

[ ] Homepage loads
[ ] Register (buyer account)
[ ] Login works and redirects correctly
[ ] Logout clears session
[ ] Checkout page loads
[ ] Legal pages load (Terms, Privacy, Copyright, VAT)
[ ] About/Contact page loads
[ ] Mobile menu works

---

## FILES OVERVIEW

  index.html                     Homepage
  checkout.html                  Checkout page
  sell.html                      Seller application
  about.html                     About & Contact
  admin.html                     Admin panel
  success.html                   Post-purchase success (NEW - replaces success.php)
  logo.png                       Site logo
  netlify.toml                   Netlify config & redirects (NEW)
  Legal/                         Legal pages
  netlify/functions/             Serverless backend (NEW - replaces all PHP)
    login.js                     Handles login (was login.php)
    register.js                  Handles registration (was register.php)
    logout.js                    Clears session (was logout.php)
    process-payment.js           Records orders (was process-payment.php)
    add-product.js               Seller submissions (was add-product.php)
    shared/db.js                 Supabase client & session helpers
    package.json                 npm dependencies (auto-installed by Netlify)

---

## FILES TO DELETE (no longer needed)

  config.php, setup.php, login.php, register.php, logout.php
  process-payment.php, add-product.php, success.php
  .htaccess, database.db, .DS_Store, UPLOAD-INSTRUCTIONS.txt

---

## THINGS TO DO AFTER GOING LIVE

1. Change admin password via Supabase dashboard
2. Integrate Stripe in netlify/functions/process-payment.js
3. Replace placeholder key 'ABCD-1234-WXYZ-5678' with real key delivery
4. Update contact email in about.html
5. Add real products via Supabase dashboard
6. Register with ICO for GDPR: https://ico.org.uk (free for sole traders under £36/year)
