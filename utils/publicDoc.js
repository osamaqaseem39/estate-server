/** Attach string `id` from Mongo `_id` for dashboard / website clients. */
function toPublic(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : { ...doc };
  return { ...o, id: String(o._id) };
}

function toPublicList(docs) {
  return (docs || []).map((d) => toPublic(d));
}

module.exports = { toPublic, toPublicList };
