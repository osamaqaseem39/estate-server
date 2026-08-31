const Review = require('../models/Review');

function parseBool(v) {
  if (v === true || v === false) return v;
  if (typeof v === 'string') return v === 'true' || v === '1';
  return false;
}

exports.createReview = async (req, res) => {
  try {
    const body = req.body;
    let avatarUrl = body.avatarUrl || '';
    if (req.file) {
      avatarUrl = `/uploads/reviews/${req.file.filename}`;
    }

    if (!body.name || !String(body.name).trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    if (!body.text || !String(body.text).trim()) {
      return res.status(400).json({ error: 'text is required' });
    }

    const doc = new Review({
      name: body.name,
      role: body.role || '',
      avatarUrl,
      rating: body.rating != null ? Number(body.rating) : 5,
      text: body.text,
      published: body.published !== undefined ? parseBool(body.published) : true,
      sortOrder: body.sortOrder != null ? Number(body.sortOrder) : 0,
    });
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    console.error('createReview:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const body = req.body;
    const update = {
      ...(body.name != null && { name: body.name }),
      ...(body.role != null && { role: body.role }),
      ...(body.rating != null && { rating: Number(body.rating) }),
      ...(body.text != null && { text: body.text }),
      ...(body.published !== undefined && { published: parseBool(body.published) }),
      ...(body.sortOrder != null && { sortOrder: Number(body.sortOrder) }),
    };
    if (req.file) {
      update.avatarUrl = `/uploads/reviews/${req.file.filename}`;
    } else if (body.avatarUrl != null) {
      update.avatarUrl = body.avatarUrl;
    }

    const doc = await Review.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ error: 'Review not found' });
    res.json(doc);
  } catch (err) {
    console.error('updateReview:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.listPublishedReviews = async (req, res) => {
  try {
    const items = await Review.find({ published: true }).sort({ sortOrder: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listAllReviewsAdmin = async (req, res) => {
  try {
    const items = await Review.find({}).sort({ sortOrder: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReview = async (req, res) => {
  try {
    const doc = await Review.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Review not found' });
    if (!doc.published) return res.status(404).json({ error: 'Review not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReviewAdmin = async (req, res) => {
  try {
    const doc = await Review.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Review not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const doc = await Review.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
