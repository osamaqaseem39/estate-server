const PaymentPlanTab = require('../models/PaymentPlanTab');
const { toPublic, toPublicList } = require('../utils/publicDoc');
const { slugify } = require('../utils/slugify');

function parseBool(v) {
  if (v === true || v === false) return v;
  if (typeof v === 'string') return v === 'true' || v === '1';
  return false;
}

function parseRows(body) {
  let rows = body.rows;
  if (typeof rows === 'string') {
    try { rows = JSON.parse(rows); } catch { rows = []; }
  }
  return Array.isArray(rows) ? rows : [];
}

exports.createPaymentPlanTab = async (req, res) => {
  try {
    const body = req.body;
    const slug = slugify(body.slug || body.title);
    if (!slug || !body.title) return res.status(400).json({ error: 'title is required' });
    const doc = new PaymentPlanTab({
      title: body.title,
      slug,
      description: body.description || '',
      rows: parseRows(body),
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

exports.listPaymentPlanTabs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.published === 'true') filter.published = true;
    const items = await PaymentPlanTab.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json(toPublicList(items));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPaymentPlanTab = async (req, res) => {
  try {
    const doc = await PaymentPlanTab.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Tab not found' });
    res.json(toPublic(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePaymentPlanTab = async (req, res) => {
  try {
    const body = req.body;
    const update = {
      ...(body.title != null && { title: body.title }),
      ...(body.description != null && { description: body.description }),
      ...(body.published !== undefined && { published: parseBool(body.published) }),
      ...(body.sortOrder != null && { sortOrder: Number(body.sortOrder) }),
    };
    if (body.slug != null) update.slug = slugify(body.slug);
    if (body.rows !== undefined) update.rows = parseRows(body);
    const doc = await PaymentPlanTab.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ error: 'Tab not found' });
    res.json(toPublic(doc));
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Slug already exists' });
    res.status(500).json({ error: err.message });
  }
};

exports.deletePaymentPlanTab = async (req, res) => {
  try {
    const doc = await PaymentPlanTab.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Tab not found' });
    res.json({ message: 'Tab deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
