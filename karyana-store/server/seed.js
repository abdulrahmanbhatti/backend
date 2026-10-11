require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Supplier = require('./models/Supplier');
const Sale = require('./models/Sale');
const Purchase = require('./models/Purchase');
const LedgerEntry = require('./models/LedgerEntry');
const StockHistory = require('./models/StockHistory');
const Setting = require('./models/Setting');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/karyana_store_db';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Customer.deleteMany({}),
      Supplier.deleteMany({}),
      Sale.deleteMany({}),
      Purchase.deleteMany({}),
      LedgerEntry.deleteMany({}),
      StockHistory.deleteMany({}),
      Setting.deleteMany({})
    ]);

    console.log('Cleared existing collections.');

    // 1. Create Default Users
    const adminUser = await User.create({
      username: 'admin',
      password: 'admin123',
      name: 'Muhammad Aslam (Owner)',
      role: 'Admin',
      phone: '0300-1234567',
      status: 'active'
    });

    const managerUser = await User.create({
      username: 'manager',
      password: 'manager123',
      name: 'Tariq Mehmood (Manager)',
      role: 'Manager',
      phone: '0321-7654321',
      status: 'active'
    });

    const cashierUser = await User.create({
      username: 'cashier',
      password: 'cashier123',
      name: 'Bilal Ahmed (Cashier)',
      role: 'Cashier',
      phone: '0333-5551234',
      status: 'active'
    });

    console.log('✅ Created Default Users (admin, manager, cashier).');

    // 2. Create Settings
    await Setting.create({
      storeName: 'Bismillah Karyana & General Store',
      tagline: 'Taza Aur Khalis Ashya Ka Ba-Aitimad Markaz',
      phone: '0300-1234567 / 042-37654321',
      address: 'Shop # 14-15, Main Bazar, Near Jamia Masjid, Lahore',
      currency: 'Rs.',
      invoiceFooter: 'Shukriya! Dobara Tashreef Layen. Khareeda huwa maal wapas nahi hoga.',
      lowStockAlertThreshold: 5,
      expiryAlertDays: 30,
      taxPercentage: 0
    });

    // 3. Create Suppliers
    const supplierAkbari = await Supplier.create({
      name: 'Haji Ghulam Rasool (Akbari Mandi)',
      company: 'Lahore Wholesale Grains & Spices Mart',
      phone: '0301-7788990',
      address: 'Shop 42, Akbari Mandi, Lahore',
      totalPurchases: 185000,
      paidAmount: 140000,
      currentPayable: 45000,
      notes: 'Main wholesale supplier for Rice, Sugar, Flour and Shan Spices'
    });

    const supplierOil = await Supplier.create({
      name: 'Al-Madina Oil & Ghee Agency',
      company: 'Al-Madina Distributors',
      phone: '0322-9988776',
      address: 'Circular Road, Badami Bagh, Lahore',
      totalPurchases: 120000,
      paidAmount: 87500,
      currentPayable: 32500,
      notes: 'Official wholesale distributor for Dalda, Habib, and Sufi cooking oils'
    });

    const supplierUnilever = await Supplier.create({
      name: 'FMCG Consumer Goods Depot',
      company: 'Punjab FMCG Logistics',
      phone: '0313-5566778',
      address: 'Plot 88, Quaid-e-Azam Industrial Estate, Kot Lakhpat',
      totalPurchases: 95000,
      paidAmount: 77000,
      currentPayable: 18000,
      notes: 'Distributor for Surf Excel, Lux, Lifebuoy, Tapal Tea'
    });

    console.log('✅ Created Suppliers.');

    // 4. Create Pakistani Karyana Products
    const now = new Date();
    const expirySoon = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days
    const expiry30 = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000); // 25 days
    const expiryNextYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const productData = [
      {
        name: 'Dalda Cooking Oil 1 Litre Pouch',
        category: 'Oil & Ghee',
        brand: 'Dalda',
        purchasePrice: 510,
        salePrice: 545,
        quantity: 24,
        barcode: '896400010001',
        sku: 'DAL-OIL-1L',
        unit: 'Packet',
        minStockLevel: 6,
        expiryDate: expiryNextYear
      },
      {
        name: 'Dalda Banaspati Ghee 1 Kg Pouch',
        category: 'Oil & Ghee',
        brand: 'Dalda',
        purchasePrice: 520,
        salePrice: 555,
        quantity: 18,
        barcode: '896400010002',
        sku: 'DAL-GHE-1K',
        unit: 'Packet',
        minStockLevel: 5,
        expiryDate: expiryNextYear
      },
      {
        name: 'Habib Cooking Oil 1 Litre Bottle',
        category: 'Oil & Ghee',
        brand: 'Habib',
        purchasePrice: 525,
        salePrice: 560,
        quantity: 12,
        barcode: '896400010003',
        sku: 'HAB-OIL-1B',
        unit: 'Bottle',
        minStockLevel: 4,
        expiryDate: expiryNextYear
      },
      {
        name: 'Shan Bombay Biryani Masala 50g',
        category: 'Spices & Recipe Mixes',
        brand: 'Shan',
        purchasePrice: 110,
        salePrice: 130,
        quantity: 40,
        barcode: '896400020001',
        sku: 'SHN-BIR-50G',
        unit: 'Packet',
        minStockLevel: 10,
        expiryDate: expiryNextYear
      },
      {
        name: 'Shan Nihari Masala 50g',
        category: 'Spices & Recipe Mixes',
        brand: 'Shan',
        purchasePrice: 110,
        salePrice: 130,
        quantity: 25,
        barcode: '896400020002',
        sku: 'SHN-NIH-50G',
        unit: 'Packet',
        minStockLevel: 8,
        expiryDate: expiryNextYear
      },
      {
        name: 'National Qorma Recipe Mix 50g',
        category: 'Spices & Recipe Mixes',
        brand: 'National',
        purchasePrice: 115,
        salePrice: 135,
        quantity: 30,
        barcode: '896400020003',
        sku: 'NAT-QOR-50G',
        unit: 'Packet',
        minStockLevel: 8,
        expiryDate: expiryNextYear
      },
      {
        name: 'Tapal Danedar Tea 430g Box',
        category: 'Beverages & Tea',
        brand: 'Tapal',
        purchasePrice: 680,
        salePrice: 740,
        quantity: 15,
        barcode: '896400030001',
        sku: 'TAP-DAN-430',
        unit: 'Box',
        minStockLevel: 5,
        expiryDate: expiryNextYear
      },
      {
        name: 'Lipton Yellow Label Black Tea 380g',
        category: 'Beverages & Tea',
        brand: 'Lipton',
        purchasePrice: 640,
        salePrice: 700,
        quantity: 10,
        barcode: '896400030002',
        sku: 'LIP-TEA-380',
        unit: 'Box',
        minStockLevel: 4,
        expiryDate: expiryNextYear
      },
      {
        name: "Olper's Full Cream Milk 1 Litre",
        category: 'Dairy & Milk',
        brand: "Olper's",
        purchasePrice: 260,
        salePrice: 290,
        quantity: 20,
        barcode: '896400040001',
        sku: 'OLP-MLK-1L',
        unit: 'Packet',
        minStockLevel: 8,
        expiryDate: expiry30 // Expiring within 30 days
      },
      {
        name: 'Nestle Milkpak 1 Litre',
        category: 'Dairy & Milk',
        brand: 'Nestle',
        purchasePrice: 265,
        salePrice: 295,
        quantity: 8,
        barcode: '896400040002',
        sku: 'NES-MLK-1L',
        unit: 'Packet',
        minStockLevel: 6,
        expiryDate: expirySoon // Expiring within 5 days!
      },
      {
        name: 'Super Karnal Basmati Rice (Pencil)',
        category: 'Grains & Pulses',
        brand: 'Al-Karam',
        purchasePrice: 320,
        salePrice: 370,
        quantity: 120,
        barcode: '896400050001',
        sku: 'BAS-RIC-1KG',
        unit: 'Kg',
        minStockLevel: 25,
        expiryDate: expiryNextYear
      },
      {
        name: 'Chakki Atta (Fine Wheat Flour) 10 Kg',
        category: 'Flour & Grains',
        brand: 'Local Mill',
        purchasePrice: 1350,
        salePrice: 1450,
        quantity: 14,
        barcode: '896400050002',
        sku: 'CHK-ATT-10K',
        unit: 'Packet',
        minStockLevel: 5,
        expiryDate: expiryNextYear
      },
      {
        name: 'White Sugar (Cheeni) Premium Grade',
        category: 'Sugar & Sweeteners',
        brand: 'Al-Noor',
        purchasePrice: 140,
        salePrice: 155,
        quantity: 85,
        barcode: '896400050003',
        sku: 'SUG-WHT-1KG',
        unit: 'Kg',
        minStockLevel: 20,
        expiryDate: expiryNextYear
      },
      {
        name: 'Surf Excel Washing Powder 1 Kg',
        category: 'Household & Cleaning',
        brand: 'Unilever',
        purchasePrice: 580,
        salePrice: 650,
        quantity: 3, // LOW STOCK example!
        barcode: '896400060001',
        sku: 'SRF-EXC-1KG',
        unit: 'Packet',
        minStockLevel: 5,
        expiryDate: expiryNextYear
      },
      {
        name: 'Ariel Complete Detergent 1 Kg',
        category: 'Household & Cleaning',
        brand: 'P&G',
        purchasePrice: 590,
        salePrice: 660,
        quantity: 0, // OUT OF STOCK example!
        barcode: '896400060002',
        sku: 'ARL-DET-1KG',
        unit: 'Packet',
        minStockLevel: 4,
        expiryDate: expiryNextYear
      },
      {
        name: 'Vim Dishwashing Bar Large',
        category: 'Household & Cleaning',
        brand: 'Unilever',
        purchasePrice: 75,
        salePrice: 90,
        quantity: 35,
        barcode: '896400060003',
        sku: 'VIM-BAR-LRG',
        unit: 'Piece',
        minStockLevel: 10,
        expiryDate: expiryNextYear
      },
      {
        name: 'Lux Beauty Soap 140g Rose',
        category: 'Personal Care',
        brand: 'Lux',
        purchasePrice: 140,
        salePrice: 165,
        quantity: 28,
        barcode: '896400070001',
        sku: 'LUX-SOP-140',
        unit: 'Piece',
        minStockLevel: 10,
        expiryDate: expiryNextYear
      },
      {
        name: 'Dettol Original Soap 100g',
        category: 'Personal Care',
        brand: 'Dettol',
        purchasePrice: 150,
        salePrice: 175,
        quantity: 22,
        barcode: '896400070002',
        sku: 'DET-SOP-100',
        unit: 'Piece',
        minStockLevel: 8,
        expiryDate: expiryNextYear
      },
      {
        name: 'Rooh Afza Sharbat Bottle 800ml',
        category: 'Beverages & Syrups',
        brand: 'Hamdard',
        purchasePrice: 380,
        salePrice: 430,
        quantity: 16,
        barcode: '896400080001',
        sku: 'ROH-AFZ-800',
        unit: 'Bottle',
        minStockLevel: 6,
        expiryDate: expiryNextYear
      },
      {
        name: 'National Tomato Ketchup 800g Pouch',
        category: 'Sauces & Condiments',
        brand: 'National',
        purchasePrice: 390,
        salePrice: 440,
        quantity: 14,
        barcode: '896400090001',
        sku: 'NAT-KTC-800',
        unit: 'Packet',
        minStockLevel: 5,
        expiryDate: expiryNextYear
      },
      {
        name: 'Peek Freans Sooper Biscuits Family Pack',
        category: 'Snacks & Biscuits',
        brand: 'English Biscuit Manufacturers',
        purchasePrice: 110,
        salePrice: 130,
        quantity: 45,
        barcode: '896400100001',
        sku: 'SOO-BIS-FAM',
        unit: 'Packet',
        minStockLevel: 12,
        expiryDate: expiryNextYear
      },
      {
        name: 'Prince Chocolate Biscuits Half Roll',
        category: 'Snacks & Biscuits',
        brand: 'LU',
        purchasePrice: 50,
        salePrice: 60,
        quantity: 50,
        barcode: '896400100002',
        sku: 'PRN-BIS-HLF',
        unit: 'Packet',
        minStockLevel: 15,
        expiryDate: expiryNextYear
      }
    ];

    const createdProducts = await Product.insertMany(productData);
    console.log(`✅ Seeded ${createdProducts.length} Karyana Products.`);

    // 5. Create Sample Customers
    const c1 = await Customer.create({
      name: 'Haji Abdul Rashid',
      phone: '0300-8451234',
      address: 'House 12, Mohalla Eidgah, Lahore',
      totalPurchases: 24500,
      totalCredit: 12500,
      paidAmount: 8000,
      currentBalance: 4500,
      notes: 'Regular customer, pays weekly every Friday'
    });

    const c2 = await Customer.create({
      name: 'Chaudhry Muhammad Akram',
      phone: '0321-4567890',
      address: 'Near Water Tank, Block C, Lahore',
      totalPurchases: 42000,
      totalCredit: 22000,
      paidAmount: 13800,
      currentBalance: 8200,
      notes: 'Monthly billing customer'
    });

    const c3 = await Customer.create({
      name: 'Master Ghulam Rasool',
      phone: '0333-9876543',
      address: 'Govt High School Street, House 4',
      totalPurchases: 14200,
      totalCredit: 6800,
      paidAmount: 5000,
      currentBalance: 1800,
      notes: 'School teacher, pays on 1st of every month'
    });

    const c4 = await Customer.create({
      name: 'Imran Butt (Cloth Merchant)',
      phone: '0312-3456789',
      address: 'Butt Cloth House, Main Bazar',
      totalPurchases: 18500,
      totalCredit: 5000,
      paidAmount: 5000,
      currentBalance: 0,
      notes: 'Zero balance, pays promptly'
    });

    const c5 = await Customer.create({
      name: 'Dr. Kamran Siddiqui',
      phone: '0345-1122334',
      address: 'Al-Shifa Clinic, Main Road',
      totalPurchases: 31000,
      totalCredit: 14250,
      paidAmount: 11000,
      currentBalance: 3250,
      notes: 'Local neighborhood clinic doctor'
    });

    console.log('✅ Seeded 5 Customers.');

    // 6. Create Ledger entries for customers with existing balance
    await LedgerEntry.create([
      {
        customer: c1._id,
        type: 'opening_balance',
        amount: 2500,
        balanceAfter: 2500,
        description: 'Opening udhaar balance from previous register',
        paymentMethod: 'none',
        recordedBy: adminUser._id,
        recordedByName: adminUser.name
      },
      {
        customer: c1._id,
        type: 'credit_sale',
        amount: 2000,
        balanceAfter: 4500,
        description: 'Grocery items taken on credit (Oil, Rice, Tea)',
        paymentMethod: 'none',
        recordedBy: cashierUser._id,
        recordedByName: cashierUser.name
      },
      {
        customer: c2._id,
        type: 'opening_balance',
        amount: 8200,
        balanceAfter: 8200,
        description: 'Previous month pending ration bill',
        paymentMethod: 'none',
        recordedBy: adminUser._id,
        recordedByName: adminUser.name
      },
      {
        customer: c3._id,
        type: 'opening_balance',
        amount: 1800,
        balanceAfter: 1800,
        description: 'Remaining udhaar from last grocery purchase',
        paymentMethod: 'none',
        recordedBy: adminUser._id,
        recordedByName: adminUser.name
      },
      {
        customer: c5._id,
        type: 'opening_balance',
        amount: 3250,
        balanceAfter: 3250,
        description: 'Clinic tea and snacks ration pending bill',
        paymentMethod: 'none',
        recordedBy: managerUser._id,
        recordedByName: managerUser.name
      }
    ]);

    // 7. Seed Initial Stock History records for each product
    const stockHistoryRecords = createdProducts.map((p) => ({
      product: p._id,
      productName: p.name,
      type: 'opening_stock',
      quantityChange: p.quantity,
      previousStock: 0,
      newStock: p.quantity,
      reason: 'Initial inventory stock registered',
      user: adminUser._id,
      userName: adminUser.name
    }));
    await StockHistory.insertMany(stockHistoryRecords);

    // 8. Create a sample completed sale for today so dashboard shows figures
    const oilP = createdProducts[0];
    const shanP = createdProducts[3];
    const tapalP = createdProducts[6];

    const saleTotal = oilP.salePrice + shanP.salePrice * 2 + tapalP.salePrice;
    const saleCost = oilP.purchasePrice + shanP.purchasePrice * 2 + tapalP.purchasePrice;

    await Sale.create({
      invoiceNumber: 'INV-20261009-0001',
      customer: c1._id,
      customerName: c1.name,
      customerPhone: c1.phone,
      cashier: cashierUser._id,
      cashierName: cashierUser.name,
      items: [
        {
          product: oilP._id,
          name: oilP.name,
          unit: oilP.unit,
          quantity: 1,
          purchasePrice: oilP.purchasePrice,
          salePrice: oilP.salePrice,
          subtotal: oilP.salePrice
        },
        {
          product: shanP._id,
          name: shanP.name,
          unit: shanP.unit,
          quantity: 2,
          purchasePrice: shanP.purchasePrice,
          salePrice: shanP.salePrice,
          subtotal: shanP.salePrice * 2
        },
        {
          product: tapalP._id,
          name: tapalP.name,
          unit: tapalP.unit,
          quantity: 1,
          purchasePrice: tapalP.purchasePrice,
          salePrice: tapalP.salePrice,
          subtotal: tapalP.salePrice
        }
      ],
      subtotal: saleTotal,
      discount: 0,
      total: saleTotal,
      totalCost: saleCost,
      profit: saleTotal - saleCost,
      paymentMethod: 'cash',
      paidAmount: saleTotal,
      changeAmount: 0,
      remainingDue: 0,
      notes: 'First morning customer transaction'
    });

    console.log('✅ Seeded Initial Sale.');
    console.log('🎉 Seeding successfully completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
