const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const { ensureUploadSubdir } = require('../uploadPaths');
const { MAX_IMAGE_UPLOAD_BYTES } = require('../uploadLimits');
const {
  createReview,
  updateReview,
  listPublishedReviews,
  listAllReviewsAdmin,
  getReview,
  getReviewAdmin,
  deleteReview,
} = require('../controllers/reviewController');

const uploadDir = ensureUploadSubdir('reviews');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_UPLOAD_BYTES },
});

router.get('/', listPublishedReviews);
router.get('/item/:id', getReview);

router.get('/admin/all', auth, listAllReviewsAdmin);
router.get('/admin/item/:id', auth, getReviewAdmin);

router.post('/', auth, upload.single('avatar'), createReview);
router.put('/items/:id', auth, upload.single('avatar'), updateReview);
router.patch('/items/:id', auth, upload.single('avatar'), updateReview);
router.patch('/:id', auth, upload.single('avatar'), updateReview);
router.put('/:id', auth, upload.single('avatar'), updateReview);
router.delete('/items/:id', auth, deleteReview);
router.delete('/:id', auth, deleteReview);

module.exports = router;
