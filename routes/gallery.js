const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const {
  createGalleryItem,
  updateGalleryItem,
  listPublishedGallery,
  listAllGalleryAdmin,
  getGalleryItem,
  getGalleryItemAdmin,
  deleteGalleryItem,
} = require('../controllers/galleryController');

const uploadDir = path.join(__dirname, '../../uploads/gallery');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
  },
});
const upload = multer({ storage });

router.get('/', listPublishedGallery);
router.get('/item/:id', getGalleryItem);

router.get('/admin/all', auth, listAllGalleryAdmin);
router.get('/admin/item/:id', auth, getGalleryItemAdmin);

router.post('/', auth, upload.single('image'), createGalleryItem);
router.put('/items/:id', auth, upload.single('image'), updateGalleryItem);
router.delete('/items/:id', auth, deleteGalleryItem);

module.exports = router;
