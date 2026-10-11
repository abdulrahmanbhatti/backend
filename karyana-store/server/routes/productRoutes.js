const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getProductByBarcode,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getProducts);
router.get('/barcode/:code', protect, getProductByBarcode);
router.get('/:id', protect, getProductById);

router.post('/', protect, authorize('Admin', 'Manager'), createProduct);
router.put('/:id', protect, authorize('Admin', 'Manager'), updateProduct);
router.delete('/:id', protect, authorize('Admin'), deleteProduct);
router.post('/:id/adjust-stock', protect, authorize('Admin', 'Manager'), adjustStock);

module.exports = router;
