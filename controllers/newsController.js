const News = require('../models/News');
const { toPublic, toPublicList } = require('../utils/publicDoc');
const { slugify } = require('../utils/slugify');

function parseBool(v) {
  if (v === true || v === false) return v;
  if (typeof v === 'string') return v === 'true' || v === '1';
  return false;
}

exports.createNews = async (req, res) => {
  try {
    const body = req.body;
    const slug = slugify(body.slug || body.title);
    if (!slug || !body.title) return res.status(400).json({ error: 'title is required' });
    const doc = new News({
      title: body.title,
      slug,
      content: body.content || '',
      excerpt: body.excerpt || '',
      imageUrl: body.imageUrl || '',
      metaTitle: body.metaTitle || '',
      metaDescription: body.metaDescription || '',
      published: parseBool(body.published),
      featured: parseBool(body.featured),
      sortOrder: body.sortOrder != null ? Number(body.sortOrder) : 0,
    });
    await doc.save();
    res.status(201).json(toPublic(doc));
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Slug already exists' });
    res.status(500).json({ error: err.message });
  }
};

exports.listNews = async (req, res) => {
  try {
    const filter = {};
    if (req.query.published === 'true') filter.published = true;
    const items = await News.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json(toPublicList(items));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNewsBySlug = async (req, res) => {
  try {
    const doc = await News.findOne({ slug: req.params.slug.toLowerCase(), published: true });
    if (!doc) return res.status(404).json({ error: 'Article not found' });
    res.json(toPublic(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNews = async (req, res) => {
  try {
    const doc = await News.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Article not found' });
    res.json(toPublic(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateNews = async (req, res) => {
  try {
    const body = req.body;
    const update = {
      ...(body.title != null && { title: body.title }),
      ...(body.content != null && { content: body.content }),
      ...(body.excerpt != null && { excerpt: body.excerpt }),
      ...(body.imageUrl != null && { imageUrl: body.imageUrl }),
      ...(body.metaTitle != null && { metaTitle: body.metaTitle }),
      ...(body.metaDescription != null && { metaDescription: body.metaDescription }),
      ...(body.published !== undefined && { published: parseBool(body.published) }),
      ...(body.featured !== undefined && { featured: parseBool(body.featured) }),
      ...(body.sortOrder != null && { sortOrder: Number(body.sortOrder) }),
    };
    if (body.slug != null) update.slug = slugify(body.slug);
    const doc = await News.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ error: 'Article not found' });
    res.json(toPublic(doc));
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Slug already exists' });
    res.status(500).json({ error: err.message });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const doc = await News.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Article not found' });
    res.json({ message: 'Article deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
