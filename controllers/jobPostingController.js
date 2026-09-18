const JobPosting = require('../models/JobPosting');
const { slugify } = require('../utils/slugify');
const { toPublic, toPublicList } = require('../utils/publicDoc');

function parseBool(v) {
  if (v === true || v === false) return v;
  if (typeof v === 'string') return v === 'true' || v === '1';
  return false;
}

async function ensureUniqueSlug(baseSlug, excludeId) {
  let slug = baseSlug;
  let n = 0;
  while (slug) {
    const filter = { slug };
    if (excludeId) filter._id = { $ne: excludeId };
    const exists = await JobPosting.findOne(filter);
    if (!exists) return slug;
    n += 1;
    slug = `${baseSlug}-${n}`;
  }
  return baseSlug;
}

exports.listJobPostings = async (req, res) => {
  try {
    const filter = {};
    if (req.query.published !== undefined) filter.published = parseBool(req.query.published);
    const items = await JobPosting.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json(toPublicList(items));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createJobPosting = async (req, res) => {
  try {
    const body = req.body;
    const title = String(body.title || '').trim();
    if (!title) return res.status(400).json({ error: 'title is required' });
    const baseSlug = slugify(body.slug || title);
    const doc = new JobPosting({
      title,
      slug: await ensureUniqueSlug(baseSlug),
      department: String(body.department || '').trim(),
      location: String(body.location || '').trim(),
      employmentType: String(body.employmentType || '').trim(),
      description: String(body.description || '').trim(),
      requirements: String(body.requirements || '').trim(),
      published: parseBool(body.published),
      sortOrder: body.sortOrder != null ? Number(body.sortOrder) : 0,
    });
    await doc.save();
    res.status(201).json(toPublic(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateJobPosting = async (req, res) => {
  try {
    const body = req.body;
    const update = {};
    if (body.title != null) update.title = String(body.title).trim();
    if (body.department != null) update.department = String(body.department).trim();
    if (body.location != null) update.location = String(body.location).trim();
    if (body.employmentType != null) update.employmentType = String(body.employmentType).trim();
    if (body.description != null) update.description = String(body.description).trim();
    if (body.requirements != null) update.requirements = String(body.requirements).trim();
    if (body.published !== undefined) update.published = parseBool(body.published);
    if (body.sortOrder != null) update.sortOrder = Number(body.sortOrder);
    if (body.slug != null || body.title != null) {
      const baseSlug = slugify(body.slug || body.title);
      if (baseSlug) update.slug = await ensureUniqueSlug(baseSlug, req.params.id);
    }
    const doc = await JobPosting.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ error: 'Job posting not found' });
    res.json(toPublic(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteJobPosting = async (req, res) => {
  try {
    const doc = await JobPosting.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Job posting not found' });
    res.json({ message: 'Job posting deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
