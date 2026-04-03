const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    location: { type: String, required: true, trim: true },
    marla: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['residential', 'commercial', 'mixed', 'other'],
      default: 'residential',
    },
    price: { type: Number, default: null },
    status: {
      type: String,
      enum: ['available', 'sold', 'reserved', 'coming_soon'],
      default: 'available',
    },
    featured: { type: Boolean, default: false },
    primaryImage: { type: String, default: '' },
    gallery: [{ type: String }],
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Property', propertySchema);
