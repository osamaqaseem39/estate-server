const path = require('path');
const fs = require('fs');
const os = require('os');

/**
 * Writable uploads root. On Vercel, project-relative paths resolve outside /tmp and fail;
 * use UPLOADS_DIR or os.tmpdir() there.
 */
function getUploadsRoot() {
  if (process.env.UPLOADS_DIR) {
    return path.resolve(process.env.UPLOADS_DIR);
  }
  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), 'real-estate-uploads');
  }
  return path.join(__dirname, '..', 'uploads');
}

function ensureUploadSubdir(subdir) {
  const dir = path.join(getUploadsRoot(), subdir);
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    console.error(`Failed to create upload dir ${subdir}:`, err.message);
    throw err;
  }
  return dir;
}

module.exports = { getUploadsRoot, ensureUploadSubdir };
