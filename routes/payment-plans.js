const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createPaymentPlanTab,
  listPaymentPlanTabs,
  getPaymentPlanTab,
  updatePaymentPlanTab,
  deletePaymentPlanTab,
} = require('../controllers/paymentPlansController');

router.get('/', listPaymentPlanTabs);
router.get('/:id', getPaymentPlanTab);
router.post('/', auth, createPaymentPlanTab);
router.patch('/:id', auth, updatePaymentPlanTab);
router.put('/:id', auth, updatePaymentPlanTab);
router.delete('/:id', auth, deletePaymentPlanTab);

module.exports = router;
