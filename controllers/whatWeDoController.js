const WhatWeDoContent = require('../models/WhatWeDoContent');

const DEFAULT_CONTENT = {
  missionTitle: 'Our mission',
  missionBody:
    'Our mission is to share honest, transparent facts and promote only those projects that are authentic, verified, and built for long-term profitability.',
  visionTitle: 'Our vision',
  visionBody:
    'GT Estates envisions a market where every investor buys with clarity, not confusion. We deliver real, on-ground facts about the locations our clients want to invest in, and match them with the best opportunities within their budget.',
  qualitiesTitle: 'Our qualities',
  qualitiesBody:
    'At GT Estates, our qualities are built around trust and clarity. We focus on verification before recommendation, honest guidance without hype, and a client-first approach that respects your budget and goals.',
  projectsTitle: 'Our projects',
  projectsBody:
    'Our projects include Etihad Town Lahore and New Metro City, offering strong opportunities in both commercial and residential segments.',
  services: ['Discover', 'Verify & Shortlist', 'Site Visit', 'Deal & Documentation', 'Handover & Support'],
  quote: 'Hard to verify. Easy with GT because we check everything before you commit.',
  ctaHeading: 'Connect with us',
  ctaBody: 'Ready to take the next step? Contact us today to learn more about our offerings or to schedule a site visit.',
};

async function getOrCreate() {
  let doc = await WhatWeDoContent.findOne();
  if (!doc) {
    doc = await WhatWeDoContent.create(DEFAULT_CONTENT);
  }
  return doc;
}

exports.getWhatWeDo = async (_req, res) => {
  try {
    const doc = await getOrCreate();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateWhatWeDo = async (req, res) => {
  try {
    const doc = await getOrCreate();
    const body = req.body;
    const fields = [
      'missionTitle', 'missionBody', 'visionTitle', 'visionBody',
      'qualitiesTitle', 'qualitiesBody', 'projectsTitle', 'projectsBody',
      'quote', 'ctaHeading', 'ctaBody',
    ];
    fields.forEach((f) => {
      if (body[f] != null) doc[f] = body[f];
    });
    if (Array.isArray(body.services)) doc.services = body.services;
    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
