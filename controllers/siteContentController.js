const SiteContent = require('../models/SiteContent');

exports.listSiteContent = async (req, res) => {
  try {
    const items = await SiteContent.find({}).sort({ pageKey: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSiteContentByKey = async (req, res) => {
  try {
    const doc = await SiteContent.findOne({ pageKey: req.params.pageKey });
    if (!doc) {
      return res.status(200).json({
        pageKey: req.params.pageKey,
        label: '',
        metaTitle: '',
        metaDescription: '',
        body: '',
      });
    }
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.upsertSiteContent = async (req, res) => {
  try {
    const body = req.body;
    const update = {
      ...(body.label != null && { label: body.label }),
      ...(body.metaTitle != null && { metaTitle: body.metaTitle }),
      ...(body.metaDescription != null && { metaDescription: body.metaDescription }),
      ...(body.body != null && { body: body.body }),
    };
    const doc = await SiteContent.findOneAndUpdate(
      { pageKey: req.params.pageKey },
      { $set: update },
      { new: true, upsert: true },
    );
    res.json(doc);
  } catch (err) {
    console.error('upsertSiteContent:', err);
    res.status(500).json({ error: err.message });
  }
};
