const GalleryItem = require('../models/GalleryItem');

function parseBool(v) {
  if (v === true || v === false) return v;
  if (typeof v === 'string') return v === 'true' || v === '1';
  return false;
}

exports.createGalleryItem = async (req, res) => {
  try {
    const body = req.body;
    let imageUrl = body.imageUrl || '';
    if (req.file) {
      imageUrl = `/uploads/gallery/${req.file.filename}`;
    }
    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl or image file required' });
    }

    const doc = new GalleryItem({
      imageUrl,
      alt: body.alt || 'GT Estates project',
      shape: body.shape || 'landscape',
      display: body.display || 'grid',
      category: body.category || 'general',
      published: body.published !== undefined ? parseBool(body.published) : true,
      sortOrder: body.sortOrder != null ? Number(body.sortOrder) : 0,
    });
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    console.error('createGalleryItem:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateGalleryItem = async (req, res) => {
  try {
    const body = req.body;
    const update = {
      ...(body.alt != null && { alt: body.alt }),
      ...(body.shape != null && { shape: body.shape }),
      ...(body.display != null && { display: body.display }),
      ...(body.category != null && { category: body.category }),
      ...(body.published !== undefined && { published: parseBool(body.published) }),
      ...(body.sortOrder != null && { sortOrder: Number(body.sortOrder) }),
    };
    if (req.file) {
      update.imageUrl = `/uploads/gallery/${req.file.filename}`;
    } else if (body.imageUrl != null) {
      update.imageUrl = body.imageUrl;
    }

    const doc = await GalleryItem.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ error: 'Gallery item not found' });
    res.json(doc);
  } catch (err) {
    console.error('updateGalleryItem:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.listPublishedGallery = async (req, res) => {
  try {
    const items = await GalleryItem.find({ published: true }).sort({ sortOrder: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listAllGalleryAdmin = async (req, res) => {
  try {
    const items = await GalleryItem.find({}).sort({ sortOrder: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGalleryItem = async (req, res) => {
  try {
    const doc = await GalleryItem.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Gallery item not found' });
    if (!doc.published) return res.status(404).json({ error: 'Gallery item not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGalleryItemAdmin = async (req, res) => {
  try {
    const doc = await GalleryItem.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Gallery item not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteGalleryItem = async (req, res) => {
  try {
    const doc = await GalleryItem.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Gallery item not found' });
    res.json({ message: 'Gallery item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
