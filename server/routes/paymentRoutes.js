const express = require('express');
const {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentRecords,
  createPaymentRecord,
  updatePaymentRecord, // Ensure this is included
  deletePaymentRecord // Ensure this is included
} = require('../controllers/paymentController');

const router = express.Router();
 
// Routes for payment methods
router.get('/', getPayments);
router.post('/', createPayment);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);

// Routes for payment records
router.get('/records', getPaymentRecords);
router.post('/records', createPaymentRecord);
router.put('/records/:id', updatePaymentRecord); // Ensure this is included
router.delete('/records/:id', deletePaymentRecord);

module.exports = router;