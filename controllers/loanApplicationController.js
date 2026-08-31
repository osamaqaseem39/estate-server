const LoanApplication = require('../models/LoanApplication');
const { toPublic, toPublicList } = require('../utils/publicDoc');

exports.createLoanApplication = async (req, res) => {
  try {
    const body = req.body;
    if (!body.fullName || !body.mobileNumber) {
      return res.status(400).json({ error: 'fullName and mobileNumber are required' });
    }
    const doc = new LoanApplication(body);
    await doc.save();
    res.status(201).json({ message: 'Application submitted successfully', id: String(doc._id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listLoanApplications = async (req, res) => {
  try {
    const items = await LoanApplication.find({}).sort({ createdAt: -1 });
    res.json(toPublicList(items));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLoanApplication = async (req, res) => {
  try {
    const doc = await LoanApplication.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Application not found' });
    res.json(toPublic(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateLoanApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const doc = await LoanApplication.findByIdAndUpdate(
      req.params.id,
      { ...(status && { status }) },
      { new: true },
    );
    if (!doc) return res.status(404).json({ error: 'Application not found' });
    res.json(toPublic(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteLoanApplication = async (req, res) => {
  try {
    const doc = await LoanApplication.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Application not found' });
    res.json({ message: 'Application deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
