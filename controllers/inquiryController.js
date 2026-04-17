const Inquiry = require('../models/Inquiry');
const { sendInquiryNotification } = require('../services/mail');

function toClient(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  const id = o._id != null ? String(o._id) : o.id;
  return {
    id,
    name: o.name,
    email: o.email || '',
    phone: o.phone || '',
    message: o.message || '',
    status: o.status,
    createdAt: o.createdAt,
    property: o.propertyType ? { title: o.propertyType } : undefined,
  };
}

exports.createInquiry = async (req, res) => {
  try {
    const body = req.body || {};
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const propertyType =
      typeof body.propertyType === 'string' ? body.propertyType.trim() : '';
    const source = body.source === 'contact' ? 'contact' : 'global';

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (source === 'contact') {
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      if (!phone) {
        return res.status(400).json({ error: 'Phone is required' });
      }
    } else {
      if (!phone) {
        return res.status(400).json({ error: 'Phone is required' });
      }
    }

    const doc = new Inquiry({
      name,
      email,
      phone,
      message,
      propertyType,
      source,
      status: 'new',
    });
    await doc.save();

    try {
      await sendInquiryNotification({
        name,
        email,
        phone,
        message,
        propertyType,
        source,
      });
    } catch (mailErr) {
      console.error('sendInquiryNotification:', mailErr);
    }

    res.status(201).json({
      message: 'Thank you. Our team will get back to you shortly.',
      id: String(doc._id),
    });
  } catch (err) {
    console.error('createInquiry:', err);
    res.status(500).json({ error: err.message || 'Failed to save inquiry' });
  }
};

exports.listInquiries = async (req, res) => {
  try {
    const items = await Inquiry.find().sort({ createdAt: -1 });
    res.json(items.map(toClient));
  } catch (err) {
    console.error('listInquiries:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateInquiry = async (req, res) => {
  try {
    const { status } = req.body || {};
    const allowed = ['new', 'contacted', 'closed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const doc = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!doc) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    res.json(toClient(doc));
  } catch (err) {
    console.error('updateInquiry:', err);
    res.status(500).json({ error: err.message });
  }
};
