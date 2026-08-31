const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    category: { type: String, enum: ['residential', 'commercial', 'townhouse', 'other'], default: 'residential' },
    label: { type: String, default: '' },
    size: { type: String, default: '' },
    price: { type: String, default: '' },
    status: { type: String, default: 'available' },
    notes: { type: String, default: '' },
  },
  { _id: true },
);

const paymentPlanRowSchema = new mongoose.Schema(
  {
    milestone: { type: String, default: '' },
    percentage: { type: String, default: '' },
    amount: { type: String, default: '' },
    dueOn: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { _id: false },
);

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true, sparse: true, unique: true },
    description: { type: String, default: '' },
    location: { type: String, required: true, trim: true },
    marla: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['residential', 'commercial', 'mixed', 'townhouse', 'other'],
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
    gallery: { type: [mongoose.Schema.Types.Mixed], default: [] },
    inventory: { type: [inventoryItemSchema], default: [] },
    paymentPlan: {
      enabled: { type: Boolean, default: false },
      title: { type: String, default: 'Payment Plan' },
      rows: { type: [paymentPlanRowSchema], default: [] },
    },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Property', propertySchema);
