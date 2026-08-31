const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, default: '', trim: true },
    avatarUrl: { type: String, default: '' },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    text: { type: String, required: true, trim: true },
    published: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Review', reviewSchema);
