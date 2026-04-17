const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createInquiry,
  listInquiries,
  updateInquiry,
} = require('../controllers/inquiryController');

/**
 * @openapi
 * /api/inquiries:
 *   post:
 *     summary: Submit a public inquiry (website)
 *     tags: [Inquiries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, phone]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               message: { type: string }
 *               propertyType: { type: string }
 *               source: { type: string, enum: [global, contact] }
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 *   get:
 *     summary: List inquiries (admin)
 *     tags: [Inquiries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/', createInquiry);
router.get('/', auth, listInquiries);

/**
 * @openapi
 * /api/inquiries/{id}:
 *   patch:
 *     summary: Update inquiry status (admin)
 *     tags: [Inquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [new, contacted, closed] }
 *     responses:
 *       200:
 *         description: OK
 */
router.patch('/:id', auth, updateInquiry);

module.exports = router;
