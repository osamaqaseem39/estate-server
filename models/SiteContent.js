const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema(
  {
    pageKey: { type: String, required: true, unique: true, trim: true },
    label: { type: String, default: '', trim: true },
    metaTitle: { type: String, default: '', trim: true },
    metaDescription: { type: String, default: '', trim: true },
    body: { type: String, default: '' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('SiteContent', siteContentSchema);
