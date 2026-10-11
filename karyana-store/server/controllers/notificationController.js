const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');

// @desc Generate real-time store alerts & notifications
// @route GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const alerts = [];
    const now = new Date();
    const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const products = await Product.find({ status: 'active' });

    products.forEach((p) => {
      if (p.quantity <= 0) {
        alerts.push({
          id: `out-${p._id}`,
          type: 'out_of_stock',
          level: 'danger',
          title: 'Khatam Shuda Stock (Out of Stock)',
          message: `${p.name} is completely out of stock (0 ${p.unit}). Order more from supplier immediately.`,
          link: '/inventory'
        });
      } else if (p.quantity <= p.minStockLevel) {
        alerts.push({
          id: `low-${p._id}`,
          type: 'low_stock',
          level: 'warning',
          title: 'Kam Stock Alert (Low Stock)',
          message: `${p.name} has only ${p.quantity} ${p.unit} remaining (minimum threshold: ${p.minStockLevel}).`,
          link: '/inventory'
        });
      }

      if (p.expiryDate) {
        const exp = new Date(p.expiryDate);
        if (exp < now) {
          alerts.push({
            id: `exp-${p._id}`,
            type: 'expired',
            level: 'danger',
            title: 'Miyad Khatam (Expired Product)',
            message: `${p.name} expired on ${exp.toLocaleDateString()}. Remove from sales shelf!`,
            link: '/expiry'
          });
        } else if (exp <= sevenDays) {
          alerts.push({
            id: `exp7-${p._id}`,
            type: 'expiring_soon',
            level: 'danger',
            title: 'Expiry in < 7 Days',
            message: `${p.name} expires in less than 7 days (${exp.toLocaleDateString()}). Discount or return to supplier.`,
            link: '/expiry'
          });
        } else if (exp <= thirtyDays) {
          alerts.push({
            id: `exp30-${p._id}`,
            type: 'expiring_soon',
            level: 'warning',
            title: 'Expiry within 30 Days',
            message: `${p.name} expires on ${exp.toLocaleDateString()}. Keep an eye on shelf rotation.`,
            link: '/expiry'
          });
        }
      }
    });

    // Check high pending customer udhaar
    const customers = await Customer.find({ currentBalance: { $gt: 5000 } }).limit(5);
    customers.forEach((c) => {
      alerts.push({
        id: `khata-${c._id}`,
        type: 'khata_overdue',
        level: 'info',
        title: 'High Customer Udhaar',
        message: `${c.name} has pending balance of Rs. ${c.currentBalance.toLocaleString()}. Follow up on payment.`,
        link: `/khata`
      });
    });

    // Check supplier dues
    const suppliers = await Supplier.find({ currentPayable: { $gt: 10000 } }).limit(5);
    suppliers.forEach((s) => {
      alerts.push({
        id: `supp-${s._id}`,
        type: 'supplier_due',
        level: 'info',
        title: 'Supplier Payment Due',
        message: `Rs. ${s.currentPayable.toLocaleString()} is payable to supplier ${s.name}.`,
        link: '/suppliers'
      });
    });

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getNotifications
};
