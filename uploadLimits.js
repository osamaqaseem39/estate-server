/**
 * Max upload sizes (bytes). Override with env; defaults: images 5 MB, CV 8 MB.
 */
function parseBytes(envVal, defaultBytes) {
  if (envVal == null || String(envVal).trim() === '') return defaultBytes;
  const n = Number(String(envVal).trim());
  return Number.isFinite(n) && n > 0 ? n : defaultBytes;
}

const MB = 1024 * 1024;

const MAX_IMAGE_UPLOAD_BYTES = parseBytes(process.env.MAX_IMAGE_UPLOAD_BYTES, 5 * MB);
const MAX_CV_UPLOAD_BYTES = parseBytes(process.env.MAX_CV_UPLOAD_BYTES, 8 * MB);

module.exports = {
  MAX_IMAGE_UPLOAD_BYTES,
  MAX_CV_UPLOAD_BYTES,
};
