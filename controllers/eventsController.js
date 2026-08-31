const Event = require('../models/Event');
const { toPublic, toPublicList } = require('../utils/publicDoc');
const { slugify } = require('../utils/slugify');

function parseBool(v) {
  if (v === true || v === false) return v;
  if (typeof v === 'string') return v === 'true' || v === '1';
  return false;
}

function parseMediaArrays(body) {
  let images = body.images;
  let videos = body.videos;
  if (typeof images === 'string') {
    try { images = JSON.parse(images); } catch { images = []; }
  }
  if (typeof videos === 'string') {
    try { videos = JSON.parse(videos); } catch { videos = []; }
  }
  return {
    images: Array.isArray(images) ? images : [],
    videos: Array.isArray(videos) ? videos : [],
  };
}

exports.createEvent = async (req, res) => {
  try {
    const body = req.body;
    const slug = slugify(body.slug || body.title);
    if (!slug || !body.title) return res.status(400).json({ error: 'title is required' });
    const media = parseMediaArrays(body);
    const doc = new Event({
      title: body.title,
      slug,
      description: body.description || '',
      images: media.images,
      videos: media.videos,
      metaTitle: body.metaTitle || '',
      metaDescription: body.metaDescription || '',
      published: parseBool(body.published),
      sortOrder: body.sortOrder != null ? Number(body.sortOrder) : 0,
    });
    await doc.save();
    res.status(201).json(toPublic(doc));
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Slug already exists' });
    res.status(500).json({ error: err.message });
  }
};

exports.listEvents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.published === 'true') filter.published = true;
    const items = await Event.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json(toPublicList(items));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEventBySlug = async (req, res) => {
  try {
    const doc = await Event.findOne({ slug: req.params.slug.toLowerCase(), published: true });
    if (!doc) return res.status(404).json({ error: 'Event not found' });
    res.json(toPublic(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEvent = async (req, res) => {
  try {
    const doc = await Event.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Event not found' });
    res.json(toPublic(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const body = req.body;
    const update = {
      ...(body.title != null && { title: body.title }),
      ...(body.description != null && { description: body.description }),
      ...(body.metaTitle != null && { metaTitle: body.metaTitle }),
      ...(body.metaDescription != null && { metaDescription: body.metaDescription }),
      ...(body.published !== undefined && { published: parseBool(body.published) }),
      ...(body.sortOrder != null && { sortOrder: Number(body.sortOrder) }),
    };
    if (body.slug != null) update.slug = slugify(body.slug);
    if (body.images !== undefined) update.images = parseMediaArrays(body).images;
    if (body.videos !== undefined) update.videos = parseMediaArrays(body).videos;
    const doc = await Event.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ error: 'Event not found' });
    res.json(toPublic(doc));
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Slug already exists' });
    res.status(500).json({ error: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const doc = await Event.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
