const CareerApplication = require('../models/CareerApplication');

exports.submitApplication = async (req, res) => {
  try {
    const { fullName, email, phone, position, city, experience, coverNote } = req.body;
    if (!fullName || !email || !phone || !position || !city || !experience) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let resumeUrl = '';
    if (req.file) {
      resumeUrl = `/uploads/careers/${req.file.filename}`;
    }

    const doc = new CareerApplication({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      position: position.trim(),
      city: city.trim(),
      experience: experience.trim(),
      coverNote: (coverNote || '').trim(),
      resumeUrl,
    });

    await doc.save();
    res.status(201).json({
      message: 'Thank you for applying. Our HR team will review your application.',
      id: doc._id,
    });
  } catch (err) {
    console.error('submitApplication:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.listApplications = async (req, res) => {
  try {
    const items = await CareerApplication.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['new', 'reviewed', 'shortlisted', 'rejected', 'hired'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const doc = await CareerApplication.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!doc) return res.status(404).json({ error: 'Application not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
