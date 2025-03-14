const Event = require('../models/Event');
const asyncHandler = require('express-async-handler');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

// @desc    Get events by month
// @route   GET /api/events/month/:year/:month
// @access  Public
const getEventsByMonth = asyncHandler(async (req, res) => {
  const { year, month } = req.params;
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const events = await Event.find({
    date: { $gte: startDate, $lte: endDate }
  });
  res.json(events);
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  res.json(event);
});

// @desc    Create new event
// @route   POST /api/events
// @access  Private
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, endDate, location, category, capacity, isRecurring, recurringPattern } = req.body;

  if (!title || !description || !location) {
    res.status(400);
    throw new Error('Please provide title, description, and location');
  }

  const event = new Event({
    title,
    description,
    date,
    endDate,
    location,
    category,
    capacity,
    isRecurring,
    recurringPattern,
    organizer: "management", // Set to a fixed value
    active: true
  });

  const createdEvent = await event.save();
  res.status(201).json(createdEvent);
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json(updatedEvent);
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  await event.deleteOne();
  res.json({ message: 'Event removed' });
});

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
const registerForEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  if (event.attendees.includes(req.user._id)) {
    res.status(400);
    throw new Error('Already registered for this event');
  }

  event.attendees.push(req.user._id);
  await event.save();
  res.json(event);
});

// @desc    Unregister from event
// @route   DELETE /api/events/:id/register
// @access  Private
const unregisterFromEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  if (!event.attendees.includes(req.user._id)) {
    res.status(400);
    throw new Error('Not registered for this event');
  }

  event.attendees = event.attendees.filter(attendee => attendee.toString() !== req.user._id.toString());
  await event.save();
  res.json(event);
});

module.exports = {
  getEvents,
  getEventsByMonth,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent
};