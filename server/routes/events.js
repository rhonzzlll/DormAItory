const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventsByMonth,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent
} = require('../controllers/eventController');

// Public routes
router.get('/', getEvents);
router.get('/month/:year/:month', getEventsByMonth);
router.get('/:id', getEventById);

// Routes without middleware
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

// Event registration routes
router.post('/:id/register', registerForEvent);
router.delete('/:id/register', unregisterFromEvent);

module.exports = router;