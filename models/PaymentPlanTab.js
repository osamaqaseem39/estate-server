const mongoose = require('mongoose');

const paymentPlanRowSchema = new mongoose.Schema(
  {
    label: { type: String, default: '' },
    percentage: { type: String, default: '' },
    amount: { type: String, default: '' },
    dueOn: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { _id: false },
);

const paymentPlanTabSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, default: '' },
    rows: { type: [paymentPlanRowSchema], default: [] },
    published: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model('PaymentPlanTab', paymentPlanTabSchema);
