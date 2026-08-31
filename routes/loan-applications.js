const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createLoanApplication,
  listLoanApplications,
  getLoanApplication,
  updateLoanApplicationStatus,
  deleteLoanApplication,
} = require('../controllers/loanApplicationController');

router.post('/', createLoanApplication);
router.get('/', auth, listLoanApplications);
router.get('/:id', auth, getLoanApplication);
router.patch('/:id', auth, updateLoanApplicationStatus);
router.delete('/:id', auth, deleteLoanApplication);

module.exports = router;
