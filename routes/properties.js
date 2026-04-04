const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const { ensureUploadSubdir } = require('../uploadPaths');
const {
  createProperty,
  updateProperty,
  listProperties,
  getProperty,
  deleteProperty,
} = require('../controllers/propertyController');

const uploadDir = ensureUploadSubdir('properties');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
  },
});
const upload = multer({ storage });

router.get('/', listProperties);
router.get('/:id', getProperty);

router.post(
  '/',
  auth,
  upload.fields([
    { name: 'primaryImage', maxCount: 1 },
    { name: 'gallery', maxCount: 20 },
  ]),
  createProperty,
);

router.put(
  '/:id',
  auth,
  upload.fields([
    { name: 'primaryImage', maxCount: 1 },
    { name: 'gallery', maxCount: 20 },
  ]),
  updateProperty,
);

router.delete('/:id', auth, deleteProperty);

module.exports = router;
