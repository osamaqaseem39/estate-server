const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const { ensureUploadSubdir } = require('../uploadPaths');
const { MAX_IMAGE_UPLOAD_BYTES } = require('../uploadLimits');
const {
  createTeamMember,
  updateTeamMember,
  listPublishedTeam,
  listAllTeamAdmin,
  getTeamMember,
  getTeamMemberAdmin,
  deleteTeamMember,
} = require('../controllers/teamController');

const uploadDir = ensureUploadSubdir('team');

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

router.get('/', listPublishedTeam);
router.get('/item/:id', getTeamMember);

router.get('/admin/all', auth, listAllTeamAdmin);
router.get('/admin/item/:id', auth, getTeamMemberAdmin);

router.post('/', auth, upload.single('image'), createTeamMember);
router.put('/items/:id', auth, upload.single('image'), updateTeamMember);
router.patch('/items/:id', auth, upload.single('image'), updateTeamMember);
router.patch('/:id', auth, upload.single('image'), updateTeamMember);
router.put('/:id', auth, upload.single('image'), updateTeamMember);
router.delete('/items/:id', auth, deleteTeamMember);
router.delete('/:id', auth, deleteTeamMember);

module.exports = router;
