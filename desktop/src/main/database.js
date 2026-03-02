const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const { encrypt, decrypt } = require('./crypto');

const BCRYPT_ROUNDS = 12;

let db = null;

/**
 * Opens (or creates) the SQLite database at the given path.
 * Creates the tables if they don't exist.
 */
function initDatabase(dbPath) {
  db = new Database(dbPath);

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS master (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_name TEXT NOT NULL,
      url TEXT,
      username TEXT NOT NULL,
      password_encrypted TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}

/**
 * Checks whether a master password has already been set.
 */
function hasMasterPassword() {
  const row = db.prepare('SELECT hash FROM master WHERE id = 1').get();
  return !!row;
}

/**
 * Sets the master password (first-time setup only).
 * Stores the bcrypt hash in the database.
 */
function setMasterPassword(masterPassword) {
  if (hasMasterPassword()) {
    throw new Error('Master password already set');
  }
  const hash = bcrypt.hashSync(masterPassword, BCRYPT_ROUNDS);
  db.prepare('INSERT INTO master (id, hash) VALUES (1, ?)').run(hash);
}

/**
 * Verifies the master password against the stored hash.
 */
function verifyMasterPassword(masterPassword) {
  const row = db.prepare('SELECT hash FROM master WHERE id = 1').get();
  if (!row) return false;
  return bcrypt.compareSync(masterPassword, row.hash);
}

/**
 * Adds a new entry (with encrypted password) to the vault.
 */
function addEntry(siteName, url, username, plainPassword, masterPassword) {
  const passwordEncrypted = encrypt(plainPassword, masterPassword);
  const stmt = db.prepare(
    'INSERT INTO entries (site_name, url, username, password_encrypted) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(siteName, url, username, passwordEncrypted);
  return result.lastInsertRowid;
}

/**
 * Retrieves all entries. Passwords remain encrypted.
 */
function getAllEntries() {
  return db.prepare(
    'SELECT id, site_name, url, username, password_encrypted, created_at, updated_at FROM entries ORDER BY site_name'
  ).all();
}

/**
 * Decrypts the password for a single entry.
 */
function getDecryptedPassword(entryId, masterPassword) {
  const row = db.prepare('SELECT password_encrypted FROM entries WHERE id = ?').get(entryId);
  if (!row) throw new Error('Entry not found');
  return decrypt(row.password_encrypted, masterPassword);
}

/**
 * Updates an existing entry.
 */
function updateEntry(entryId, siteName, url, username, plainPassword, masterPassword) {
  const passwordEncrypted = encrypt(plainPassword, masterPassword);
  const stmt = db.prepare(
    'UPDATE entries SET site_name = ?, url = ?, username = ?, password_encrypted = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  );
  return stmt.run(siteName, url, username, passwordEncrypted, entryId);
}

/**
 * Deletes an entry from the vault.
 */
function deleteEntry(entryId) {
  return db.prepare('DELETE FROM entries WHERE id = ?').run(entryId);
}

/**
 * Searches entries by site name or URL.
 */
function searchEntries(query) {
  return db.prepare(
    'SELECT id, site_name, url, username, created_at, updated_at FROM entries WHERE site_name LIKE ? OR url LIKE ? ORDER BY site_name'
  ).all(`%${query}%`, `%${query}%`);
}

/**
 * Closes the database connection.
 */
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  initDatabase,
  hasMasterPassword,
  setMasterPassword,
  verifyMasterPassword,
  addEntry,
  getAllEntries,
  getDecryptedPassword,
  updateEntry,
  deleteEntry,
  searchEntries,
  closeDatabase,
};
