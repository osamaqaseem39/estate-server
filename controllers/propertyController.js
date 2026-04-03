const mongoose = require('mongoose');
const Property = require('../models/Property');

function validId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function parseBool(v) {
  if (v === true || v === false) return v;
  if (typeof v === 'string') return v === 'true' || v === '1';
  return false;
}

exports.createProperty = async (req, res) => {
  try {
    const body = req.body;
    let primaryImage = body.primaryImage || '';
    let gallery = [];

    if (req.files) {
      if (req.files.primaryImage?.[0]) {
        primaryImage = `/uploads/properties/${req.files.primaryImage[0].filename}`;
      }
      if (req.files.gallery?.length) {
        gallery = req.files.gallery.map((f) => `/uploads/properties/${f.filename}`);
      }
    }

    const doc = new Property({
      title: body.title,
      description: body.description || '',
      location: body.location,
      marla: body.marla,
      type: body.type || 'residential',
      price: body.price != null && body.price !== '' ? Number(body.price) : null,
      status: body.status || 'available',
      featured: parseBool(body.featured),
      primaryImage,
      gallery,
      sortOrder: body.sortOrder != null ? Number(body.sortOrder) : 0,
    });

    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    console.error('createProperty:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid property id' });
    }
    const body = req.body;
    const update = {
      ...(body.title != null && { title: body.title }),
      ...(body.description != null && { description: body.description }),
      ...(body.location != null && { location: body.location }),
      ...(body.marla != null && { marla: body.marla }),
      ...(body.type != null && { type: body.type }),
      ...(body.price !== undefined && {
        price: body.price === '' || body.price == null ? null : Number(body.price),
      }),
      ...(body.status != null && { status: body.status }),
      ...(body.featured !== undefined && { featured: parseBool(body.featured) }),
      ...(body.sortOrder != null && { sortOrder: Number(body.sortOrder) }),
    };

    if (req.files?.primaryImage?.[0]) {
      update.primaryImage = `/uploads/properties/${req.files.primaryImage[0].filename}`;
    }
    if (req.files?.gallery?.length) {
      update.gallery = req.files.gallery.map((f) => `/uploads/properties/${f.filename}`);
    }

    const doc = await Property.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ error: 'Property not found' });
    res.json(doc);
  } catch (err) {
    console.error('updateProperty:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.listProperties = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.featured !== undefined) filter.featured = parseBool(req.query.featured);

    const items = await Property.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProperty = async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid property id' });
    }
    const doc = await Property.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Property not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid property id' });
    }
    const doc = await Property.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Property not found' });
    res.json({ message: 'Property deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
