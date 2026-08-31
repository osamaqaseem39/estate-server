const mongoose = require('mongoose');

const whatWeDoSchema = new mongoose.Schema(
  {
    missionTitle: { type: String, default: 'Our mission' },
    missionBody: { type: String, default: '' },
    visionTitle: { type: String, default: 'Our vision' },
    visionBody: { type: String, default: '' },
    qualitiesTitle: { type: String, default: 'Our qualities' },
    qualitiesBody: { type: String, default: '' },
    projectsTitle: { type: String, default: 'Our projects' },
    projectsBody: { type: String, default: '' },
    services: { type: [String], default: [] },
    quote: { type: String, default: '' },
    ctaHeading: { type: String, default: 'Connect with us' },
    ctaBody: { type: String, default: '' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('WhatWeDoContent', whatWeDoSchema);
