/**
 * Image Controller - placeholder
 * Handles image uploads/replacements to the GCS bucket.
 * Accepts a file and a target filename, and uploads/replaces it.
 */

const cloudStorage = require('../services/cloudStorageService');

/**
 * Image Controller - placeholder
 * Handles image uploads/replacements to the GCS bucket.
 * Accepts a file and a target filename, and uploads/replaces it.
 */

/**
 * POST /api/images/upload
 * Upload or replace an image.
 * Expects multipart/form-data with:
 *   - file: the image binary
 *   - filename: the target name in the bucket (e.g. 'about.jpg', 'team/hero.png')
 */
async function uploadImage(req, res) {
  try {
    const file = req.file;
    const { filename } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file provided. Upload a file with field name "file".' });
    }

    const targetName = filename || file.originalname;

    const url = await cloudStorage.uploadImage(targetName, file.buffer, file.mimetype);

    res.json({
      success: true,
      message: `Image "${targetName}" uploaded/replaced successfully`,
      data: { filename: targetName, url },
    });
  } catch (err) {
    console.error('[imageController] uploadImage error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to upload image' });
  }
}

/**
 * DELETE /api/images/:filename
 * Delete an image from the bucket.
 */
async function deleteImage(req, res) {
  try {
    const { filename } = req.params;
    await cloudStorage.deleteImage(filename);
    res.json({ success: true, message: `Image "${filename}" deleted` });
  } catch (err) {
    console.error('[imageController] deleteImage error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to delete image' });
  }
}

module.exports = { uploadImage, deleteImage };
