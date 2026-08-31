const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createPage,
  listPages,
  getPageBySlug,
  getPage,
  updatePage,
  deletePage,
} = require('../controllers/pagesController');

router.get('/', listPages);
router.get('/slug/:slug', getPageBySlug);
router.get('/:id', getPage);
router.post('/', auth, createPage);
router.patch('/:id', auth, updatePage);
router.put('/:id', auth, updatePage);
router.delete('/:id', auth, deletePage);

module.exports = router;
