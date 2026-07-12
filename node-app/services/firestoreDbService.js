/**
 * Firestore Database Service
 * Replaces the Cloudflare D1 placeholder with Google Firestore (via Firebase Admin SDK).
 * Provides the same CRUD interface: findAll, findById, insert, update, remove.
 */

const { FieldValue } = require('firebase-admin/firestore');

let db = null;

/**
 * Initialize Firestore from an already-initialized Firebase Admin app.
 * Called once from server.js after firebaseAdmin.initializeApp().
 * @param {object} firestoreInstance - A Firestore instance from firebaseAdmin.firestore()
 */
function init(firestoreInstance) {
  db = firestoreInstance;
}

/**
 * Ensure the database is initialized before any operation.
 */
function ensureInit() {
  if (!db) {
    throw new Error(
      'Firestore not initialized. Call init(firestoreInstance) first, ' +
        'or ensure firebaseAdmin.initializeApp() was called in server.js.'
    );
  }
}

/**
 * Get a reference to a Firestore collection.
 * @param {string} collectionName
 * @returns {FirebaseFirestore.CollectionReference}
 */
function collection(collectionName) {
  ensureInit();
  return db.collection(collectionName);
}

/**
 * Convert Firestore Timestamps to ISO strings recursively.
 * @param {object} obj - Document data containing Firestore Timestamps
 * @returns {object} Same object with Timestamps converted to ISO strings
 */
function serializeTimestamps(obj) {
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    const val = result[key];
    if (val && typeof val === 'object' && val._seconds !== undefined && val._nanoseconds !== undefined) {
      // Firestore Timestamp → ISO string
      result[key] = new Date(val._seconds * 1000 + val._nanoseconds / 1000000).toISOString();
    } else if (val && typeof val.toDate === 'function') {
      // Firestore Timestamp object (native) → ISO string
      result[key] = val.toDate().toISOString();
    }
  }
  return result;
}

/**
 * Fetch all documents from a collection, ordered by creation date descending.
 * @param {string} table - Collection name
 * @returns {Promise<Array>} Array of document objects (each includes id)
 */
async function findAll(table) {
  ensureInit();
  const snapshot = await db
    .collection(table)
    .orderBy('createdAt', 'desc')
    .get();

  const results = [];
  snapshot.forEach((doc) => {
    results.push(serializeTimestamps({ id: doc.id, ...doc.data() }));
  });
  return results;
}

/**
 * Fetch all documents from a collection ordered by an explicit displayOrder
 * field ascending. Documents missing displayOrder fall back to their
 * createdAt timestamp so the sort never errors and old records still appear.
 * @param {string} table - Collection name
 * @param {string} orderField - Field used for ordering (default 'displayOrder')
 * @returns {Promise<Array>} Array of document objects (each includes id)
 */
async function findAllOrdered(table, orderField = 'displayOrder') {
  ensureInit();
  // Firestore can't mix ordered and unordered queries, so fetch all and sort
  // in memory. Team member collections are small, so this is safe.
  const snapshot = await db.collection(table).get();

  const results = [];
  snapshot.forEach((doc) => {
    results.push(serializeTimestamps({ id: doc.id, ...doc.data() }));
  });

  results.sort((a, b) => {
    const aVal = a[orderField];
    const bVal = b[orderField];
    const aMissing = aVal === undefined || aVal === null;
    const bMissing = bVal === undefined || bVal === null;
    if (aMissing && bMissing) {
      // Both missing -> fall back to createdAt (asc)
      return String(a.createdAt).localeCompare(String(b.createdAt));
    }
    if (aMissing) return 1; // missing sorts last
    if (bMissing) return -1;
    return aVal - bVal;
  });

  return results;
}

/**
 * Find a single document by ID.
 * @param {string} table - Collection name
 * @param {string} id - Document ID
 * @returns {Promise<object|null>} Document data with id, or null
 */
async function findById(table, id) {
  ensureInit();
  const doc = await db.collection(table).doc(id).get();
  if (!doc.exists) {
    return null;
  }
  return serializeTimestamps({ id: doc.id, ...doc.data() });
}

/**
 * Insert a new document into a collection.
 * Auto-generates an ID and adds createdAt/updatedAt timestamps.
 * @param {string} table - Collection name
 * @param {object} data - Document data
 * @returns {Promise<string>} The generated document ID
 */
async function insert(table, data) {
  ensureInit();
  const docRef = await db.collection(table).add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Update an existing document by ID.
 * Merges the provided fields into the document.
 * @param {string} table - Collection name
 * @param {string} id - Document ID
 * @param {object} data - Fields to update
 * @returns {Promise<object>} Success indicator
 */
async function update(table, id, data) {
  ensureInit();
  await db
    .collection(table)
    .doc(id)
    .set(
      {
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  return { success: true };
}

/**
 * Delete a document by ID.
 * @param {string} table - Collection name
 * @param {string} id - Document ID
 * @returns {Promise<object>} Success indicator
 */
async function remove(table, id) {
  ensureInit();
  await db.collection(table).doc(id).delete();
  return { success: true };
}

module.exports = { init, findAll, findAllOrdered, findById, insert, update, remove };
