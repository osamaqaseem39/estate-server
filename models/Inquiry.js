const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    message: { type: String, trim: true, default: '' },
    propertyType: { type: String, trim: true, default: '' },
    source: { type: String, enum: ['global', 'contact'], default: 'global' },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inquiry', inquirySchema);
