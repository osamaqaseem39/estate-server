const Page = require('../models/Page');
const { toPublic, toPublicList } = require('../utils/publicDoc');
const { slugify } = require('../utils/slugify');

const DEFAULT_PAGES = [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    content: '<p>Add your privacy policy content from the dashboard under Pages / SEO.</p>',
    metaTitle: 'Privacy Policy - GT Estate',
    metaDescription: 'GT Estate privacy policy.',
    published: true,
  },
  {
    slug: 'terms',
    title: 'Terms & Conditions',
    content: '<p>Add your terms and conditions from the dashboard under Pages / SEO.</p>',
    metaTitle: 'Terms & Conditions - GT Estate',
    metaDescription: 'GT Estate terms and conditions.',
    published: true,
  },
  {
    slug: 'home',
    title: 'Home',
    content: '',
    metaTitle: 'GT Estate | Next-Gen Real Estate Platform',
    metaDescription: 'GT Estates — premium residential and commercial plots in Lahore and beyond.',
    published: true,
  },
];

async function ensureDefaultPages() {
  for (const seed of DEFAULT_PAGES) {
    const exists = await Page.findOne({ slug: seed.slug });
    if (!exists) {
      await Page.create(seed);
    }
  }
}

exports.createPage = async (req, res) => {
  try {
    const body = req.body;
    const slug = slugify(body.slug || body.title);
    if (!slug) return res.status(400).json({ error: 'slug is required' });
    const doc = new Page({
      slug,
      title: body.title,
      content: body.content || '',
      metaTitle: body.metaTitle || '',
      metaDescription: body.metaDescription || '',
      metaKeywords: body.metaKeywords || '',
      published: body.published === true || body.published === 'true',
    });
    await doc.save();
    res.status(201).json(toPublic(doc));
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Slug already exists' });
    res.status(500).json({ error: err.message });
  }
};

exports.listPages = async (req, res) => {
  try {
    await ensureDefaultPages();
    const filter = {};
    if (req.query.published === 'true') filter.published = true;
    const items = await Page.find(filter).sort({ slug: 1 });
    res.json(toPublicList(items));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPageBySlug = async (req, res) => {
  try {
    await ensureDefaultPages();
    const doc = await Page.findOne({ slug: req.params.slug.toLowerCase() });
    if (!doc) return res.status(404).json({ error: 'Page not found' });
    if (req.query.published === 'true' && !doc.published) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(toPublic(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPage = async (req, res) => {
  try {
    const doc = await Page.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Page not found' });
    res.json(toPublic(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePage = async (req, res) => {
  try {
    const body = req.body;
    const update = {
      ...(body.title != null && { title: body.title }),
      ...(body.content != null && { content: body.content }),
      ...(body.metaTitle != null && { metaTitle: body.metaTitle }),
      ...(body.metaDescription != null && { metaDescription: body.metaDescription }),
      ...(body.metaKeywords != null && { metaKeywords: body.metaKeywords }),
      ...(body.published !== undefined && {
        published: body.published === true || body.published === 'true',
      }),
    };
    if (body.slug != null) update.slug = slugify(body.slug);
    const doc = await Page.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ error: 'Page not found' });
    res.json(toPublic(doc));
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Slug already exists' });
    res.status(500).json({ error: err.message });
  }
};

exports.deletePage = async (req, res) => {
  try {
    const doc = await Page.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Page not found' });
    res.json({ message: 'Page deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
