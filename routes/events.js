const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createEvent,
  listEvents,
  getEventBySlug,
  getEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventsController');

router.get('/', listEvents);
router.get('/slug/:slug', getEventBySlug);
router.get('/:id', getEvent);
router.post('/', auth, createEvent);
router.patch('/:id', auth, updateEvent);
router.put('/:id', auth, updateEvent);
router.delete('/:id', auth, deleteEvent);

module.exports = router;
