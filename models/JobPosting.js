const mongoose = require('mongoose');

const jobPostingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true, sparse: true, unique: true },
    department: { type: String, default: '' },
    location: { type: String, default: '' },
    employmentType: { type: String, default: '' },
    description: { type: String, default: '' },
    requirements: { type: String, default: '' },
    published: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model('JobPosting', jobPostingSchema);
