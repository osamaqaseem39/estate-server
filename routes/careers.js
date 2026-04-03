const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const {
  submitApplication,
  listApplications,
  updateApplicationStatus,
} = require('../controllers/careerController');

const uploadDir = path.join(__dirname, '../../uploads/careers');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      /pdf|msword|wordprocessingml/.test(file.mimetype) ||
      /\.(pdf|doc|docx)$/i.test(file.originalname);
    if (ok) cb(null, true);
    else cb(new Error('Only PDF and Word documents are allowed'));
  },
});

router.post('/applications', upload.single('cv'), submitApplication);

router.get('/applications', auth, listApplications);
router.patch('/applications/:id', auth, updateApplicationStatus);

module.exports = router;
