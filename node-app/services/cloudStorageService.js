/**
 * Cloud Storage Service
 * Handles image uploads/replacements to a Google Cloud Storage bucket
 * using the @google-cloud/storage SDK.
 *
 * Credentials must be injected via init() — the SDK does NOT auto-discover
 * the Firebase Admin SDK credentials. See server.js for initialization.
 */

const { Storage } = require('@google-cloud/storage');

const BUCKET_NAME = process.env.GCS_BUCKET || 'wolfpackdna-images';

let bucketRef = null;

/**
 * Initialize the Storage client with explicit service account credentials.
 * Called once from server.js after the Firebase Admin SDK initializes.
 *
 * @param {object} credentialOptions - { projectId, clientEmail, privateKey }
 */
function init({ projectId, clientEmail, privateKey }) {
  const storage = new Storage({
    projectId,
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });
  bucketRef = storage.bucket(BUCKET_NAME);
  console.log(`[GCS] Initialized bucket "${BUCKET_NAME}"`);
}

/**
 * Ensure the bucket reference is initialized.
 */
function ensureInit() {
  if (!bucketRef) {
    throw new Error(
      'Cloud Storage not initialized. Call init(credentials) from server.js first.'
    );
  }
}

/**
 * Upload (or replace) an image in the GCS bucket.
 * If an object with the same name exists, it is overwritten.
 *
 * @param {string} fileName - e.g. 'about.jpg', 'team/hero.png'
 * @param {Buffer} fileBuffer - the image binary data
 * @param {string} mimeType - e.g. 'image/jpeg'
 * @returns {Promise<string>} public URL of the uploaded image
 */
async function uploadImage(fileName, fileBuffer, mimeType) {
  ensureInit();

  const file = bucketRef.file(fileName);

  await file.save(fileBuffer, {
    contentType: mimeType,
    // Allow overwriting an existing object of the same name
    preconditionOpts: { ifGenerationMatch: undefined },
  });

  console.log(`[GCS] Uploaded "${fileName}" (${fileBuffer.length} bytes, ${mimeType})`);

  // Return the standard Google Cloud Storage public URL
  return `https://storage.googleapis.com/${BUCKET_NAME}/${fileName}`;
}

/**
 * Delete an image from the GCS bucket.
 *
 * @param {string} fileName - the object name to delete (e.g. 'about.jpg')
 */
async function deleteImage(fileName) {
  ensureInit();

  const file = bucketRef.file(fileName);
  const [exists] = await file.exists();

  if (!exists) {
    console.log(`[GCS] File "${fileName}" does not exist — nothing to delete`);
    return;
  }

  await file.delete();
  console.log(`[GCS] Deleted "${fileName}"`);
}

module.exports = { init, uploadImage, deleteImage };