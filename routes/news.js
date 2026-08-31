const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createNews,
  listNews,
  getNewsBySlug,
  getNews,
  updateNews,
  deleteNews,
} = require('../controllers/newsController');

router.get('/', listNews);
router.get('/slug/:slug', getNewsBySlug);
router.get('/:id', getNews);
router.post('/', auth, createNews);
router.patch('/:id', auth, updateNews);
router.put('/:id', auth, updateNews);
router.delete('/:id', auth, deleteNews);

module.exports = router;
