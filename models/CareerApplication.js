const mongoose = require('mongoose');

const careerApplicationSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    experience: { type: String, required: true, trim: true },
    coverNote: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['new', 'reviewed', 'shortlisted', 'rejected', 'hired'],
      default: 'new',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('CareerApplication', careerApplicationSchema);
