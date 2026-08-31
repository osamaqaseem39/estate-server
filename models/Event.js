const mongoose = require('mongoose');

const mediaImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    title: { type: String, default: '' },
  },
  { _id: false },
);

const mediaVideoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    title: { type: String, default: '' },
  },
  { _id: false },
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, default: '' },
    images: { type: [mediaImageSchema], default: [] },
    videos: { type: [mediaVideoSchema], default: [] },
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    published: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Event', eventSchema);
