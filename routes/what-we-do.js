const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getWhatWeDo, updateWhatWeDo } = require('../controllers/whatWeDoController');

router.get('/', getWhatWeDo);
router.patch('/', auth, updateWhatWeDo);
router.put('/', auth, updateWhatWeDo);

module.exports = router;
