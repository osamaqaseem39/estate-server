const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true, trim: true },
    alt: { type: String, default: 'GT Estates project' },
    shape: {
      type: String,
      enum: ['portrait', 'landscape', 'square'],
      default: 'landscape',
    },
    display: {
      type: String,
      enum: ['grid', 'full-original'],
      default: 'grid',
    },
    category: { type: String, default: 'general', trim: true },
    published: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model('GalleryItem', galleryItemSchema);
