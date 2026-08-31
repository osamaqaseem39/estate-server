const TeamMember = require('../models/TeamMember');

function parseBool(v) {
  if (v === true || v === false) return v;
  if (typeof v === 'string') return v === 'true' || v === '1';
  return false;
}

exports.createTeamMember = async (req, res) => {
  try {
    const body = req.body;
    let imageUrl = body.imageUrl || '';
    if (req.file) {
      imageUrl = `/uploads/team/${req.file.filename}`;
    }

    if (!body.name || !body.name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    if (!body.designation || !body.designation.trim()) {
      return res.status(400).json({ error: 'designation is required' });
    }

    const doc = new TeamMember({
      name: body.name,
      designation: body.designation,
      imageUrl,
      bio: body.bio || '',
      published: body.published !== undefined ? parseBool(body.published) : true,
      sortOrder: body.sortOrder != null ? Number(body.sortOrder) : 0,
    });
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    console.error('createTeamMember:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateTeamMember = async (req, res) => {
  try {
    const body = req.body;
    const update = {
      ...(body.name != null && { name: body.name }),
      ...(body.designation != null && { designation: body.designation }),
      ...(body.bio != null && { bio: body.bio }),
      ...(body.published !== undefined && { published: parseBool(body.published) }),
      ...(body.sortOrder != null && { sortOrder: Number(body.sortOrder) }),
    };
    if (req.file) {
      update.imageUrl = `/uploads/team/${req.file.filename}`;
    } else if (body.imageUrl != null) {
      update.imageUrl = body.imageUrl;
    }

    const doc = await TeamMember.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ error: 'Team member not found' });
    res.json(doc);
  } catch (err) {
    console.error('updateTeamMember:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.listPublishedTeam = async (req, res) => {
  try {
    const items = await TeamMember.find({ published: true }).sort({ sortOrder: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listAllTeamAdmin = async (req, res) => {
  try {
    const items = await TeamMember.find({}).sort({ sortOrder: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTeamMember = async (req, res) => {
  try {
    const doc = await TeamMember.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Team member not found' });
    if (!doc.published) return res.status(404).json({ error: 'Team member not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTeamMemberAdmin = async (req, res) => {
  try {
    const doc = await TeamMember.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Team member not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTeamMember = async (req, res) => {
  try {
    const doc = await TeamMember.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Team member not found' });
    res.json({ message: 'Team member deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
