const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  listSiteContent,
  getSiteContentByKey,
  upsertSiteContent,
} = require('../controllers/siteContentController');

router.get('/', listSiteContent);
router.get('/:pageKey', getSiteContentByKey);
router.put('/:pageKey', auth, upsertSiteContent);

module.exports = router;
