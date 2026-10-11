# 🛒 Bismillah Karyana & General Store Management System (MERN)

A complete, production-grade **Point of Sale (POS) + Inventory + Udhaar / Khata + Business Management System** specially tailored for neighborhood grocery and general store owners in Pakistan.

---

## 🚀 Live Servers & Access

- **Frontend (Web Application):** [http://localhost:5173](http://localhost:5173)
- **Backend API Server:** [http://localhost:5000/api](http://localhost:5000/api)
- **Database:** MongoDB (`mongodb://127.0.0.1:27017/karyana_store_db`)

### 🔑 Demo Accounts (Pre-seeded & Ready with 1-Click)

| Role | Username | Password | Full Name | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Admin / Store Owner** | `admin` | `admin123` | Muhammad Aslam (Owner) | Full access (POS, Khata, Inventory, Reports, Staff, Settings) |
| **Store Manager** | `manager` | `manager123` | Tariq Mehmood (Manager) | Sales, Inventory, Stock-in, Suppliers, Purchases, Reports |
| **Counter Cashier** | `cashier` | `cashier123` | Bilal Ahmed (Cashier) | Ultra-fast POS Billing, Customer search, Khata entry |

---

## 🌟 Implemented Phases & Features

### 🟢 Phase 1: Core Billing & Digital Khata
1. **Authentication & Roles:**
   - JWT token auth with bcrypt password security.
   - Role-based permissions: Admin, Manager, Cashier.
   - Quick one-click login switcher on the Login page for hassle-free demonstration.

2. **Interactive Dashboard:**
   - Today's sales (Rs.), today's bills count, today's real wholesale-calculated profit.
   - Inventory health: total products, low-stock alerts, out-of-stock items, near-expiry count.
   - Market Udhaar counter & wholesaler payables counter.
   - Recent sales and recent wholesaler purchases feeds.

3. **High-Speed POS / Billing Engine (`/pos`):**
   - Barcode scanner support: barcode input automatically focuses and submits on Enter.
   - Search by product name, barcode, or SKU with live category chips.
   - Cart management: increment, decrement, delete, direct discount (Rs.).
   - Payment modes: **Cash** (auto-calculates customer change to return), **Online** (JazzCash / EasyPaisa), **Udhaar** (credit ledger).
   - Instant invoice generation with **80mm thermal receipt format** and **A4 standard print support**.
   - Automatic real-time stock deduction upon every sale.

4. **Product Management (`/products`):**
   - Name, category, brand, purchase cost, retail sale price, quantity, barcode, SKU, units (Piece, Packet, Box, Bottle, Kg, Gram, Liter, Dozen), minimum stock threshold, expiry date.
   - Automatic profit margin calculations per unit.

5. **Customer Management (`/customers`):**
   - Name, phone, address/mohalla, total purchases, total credit, paid amount, remaining balance.
   - Direct jump to individual customer khata ledger.

6. **Digital Udhaar / Khata (Hero Feature - `/khata`):**
   - Total market credit debt tracker.
   - Customer selection panel with filter for pending balances only.
   - Full ledger history per customer (debit credit stream with running balance).
   - Single-click **"Record Payment (رقم وصول کریں)"** modal for quick collection entry.
   - Printable customer khata statement slip.

---

### 🔵 Phase 2: Stock Control & Supply Chain
7. **Inventory Management (`/inventory`):**
   - Real-time stock valuation: total retail value vs. wholesale cost value.
   - Low stock warning banner (e.g., Surf Excel remaining packets warning).
   - Stock adjustments: Stock-In, Stock-Out, Damaged Goods, Expired Stock.
   - Complete audit trail of all stock movements with timestamps and users.

8. **Purchase Management (`/purchases`):**
   - Record wholesaler stock deliveries with item quantities and purchase costs.
   - Automatic stock increment upon saving.
   - Tracks paid amount vs. remaining payable to wholesaler.

9. **Supplier Management (`/suppliers`):**
   - Wholesaler contact info, mandi location, company name.
   - Real-time payable debt tracking.
   - Record payments directly to suppliers to settle bills.

---

### 🟣 Phase 3: Insights, Expiry, Staff & Safety
10. **Reports & Analytics (`/reports`):**
    - Date range filtering: Today, Yesterday, Last 7 Days, This Month, Custom Date Range.
    - Sales revenue, bills count, net profit, margin %.
    - Top performing products ranking by units sold and profit generated.
    - Payment method distribution (Cash vs. Online vs. Udhaar).

11. **Expiry Date Management (`/expiry`):**
    - Auto-detection into 3 danger tiers:
      - Expired products (immediate disposal).
      - Expiring within 7 days.
      - Expiring within 30 days.
    - One-click discard & stock write-off.

12. **Staff Management (`/staff`):**
    - Owner can create Manager and Cashier accounts.
    - Toggle activate / deactivate status.

13. **Settings & Data Safety (`/settings`):**
    - Store name, tagline, phone, address, currency symbol (`Rs.`), receipt footer message.
    - **Offline JSON Database Backup:** Export full database with 1 click to prevent data loss.

---

## 🛠️ Project Structure

```
karyana-store/
├── package.json
├── README.md
├── server/
│   ├── .env
│   ├── server.js               # Express application
│   ├── seed.js                 # Realistic Pakistani grocery seed data
│   ├── models/
│   │   ├── User.js             # Staff & Admin credentials
│   │   ├── Product.js          # Products, prices, barcodes, units
│   │   ├── Customer.js         # Customers & Udhaar balances
│   │   ├── Supplier.js         # Wholesalers & payables
│   │   ├── Sale.js             # Invoices & sale items
│   │   ├── Purchase.js         # Wholesaler purchases
│   │   ├── LedgerEntry.js      # Customer digital khata
│   │   ├── StockHistory.js     # Stock movements audit log
│   │   ├── Setting.js          # Store settings & receipt footer
│   │   └── Notification.js     # Store alerts
│   ├── controllers/
│   ├── middleware/
│   └── routes/
└── client/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── App.jsx             # React Router & Role Protection
        ├── context/
        │   ├── AuthContext.jsx
        │   └── StoreContext.jsx
        ├── components/
        │   ├── layout/         # Sidebar, Navbar, Layout
        │   └── common/         # ReceiptModal (80mm thermal receipt)
        └── pages/
            ├── Login.jsx       # 1-Click demo logins
            ├── Dashboard.jsx   # Visual KPIs & summaries
            ├── POS.jsx         # Counter billing & barcode scanner
            ├── Khata.jsx       # Digital customer ledger
            ├── Products.jsx    # Product catalog & pricing
            ├── Customers.jsx   # Customer directory
            ├── Inventory.jsx   # Stock levels & adjustments
            ├── Purchases.jsx   # Wholesaler stock-in
            ├── Suppliers.jsx   # Wholesaler payables
            ├── Reports.jsx     # Financial analytics & profit
            ├── Expiry.jsx      # Expiry date monitor
            ├── Staff.jsx       # User accounts
            └── Settings.jsx    # Store details & JSON backup
```

---

## 🏃 Running the Application

### 1. Start Backend Server
```bash
cd server
npm start
```

### 2. Start Frontend Web Client
```bash
cd client
npm run dev
```

Visit **http://localhost:5173** in your web browser.
